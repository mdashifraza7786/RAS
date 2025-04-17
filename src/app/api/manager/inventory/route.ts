import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Inventory from '@/models/Inventory';
import Order from '@/models/Order';
import { Types } from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkManagerAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const query: any = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (lowStock) {
      query.$or = [
        { status: 'Low Stock' },
        { status: 'Critical Stock' },
        { status: 'Out of Stock' }
      ];
    }
    
    const total = await Inventory.countDocuments(query);
    
    const items = await Inventory.find(query)
      .sort({ category: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    const itemsWithExpiryStatus = items.map(item => {
      const now = new Date();
      const expiryDate = new Date(item.expiryDate);
      const diffTime = expiryDate.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...item,
        daysUntilExpiry,
        expiryStatus: daysUntilExpiry <= 7 ? 'Expiring Soon' : 'Good'
      };
    });
    
    return NextResponse.json({
      items: itemsWithExpiryStatus,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    const data = await request.json();
    
    console.log("Received inventory data:", data);
    
    if (!data.name || !data.category || !data.quantity || !data.unit || 
        !data.costPerUnit || !data.supplier || !data.minStockLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    data.totalCost = data.quantity * data.costPerUnit;
    
    let item;
    
    if (data._id) {
      item = await Inventory.findByIdAndUpdate(
        data._id,
        data,
        { new: true, runValidators: true }
      );
      
      if (!item) {
        return NextResponse.json(
          { error: 'Inventory item not found' },
          { status: 404 }
        );
      }
    } else {
      item = await Inventory.create(data);
    }
    
    return NextResponse.json(item, { status: data._id ? 200 : 201 });
  } catch (error) {
    console.error('Error creating/updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create/update inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    const data = await request.json();
    const { id, quantity, type } = data;
    
    if (!id || !quantity || !type) {
      return NextResponse.json(
        { error: 'Item ID, quantity, and type (add/remove) are required' },
        { status: 400 }
      );
    }
    
    const item = await Inventory.findById(id);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    const newQuantity = type === 'add' 
      ? item.quantity + quantity
      : item.quantity - quantity;
    
    if (newQuantity < 0) {
      return NextResponse.json(
        { error: 'Insufficient quantity' },
        { status: 400 }
      );
    }
    
    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      {
        quantity: newQuantity,
        lastRestocked: type === 'add' ? new Date() : item.lastRestocked,
        totalCost: newQuantity * item.costPerUnit
      },
      { new: true }
    );
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory quantity' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }
    
    const activeOrder = await Order.findOne({
      'items.menuItem': id,
      status: { $in: ['pending', 'in-progress'] }
    });
    
    if (activeOrder) {
      return NextResponse.json(
        { error: 'Cannot delete item with active orders' },
        { status: 400 }
      );
    }
    
    const item = await Inventory.findByIdAndDelete(id);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
} 