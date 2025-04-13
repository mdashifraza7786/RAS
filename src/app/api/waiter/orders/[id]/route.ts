import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

// GET /api/waiter/orders/[id] - Get a specific order by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Use await with params to follow Next.js best practices
    const { id: orderId } = await context.params;
    console.log("API: Fetching order", orderId);
    
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
    
    // Find the order with populated references
    const order = await Order.findById(orderId)
      .populate('table', 'number name')
      .lean();
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    console.log("API: Order found and returned");
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
} 