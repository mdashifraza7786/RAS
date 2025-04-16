import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Bill from '@/models/Bill';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ICustomer } from '@/models/Customer';

// GET /api/customers/[id] - Get a customer by ID (with optional history)
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated with appropriate role (manager or waiter)
    if (!session || (session.user.role !== 'manager' && session.user.role !== 'waiter')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const { id } = await params;
    
    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      );
    }
    
    // Get customer 
    const customer = await (Customer as any).findById(id);
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Check if we should include bill history
    const includeHistory = request.nextUrl.searchParams.get('history') === 'true';
    
    if (includeHistory) {
      // Find recent bills for this customer
      const recentBills = await (Bill as any).find({ customer: id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({
          path: 'order',
          select: 'orderNumber table items total status'
        })
        .lean();
      
      console.log(`Found ${recentBills.length} bills for customer ${id}`);
      
      return NextResponse.json({
        customer,
        recentBills
      });
    }
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update a customer
export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated with appropriate role (manager or waiter)
    if (!session || (session.user.role !== 'manager' && session.user.role !== 'waiter')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const { id } = await params;
    
    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Prevent updating critical fields directly
    const safeData = { ...data };
    delete safeData._id;
    delete safeData.createdAt;
    delete safeData.updatedAt;
    
    // Find and update customer
    const customer = await (Customer as any).findByIdAndUpdate(
      id,
      { $set: safeData },
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete a customer (manager only)
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only managers can delete customers
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized. Only managers can delete customers.' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const { id } = await params;
    
    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      );
    }
    
    // Find and delete customer
    const customer = await (Customer as any).findByIdAndDelete(id);
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
} 