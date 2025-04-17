import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'manager' && session.user.role !== 'waiter')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    
    const filters: Record<string, unknown> = {};
    
    const phone = searchParams.get('phone');
    if (phone) {
      filters.phone = { $regex: phone, $options: 'i' };
    }
    
    const name = searchParams.get('name');
    if (name) {
      filters.name = { $regex: name, $options: 'i' };
    }
    
    const minVisits = searchParams.get('minVisits');
    if (minVisits) {
      filters.visits = { $gte: parseInt(minVisits) };
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const total = await (Customer as any).countDocuments(filters);
    
    const customers = await (Customer as any).find(filters)
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'manager' && session.user.role !== 'waiter')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const data = await request.json();
    
    if (!data.name || !data.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }
    
    const existingCustomer = await (Customer as any).findOne({ phone: data.phone });
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'A customer with this phone number already exists', customer: existingCustomer },
        { status: 400 }
      );
    }
    
    if (!data.visits) {
      data.visits = 1;
    }
    
    if (!data.totalSpent) {
      data.totalSpent = 0;
    }
    
    if (!data.lastVisit) {
      data.lastVisit = new Date();
    }
    
    const customer = await (Customer as any).create(data);
    
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 