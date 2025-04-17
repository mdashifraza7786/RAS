import mongoose, { Schema, Document, Types } from 'mongoose';
import { IMenuItem } from './MenuItem';
import { ITable } from './Table';
import { ICustomer } from './Customer';
import { IUser } from './User';
import Counter from './Counter';

export enum OrderStatus {
  Pending = 'pending',
  Cooking = 'cooking',
  Ready = 'ready',
  Served = 'served',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export enum ItemStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Ready = 'ready',
  Served = 'served',
  Cancelled = 'cancelled'
}

export interface OrderItem {
  menuItem: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  status: ItemStatus;
}

export interface IOrder extends Document {
  orderNumber: number;
  table: Types.ObjectId;
  items: OrderItem[];
  status: OrderStatus;
  priority: 'high' | 'normal';
  estimatedTime?: number;
  startedAt?: Date;
  completedAt?: Date;
  events: Array<{
    timestamp: Date;
    action: string;
    user: string;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'upi';
  customerName?: string;
  customerPhone?: string;
  customer?: Types.ObjectId;
  specialInstructions?: string;
  waiter?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItem>({
  menuItem: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  note: {
    type: String
  },
  status: {
    type: String,
    enum: Object.values(ItemStatus),
    default: ItemStatus.Pending
  }
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: Number,
      required: true,
      unique: true
    },
    table: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: true
    },
    priority: {
      type: String,
      enum: ['high', 'normal'],
      default: 'normal'
    },
    estimatedTime: Number,
    startedAt: Date,
    completedAt: Date,
    events: [{
      timestamp: { type: Date, required: true },
      action: { type: String, required: true },
      user: { type: String, required: true }
    }],
    items: [orderItemSchema],
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Pending
    },
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi']
    },
    customerName: {
      type: String
    },
    customerPhone: {
      type: String
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer'
    },
    specialInstructions: {
      type: String
    },
    waiter: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

orderSchema.statics.getNextOrderNumber = async function() {
  const CounterModel = mongoose.models.Counter || mongoose.model('Counter', new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    value: { type: Number, default: 0 }
  }));
  
  const counter = await (CounterModel as any).findOneAndUpdate(
    { name: 'orderNumber' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  
  return counter.value;
};

orderSchema.pre('save', function(this: any, next) {
  // Calculate totals
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0);
    this.tax = Math.round(this.subtotal * 0.18 * 100) / 100; // 18% tax
    this.total = Math.round((this.subtotal + this.tax) * 100) / 100;
  }
  
  next();
});

interface OrderModel extends mongoose.Model<IOrder> {
  getNextOrderNumber(): Promise<number>;
}

const Order = (mongoose.models.Order || mongoose.model<IOrder, OrderModel>('Order', orderSchema)) as OrderModel;

export default Order; 
