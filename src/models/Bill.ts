import mongoose, { Schema, Document } from 'mongoose';
import { IOrder } from './Order';

export interface IBill extends Document {
  billNumber: number;
  order: IOrder['_id'];
  subtotal: number;
  tax: number;
  tip?: number;
  discount?: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  customerName?: string;
  customerPhone?: string;
  waiter?: string; // Reference to user ID of waiter
  createdAt: Date;
  updatedAt: Date;
}

const billSchema = new Schema<IBill>(
  {
    billNumber: {
      type: Number,
      required: true,
      unique: true
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
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
    tip: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'refunded'],
      default: 'unpaid'
    },
    customerName: {
      type: String
    },
    customerPhone: {
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

// Add counter for generating unique sequential bill numbers
billSchema.statics.getNextBillNumber = async function() {
  const counter = await mongoose.model('Counter').findOneAndUpdate(
    { name: 'billNumber' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};

// Pre-save hook to recalculate the total
billSchema.pre('save', function(next) {
  if (this.isModified('subtotal') || this.isModified('tax') || this.isModified('tip') || this.isModified('discount')) {
    this.total = this.subtotal + this.tax + (this.tip || 0) - (this.discount || 0);
    this.total = Math.round(this.total * 100) / 100; // Round to 2 decimal places
  }
  next();
});

// Check if model already exists to prevent overwrite during hot reload in development
const Bill = mongoose.models.Bill || mongoose.model<IBill>('Bill', billSchema);

export default Bill; 