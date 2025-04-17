import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Table from '@/models/Table';
import { getServerSession } from 'next-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const data = await request.json();
    
    if (session.user.role === 'chef') {
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
      
      if (data.items) {
        const order = await Order.findById(params.id);
        if (!order) {
          return NextResponse.json(
            { error: 'Order not found' },
            { status: 404 }
          );
        }
        
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
    
    if (data.status === 'completed' && order.table) {
      const otherActiveOrders = await Order.countDocuments({
        table: order.table,
        status: { $nin: ['completed', 'cancelled'] },
        _id: { $ne: order._id }
      });
      
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const order = await Order.findById(params.id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    await Order.findByIdAndDelete(params.id);
    
    if (order.table) {
      const otherActiveOrders = await Order.countDocuments({
        table: order.table,
        status: { $nin: ['completed', 'cancelled'] }
      });
      
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