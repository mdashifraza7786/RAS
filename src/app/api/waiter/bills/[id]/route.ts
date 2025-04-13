import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Bill, { IBill } from '@/models/Bill';
import Order from '@/models/Order';

// GET /api/waiter/bills/[id] - Get a specific bill by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Use await with params to follow Next.js best practices
    const { id: billId } = await context.params;
    
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
    
    // Find the bill
    const bill = await Bill.findById(billId)
      .populate('order')
      .populate('table', 'number name');
    
    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    // Check if this bill belongs to this waiter
    if (bill.waiter && bill.waiter.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied - This bill was created by another waiter' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ bill });
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bill details' },
      { status: 500 }
    );
  }
}

// PUT /api/waiter/bills/[id] - Update a bill
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Use await with params to follow Next.js best practices
    const { id: billId } = await context.params;
    
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
    
    // Find the bill
    const bill = await Bill.findById(billId);
    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    // Check if this bill belongs to this waiter
    if (bill.waiter && String(bill.waiter) !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied - This bill was created by another waiter' },
        { status: 403 }
      );
    }
    
    // Get request body
    const data = await request.json();
    
    // Allowed fields to update
    const allowedUpdates = [
      'paymentMethod',
      'paymentStatus',
      'tip',
      'discount',
      'customerName',
      'customerPhone'
    ];
    
    // Filter out fields that aren't allowed to be updated
    const updates: Record<string, any> = {};
    allowedUpdates.forEach(field => {
      if (field in data) {
        updates[field] = data[field];
      }
    });
    
    // Recalculate total if tip or discount has changed
    if ('tip' in updates || 'discount' in updates) {
      const tip = 'tip' in updates ? updates.tip : bill.tip || 0;
      const discount = 'discount' in updates ? updates.discount : bill.discount || 0;
      updates.total = bill.subtotal + bill.tax + tip - discount;
    }
    
    // Update the bill
    const updatedBill = await Bill.findByIdAndUpdate(
      billId,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('order')
      .populate('table', 'number name');
    
    // If payment status is updated to 'paid', update the order as well
    if (updates.paymentStatus === 'paid') {
      await Order.findByIdAndUpdate(
        bill.order,
        { 
          paymentStatus: 'paid',
          paymentMethod: updates.paymentMethod || bill.paymentMethod
        }
      );
    }
    
    return NextResponse.json({
      message: 'Bill updated successfully',
      bill: updatedBill
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { error: 'Failed to update bill' },
      { status: 500 }
    );
  }
}

// DELETE /api/waiter/bills/[id] - Delete a bill
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Use await with params to follow Next.js best practices
    const { id: billId } = await context.params;
    
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
    
    // Find the bill
    const bill = await Bill.findById(billId);
    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    // Check if this bill belongs to this waiter
    if (bill.waiter && String(bill.waiter) !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied - This bill was created by another waiter' },
        { status: 403 }
      );
    }
    
    // Make sure the bill is not paid yet
    if (bill.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Cannot delete a paid bill' },
        { status: 400 }
      );
    }
    
    // Delete the bill
    await Bill.findByIdAndDelete(billId);
    
    return NextResponse.json({
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      { error: 'Failed to delete bill' },
      { status: 500 }
    );
  }
} 