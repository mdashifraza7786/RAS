import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order, { OrderItem } from '@/models/Order';
import Table from '@/models/Table';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

// Define proper types for filters
interface OrderFilters {
  status?: string | { $in: string[] };
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

// GET /api/orders - Get all orders (with optional filters)
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
    const filters: OrderFilters = {};
    
    // Status filter
    const status = searchParams.get('status');
    if (status) {
      filters.status = status;
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
    
    // If chef, only show orders that are pending, in-progress, or ready
    if (session.user.role === 'chef') {
      filters.status = { $in: ['pending', 'in-progress', 'ready'] };
    }
    
    // Apply pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Order.countDocuments(filters);
    
    // Fetch orders with pagination and sorting
    const orders = await Order.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('table', 'number name')
      .populate('waiter', 'name');
    
    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and has waiter or manager role (or is a guest)
    const isGuest = request.headers.get('x-guest-token') === process.env.GUEST_TOKEN;
    
    if (!isGuest && (!session || (session.user.role !== 'waiter' && session.user.role !== 'manager'))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const data = await request.json();
    
    // Validate required fields
    if (!data.table || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Table and at least one item are required' },
        { status: 400 }
      );
    }
    
    // Verify table exists and is available or occupied
    const table = await Table.findById(data.table);
    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }
    
    if (table.status !== 'available' && table.status !== 'occupied') {
      return NextResponse.json(
        { error: 'Table is not available for orders' },
        { status: 400 }
      );
    }
    
    // Calculate subtotal, tax, and total
    const subtotal = data.items.reduce(
      (sum: number, item: OrderItem) => sum + item.price * item.quantity,
      0
    );
    
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% tax
    const total = subtotal + tax;
    
    // Assign order number
    // Get the counter for order numbers
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { name: 'orderNumber' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const orderNumber = counter.value;
    
    // Create order with calculated values
    const orderData = {
      ...data,
      orderNumber,
      subtotal,
      tax,
      total,
      status: 'pending',
      paymentStatus: 'unpaid',
      waiter: session?.user.id || null
    };
    
    const order = await Order.create(orderData);
    
    // Update table status to occupied
    if (table.status === 'available') {
      table.status = 'occupied';
      await table.save();
    }
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 