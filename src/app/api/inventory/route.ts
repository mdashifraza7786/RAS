import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Inventory from '@/models/Inventory';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock') === 'true';
    
    // Build query
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
    
    // Get inventory items
    const items = await (Inventory as any).find(query)
      .sort({ category: 1, name: 1 })
      .lean();

    // Format items for the response
    const formattedItems = items.map(item => ({
      id: item._id.toString(),
      name: item.name,
      category: item.category,
      currentStock: item.quantity, // Map from quantity to currentStock for UI
      unit: item.unit,
      minThreshold: item.minStockLevel,
      lastUpdated: new Date(item.updatedAt).toISOString().split('T')[0],
      supplier: item.supplier,
      notes: ''
    }));

    return NextResponse.json({ items: formattedItems }, { status: 200 });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
} 