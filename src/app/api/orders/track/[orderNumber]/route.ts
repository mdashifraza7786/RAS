import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order, { IOrder, OrderItem } from "@/models/Order";
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
    const orderNumber = context.params.orderNumber;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the order by order number
    const order = await Order.findOne({ orderNumber: parseInt(orderNumber) })
      .populate('table')
      .populate('waiter', 'name')
      .populate({
        path: 'items.menuItem',
        select: 'name price',
      });

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
      items: order.items.map((item: OrderItem) => ({
        id: (item as any)._id.toString(),
        name: item.name || "Unknown Item",
        quantity: item.quantity,
        price: item.price,
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
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
} 