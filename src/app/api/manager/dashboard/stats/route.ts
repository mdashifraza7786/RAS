import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import Bill from '@/models/Bill';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a manager
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Get current date and last month's date
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get total revenue for current month
    const currentMonthRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);
    
    // Get total revenue for last month
    const lastMonthRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth, $lt: thisMonth },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);
    
    // Get total orders for current month
    const currentMonthOrders = await Order.countDocuments({
      createdAt: { $gte: thisMonth }
    });
    
    // Get total orders for last month
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth }
    });
    
    // Get new customers this month
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: thisMonth }
    });
    
    // Get new customers last month
    const lastMonthCustomers = await Customer.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth }
    });
    
    // Calculate average order value
    const avgOrderValue = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$total' }
        }
      }
    ]);
    
    // Calculate revenue growth
    const currentRevenue = currentMonthRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    // Calculate order growth
    const orderGrowth = lastMonthOrders ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0;
    
    // Calculate customer growth
    const customerGrowth = lastMonthCustomers ? ((newCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0;
    
    return NextResponse.json({
      revenue: {
        current: currentRevenue,
        growth: revenueGrowth
      },
      orders: {
        total: currentMonthOrders,
        growth: orderGrowth
      },
      customers: {
        new: newCustomers,
        growth: customerGrowth
      },
      averageOrderValue: {
        current: Math.round(avgOrderValue[0]?.avg || 0),
        previous: Math.round((previousRevenue / lastMonthOrders) || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching manager stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manager statistics' },
      { status: 500 }
    );
  }
} 