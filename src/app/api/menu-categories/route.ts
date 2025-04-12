import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Aggregate to get distinct categories
    const categories = await MenuItem.aggregate([
      // Only include available menu items
      { $match: { available: true } },
      // Group by category and count items in each category
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        items: { $push: "$$ROOT" } 
      }},
      // Sort by category name
      { $sort: { _id: 1 } },
      // Project the fields we want
      { $project: { 
        _id: 0,
        name: '$_id',
        count: 1,
        // Include the first menu item's image as the category image if needed
        image: { $arrayElemAt: ['$items.image', 0] }
      }}
    ]);
    
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu categories' },
      { status: 500 }
    );
  }
} 