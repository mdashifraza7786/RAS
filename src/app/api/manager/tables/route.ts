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

// GET /api/manager/tables - Get all tables with additional manager info
export async function GET(request: NextRequest) {
  try {
    // Check manager authentication
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build query
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
    
    // Get tables with current orders
    const tables = await Table.find(query)
      .sort({ number: 1 })
      .lean() as unknown as TableDoc[];
    
    // Get current orders for each table
    const currentOrders = await Order.find({
      table: { $in: tables.map(t => t._id) },
      status: { $in: ['pending', 'in-progress'] }
    }).lean();
    
    // Map orders to tables
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

// POST /api/manager/tables - Create a new table
export async function POST(request: NextRequest) {
  try {
    // Check manager authentication
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    const data = await request.json();
    
    // Validate required fields
    if (!data.number || !data.capacity || !data.name) {
      return NextResponse.json(
        { error: 'Table number, name, and capacity are required' },
        { status: 400 }
      );
    }
    
    // Check if table number already exists
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

// PUT /api/manager/tables - Update a table
export async function PUT(request: NextRequest) {
  try {
    // Check manager authentication
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
    
    // If updating table number, check for duplicates
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

// DELETE /api/manager/tables - Delete a table
export async function DELETE(request: NextRequest) {
  try {
    // Check manager authentication
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
    
    // Check if table has any active orders
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