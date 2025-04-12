import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { getServerSession } from 'next-auth';

// GET /api/customers - Get all customers (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated with appropriate role (manager or waiter)
    if (!session || (session.user.role !== 'manager' && session.user.role !== 'waiter')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    
    // Build query filters based on search parameters
    const filters: Record<string, unknown> = {};
    
    // Phone search
    const phone = searchParams.get('phone');
    if (phone) {
      filters.phone = { $regex: phone, $options: 'i' };
    }
    
    // Name search
    const name = searchParams.get('name');
    if (name) {
      filters.name = { $regex: name, $options: 'i' };
    }
    
    // Visits filter
    const minVisits = searchParams.get('minVisits');
    if (minVisits) {
      filters.visits = { $gte: parseInt(minVisits) };
    }
    
    // Apply pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Customer.countDocuments(filters);
    
    // Fetch customers with pagination and sorting
    const customers = await Customer.find(filters)
      .sort({ lastVisit: -1 })
      .skip(skip)
      .limit(limit);
    
    return NextResponse.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated with appropriate role (manager or waiter)
    if (!session || (session.user.role !== 'manager' && session.user.role !== 'waiter')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }
    
    // Check if customer with this phone already exists
    const existingCustomer = await Customer.findOne({ phone: data.phone });
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'A customer with this phone number already exists', customer: existingCustomer },
        { status: 400 }
      );
    }
    
    // Set defaults if not provided
    if (!data.visits) {
      data.visits = 1;
    }
    
    if (!data.totalSpent) {
      data.totalSpent = 0;
    }
    
    if (!data.lastVisit) {
      data.lastVisit = new Date();
    }
    
    // Create the customer
    const customer = await Customer.create(data);
    
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 