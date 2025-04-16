import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Table from '@/models/Table';
import Bill from '@/models/Bill';
import Activity from '@/models/Activity';
import { formatDistanceToNow } from 'date-fns';

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
    
    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Combine activities from different sources for a comprehensive activity feed
    const activities = [];
    
    // Get orders related to this waiter
    const orders = await (Order as any).find({ waiterId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id orderNumber status updatedAt createdAt items');
      
    for (const order of orders) {
      let action = '';
      let type = 'order';

      // Different message based on status and whether it's a new order or updated
      const isNew = order.createdAt.toString() === order.updatedAt.toString();
      
      switch (order.status) {
        case 'pending':
          action = isNew 
            ? `New order #${order.orderNumber || order._id.toString().slice(-6)} created` 
            : `Order #${order.orderNumber || order._id.toString().slice(-6)} is pending`;
          break;
        case 'in-progress':
          action = `Order #${order.orderNumber || order._id.toString().slice(-6)} is being prepared`;
          break;
        case 'ready':
          action = `Order #${order.orderNumber || order._id.toString().slice(-6)} is ready to serve`;
          type = 'order_ready';
          break;
        case 'completed':
          action = `Order #${order.orderNumber || order._id.toString().slice(-6)} was completed`;
          break;
        case 'cancelled':
          action = `Order #${order.orderNumber || order._id.toString().slice(-6)} was cancelled`;
          break;
        default:
          action = `Order #${order.orderNumber || order._id.toString().slice(-6)} was updated`;
      }

      activities.push({
        id: order._id.toString(),
        type,
        action,
        timestamp: order.updatedAt,
        timeSince: formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true }),
        details: {
          items: order.items.length,
          status: order.status
        }
      });
    }
    
    // Get table assignments for this waiter
    const tables = await (Table as any).find({ assignedTo: waiterId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id number name status updatedAt');
      
    for (const table of tables) {
      activities.push({
        id: table._id.toString(),
        type: 'table',
        action: `Table #${table.number} (${table.name}) is ${table.status}`,
        timestamp: table.updatedAt,
        timeSince: formatDistanceToNow(new Date(table.updatedAt), { addSuffix: true }),
        details: {
          number: table.number,
          name: table.name,
          status: table.status
        }
      });
    }
    
    // Get bills related to this waiter
    const bills = await (Bill as any).find({
      order: { $in: await (Order as any).find({ waiterId }).distinct('_id') }
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id billNumber paymentStatus total updatedAt');
      
    for (const bill of bills) {
      let type = 'payment';
      let action = '';
      
      switch (bill.paymentStatus) {
        case 'paid':
          action = `Bill #${bill.billNumber} was paid (₹${bill.total})`;
          break;
        case 'unpaid':
          action = `Bill #${bill.billNumber} is awaiting payment (₹${bill.total})`;
          type = 'bill_request';
          break;
        case 'cancelled':
          action = `Bill #${bill.billNumber} was cancelled`;
          break;
        default:
          action = `Bill #${bill.billNumber} status changed to ${bill.paymentStatus}`;
      }
      
      activities.push({
        id: bill._id.toString(),
        type,
        action,
        timestamp: bill.updatedAt,
        timeSince: formatDistanceToNow(new Date(bill.updatedAt), { addSuffix: true }),
        details: {
          billNumber: bill.billNumber,
          status: bill.paymentStatus,
          total: bill.total
        }
      });
    }
    
    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    // Get total count for pagination
    const orderCount = await (Order as any).countDocuments({ waiterId });
    const tableCount = await (Table as any).countDocuments({ assignedTo: waiterId });
    const billCount = await (Bill as any).countDocuments({
      order: { $in: await (Order as any).find({ waiterId }).distinct('_id') }
    });
    
    const totalCount = orderCount + tableCount + billCount;
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('Error fetching waiter activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
} 