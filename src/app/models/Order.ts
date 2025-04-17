import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrderEvent {
  timestamp: Date;
  action: string;
  user: string;
}

export interface IOrderItem {
  name: string;
  quantity: number;
  price: number;
  status: 'pending' | 'in-progress' | 'ready' | 'served';
  specialInstructions?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  orderType: 'dine-in' | 'guest';
  status: 'pending' | 'cooking' | 'ready' | 'served' | 'completed' | 'cancelled';
  items: IOrderItem[];
  total: number;
  specialInstructions?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  servedAt?: Date;
  events: IOrderEvent[];
  waiterId?: mongoose.Types.ObjectId;
  tableId?: mongoose.Types.ObjectId;
}

const orderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  orderType: { type: String, enum: ['dine-in', 'guest'], required: true },
  status: { 
    type: String, 
    enum: ['pending', 'cooking', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending'
  },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'in-progress', 'ready', 'served'],
      default: 'pending'
    },
    specialInstructions: String
  }],
  total: { type: Number, required: true },
  specialInstructions: String,
  createdAt: { type: Date, default: Date.now },
  startedAt: Date,
  completedAt: Date,
  servedAt: Date,
  events: [{
    timestamp: { type: Date, required: true },
    action: { type: String, required: true },
    user: { type: String, required: true }
  }],
  waiterId: { type: Schema.Types.ObjectId, ref: 'User' },
  tableId: { type: Schema.Types.ObjectId, ref: 'Table' }
});

const Order = (mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema)) as Model<IOrder>;

export default Order; 