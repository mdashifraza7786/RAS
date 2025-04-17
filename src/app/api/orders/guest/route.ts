import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User, { IUser } from "@/models/User";
import MenuItem, { IMenuItem } from "@/models/MenuItem";
import Table, { ITable } from "@/models/Table";
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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { items, customerName, customerPhone, specialInstructions, tableNumber } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (!tableNumber) {
      return NextResponse.json(
        { error: "Table number is required" },
        { status: 400 }
      );
    }

    const table = await (Table as Model<ITable>).findOne({ number: tableNumber });
    if (!table) {
      return NextResponse.json(
        { error: "Invalid table number" },
        { status: 400 }
      );
    }

    if (table.status !== 'available') {
      return NextResponse.json(
        { error: "Table is not available" },
        { status: 400 }
      );
    }

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

    const assignWaiter = (waiters: WaiterWithStats[]) => {
      const sortedWaiters = waiters.sort((a, b) => {
        const aCount = a.orderCount || 0;
        const bCount = b.orderCount || 0;
        if (aCount !== bCount) {
          return aCount - bCount;
        }
        const aTime = a.lastOrderAssigned ? a.lastOrderAssigned.getTime() : 0;
        const bTime = b.lastOrderAssigned ? b.lastOrderAssigned.getTime() : 0;
        return aTime - bTime;
      });

      return sortedWaiters[0];
    };

    const assignedWaiter = assignWaiter(waiters);

    const menuItemIds = items.map(item => new mongoose.Types.ObjectId(item.menuItemId));
    const menuItems = await (MenuItem as Model<IMenuItem>).find({ _id: { $in: menuItemIds } }).lean();

    const menuItemMap = new Map(menuItems.map(item => [item._id.toString(), item]));

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

    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.18;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

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
      table: table._id
    });

    await order.save();

    await (Table as Model<ITable>).findByIdAndUpdate(
      table._id,
      {
        status: 'occupied',
        currentWaiter: assignedWaiter._id,
        lastStatusChanged: new Date()
      },
      { new: true }
    );

    await (User as Model<WaiterWithStats>).findByIdAndUpdate(
      assignedWaiter._id,
      {
        $inc: { orderCount: 1 },
        lastOrderAssigned: new Date(),
      },
      { new: true }
    );

    const populatedOrder = await Order.findById(order._id)
      .populate('waiter', 'name')
      .populate('table', 'number name')
      .populate('items.menuItem', 'name price')
      .lean();

    if (!populatedOrder || !populatedOrder.waiter) {
      throw new Error('Failed to populate order details');
    }

    const formattedOrder = {
      id: populatedOrder._id.toString(),
      orderNumber: populatedOrder.orderNumber,
      customerName: populatedOrder.customerName,
      tableNumber: (populatedOrder.table as any).number,
      tableName: (populatedOrder.table as any).name,
      waiter: {
        id: (populatedOrder.waiter as any)._id.toString(),
        name: (populatedOrder.waiter as any).name
      },
      status: populatedOrder.status,
      items: populatedOrder.items.map((item: any) => ({
        id: item._id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        notes: item.notes
      })),
      subtotal: populatedOrder.subtotal,
      tax: populatedOrder.tax,
      total: populatedOrder.total,
      specialInstructions: populatedOrder.specialInstructions,
      paymentStatus: populatedOrder.paymentStatus,
      createdAt: populatedOrder.createdAt,
      updatedAt: populatedOrder.updatedAt,
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