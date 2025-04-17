import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Order from '@/models/Order';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    
    const filters: Record<string, any> = {};
    
    const paymentStatus = searchParams.get('paymentStatus');
    if (paymentStatus) {
      filters.paymentStatus = paymentStatus;
    }
    
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
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const total = await Bill.countDocuments(filters);
    
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || (session.user.role !== 'waiter' && session.user.role !== 'manager')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const data = await request.json();
    
    if (!data.order) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    const order = await Order.findById(data.order);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    const existingBill = await Bill.findOne({ order: data.order });
    if (existingBill) {
      return NextResponse.json(
        { error: 'A bill already exists for this order' },
        { status: 400 }
      );
    }
    
    if (!data.subtotal) {
      data.subtotal = order.subtotal;
    }
    
    if (!data.tax) {
      data.tax = order.tax;
    }
    
    const subtotal = data.subtotal || 0;
    const tax = data.tax || 0;
    const tip = data.tip || 0;
    const discount = data.discount || 0;
    const total = subtotal + tax + tip - discount;
    
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { name: 'billNumber' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const billNumber = counter.value;
    
    const billData = {
      ...data,
      billNumber,
      total,
      waiter: session.user.id
    };
    
    const bill = await Bill.create(billData);
    
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