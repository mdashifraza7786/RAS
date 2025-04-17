import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MenuItem, { IMenuItem } from '@/models/MenuItem';
import { Model } from 'mongoose';

export async function GET() {
  try {
    await connectDB();

    // Get menu items that are available
    const menuItems = await (MenuItem as Model<IMenuItem>).find({ available: true })
      .select('name description price category image available preparationTime')
      .sort({ category: 1, name: 1 });

    console.log('Available menu items found:', menuItems.length);
    
    return NextResponse.json({ menuItems });

  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch menu items',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 