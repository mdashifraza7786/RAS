import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

// Valid item statuses
const validItemStatuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];

// PUT /api/waiter/orders/[id]/items/[itemId]/status - Update item status
export async function PUT(
  request: NextRequest,
  context: { params: { id: string; itemId: string } }
) {
  try {
    // Use await with params to follow Next.js best practices
    const { id: orderId, itemId } = await context.params;
    console.log(`API: Updating item ${itemId} status for order ${orderId}`);
    
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
    
    // Parse request body
    const data = await request.json();
    console.log("API: Received item status update data:", JSON.stringify(data));
    
    // Validate status
    if (!data.status || !validItemStatuses.includes(data.status)) {
      return NextResponse.json(
        { error: 'Invalid status provided' },
        { status: 400 }
      );
    }
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if order is completed or cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot update items in a completed or cancelled order' },
        { status: 400 }
      );
    }
    
    // Find the item in the order
    const itemIndex = order.items.findIndex(
      (item: any) => item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in order' },
        { status: 404 }
      );
    }
    
    // Update the item status using MongoDB's positional operator
    const updatedOrder = await Order.findOneAndUpdate(
      { 
        _id: orderId, 
        'items._id': itemId 
      },
      { 
        $set: { 
          'items.$.status': data.status,
          updatedAt: new Date()
        } 
      },
      { new: true }
    );
    
    console.log(`API: Item status updated to ${data.status}`);
    
    // Check if all items are served and update order status if needed
    if (data.status === 'served') {
      const allServed = updatedOrder.items.every(
        (item: any) => item.status === 'served' || item.status === 'cancelled'
      );
      
      if (allServed && updatedOrder.status !== 'served') {
        updatedOrder.status = 'served';
        await updatedOrder.save();
        console.log("API: All items served, updated order status to served");
      }
    }
    
    return NextResponse.json({
      message: `Item status updated to ${data.status}`,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating item status:', error);
    return NextResponse.json(
      { error: 'Failed to update item status' },
      { status: 500 }
    );
  }
} 