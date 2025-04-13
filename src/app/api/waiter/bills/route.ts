import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import Bill from '@/models/Bill';
import Order from '@/models/Order';

// GET /api/waiter/bills - Get all bills (with pagination and filtering)
export async function GET(request: NextRequest) {
  try {
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
    
    const searchParams = request.nextUrl.searchParams;
    
    // Check if this is the 'all' request
    if (searchParams.has('all')) {
      // Log session ID and search params for debugging
      console.log('Getting all bills for waiter:', session.user.id);
      console.log('Search params:', Object.fromEntries(searchParams.entries()));
      
      // Only fetch bills created by this waiter without pagination
      const bills = await Bill.find({ waiter: session.user.id })
        .sort({ createdAt: -1 })
        .populate('order', 'orderNumber items status')
        .populate('table', 'number name');
      
      console.log(`Found ${bills.length} bills for waiter ${session.user.id}`);
      
      return NextResponse.json({ bills });
    }
    
    // Otherwise, handle the regular paginated request:
    // Build query filters
    const filters: Record<string, any> = {};
    
    // Only show bills created by this waiter
    filters.waiter = session.user.id;
    
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
    
    // Table filter
    const tableId = searchParams.get('tableId');
    if (tableId) {
      filters.table = tableId;
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
      .populate('order', 'orderNumber items status');
    
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

// POST /api/waiter/bills - Create a new bill
export async function POST(request: NextRequest) {
  try {
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
    const data = await request.json();
    
    // Validate required fields
    if (!data.order) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Check if order exists
    const order = await Order.findById(data.order);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if a bill already exists for this order
    const existingBill = await Bill.findOne({ order: data.order });
    if (existingBill) {
      return NextResponse.json(
        { error: 'A bill already exists for this order' },
        { status: 400 }
      );
    }
    
    // Make sure the order is in a billable state
    if (order.status !== 'served' && order.status !== 'completed') {
      return NextResponse.json(
        { error: 'Order must be served or completed before creating a bill' },
        { status: 400 }
      );
    }
    
    // Ensure subtotal and tax are set
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
    
    // Get the next bill number
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { name: 'billNumber' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const billNumber = counter.value;
    
    // Create the bill document
    const billData = {
      ...data,
      billNumber,
      total,
      waiter: session.user.id,
      table: order.table,
      paymentStatus: data.paymentStatus || 'pending'
    };
    
    const bill = await Bill.create(billData);
    
    // Update order payment status if bill is marked as paid
    if (data.paymentStatus === 'paid') {
      order.paymentStatus = 'paid';
      order.paymentMethod = data.paymentMethod;
      await order.save();
    }
    
    // Return the created bill
    return NextResponse.json({
      message: 'Bill created successfully',
      bill
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    );
  }
} 