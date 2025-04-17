import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import MenuItem, { IMenuItem } from '@/models/MenuItem';
import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const id = params?.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing menu item ID' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { available } = body;

    if (typeof available !== 'boolean') {
      return NextResponse.json(
        { error: 'Available status must be a boolean' },
        { status: 400 }
      );
    }
    
    const updatedMenuItem = await (MenuItem as any).findByIdAndUpdate(
      id,
      { available },
      { new: true }
    );

    if (!updatedMenuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      menuItem: {
        id: updatedMenuItem._id,
        name: updatedMenuItem.name,
        available: updatedMenuItem.available
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating menu item availability:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item availability' },
      { status: 500 }
    );
  }
} 