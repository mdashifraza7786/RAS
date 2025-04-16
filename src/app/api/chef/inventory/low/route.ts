import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Inventory from '@/models/Inventory';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is authorized (chef or manager)
    if (!['chef', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Connect to the database
    await connectToDatabase();
    
    // Find inventory items that are below or equal to their threshold
    const lowInventoryItems = await (Inventory as any).find({
      $expr: { $lte: ['$quantity', '$threshold'] }
    }).sort({ quantity: 1 });
    
    return NextResponse.json({
      items: lowInventoryItems,
      count: lowInventoryItems.length
    });
    
  } catch (error) {
    console.error('Error fetching low inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low inventory items' },
      { status: 500 }
    );
  }
} 