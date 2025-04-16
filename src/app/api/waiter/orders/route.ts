import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Table from '@/models/Table';
import Customer from '@/models/Customer';
import mongoose from 'mongoose';
import { IOrder } from '@/models/Order';

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
    const orders = await (Order as any).find(filter)
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
export async function POST(request: NextRequest) {
  try {
    console.log("Starting order creation process");
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated with role waiter
    if (!session || !session.user || session.user.role !== 'waiter') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    console.log("Connected to database");
    
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.table || !data.items || !data.items.length) {
      return NextResponse.json(
        { error: 'Table and items are required' },
        { status: 400 }
      );
    }
    
    // Get table
    const table = await (Table as any).findById(data.table);
    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }
    
    try {
      console.log("Generating order number");
      // Generate unique order number
      const orderNumber = await Order.getNextOrderNumber();
      console.log("Generated order number:", orderNumber);
      
      // Calculate totals
      const subtotal = data.items.reduce(
        (sum: number, item: any) => sum + (item.price * item.quantity), 
        0
      );
      const tax = Math.round(subtotal * 0.10 * 100) / 100; // 10% tax
      const total = Math.round((subtotal + tax) * 100) / 100;
      
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
      
      console.log("Creating order with data:", JSON.stringify(orderData));
      // Create the order
      const order = await (Order as any).create(orderData);
      console.log("Order created successfully:", order._id);
      
      // Update table status to occupied if it's not already
      if (table.status === 'available') {
        table.status = 'occupied';
        await table.save();
        console.log("Table status updated to occupied");
      }
      
      // If this order has customer information, update the customer's stats
      if (order.customer) {
        try {
          console.log("Updating customer stats for customer:", order.customer);
          const customer = await (Customer as any).findById(order.customer);
          if (customer) {
            // Increment visits
            customer.visits += 1;
            // Update last visit date
            customer.lastVisit = new Date();
            await customer.save();
            console.log("Customer stats updated successfully");
          }
        } catch (error) {
          console.error('Error updating customer stats:', error);
          // Continue even if this fails
        }
      }
      
      return NextResponse.json(order, { status: 201 });
    } catch (error) {
      console.error('Error in order creation process:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to process order' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 