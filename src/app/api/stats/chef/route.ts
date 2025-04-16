import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import MenuItem from '@/models/MenuItem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get counts of orders by status
    const pendingCount = await Order.countDocuments({ status: 'pending' });
    const inProgressCount = await Order.countDocuments({ status: 'in-progress' });
    const readyCount = await Order.countDocuments({ status: 'ready' });
    
    // Get completed orders count for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = await Order.countDocuments({
      status: 'completed', 
      updatedAt: { $gte: today }
    });
    
    // Get average preparation time from orders completed in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const completedOrders = await Order.find({
      status: 'completed',
      createdAt: { $gte: sevenDaysAgo }
    }).lean();
    
    let avgPrepTime = 0;
    if (completedOrders.length > 0) {
      const totalPrepTime = completedOrders.reduce((sum, order) => {
        const createdTime = new Date(order.createdAt).getTime();
        const completedTime = new Date(order.updatedAt).getTime();
        return sum + (completedTime - createdTime) / (1000 * 60); // Convert to minutes
      }, 0);
      
      avgPrepTime = Math.round(totalPrepTime / completedOrders.length);
    }
    
    // Get inventory low items
    const lowInventoryItems = await MenuItem.find({ available: false }).limit(5).lean();

    // Return stats
    return NextResponse.json({
      pendingOrders: pendingCount,
      inProgressOrders: inProgressCount,
      completedOrders: completedToday,
      readyOrders: readyCount,
      averagePreparationTime: avgPrepTime,
      lowInventoryItems: lowInventoryItems.map(item => ({
        _id: item._id.toString(),
        name: item.name
      }))
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching chef stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chef dashboard stats' },
      { status: 500 }
    );
  }
} 