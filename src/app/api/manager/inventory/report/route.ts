import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Inventory from '@/models/Inventory';
import { checkManagerAuth } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    const data = await request.json();
    const { reportType } = data;
    
    let query = {};
    let sort: Record<string, 1 | -1> = { category: 1, name: 1 };
    
    switch (reportType) {
      case 'low-stock':
        query = { 
          $or: [
            { status: 'Low Stock' },
            { status: 'Critical Stock' },
            { status: 'Out of Stock' },
            { $expr: { $lte: ["$quantity", "$minStockLevel"] } }
          ]
        };
        break;
        
      case 'expiring-soon':
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
        query = { expiryDate: { $lte: sevenDaysLater } };
        sort = { expiryDate: 1 };
        break;
        
      case 'category':
        const { category } = data;
        if (category && category !== 'all') {
          query = { category };
        }
        break;
        
      case 'value':
        sort = { totalCost: -1 };
        break;
    }
    
    const items = await Inventory.find(query).sort(sort).lean();
    
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + item.totalCost, 0);
    const lowStockItems = items.filter(item => 
      item.status === 'Low Stock' || 
      item.status === 'Critical Stock' || 
      item.status === 'Out of Stock' ||
      item.quantity <= item.minStockLevel
    ).length;
    
    interface CategorySummary {
      [category: string]: {
        count: number;
        value: number;
      }
    }
    
    const categorySummary: CategorySummary = items.reduce((acc: CategorySummary, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          count: 0,
          value: 0
        };
      }
      acc[item.category].count++;
      acc[item.category].value += item.totalCost;
      return acc;
    }, {});
    
    return NextResponse.json({
      items,
      summary: {
        totalItems,
        totalValue,
        lowStockItems,
        categorySummary
      },
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error generating inventory report:', error);
    return NextResponse.json(
      { error: 'Failed to generate inventory report' },
      { status: 500 }
    );
  }
} 