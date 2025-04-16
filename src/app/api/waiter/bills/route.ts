import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import Bill from '@/models/Bill';
import Order from '@/models/Order';
import Customer from '@/models/Customer';

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
      const bills = await (Bill as any).find({ waiter: session.user.id })
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
    const total = await (Bill as any).countDocuments(filters);
    
    // Fetch bills with pagination and sorting
    const bills = await (Bill as any).find(filters)
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
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated with role of waiter
    if (!session || session.user.role !== 'waiter') {
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
    
    // Check if order exists
    const order = await (Order as any).findById(data.order);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if bill already exists for this order
    const existingBill = await (Bill as any).findOne({ order: data.order });
    if (existingBill) {
      return NextResponse.json(
        { error: 'A bill already exists for this order', bill: existingBill },
        { status: 400 }
      );
    }
    
    // Get next bill number 
    const billNumber = await (Bill as any).getNextBillNumber();
    
    // Create bill data
    const billData = {
      ...data,
      billNumber,
      // Use order data if not provided in request
      subtotal: data.subtotal || order.subtotal,
      tax: data.tax || order.tax,
      total: data.total || order.total,
      // Include order's customer information if available
      customerName: data.customerName || order.customerName,
      customerPhone: data.customerPhone || order.customerPhone,
      customer: data.customer || order.customer,
      waiter: session.user.id
    };
    
    // Create the bill
    const bill = await (Bill as any).create(billData);
    
    // Update order payment status to paid
    order.paymentStatus = 'paid';
    order.paymentMethod = data.paymentMethod;
    order.status = 'completed';
    await order.save();
    
    // If a customer ID is associated with this bill, update their stats
    if (bill.customer) {
      const customer = await (Customer as any).findById(bill.customer);
      if (customer) {
        customer.visits = (customer.visits || 0) + 1;
        customer.totalSpent = (customer.totalSpent || 0) + bill.total;
        customer.lastVisit = new Date();
        await customer.save();
      }
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