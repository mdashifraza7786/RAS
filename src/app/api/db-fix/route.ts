import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Bill from '@/models/Bill';
import Order from '@/models/Order';
import mongoose from 'mongoose';

// POST /api/db-fix - Fix customer order history
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const customerId = data.customerId;
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }
    
    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json(
        { error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }
    
    // Find the customer
    const customer = await (Customer as any).findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Create a test order if none exists
    let order = await (Order as any).findOne({
      customer: customerId
    });
    
    if (!order) {
      // Get next order number
      const orderNumber = await (Order as any).getNextOrderNumber();
      
      // Create a test order
      order = await (Order as any).create({
        orderNumber,
        table: new mongoose.Types.ObjectId(), // dummy table ID
        items: [
          {
            menuItem: new mongoose.Types.ObjectId(), // dummy menu item ID
            name: "Test Item",
            price: 100,
            quantity: 1,
            status: "served"
          }
        ],
        status: "completed",
        subtotal: 100,
        tax: 18,
        total: 118,
        paymentStatus: "paid",
        paymentMethod: "cash",
        customer: customerId,
        customerName: customer.name,
        customerPhone: customer.phone
      });
    }
    
    // Create a test bill if none exists
    let bill = await (Bill as any).findOne({
      customer: customerId
    });
    
    if (!bill) {
      // Get next bill number
      const billNumber = await (Bill as any).getNextBillNumber();
      
      // Create a test bill
      bill = await (Bill as any).create({
        billNumber,
        order: order._id,
        subtotal: 100,
        tax: 18,
        total: 118,
        paymentMethod: "cash",
        paymentStatus: "paid",
        customerName: customer.name,
        customerPhone: customer.phone,
        customer: customerId,
        waiter: "system"
      });
      
      // Update customer stats
      customer.visits = (customer.visits || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + bill.total;
      customer.lastVisit = new Date();
      await customer.save();
    }
    
    return NextResponse.json({
      message: 'Customer order history fixed',
      customer,
      order,
      bill
    });
  } catch (error) {
    console.error('Error fixing customer order history:', error);
    return NextResponse.json(
      { error: 'Failed to fix customer order history' },
      { status: 500 }
    );
  }
} 