import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Table from '@/models/Table';
import Order from '@/models/Order';
import { Types } from 'mongoose';
import { checkManagerAuth } from '@/lib/api-auth';

interface TableDoc {
  _id: Types.ObjectId;
  number: number;
  capacity: number;
  status: string;
  name: string;
}

export async function GET(request: NextRequest) {
  try {
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { number: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tables = await Table.find(query)
      .sort({ number: 1 })
      .lean() as unknown as TableDoc[];
    
    const currentOrders = await Order.find({
      table: { $in: tables.map(t => t._id) },
      status: { $in: ['pending', 'in-progress'] }
    }).lean();
    
    const tablesWithOrders = tables.map(table => ({
      ...table,
      currentOrder: currentOrders.find(order => 
        order.table?.toString() === table._id.toString()
      ) || null
    }));
    
    return NextResponse.json({ tables: tablesWithOrders });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    const data = await request.json();
    
    if (!data.number || !data.capacity || !data.name) {
      return NextResponse.json(
        { error: 'Table number, name, and capacity are required' },
        { status: 400 }
      );
    }
    
    const existingTable = await Table.findOne({ number: data.number });
    if (existingTable) {
      return NextResponse.json(
        { error: 'A table with this number already exists' },
        { status: 400 }
      );
    }
    
    const table = await Table.create(data);
    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Table ID is required' },
        { status: 400 }
      );
    }
    
    if (updateData.number) {
      const existingTable = await Table.findOne({
        number: updateData.number,
        _id: { $ne: id }
      });
      
      if (existingTable) {
        return NextResponse.json(
          { error: 'A table with this number already exists' },
          { status: 400 }
        );
      }
    }
    
    const table = await Table.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Table ID is required' },
        { status: 400 }
      );
    }
    
    const activeOrder = await Order.findOne({
      table: id,
      status: { $in: ['pending', 'in-progress'] }
    });
    
    if (activeOrder) {
      return NextResponse.json(
        { error: 'Cannot delete table with active orders' },
        { status: 400 }
      );
    }
    
    const table = await Table.findByIdAndDelete(id);
    
    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    );
  }
} 