import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import mongoose from 'mongoose';

// DELETE /api/waiter/orders/[id]/removeItem - Remove an item from an order
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (session.user.role !== 'waiter') {
            return NextResponse.json(
                { error: 'Forbidden. Only waiters can update orders.' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('itemId');

        if (!itemId) {
            return NextResponse.json(
                { error: 'Item ID is required' },
                { status: 400 }
            );
        }

        // Connect to the database
        await connectToDatabase();

        const orderId = params.id;
        
        // Check if order exists using mongoose model directly
        const OrderModel = mongoose.models.Order;
        const order = await OrderModel.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if order is not completed or cancelled
        if (order.status === 'completed' || order.status === 'cancelled') {
            return NextResponse.json(
                { error: `Cannot modify a ${order.status} order` },
                { status: 400 }
            );
        }

        // Find the item to be removed
        const itemIndex = order.items.findIndex((item: any) => item._id.toString() === itemId);

        if (itemIndex === -1) {
            return NextResponse.json(
                { error: 'Item not found in this order' },
                { status: 404 }
            );
        }

        // Remove the item from the items array
        order.items.splice(itemIndex, 1);

        // Recalculate totals
        order.subtotal = order.items.reduce(
            (sum: number, item: any) => sum + (item.price * item.quantity), 
            0
        );
        order.tax = Math.round(order.subtotal * 0.10 * 100) / 100; // 10% tax
        order.total = Math.round((order.subtotal + order.tax) * 100) / 100;

        // Save the updated order
        await order.save();

        // Return the updated order
        return NextResponse.json({
            message: 'Item removed from order successfully',
            order
        });
    } catch (error) {
        console.error('Error removing item from order:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 