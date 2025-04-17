import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User, { IUser } from "@/models/User";
import MenuItem, { IMenuItem } from "@/models/MenuItem";
import { generateOrderNumber } from "@/lib/utils";
import mongoose, { FilterQuery, Model } from "mongoose";

interface WaiterWithStats extends IUser {
  orderCount: number;
  lastOrderAssigned?: Date;
}

interface OrderItem {
  menuItem: mongoose.Types.ObjectId;
  quantity: number;
  notes?: string;
  price: number;
  name: string;
}

/**
 * @route POST /api/orders/guest
 * @desc Create a new guest order with balanced waiter assignment
 * @access Public
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { items, customerName, customerPhone, specialInstructions } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    // Fetch menu items to get their details
    const menuItemIds = items.map(item => new mongoose.Types.ObjectId(item.menuItemId));
    const menuItems = await (MenuItem as Model<IMenuItem>).find({ _id: { $in: menuItemIds } }).lean();

    // Create a map for quick lookup
    const menuItemMap = new Map(menuItems.map(item => [item._id.toString(), item]));

    // Get all active waiters
    const filter: FilterQuery<IUser> = {
      role: "waiter",
      status: "active",
      isAvailable: true
    };
    const waiters = await (User as Model<WaiterWithStats>).find(filter).lean();

    if (!waiters || waiters.length === 0) {
      return NextResponse.json(
        { error: "No waiters available at the moment" },
        { status: 503 }
      );
    }

    // Implement balanced waiter assignment
    const assignWaiter = (waiters: WaiterWithStats[]) => {
      // Sort waiters by order count and last assignment time
      const sortedWaiters = waiters.sort((a, b) => {
        // First, compare by order count
        const aCount = a.orderCount || 0;
        const bCount = b.orderCount || 0;
        if (aCount !== bCount) {
          return aCount - bCount;
        }
        // If order counts are equal, assign to the one who hasn't had an order in longer
        const aTime = a.lastOrderAssigned ? a.lastOrderAssigned.getTime() : 0;
        const bTime = b.lastOrderAssigned ? b.lastOrderAssigned.getTime() : 0;
        return aTime - bTime;
      });

      return sortedWaiters[0];
    };

    // Assign a waiter using the balanced algorithm
    const assignedWaiter = assignWaiter(waiters);

    // Prepare order items with menu item details
    const orderItems = items.map(item => {
      const menuItem = menuItemMap.get(item.menuItemId) as IMenuItem;
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.menuItemId}`);
      }
      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        notes: item.notes || '',
        status: 'pending'
      };
    });

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.18; // 18% tax rate
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Create the order
    const order = new Order({
      orderNumber: await generateOrderNumber(),
      customerName,
      customerPhone,
      specialInstructions,
      items: orderItems,
      status: 'pending',
      waiter: assignedWaiter._id,
      orderType: 'guest',
      paymentStatus: 'unpaid',
      subtotal,
      tax,
      total,
      table: new mongoose.Types.ObjectId('000000000000000000000000') // Default table ID for guest orders
    });

    // Save the order
    await order.save();

    // Update waiter's stats
    await (User as Model<WaiterWithStats>).findByIdAndUpdate(
      assignedWaiter._id,
      {
        $inc: { orderCount: 1 },
        lastOrderAssigned: new Date(),
      },
      { new: true }
    );

    // Populate necessary fields for response
    const populatedOrder = await Order.findById(order._id)
      .populate('waiter', 'name')
      .populate('items.menuItem', 'name price')
      .lean();

    if (!populatedOrder || !populatedOrder.waiter) {
      throw new Error('Failed to populate order details');
    }

    // Format the response
    const formattedOrder = {
      id: populatedOrder._id.toString(),
      orderNumber: populatedOrder.orderNumber,
      status: populatedOrder.status,
      items: populatedOrder.items.map((item: any) => ({
        id: item._id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        notes: item.notes
      })),
      customerName: populatedOrder.customerName,
      customerPhone: populatedOrder.customerPhone,
      specialInstructions: populatedOrder.specialInstructions,
      waiter: {
        id: (populatedOrder.waiter as any)._id.toString(),
        name: (populatedOrder.waiter as any).name
      },
      subtotal: populatedOrder.subtotal,
      tax: populatedOrder.tax,
      total: populatedOrder.total,
      createdAt: populatedOrder.createdAt
    };

    return NextResponse.json({
      message: "Order placed successfully",
      order: formattedOrder
    });

  } catch (error: any) {
    console.error("Error creating guest order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
} 