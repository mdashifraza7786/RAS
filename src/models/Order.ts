import mongoose, { Schema, Document } from 'mongoose';
import { IMenuItem } from './MenuItem';
import { ITable } from './Table';
import { ICustomer } from './Customer';
import Counter from './Counter';

export interface OrderItem {
  menuItem: IMenuItem['_id'];
  name: string;
  price: number;
  quantity: number;
  note?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
}

export interface IOrder extends Document {
  orderNumber: number;
  table: ITable['_id'];
  items: OrderItem[];
  status: 'pending' | 'in-progress' | 'ready' | 'served' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'upi';
  customerName?: string;
  customerPhone?: string;
  customer?: ICustomer['_id'];
  specialInstructions?: string;
  waiter?: string; // Reference to user ID of waiter
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItem>({
  menuItem: {
    type: Schema.Types.ObjectId as any,
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
    enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
    default: 'pending'
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
      type: Schema.Types.ObjectId as any,
      ref: 'Table',
      required: true
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'ready', 'served', 'completed', 'cancelled'],
      default: 'pending'
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
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
      type: Schema.Types.ObjectId as any,
      ref: 'Customer'
    },
    specialInstructions: {
      type: String
    },
    waiter: {
      type: Schema.Types.ObjectId as any,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Add counter for generating unique sequential order numbers
orderSchema.statics.getNextOrderNumber = async function() {
  // Ensure Counter model exists
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

// Pre-save hook to handle calculations and validations
orderSchema.pre('save', function(this: any, next) {
  // Calculate totals
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0);
    this.tax = Math.round(this.subtotal * 0.18 * 100) / 100; // 18% tax
    this.total = Math.round((this.subtotal + this.tax) * 100) / 100;
  }
  
  next();
});

// Add types to the static methods
interface OrderModel extends mongoose.Model<IOrder> {
  getNextOrderNumber(): Promise<number>;
}

// Check if model already exists to prevent overwrite during hot reload in development
const Order = (mongoose.models.Order || mongoose.model<IOrder, OrderModel>('Order', orderSchema)) as OrderModel;

export default Order; 