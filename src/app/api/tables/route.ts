import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Table from '@/models/Table';
import { getServerSession } from 'next-auth';

// GET /api/tables - Get all tables
export async function GET() {
  try {
    await connectToDatabase();
    
    const tables = await Table.find().sort({ number: 1 });
    
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

// POST /api/tables - Create a new table (manager only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has manager role
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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