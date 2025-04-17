import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import connectToDatabase from '@/lib/mongodb';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    await connectToDatabase();

    const { id, itemId } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const validItemStatuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
    if (!status || !validItemStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid item status value' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const itemIndex = order.items.findIndex(
      (item: any) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in order' },
        { status: 404 }
      );
    }

    order.items[itemIndex].status = status;

    if (status === 'ready' && order.items.every((item: any) => item.status === 'ready')) {
      order.status = 'ready';
    } 
    else if (status === 'preparing' && order.status === 'pending') {
      order.status = 'in-progress';
    }
    
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