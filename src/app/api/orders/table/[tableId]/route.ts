import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import Table from '@/models/Table';

export async function GET(
  request: Request,
  { params }: { params: { tableId: string } }
) {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { error: 'Database connection string is not defined' },
        { status: 500 }
      );
    }
    await mongoose.connect(mongoUri);

    const { tableId } = params;

    // Validate tableId
    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return NextResponse.json(
        { error: 'Invalid table ID format' },
        { status: 400 }
      );
    }

    // Check if table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Fetch orders for this table
    // Only include orders that are still active (not completed or cancelled)
    const orders = await Order.find({
      table: tableId,
      status: { $nin: ['completed', 'cancelled'] }
    })
    .sort({ createdAt: -1 })
    .populate('items.menuItem', 'name price')
    .lean();

    // Transform the data to match the format expected by the client
    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      tableId: order.table.toString(),
      items: order.items.map(item => ({
        menuItemId: item.menuItem._id.toString(),
        name: item.name,
        quantity: item.quantity,
        status: item.status
      })),
      status: order.status,
      totalAmount: order.total,
      createdAt: order.createdAt
    }));

    return NextResponse.json({ orders: formattedOrders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders for table:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 