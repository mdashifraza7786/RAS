import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

// DELETE /api/waiter/orders/[id]/removeItem - Remove an item from an order
export async function DELETE(
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
    const { itemId } = await request.json();
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
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
    
    // Check if the order is completed or cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
      return NextResponse.json(
        { error: `Cannot remove items from a ${order.status} order` },
        { status: 400 }
      );
    }
    
    // Find the item in the order
    const itemIndex = order.items.findIndex((item: { id: string }) => item.id === itemId);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in this order' },
        { status: 404 }
      );
    }
    
    // Get the item price to subtract from the total
    const itemPrice = order.items[itemIndex].price * order.items[itemIndex].quantity;
    
    // Remove the item
    order.items.splice(itemIndex, 1);
    
    // Update the total price
    order.totalPrice = Math.max(0, order.totalPrice - itemPrice);
    order.updatedAt = new Date();
    
    // Save the order
    await order.save();
    
    return NextResponse.json({
      message: 'Item removed from order successfully',
      order: {
        id: order._id,
        totalPrice: order.totalPrice,
        itemCount: order.items.length
      }
    });
  } catch (error) {
    console.error('Error removing item from order:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from order' },
      { status: 500 }
    );
  }
} 