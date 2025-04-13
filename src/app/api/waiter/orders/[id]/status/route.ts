import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import Table from '@/models/Table';

// PATCH /api/waiter/orders/[id]/status - Update order status
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is a waiter
    if (session.user.role !== 'waiter') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectToDatabase();
    
    // Get the requested status update
    const data = await request.json();
    
    if (!data.status && !data.paymentStatus) {
      return NextResponse.json(
        { error: 'Status or paymentStatus is required' },
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
    
    // Prepare update object
    const updateData: Record<string, any> = {};
    
    // Update order status if provided
    if (data.status) {
      // Validate status
      const validStatuses = ['pending', 'in-progress', 'ready', 'served', 'completed', 'cancelled'];
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json(
          { error: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ') },
          { status: 400 }
        );
      }
      
      // Update status
      updateData.status = data.status;
    }
    
    // Update payment status if provided
    if (data.paymentStatus) {
      // Validate payment status
      const validPaymentStatuses = ['paid', 'unpaid', 'refunded'];
      if (!validPaymentStatuses.includes(data.paymentStatus)) {
        return NextResponse.json(
          { error: 'Invalid payment status. Valid statuses are: ' + validPaymentStatuses.join(', ') },
          { status: 400 }
        );
      }
      
      // Update payment status
      updateData.paymentStatus = data.paymentStatus;
      
      // If marking as paid, record payment method if provided
      if (data.paymentStatus === 'paid' && data.paymentMethod) {
        const validPaymentMethods = ['cash', 'card', 'upi'];
        if (!validPaymentMethods.includes(data.paymentMethod)) {
          return NextResponse.json(
            { error: 'Invalid payment method. Valid methods are: ' + validPaymentMethods.join(', ') },
            { status: 400 }
          );
        }
        
        updateData.paymentMethod = data.paymentMethod;
        
        // Mark the associated table as available when payment is completed
        if (order.table) {
          await Table.findByIdAndUpdate(
            order.table,
            { $set: { status: 'available' } },
            { new: true }
          );
        }
      }
    }
    
    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    return NextResponse.json({
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 