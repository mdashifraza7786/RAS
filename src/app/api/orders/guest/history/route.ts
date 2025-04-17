import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const cleanPhone = phone.replace(/,+$/, '');

    const orders = await Order.find({ 
      customerPhone: { $in: [cleanPhone, `${cleanPhone},`] }
    })
    .sort({ createdAt: -1 })
    .populate('waiter', 'name')
    .populate('table', 'number name')
    .lean();

    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      tableNumber: order.table ? (order.table as any).number : null,
      tableName: order.table ? (order.table as any).name : null,
      waiter: order.waiter ? {
        id: (order.waiter as any)._id.toString(),
        name: (order.waiter as any).name
      } : null,
      items: order.items.map((item: any) => ({
        id: item._id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        status: item.status
      }))
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error: any) {
    console.error("Error fetching guest order history:", error);
    return NextResponse.json(
      { error: "Failed to fetch order history" },
      { status: 500 }
    );
  }
} 