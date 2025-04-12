import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Order from '@/models/Order';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';

// GET /api/bills - Get all bills (with optional filters)
export async function GET(request: NextRequest) {
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
    
    const searchParams = request.nextUrl.searchParams;
    
    // Build query filters based on search parameters
    const filters: Record<string, any> = {};
    
    // Payment status filter
    const paymentStatus = searchParams.get('paymentStatus');
    if (paymentStatus) {
      filters.paymentStatus = paymentStatus;
    }
    
    // Date range filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (startDate || endDate) {
      filters.createdAt = {};
      
      if (startDate) {
        filters.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        filters.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Apply pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Bill.countDocuments(filters);
    
    // Fetch bills with pagination and sorting
    const bills = await Bill.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('order', 'orderNumber')
      .populate('waiter', 'name');
    
    return NextResponse.json({
      bills,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

// POST /api/bills - Create a new bill
export async function POST(request: NextRequest) {
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
    
    // Validate required fields
    if (!data.order) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Check if order exists and is ready for billing
    const order = await Order.findById(data.order);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if bill already exists for this order
    const existingBill = await Bill.findOne({ order: data.order });
    if (existingBill) {
      return NextResponse.json(
        { error: 'A bill already exists for this order' },
        { status: 400 }
      );
    }
    
    // Calculate totals if not provided
    if (!data.subtotal) {
      data.subtotal = order.subtotal;
    }
    
    if (!data.tax) {
      data.tax = order.tax;
    }
    
    // Calculate total with tip and discount
    const subtotal = data.subtotal || 0;
    const tax = data.tax || 0;
    const tip = data.tip || 0;
    const discount = data.discount || 0;
    const total = subtotal + tax + tip - discount;
    
    // Assign bill number
    // Get the counter for bill numbers
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { name: 'billNumber' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const billNumber = counter.value;
    
    // Create bill with calculated values
    const billData = {
      ...data,
      billNumber,
      total,
      waiter: session.user.id
    };
    
    const bill = await Bill.create(billData);
    
    // Update order payment status if bill is marked as paid
    if (data.paymentStatus === 'paid') {
      order.paymentStatus = 'paid';
      order.paymentMethod = data.paymentMethod;
      await order.save();
    }
    
    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    );
  }
} 