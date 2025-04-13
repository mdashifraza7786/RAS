import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Table from '@/models/Table';
import Order from '@/models/Order';
import { formatDistanceToNow } from 'date-fns';

// GET endpoint to retrieve tables
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is a waiter
    if (session.user.role !== 'waiter') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Connect to the database
    await connectToDatabase();

    // Get waiterId from the session
    const waiterId = session.user.id;

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const showAll = searchParams.get('showAll') === 'true';
    const location = searchParams.get('location');

    // Build query based on params
    let query: any = {};

    // Filter by status if provided
    if (status && ['available', 'occupied', 'reserved', 'cleaning'].includes(status)) {
      query.status = status;
    }

    // Filter by location if provided
    if (location) {
      query.location = location;
    }

    // Filter by assigned waiter unless showAll is true
    if (!showAll) {
      query.assignedTo = waiterId;
    }

    // Get tables based on query
    const tables = await Table.find(query).sort({ number: 1 });

    // Get active orders for each occupied table
    const tableIds = tables.filter(t => t.status === 'occupied').map(t => t._id);
    const activeOrders = tableIds.length > 0 
      ? await Order.find({ 
          table: { $in: tableIds },
          status: { $nin: ['completed', 'cancelled'] }
        }).select('_id table status createdAt')
      : [];

    // Map orders to tables
    const tableOrders = activeOrders.reduce((acc, order) => {
      const tableId = order.table.toString();
      if (!acc[tableId]) {
        acc[tableId] = [];
      }
      acc[tableId].push({
        id: order._id.toString(),
        status: order.status,
        createdAt: order.createdAt,
        timeElapsed: formatDistanceToNow(new Date(order.createdAt), { addSuffix: false })
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Format response with tables and their active orders
    const formattedTables = tables.map(table => {
      const tableId = table._id.toString();
      return {
        id: tableId,
        number: table.number,
        name: table.name,
        capacity: table.capacity,
        status: table.status,
        location: table.location,
        isAssigned: table.assignedTo ? table.assignedTo.toString() === waiterId : false,
        lastStatusChanged: table.lastStatusChanged,
        timeElapsed: table.lastStatusChanged 
          ? formatDistanceToNow(new Date(table.lastStatusChanged), { addSuffix: false })
          : null,
        orders: tableOrders[tableId] || []
      };
    });

    // Get unique locations for filtering
    const locations = await Table.distinct('location');

    return NextResponse.json({
      tables: formattedTables,
      filters: {
        locations
      },
      meta: {
        total: formattedTables.length,
        assigned: formattedTables.filter(t => t.isAssigned).length,
        available: formattedTables.filter(t => t.status === 'available').length,
        occupied: formattedTables.filter(t => t.status === 'occupied').length,
        reserved: formattedTables.filter(t => t.status === 'reserved').length,
        cleaning: formattedTables.filter(t => t.status === 'cleaning').length,
      }
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update table status
export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is a waiter
    if (session.user.role !== 'waiter') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Connect to the database
    await connectToDatabase();

    // Get waiterId from the session
    const waiterId = session.user.id;
    
    // Parse request body
    const body = await req.json();
    const { tableId, status, action } = body;
    
    if (!tableId) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 });
    }
    
    // Find the table
    const table = await Table.findById(tableId);
    
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }
    
    // Handle different actions
    if (action === 'assign') {
      // Assign table to current waiter
      table.assignedTo = waiterId;
      await table.save();
      return NextResponse.json({ 
        message: `Table #${table.number} assigned to you successfully`,
        table: {
          id: table._id.toString(),
          number: table.number,
          name: table.name,
          status: table.status,
          isAssigned: true
        }
      });
    } 
    else if (action === 'unassign') {
      // Check if the table is assigned to the current waiter
      if (table.assignedTo && table.assignedTo.toString() !== waiterId) {
        return NextResponse.json({ error: 'You can only unassign tables assigned to you' }, { status: 403 });
      }
      
      // Unassign table
      table.assignedTo = undefined;
      await table.save();
      return NextResponse.json({ 
        message: `Table #${table.number} unassigned successfully`,
        table: {
          id: table._id.toString(),
          number: table.number,
          name: table.name,
          status: table.status,
          isAssigned: false
        }
      });
    }
    else if (action === 'updateStatus') {
      // Update table status
      if (!status || !['available', 'occupied', 'reserved', 'cleaning'].includes(status)) {
        return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
      }
      
      // Check if the table is assigned to the current waiter
      if (table.assignedTo && table.assignedTo.toString() !== waiterId) {
        return NextResponse.json({ error: 'You can only update status of tables assigned to you' }, { status: 403 });
      }
      
      // Check if there are active orders when marking a table as available
      if (status === 'available' && table.status === 'occupied') {
        const activeOrders = await Order.countDocuments({
          table: tableId,
          status: { $nin: ['completed', 'cancelled'] }
        });
        
        if (activeOrders > 0) {
          return NextResponse.json({ 
            error: 'Cannot mark table as available when there are active orders' 
          }, { status: 400 });
        }
      }
      
      // Update the status
      table.status = status;
      await table.save();
      
      return NextResponse.json({ 
        message: `Table #${table.number} status updated to ${status}`,
        table: {
          id: table._id.toString(),
          number: table.number,
          name: table.name,
          status: table.status,
          isAssigned: table.assignedTo ? table.assignedTo.toString() === waiterId : false
        }
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    );
  }
} 