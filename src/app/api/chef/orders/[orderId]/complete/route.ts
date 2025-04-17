import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Order, { IOrder, OrderStatus, ItemStatus } from '@/models/Order';
import { Model } from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'chef') {
      return NextResponse.json(
        { error: 'Unauthorized - Chef access required' },
        { status: 401 }
      );
    }

    await connectDB();

    const order = await Order.findById(params.orderId).lean() as IOrder;
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== OrderStatus.Cooking) {
      return NextResponse.json(
        { error: 'Order must be in cooking status to be completed' },
        { status: 400 }
      );
    }

    // Update order with new status and completion time
    const updatedOrder = await (Order as Model<IOrder>).findByIdAndUpdate(
      params.orderId,
      {
        $set: {
          status: OrderStatus.Ready,
          completedAt: new Date(),
          items: order.items.map(item => ({
            ...item,
            status: (item.status === ItemStatus.Pending || item.status === ItemStatus.InProgress) 
              ? ItemStatus.Ready 
              : item.status
          }))
        },
        $push: {
          events: {
            timestamp: new Date(),
            action: 'completed',
            user: session.user.name || 'Unknown Chef'
          }
        }
      },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Order marked as completed',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error completing order:', error);
    return NextResponse.json(
      { error: 'Failed to complete order' },
      { status: 500 }
    );
  }
} 