import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';

export async function GET() {
  try {
    await connectToDatabase();
    
    const categories = await MenuItem.aggregate([
      { $match: { available: true } },
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        items: { $push: "$$ROOT" } 
      }},
      { $sort: { _id: 1 } },
      { $project: { 
        _id: 0,
        name: '$_id',
        count: 1,
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