import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Table from '@/models/Table';
import MenuItem from '@/models/MenuItem';
import Customer from '@/models/Customer';
import { getServerSession } from 'next-auth';

// GET /api/stats - Get dashboard statistics based on role
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
    
    // Determine which stats to fetch based on user role
    let stats = {};
    
    if (session.user.role === 'manager') {
      stats = await getManagerStats();
    } else if (session.user.role === 'waiter') {
      stats = await getWaiterStats(session.user.id);
    } else if (session.user.role === 'chef') {
      stats = await getChefStats();
    }
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

// Get statistics for manager dashboard
async function getManagerStats() {
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Get orders for today
  const todayOrders = await Order.find({
    createdAt: { $gte: today, $lt: tomorrow }
  });
  
  // Calculate revenue
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  
  // Get total orders
  const totalOrders = await Order.countDocuments();
  
  // Get table status counts
  const tables = await Table.find();
  const tableStats = {
    total: tables.length,
    available: tables.filter(table => table.status === 'available').length,
    occupied: tables.filter(table => table.status === 'occupied').length,
    reserved: tables.filter(table => table.status === 'reserved').length,
    cleaning: tables.filter(table => table.status === 'cleaning').length
  };
  
  // Get popular menu items
  const popularItems = await MenuItem.find({ popular: true }).limit(5);
  
  // Get recent customers
  const recentCustomers = await Customer.find()
    .sort({ lastVisit: -1 })
    .limit(5);
  
  // Get pending orders
  const pendingOrders = await Order.find({ status: 'pending' })
    .populate('table', 'number name')
    .limit(5);
  
  return {
    todayOrders: todayOrders.length,
    todayRevenue,
    totalOrders,
    tableStats,
    popularItems,
    recentCustomers,
    pendingOrders
  };
}

// Get statistics for waiter dashboard
async function getWaiterStats(waiterId: string) {
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Get waiter's orders for today
  const todayOrders = await Order.find({
    waiter: waiterId,
    createdAt: { $gte: today, $lt: tomorrow }
  });
  
  // Calculate revenue from waiter's orders
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  
  // Get table status
  const tables = await Table.find().sort({ number: 1 });
  
  // Get active orders for this waiter
  const activeOrders = await Order.find({
    waiter: waiterId,
    status: { $in: ['pending', 'in-progress', 'ready'] }
  })
    .populate('table', 'number name')
    .sort({ createdAt: -1 });
  
  return {
    todayOrders: todayOrders.length,
    todayRevenue,
    tables,
    activeOrders
  };
}

// Get statistics for chef dashboard
async function getChefStats() {
  // Get counts of orders by status
  const pendingCount = await Order.countDocuments({ status: 'pending' });
  const inProgressCount = await Order.countDocuments({ status: 'in-progress' });
  const readyCount = await Order.countDocuments({ status: 'ready' });
  
  // Get pending orders that need to be prepared
  const pendingOrders = await Order.find({ status: 'pending' })
    .populate('table', 'number name')
    .sort({ createdAt: 1 });
  
  // Get orders in progress
  const inProgressOrders = await Order.find({ status: 'in-progress' })
    .populate('table', 'number name')
    .sort({ createdAt: 1 });
  
  // Get inventory status (for a real app, this would come from inventory model)
  const lowInventory = await MenuItem.find({ available: false }).limit(5);
  
  return {
    orderCounts: {
      pending: pendingCount,
      inProgress: inProgressCount,
      ready: readyCount
    },
    pendingOrders,
    inProgressOrders,
    lowInventory
  };
} 