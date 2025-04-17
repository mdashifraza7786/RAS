import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  number: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  assignedTo?: mongoose.Types.ObjectId; 
  lastStatusChanged: Date;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new Schema<ITable>(
  {
    number: {
      type: Number,
      required: [true, 'Please provide a table number'],
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a table name'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide a capacity'],
      min: 1
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'cleaning'],
      default: 'available'
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    lastStatusChanged: {
      type: Date,
      default: Date.now
    },
    location: {
      type: String,
      default: 'Main'
    }
  },
  {
    timestamps: true
  }
);

tableSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.lastStatusChanged = new Date();
  }
  next();
});

const Table = mongoose.models.Table || mongoose.model<ITable>('Table', tableSchema);

export default Table; 
