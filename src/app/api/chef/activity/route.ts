import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import MenuItem from '@/models/MenuItem';
import Inventory from '@/models/Inventory';
import { formatDistanceToNow } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'chef') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    await connectToDatabase();
    
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const activities = [];
    
    const orders = await (Order as any).find({ 
      status: { $in: ['pending', 'in-progress', 'ready', 'completed'] }
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id orderNumber status updatedAt createdAt items waiterId');
      
    for (const order of orders) {
      let action = '';
      let type = 'order';

      const isNew = order.createdAt.toString() === order.updatedAt.toString();
      
      switch (order.status) {
        case 'pending':
          action = isNew 
            ? `New order #${order.orderNumber || order._id.toString().slice(-6)} received` 
            : `Order #${order.orderNumber || order._id.toString().slice(-6)} is pending preparation`;
          type = 'order_new';
          break;
        case 'in-progress':
          action = `Order #${order.orderNumber || order._id.toString().slice(-6)} is being prepared`;
          type = 'order_cooking';
          break;
        case 'ready':
          action = `Order #${order.orderNumber || order._id.toString().slice(-6)} is ready for pickup`;
          type = 'order_ready';
          break;
        case 'completed':
          action = `Order #${order.orderNumber || order._id.toString().slice(-6)} was served`;
          type = 'order_completed';
          break;
        case 'cancelled':
          action = `Order #${order.orderNumber || order._id.toString().slice(-6)} was cancelled`;
          type = 'order_cancelled';
          break;
        default:
          action = `Order #${order.orderNumber || order._id.toString().slice(-6)} was updated`;
          type = 'order_update';
      }

      activities.push({
        id: order._id.toString(),
        type,
        action,
        timestamp: order.updatedAt,
        timeSince: formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true }),
        details: {
          items: order.items.length,
          status: order.status,
          orderId: order._id.toString()
        }
      });
    }
    
    const inventoryUpdates = await (Inventory as any).find({})
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Math.floor(limit / 2))
      .select('_id itemName quantity threshold updatedAt');
      
    for (const item of inventoryUpdates) {
      const isLow = item.quantity <= item.threshold;
      const action = isLow
        ? `Low inventory alert: ${item.itemName} (${item.quantity} units)`
        : `Inventory updated: ${item.itemName} (${item.quantity} units)`;
        
      activities.push({
        id: item._id.toString(),
        type: isLow ? 'inventory_low' : 'inventory_update',
        action,
        timestamp: item.updatedAt,
        timeSince: formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true }),
        details: {
          itemName: item.itemName,
          quantity: item.quantity,
          threshold: item.threshold,
          isLow
        }
      });
    }
    
    const menuUpdates = await (MenuItem as any).find({})
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Math.floor(limit / 2))
      .select('_id name category available updatedAt');
      
    for (const item of menuUpdates) {
      const action = `Menu item updated: ${item.name} (${item.available ? 'Available' : 'Unavailable'})`;
      
      activities.push({
        id: item._id.toString(),
        type: 'menu_update',
        action,
        timestamp: item.updatedAt,
        timeSince: formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true }),
        details: {
          name: item.name,
          category: item.category,
          available: item.available
        }
      });
    }
    
    activities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    const orderCount = await (Order as any).countDocuments({ 
      status: { $in: ['pending', 'in-progress', 'ready', 'completed'] }
    });
    const inventoryCount = await (Inventory as any).countDocuments({});
    const menuCount = await (MenuItem as any).countDocuments({});
    
    const totalCount = orderCount + inventoryCount + menuCount;
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('Error fetching chef activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
} 