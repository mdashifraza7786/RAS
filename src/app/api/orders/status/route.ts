import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order, { IOrder, OrderItem } from '@/models/Order';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({ orderNumber }).select('status items createdAt');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: order.status,
      items: order.items.map((item: any) => ({
        id: item._id.toString(),
        name: item.name,
        status: item.status
      })),
      createdAt: order.createdAt
    });

  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { orderNumber, status, itemId, itemStatus } = await request.json();

    if (!orderNumber || (!status && !itemStatus)) {
      return NextResponse.json(
        { error: 'Order number and status are required' },
        { status: 400 }
      );
    }

    await connectDB();

    let updateQuery: any = {};
    
    // Update specific item status
    if (itemId && itemStatus) {
      updateQuery = {
        $set: { "items.$[elem].status": itemStatus }
      };
      const arrayFilters = [{ "elem._id": itemId }];
      
      const order = await Order.findOneAndUpdate(
        { orderNumber },
        updateQuery,
        { 
          arrayFilters,
          new: true 
        }
      );

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: order.status,
        items: order.items.map((item: any) => ({
          id: item._id.toString(),
          name: item.name,
          status: item.status
        }))
      });
    }

    // Update overall order status
    if (status) {
      updateQuery = { status };
      
      const order = await Order.findOneAndUpdate(
        { orderNumber },
        updateQuery,
        { new: true }
      );

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: order.status,
        items: order.items.map((item: any) => ({
          id: item._id.toString(),
          name: item.name,
          status: item.status
        }))
      });
    }

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 