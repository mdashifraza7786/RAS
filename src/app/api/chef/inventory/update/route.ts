import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Inventory from '@/models/Inventory';
import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'chef') {
      return NextResponse.json(
        { error: 'Only chefs can update inventory' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { itemId, amount } = body;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json(
        { error: 'Valid item ID is required' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Amount must be a number' },
        { status: 400 }
      );
    }

    if (amount >= 0) {
      return NextResponse.json(
        { error: 'Chefs can only reduce inventory, not add to it' },
        { status: 403 }
      );
    }

    const updatedItem = await (Inventory as any).findByIdAndUpdate(
      itemId,
      { 
        $inc: { currentStock: amount },
        lastUpdated: new Date() 
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    if (updatedItem.currentStock < 0) {
      updatedItem.currentStock = 0;
      await updatedItem.save();
    }

    return NextResponse.json({
      success: true,
      item: {
        id: updatedItem._id,
        name: updatedItem.name,
        currentStock: updatedItem.currentStock,
        unit: updatedItem.unit,
        lastUpdated: updatedItem.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    );
  }
} 