import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Table from '@/models/Table';
import { getServerSession } from 'next-auth';

// GET /api/orders/[id] - Get a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Find order by ID and populate related data
    const order = await Order.findById(params.id)
      .populate('table', 'number name')
      .populate('waiter', 'name');
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update an order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const data = await request.json();
    
    // Check what parts of the order can be updated based on role
    if (session.user.role === 'chef') {
      // Chef can only update item status or order status
      const allowedFields = ['items', 'status'];
      const requestedUpdates = Object.keys(data);
      
      const isValidOperation = requestedUpdates.every(update => 
        allowedFields.includes(update) || 
        (update === 'items' && Array.isArray(data.items))
      );
      
      if (!isValidOperation) {
        return NextResponse.json(
          { error: 'Chef can only update item status or order status' },
          { status: 403 }
        );
      }
      
      // If updating items, ensure we're only updating the status field
      if (data.items) {
        const order = await Order.findById(params.id);
        if (!order) {
          return NextResponse.json(
            { error: 'Order not found' },
            { status: 404 }
          );
        }
        
        // Create a new items array with updated statuses only
        const updatedItems = order.items.map(existingItem => {
          const updatedItem = data.items.find(
            (item: any) => item._id.toString() === existingItem._id.toString()
          );
          
          if (updatedItem && updatedItem.status) {
            return {
              ...existingItem.toObject(),
              status: updatedItem.status
            };
          }
          
          return existingItem;
        });
        
        data.items = updatedItems;
      }
    }
    
    // Find and update the order
    const order = await Order.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // If order status changes to 'completed', update table status
    if (data.status === 'completed' && order.table) {
      // Check if there are other active orders for this table
      const otherActiveOrders = await Order.countDocuments({
        table: order.table,
        status: { $nin: ['completed', 'cancelled'] },
        _id: { $ne: order._id }
      });
      
      // If no other active orders, mark table as available for cleaning
      if (otherActiveOrders === 0) {
        await Table.findByIdAndUpdate(
          order.table,
          { $set: { status: 'cleaning' } }
        );
      }
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Delete an order (manager only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has manager role
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Get the order before deletion to handle table status update
    const order = await Order.findById(params.id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Delete the order
    await Order.findByIdAndDelete(params.id);
    
    // Check if there are other active orders for this table
    if (order.table) {
      const otherActiveOrders = await Order.countDocuments({
        table: order.table,
        status: { $nin: ['completed', 'cancelled'] }
      });
      
      // If no other active orders, mark table as available
      if (otherActiveOrders === 0) {
        await Table.findByIdAndUpdate(
          order.table,
          { $set: { status: 'available' } }
        );
      }
    }
    
    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
} 