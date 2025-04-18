import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order, { OrderStatus, ItemStatus } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
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

    let order;
    const { orderId } = params;

    const orderNumber = parseInt(orderId);
    if (!isNaN(orderNumber)) {
      order = await Order.findOne({ orderNumber })
        .populate('waiter', 'name')
        .populate('table', 'number name')
        .populate({
          path: 'items.menuItem',
          select: 'name price'
        })
        .lean();
    }

    if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId)
        .populate('waiter', 'name')
        .populate('table', 'number name')
        .populate({
          path: 'items.menuItem',
          select: 'name price'
        })
        .lean();
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const formattedOrder = {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      table: order.table ? `Table ${(order.table as any).number}` : 'Takeaway',
      items: order.items.map((item: any) => ({
        id: item._id.toString(),
        name: item.menuItem.name,
        quantity: item.quantity,
        special: item.specialInstructions || '',
        status: item.status || order.status,
        assignedTo: item.assignedTo ? item.assignedTo.name : undefined,
        estimatedTime: item.estimatedTime
      })),
      timeReceived: new Date(order.createdAt).toLocaleTimeString(),
      priority: order.priority || 'normal',
      status: order.status,
      estimatedTime: order.estimatedTime,
      startedAt: order.startedAt ? new Date(order.startedAt).toLocaleTimeString() : undefined,
      completedAt: order.completedAt ? new Date(order.completedAt).toLocaleTimeString() : undefined,
      waiter: order.waiter ? (order.waiter as any).name : 'System',
      events: [
        {
          time: new Date(order.createdAt).toLocaleTimeString(),
          action: 'Order received from POS',
          user: 'System'
        },
        ...(order.events || []).map((event: any) => ({
          time: new Date(event.timestamp).toLocaleTimeString(),
          action: event.action,
          user: event.user
        }))
      ],
      notes: order.specialInstructions
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

export async function PUT(
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

    const body = await request.json();
    const { status, itemUpdates } = body;

    let order;
    const { orderId } = params;

    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    }

    if (!order) {
      const orderNumber = parseInt(orderId);
      if (!isNaN(orderNumber)) {
        order = await Order.findOne({ orderNumber });
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (status) {
      if (!Object.values(OrderStatus).includes(status)) {
        return NextResponse.json(
          { error: "Invalid order status" },
          { status: 400 }
        );
      }
      order.status = status;
    }

    if (itemUpdates && Array.isArray(itemUpdates)) {
      itemUpdates.forEach(update => {
        const item = order.items.find(item => item._id.toString() === update.itemId);
        if (item && Object.values(ItemStatus).includes(update.status)) {
          item.status = update.status;
        }
      });
    }

    if (!order.events) {
      order.events = [];
    }
    order.events.push({
      timestamp: new Date(),
      action: `Order status updated to ${status || order.status}`,
      user: session.user.name || 'Chef'
    });

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('waiter', 'name')
      .populate('table', 'number name')
      .populate({
        path: 'items.menuItem',
        select: 'name price'
      })
      .lean();

    const formattedOrder = {
      id: updatedOrder._id.toString(),
      orderNumber: updatedOrder.orderNumber,
      table: updatedOrder.table ? `Table ${(updatedOrder.table as any).number}` : 'Takeaway',
      items: updatedOrder.items.map((item: any) => ({
        id: item._id.toString(),
        name: item.menuItem.name,
        quantity: item.quantity,
        special: item.specialInstructions || '',
        status: item.status || updatedOrder.status,
        assignedTo: item.assignedTo ? item.assignedTo.name : undefined,
        estimatedTime: item.estimatedTime
      })),
      timeReceived: new Date(updatedOrder.createdAt).toLocaleTimeString(),
      priority: updatedOrder.priority || 'normal',
      status: updatedOrder.status,
      estimatedTime: updatedOrder.estimatedTime,
      startedAt: updatedOrder.startedAt ? new Date(updatedOrder.startedAt).toLocaleTimeString() : undefined,
      completedAt: updatedOrder.completedAt ? new Date(updatedOrder.completedAt).toLocaleTimeString() : undefined,
      waiter: updatedOrder.waiter ? (updatedOrder.waiter as any).name : 'System',
      events: [
        {
          time: new Date(updatedOrder.createdAt).toLocaleTimeString(),
          action: 'Order received from POS',
          user: 'System'
        },
        ...(updatedOrder.events || []).map((event: any) => ({
          time: new Date(event.timestamp).toLocaleTimeString(),
          action: event.action,
          user: event.user
        }))
      ],
      notes: updatedOrder.specialInstructions
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
} 