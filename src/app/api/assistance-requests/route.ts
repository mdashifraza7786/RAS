import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Table from '@/models/Table';

// Define the schema for assistance requests if it doesn't exist
// We'll store this in memory for now as a simple solution
// In a production app, you'd want to create a proper model for this
const assistanceRequests = new Map();

export async function POST(request: Request) {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { error: 'Database connection string is not defined' },
        { status: 500 }
      );
    }
    await mongoose.connect(mongoUri);

    // Parse request body
    const body = await request.json();
    const { tableId, requestType, message } = body;

    // Validate inputs
    if (!tableId) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 });
    }
    
    if (!requestType || !['waiter', 'refill', 'checkout'].includes(requestType)) {
      return NextResponse.json({ error: 'Valid request type is required' }, { status: 400 });
    }

    // Validate table ID
    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return NextResponse.json({ error: 'Invalid table ID format' }, { status: 400 });
    }

    // Check if table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Create assistance request
    const requestId = Date.now().toString();
    const assistanceRequest = {
      id: requestId,
      tableId,
      tableName: table.name,
      requestType,
      message: message || '',
      timestamp: new Date(),
      status: 'pending' // pending, completed, cancelled
    };

    // Store in our in-memory map
    assistanceRequests.set(requestId, assistanceRequest);

    // In a real app, you might want to emit an event, send a notification,
    // or use a websocket to alert staff about the request

    return NextResponse.json({ 
      success: true, 
      message: `Your ${requestType} request has been received. A staff member will assist you shortly.`,
      requestId
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating assistance request:', error);
    return NextResponse.json(
      { error: 'Failed to create assistance request' },
      { status: 500 }
    );
  }
}

// Get all assistance requests (for staff interface)
export async function GET() {
  try {
    // Return all assistance requests (would be different in a real app with DB storage)
    const requests = Array.from(assistanceRequests.values())
      .filter(request => request.status === 'pending')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching assistance requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assistance requests' },
      { status: 500 }
    );
  }
} 