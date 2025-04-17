import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value. Must be one of: " + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status,
          ...(status === 'preparing' ? { startedAt: new Date() } : {}),
          ...(status === 'ready' ? { completedAt: new Date() } : {})
        }
      },
      { new: true }
    ).populate('waiter', 'name')
     .populate('table', 'number name');

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const formattedOrder = {
      id: updatedOrder._id.toString(),
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      customerName: updatedOrder.customerName,
      tableId: updatedOrder.table ? (updatedOrder.table as any)._id.toString() : undefined,
      tableName: updatedOrder.table ? (updatedOrder.table as any).name : undefined,
      waiter: updatedOrder.waiter ? {
        id: (updatedOrder.waiter as any)._id.toString(),
        name: (updatedOrder.waiter as any).name
      } : undefined,
      items: updatedOrder.items.map((item: any) => ({
        id: item._id.toString(),
        name: item.name,
        quantity: item.quantity,
        status: item.status || updatedOrder.status
      })),
      startedAt: updatedOrder.startedAt,
      completedAt: updatedOrder.completedAt,
      updatedAt: updatedOrder.updatedAt
    };

    return NextResponse.json({ 
      message: "Order status updated successfully",
      order: formattedOrder 
    });

  } catch (error: any) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id)
      .select('status items startedAt completedAt')
      .populate('waiter', 'name')
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const formattedOrder = {
      id: order._id.toString(),
      status: order.status,
      items: order.items.map((item: any) => ({
        id: item._id.toString(),
        status: item.status || order.status
      })),
      startedAt: order.startedAt,
      completedAt: order.completedAt
    };

    return NextResponse.json({ order: formattedOrder });

  } catch (error: any) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order status" },
      { status: 500 }
    );
  }
}
