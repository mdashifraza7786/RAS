import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Table, { ITable } from "@/models/Table";
import Order, { IOrder } from "@/models/Order";
import { Model } from "mongoose";

type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

/**
 * @route GET /api/tables/:number/availability
 * @desc Check if a table is available for new orders
 * @access Public
 */
export async function GET(
  request: NextRequest,
  context: { params: { number: string } }
) {
  try {
    const tableNumber = parseInt(context.params.number);

    if (isNaN(tableNumber)) {
      return NextResponse.json(
        { error: "Invalid table number" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the table by number
    const table = await (Table as Model<ITable>).findOne({ number: tableNumber });

    if (!table) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      );
    }

    // Check if there are any active orders for this table
    const activeOrder = await (Order as Model<IOrder>).findOne({
      table: table._id,
      status: { 
        $in: ['pending', 'preparing', 'ready'] 
      }
    });

    // Table is available if:
    // 1. It exists
    // 2. It's in 'available' status
    // 3. There are no active orders assigned to it
    const isAvailable = (table.status as TableStatus) === 'available' && !activeOrder;

    return NextResponse.json({
      tableNumber,
      isAvailable,
      status: table.status,
      name: table.name,
      capacity: table.capacity,
      currentOrder: activeOrder ? {
        orderNumber: activeOrder.orderNumber,
        status: activeOrder.status
      } : null
    });

  } catch (error: any) {
    console.error("Error checking table availability:", error);
    return NextResponse.json(
      { error: "Failed to check table availability" },
      { status: 500 }
    );
  }
} 