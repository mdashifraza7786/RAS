import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Check user authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectDB();

    // Get active orders (pending, in-progress, ready)
    const orders = await Order.find({
      status: { $in: ['pending', 'in-progress', 'ready'] }
    })
      .sort({ createdAt: -1 })
      .populate('table', 'number name')
      .populate({
        path: 'items.menuItem',
        select: 'name price preparationTime isVegetarian isVegan isGlutenFree'
      })
      .lean();

    // Format orders for response
    const formattedOrders = orders.map(order => ({
      ...order,
      _id: order._id.toString(),
      table: order.table ? {
        _id: (order.table as any)._id.toString(),
        name: (order.table as any).name
      } : null,
      items: order.items.map(item => ({
        ...item,
        _id: (item as any)._id.toString(),
        menuItem: item.menuItem ? {
          ...(item.menuItem as any),
          _id: (item.menuItem as any)._id.toString()
        } : null
      }))
    }));

    return NextResponse.json({ orders: formattedOrders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching active orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active orders' },
      { status: 500 }
    );
  }
} 