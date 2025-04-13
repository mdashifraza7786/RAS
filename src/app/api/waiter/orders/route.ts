import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Table from '@/models/Table';
import mongoose from 'mongoose';

// GET /api/waiter/orders - Get waiter's orders
export async function GET(req: NextRequest) {
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

    // Connect to the database
    await connectToDatabase();

    // Get waiterId from the session
    const waiterId = session.user.id;

    // Get query parameters for filtering
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Increased limit to show more orders
    const skip = (page - 1) * limit;

    // Build query filter
    const filter: any = { waiter: waiterId };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      filter.status = status;
    }

    console.log('Filter applied:', JSON.stringify(filter));

    // Get total count for pagination
    const total = await Order.countDocuments(filter);
    console.log(`Found ${total} orders matching filter`);

    // Fetch orders with pagination
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('table', 'number name')
      .lean();

    console.log(`Returning ${orders.length} orders`);

    // Return orders with pagination info
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
    console.error('Error fetching waiter orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/waiter/orders - Create a new order
export async function POST(req: NextRequest) {
  try {
    console.log("Waiter API: Order creation started");
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log("Waiter API: No session found");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is a waiter
    if (session.user.role !== 'waiter') {
      console.log("Waiter API: User role is not waiter, found:", session.user.role);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Connect to the database
    await connectToDatabase();

    // Get waiterId from the session
    const waiterId = session.user.id;
    console.log("Waiter API: Processing order for waiter ID:", waiterId);
    
    // Parse request body
    const data = await req.json();
    console.log("Waiter API: Received order data:", JSON.stringify(data));

    // Validate required fields
    if (!data.table || !data.items || !data.items.length) {
      return NextResponse.json(
        { error: 'Table and items are required' },
        { status: 400 }
      );
    }

    // Find the table
    const table = await Table.findById(data.table);
    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }
    
    // Check if the table is assigned to this waiter if it's an assigned table
    if (table.assignedTo && table.assignedTo.toString() !== waiterId) {
      console.log(`Waiter API: Table ${table._id} is assigned to ${table.assignedTo}, not to the current waiter ${waiterId}`);
      // Still allow the order but log it
    }

    // Calculate subtotal, tax, and total
    const subtotal = data.items.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity),
      0
    );
    const tax = Math.round(subtotal * 0.10 * 100) / 100; // 10% tax
    const total = Math.round((subtotal + tax) * 100) / 100;

    // Get the next order number
    const Counter = mongoose.models.Counter || mongoose.model('Counter', new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      value: { type: Number, default: 0 }
    }));
    
    const counter = await Counter.findOneAndUpdate(
      { name: 'orderNumber' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const orderNumber = counter.value;
    console.log("Waiter API: Generated order number:", orderNumber);

    // Create order with calculated values
    const orderData = {
      ...data,
      orderNumber,
      subtotal,
      tax,
      total,
      status: 'pending',
      paymentStatus: 'unpaid',
      waiter: waiterId // Ensure waiter ID is set from the session
    };
    
    console.log("Waiter API: Final order data:", JSON.stringify(orderData));
    const order = await Order.create(orderData);
    console.log("Waiter API: Order created successfully with ID:", order._id);

    // Update table status to occupied if currently available
    if (table.status === 'available') {
      table.status = 'occupied';
      await table.save();
      console.log("Waiter API: Updated table status to occupied");
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating waiter order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 