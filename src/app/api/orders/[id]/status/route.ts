import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/models/Order';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Handle special "current" ID for getting all active orders
    if (id === 'current') {
      return NextResponse.json(
        { error: 'To get all current orders, use the /orders/table/{tableId} endpoint' },
        { status: 400 }
      );
    }

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // Get the order
    const order = await Order.findById(id).select('status items').lean();
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Return the order status and item statuses
    return NextResponse.json({
      status: order.status as string,
      items: (order.items || []).map((item: any) => ({
        id: item._id,
        status: item.status
      }))
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

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
    const validStatuses = ['pending', 'in-progress', 'ready', 'served', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('status').lean();

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: updatedOrder.status as string }, { status: 200 });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
