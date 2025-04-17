import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { getOrderStatusMapping } from "@/lib/utils";

/**
 * @route GET /api/orders/track/:orderNumber
 * @desc Get order details by order number for customer tracking
 * @access Public
 */
export async function GET(
  request: NextRequest,
  context: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = context.params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    await connectDB();

    let order;

    // Try to find by order number first
    if (!isNaN(parseInt(orderNumber))) {
      order = await Order.findOne({ orderNumber: parseInt(orderNumber) })
        .populate('table')
        .populate('waiter', 'name')
        .populate({
          path: 'items.menuItem',
          select: 'name price',
        });
    }

    // If not found and it's a valid MongoDB ObjectId, try finding by _id
    if (!order && mongoose.Types.ObjectId.isValid(orderNumber)) {
      order = await Order.findById(orderNumber)
        .populate('table')
        .populate('waiter', 'name')
        .populate({
          path: 'items.menuItem',
          select: 'name price',
        });
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Format the order data for the response
    const formattedOrder = {
      id: order._id.toString(),
      orderNumber: order.orderNumber.toString(),
      customerName: order.customerName || "Guest",
      tableId: order.table ? (order.table as any)._id?.toString() : undefined,
      tableName: order.table ? (order.table as any).name : "Takeaway",
      waiter: order.waiter ? {
        id: (order.waiter as any)._id.toString(),
        name: (order.waiter as any).name
      } : undefined,
      status: getOrderStatusMapping(order.status),
      items: order.items.map((item: any) => ({
        id: item._id.toString(),
        name: item.menuItem?.name || item.name || "Unknown Item",
        quantity: item.quantity,
        price: item.menuItem?.price || item.price,
        status: getOrderStatusMapping(item.status || order.status),
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      specialInstructions: order.specialInstructions,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
} 