import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order, { OrderStatus, ItemStatus } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'chef') {
      return NextResponse.json(
        { error: "Unauthorized - Chef access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const order = await Order.findOne({ orderNumber: parseInt(params.orderId) });
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== OrderStatus.Pending) {
      return NextResponse.json(
        { error: "Order cannot be started - invalid status" },
        { status: 400 }
      );
    }

    order.status = OrderStatus.Cooking;
    order.startedAt = new Date();
    if (!order.events) {
      order.events = [];
    }
    order.events.push({
      timestamp: new Date(),
      action: 'Started cooking',
      user: session.user.name || 'Chef'
    });

    order.items.forEach(item => {
      if (item.status === ItemStatus.Pending) {
        item.status = ItemStatus.InProgress;
      }
    });

    await order.save();

    return NextResponse.json({ 
      message: "Order started successfully",
      order: order 
    });
  } catch (error: any) {
    console.error("Error starting order:", error);
    return NextResponse.json(
      { error: "Failed to start order" },
      { status: 500 }
    );
  }
} 