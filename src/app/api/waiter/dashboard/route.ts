import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Table from '@/models/Table';
import Bill from '@/models/Bill';
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

    // Get table statistics (all assigned to this waiter)
    const tables = await (Table as any).find({ assignedTo: waiterId });
    const totalTables = tables.length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const availableTables = tables.filter(t => t.status === 'available').length;
    
    // Get statistics for all tables in the restaurant
    const allTables = await (Table as any).find({});
    const allTableCount = allTables.length;
    const allOccupiedTables = allTables.filter(t => t.status === 'occupied').length;
    const allAvailableTables = allTables.filter(t => t.status === 'available').length;
    const allReservedTables = allTables.filter(t => t.status === 'reserved').length;

    // Get open orders count (orders assigned to this waiter with status 'pending' or 'in-progress')
    const openOrders = await Order.countDocuments({
      waiterId,
      status: { $in: ['pending', 'in-progress'] }
    });

    // Get ready to serve orders count (orders assigned to this waiter with status 'ready')
    const readyToServe = await Order.countDocuments({
      waiterId,
      status: 'ready'
    });

    // Get unpaid bills count (bills associated with this waiter's orders that are not paid)
    const unpaidBills = await Bill.countDocuments({
      paymentStatus: 'unpaid',
      order: { $in: await Order.find({ waiterId }).distinct('_id') }
    });

    // Get recent activity (10 most recent events)
    const recentActivity = [];

    // Get most recent orders
    const recentOrders = await Order.find({ waiterId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('_id status updatedAt');

    for (const order of recentOrders) {
      let action = '';
      let type = 'order';

      switch (order.status) {
        case 'pending':
          action = `Order #${order._id.toString().slice(-6)} was created`;
          break;
        case 'in-progress':
          action = `Order #${order._id.toString().slice(-6)} is being prepared`;
          break;
        case 'ready':
          action = `Order #${order._id.toString().slice(-6)} is ready to serve`;
          break;
        case 'completed':
          action = `Order #${order._id.toString().slice(-6)} was completed`;
          break;
        case 'cancelled':
          action = `Order #${order._id.toString().slice(-6)} was cancelled`;
          break;
        default:
          action = `Order #${order._id.toString().slice(-6)} status updated`;
      }

      recentActivity.push({
        id: order._id.toString(),
        type,
        action,
        timeSince: formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true })
      });
    }

    // Get most recent table assignments
    const recentTables = await (Table as any).find({ assignedTo: waiterId })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select('_id number status updatedAt');

    for (const table of recentTables) {
      recentActivity.push({
        id: table._id.toString(),
        type: 'table',
        action: `Table #${table.number} is ${table.status}`,
        timeSince: formatDistanceToNow(new Date(table.updatedAt), { addSuffix: true })
      });
    }

    // Get most recent bills
    const recentBills = await (Bill as any).find({
      order: { $in: await (Order as any).find({ waiterId }).distinct('_id') }
    })
      .sort({ updatedAt: -1 })
      .limit(2)
      .select('_id billNumber paymentStatus updatedAt');

    for (const bill of recentBills) {
      recentActivity.push({
        id: bill._id.toString(),
        type: 'payment',
        action: `Bill #${bill.billNumber} is ${bill.paymentStatus}`,
        timeSince: formatDistanceToNow(new Date(bill.updatedAt), { addSuffix: true })
      });
    }

    // Sort all activities by time (most recent first) and limit to 10
    recentActivity.sort((a, b) => {
      return new Date(b.timeSince).getTime() - new Date(a.timeSince).getTime();
    }).slice(0, 10);

    // Prepare table description message
    let tableDescription;
    if (totalTables === 0) {
      tableDescription = `No tables assigned (${allTableCount} total in restaurant)`;
    } else {
      tableDescription = `${occupiedTables} occupied, ${availableTables} available`;
    }

    // Format the response
    const dashboardData = {
      quickStats: {
        activeTables: {
          title: 'My Tables',
          value: totalTables === 0 ? '0' : `${occupiedTables}/${totalTables}`,
          description: tableDescription
        },
        allTables: {
          title: 'All Tables',
          value: `${allOccupiedTables}/${allTableCount}`,
          description: `${allOccupiedTables} occupied, ${allAvailableTables} available, ${allReservedTables} reserved`
        },
        openOrders: {
          title: 'Open Orders',
          value: openOrders.toString(),
          description: 'Orders that need attention'
        },
        readyToServe: {
          title: 'Ready to Serve',
          value: readyToServe.toString(),
          description: 'Orders ready for delivery'
        },
        unpaidBills: {
          title: 'Unpaid Bills',
          value: unpaidBills.toString(),
          description: 'Bills awaiting payment'
        }
      },
      recentActivity
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching waiter dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 