import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';

// Interface for bill filters
interface BillFilters {
  paymentStatus?: string;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

// GET /api/bills/[id] - Get a specific bill
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
    
    // Find bill by ID and populate related data
    const bill = await Bill.findById(params.id)
      .populate('order')
      .populate('waiter', 'name');
    
    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bill' },
      { status: 500 }
    );
  }
}

// PUT /api/bills/[id] - Update a bill
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has waiter or manager role
    if (!session || (session.user.role !== 'waiter' && session.user.role !== 'manager')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const data = await request.json();
    
    // Find bill by ID
    const bill = await Bill.findById(params.id);
    
    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    // If updating amounts, recalculate total
    if (data.subtotal !== undefined || data.tax !== undefined || data.tip !== undefined || data.discount !== undefined) {
      const subtotal = data.subtotal !== undefined ? data.subtotal : bill.subtotal;
      const tax = data.tax !== undefined ? data.tax : bill.tax;
      const tip = data.tip !== undefined ? data.tip : bill.tip || 0;
      const discount = data.discount !== undefined ? data.discount : bill.discount || 0;
      
      data.total = subtotal + tax + tip - discount;
    }
    
    // Update bill
    const updatedBill = await Bill.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    // If payment status changed to 'paid', update the related order
    if (data.paymentStatus === 'paid' && bill.paymentStatus !== 'paid') {
      const order = await Order.findById(bill.order);
      if (order) {
        order.paymentStatus = 'paid';
        if (data.paymentMethod) {
          order.paymentMethod = data.paymentMethod;
        }
        await order.save();
      }
    }
    
    return NextResponse.json(updatedBill);
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { error: 'Failed to update bill' },
      { status: 500 }
    );
  }
}

// DELETE /api/bills/[id] - Delete a bill (manager only)
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
    
    const bill = await Bill.findById(params.id);
    
    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    // If bill is paid, check before deletion
    if (bill.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Cannot delete a paid bill. Consider voiding or refunding instead.' },
        { status: 400 }
      );
    }
    
    // Delete the bill
    await Bill.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      { error: 'Failed to delete bill' },
      { status: 500 }
    );
  }
} 