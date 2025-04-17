import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  message: string;
  type: string;
  waiterId?: mongoose.Types.ObjectId;
  tableId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  billId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'order_created',
        'order_updated',
        'order_ready',
        'order_served',
        'order_cancelled',
        'bill_request',
        'payment_processed',
        'table_status_change',
        'reservation_arrived',
        'system',
        'other'
      ],
    },
    waiterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: false,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
    },
    billId: {
      type: Schema.Types.ObjectId,
      ref: 'Bill',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

ActivitySchema.index({ createdAt: -1, waiterId: 1, type: 1 });

const Activity = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity; 
