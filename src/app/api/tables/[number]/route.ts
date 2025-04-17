import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Table, { ITable } from '@/models/Table';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';

// GET /api/tables/[number] - Get a specific table
export async function GET(
  request: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    await connectDB();
    
    const tableNumber = parseInt(params.number);
    if (isNaN(tableNumber)) {
      return NextResponse.json(
        { error: 'Invalid table number' },
        { status: 400 }
      );
    }
    
    const table = await (Table as Model<ITable>).findOne({ number: tableNumber });
    
    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table' },
      { status: 500 }
    );
  }
}

// PUT /api/tables/[number] - Update a table (manager and waiter)
export async function PUT(
  request: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has manager or waiter role
    if (!session || (session.user.role !== 'manager' && session.user.role !== 'waiter')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    const data = await request.json();
    
    const tableNumber = parseInt(params.number);
    if (isNaN(tableNumber)) {
      return NextResponse.json(
        { error: 'Invalid table number' },
        { status: 400 }
      );
    }
    
    // If user is waiter, only allow updating status
    if (session.user.role === 'waiter') {
      const allowedFields = ['status'];
      const requestedUpdates = Object.keys(data);
      
      const isValidOperation = requestedUpdates.every(update => allowedFields.includes(update));
      
      if (!isValidOperation) {
        return NextResponse.json(
          { error: 'Waiters can only update table status' },
          { status: 403 }
        );
      }
    }
    
    const table = await (Table as Model<ITable>).findOneAndUpdate(
      { number: tableNumber },
      { $set: data },
      { new: true, runValidators: true }
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

// POST /api/tables/[number] - Create or update a table (manager only)
export async function POST(
  request: NextRequest,
  { params }: { params: { number: string } }
) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has manager role
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    const data = await request.json();
    
    const tableNumber = parseInt(params.number);
    if (isNaN(tableNumber)) {
      return NextResponse.json(
        { error: 'Invalid table number' },
        { status: 400 }
      );
    }
    
    // Create or update the table
    const table = await (Table as Model<ITable>).findOneAndUpdate(
      { number: tableNumber },
      { 
        $set: { 
          ...data,
          number: tableNumber // Ensure the number matches the URL parameter
        } 
      },
      { 
        new: true, 
        upsert: true, // Create if doesn't exist
        runValidators: true 
      }
    );
    
    return NextResponse.json(table);
  } catch (error) {
    console.error('Error creating/updating table:', error);
    return NextResponse.json(
      { error: 'Failed to create/update table' },
      { status: 500 }
    );
  }
} 