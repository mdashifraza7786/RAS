import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Order from '@/models/Order';
import { Types } from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface PaymentStats {
  totalRevenue: number;
  averageOrderValue: number;
  paymentMethods: {
    [key: string]: number;
  };
  dailyRevenue: {
    date: string;
    amount: number;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const paymentMethod = searchParams.get('paymentMethod');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const query: any = {
      paymentStatus: 'paid'
    };
    
    query.paymentStatus = { $ne: 'refunded' };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (paymentMethod && paymentMethod !== 'all' && paymentMethod !== 'All Methods') {
      let dbPaymentMethod = paymentMethod.toLowerCase();
      if (dbPaymentMethod === 'card') {
        query.paymentMethod = 'card';
      } else if (dbPaymentMethod === 'wallet') {
        query.paymentMethod = 'upi';
      } else {
        query.paymentMethod = dbPaymentMethod;
      }
    }
    
    try {
      const total = await Bill.countDocuments(query);
      
      const bills = await Bill.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('order', 'orderNumber items')
        .populate('waiter', 'name')
        .lean();

      const mappedBills = bills.map(bill => ({
        ...bill,
        paidAt: bill.createdAt,
        customer: bill.customerName || 'Guest'
      }));
      
      const stats: PaymentStats = {
        totalRevenue: 0,
        averageOrderValue: 0,
        paymentMethods: {},
        dailyRevenue: []
      };
      
      const allBills = await Bill.find({ paymentStatus: 'paid' })
        .sort({ createdAt: 1 })
        .lean();
            
      allBills.forEach(bill => {
        stats.totalRevenue += bill.total;
        stats.paymentMethods[bill.paymentMethod] = (stats.paymentMethods[bill.paymentMethod] || 0) + bill.total;
        
        const date = new Date(bill.createdAt).toISOString().split('T')[0];
        const existingDay = stats.dailyRevenue.find(d => d.date === date);
        if (existingDay) {
          existingDay.amount += bill.total;
        } else {
          stats.dailyRevenue.push({ date, amount: bill.total });
        }
      });
      
      stats.averageOrderValue = stats.totalRevenue / (allBills.length || 1);
      
      return NextResponse.json({
        bills: mappedBills,
        stats,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const data = await request.json();
    
    if (!data.orderId || !data.amount || !data.paymentMethod) {
      return NextResponse.json(
        { error: 'Order ID, amount, and payment method are required' },
        { status: 400 }
      );
    }
    
    const order = await Order.findById(data.orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    const existingBill = await Bill.findOne({ order: data.orderId });
    if (existingBill) {
      return NextResponse.json(
        { error: 'Bill already exists for this order' },
        { status: 400 }
      );
    }
    
    const bill = await Bill.create({
      order: data.orderId,
      total: data.amount,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'paid',
      paidAt: new Date(),
      notes: data.notes
    });
    
    await Order.findByIdAndUpdate(data.orderId, { status: 'completed' });
    
    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const data = await request.json();
    const { billId, status, notes } = data;
    
    if (!billId || !status) {
      return NextResponse.json(
        { error: 'Bill ID and status are required' },
        { status: 400 }
      );
    }
    
    const bill = await Bill.findByIdAndUpdate(
      billId,
      {
        paymentStatus: status,
        notes: notes || undefined
      },
      { new: true }
    ).populate('order', 'orderNumber items');
    
    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    if (status === 'paid') {
      await Order.findByIdAndUpdate(bill.order, { status: 'completed' });
    }
    
    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
  
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Bill ID is required' },
        { status: 400 }
      );
    }
    
    const bill = await Bill.findById(id);
    
    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    if (bill.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Cannot delete paid bills' },
        { status: 400 }
      );
    }
    
    await Bill.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      { error: 'Failed to delete bill' },
      { status: 500 }
    );
  }
} 