import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import mongoose from 'mongoose';

// GET /api/waiter/orders/[id]/items - Get items for a specific order
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Use await with params to follow Next.js best practices
    const { id: orderId } = await context.params;
    
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
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order.items);
  } catch (error) {
    console.error('Error fetching order items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order items' },
      { status: 500 }
    );
  }
}

// POST /api/waiter/orders/[id]/items - Add items to an existing order
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Use await with params to follow Next.js best practices
    const { id: orderId } = await context.params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is a waiter
    if (session.user.role !== 'waiter') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the request body
    const { items } = await request.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing items data' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if the order is already completed or cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot add items to a completed or cancelled order' },
        { status: 400 }
      );
    }
    
    // Add unique _id to each item and set default status
    const newItems = items.map((item: any) => ({
      ...item,
      _id: new mongoose.Types.ObjectId(),
      status: 'pending',
      addedAt: new Date()
    }));
    
    // Add the new items to the order
    order.items.push(...newItems);
    
    // Update the total price
    const totalPrice = order.items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    order.totalPrice = totalPrice;
    
    // Save the order
    await order.save();
    
    return NextResponse.json({
      message: 'Items added to order successfully',
      items: newItems
    });
  } catch (error) {
    console.error('Error adding items to order:', error);
    return NextResponse.json(
      { error: 'Failed to add items to order' },
      { status: 500 }
    );
  }
} 