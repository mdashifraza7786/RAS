import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Inventory from '@/models/Inventory';
import { checkManagerAuth } from '@/lib/api-auth';

// POST /api/manager/inventory/report - Generate inventory report
export async function POST(request: NextRequest) {
  try {
    // Check manager authentication
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    const data = await request.json();
    const { reportType } = data;
    
    let query = {};
    let sort: Record<string, 1 | -1> = { category: 1, name: 1 };
    
    // Build query based on report type
    switch (reportType) {
      case 'low-stock':
        query = { 
          $or: [
            // Check existing status fields
            { status: 'Low Stock' },
            { status: 'Critical Stock' },
            { status: 'Out of Stock' },
            // Also directly check quantity vs minStockLevel
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
    
    // Get inventory items based on query
    const items = await Inventory.find(query).sort(sort).lean();
    
    // Calculate summary statistics
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + item.totalCost, 0);
    const lowStockItems = items.filter(item => 
      item.status === 'Low Stock' || 
      item.status === 'Critical Stock' || 
      item.status === 'Out of Stock' ||
      item.quantity <= item.minStockLevel
    ).length;
    
    // Group items by category for summary
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