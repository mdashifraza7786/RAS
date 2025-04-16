import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import connectToDatabase from '@/lib/mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    // Connect to database
    await connectToDatabase();

    const { id, itemId } = params;

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validItemStatuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
    if (!status || !validItemStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid item status value' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Find the specific item
    const itemIndex = order.items.findIndex(
      (item: any) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in order' },
        { status: 404 }
      );
    }

    // Update the item status
    order.items[itemIndex].status = status;

    // Also update the overall order status based on item statuses
    // If all items are 'ready', set order to 'ready'
    if (status === 'ready' && order.items.every((item: any) => item.status === 'ready')) {
      order.status = 'ready';
    } 
    // If any item is 'preparing', set order to 'in-progress'
    else if (status === 'preparing' && order.status === 'pending') {
      order.status = 'in-progress';
    }

    // Save the order
    await order.save();

    // Return the updated order and item
    return NextResponse.json({
      order: {
        id: order._id,
        status: order.status
      },
      item: {
        id: itemId,
        status: order.items[itemIndex].status
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating item status:', error);
    return NextResponse.json(
      { error: 'Failed to update item status' },
      { status: 500 }
    );
  }
} 