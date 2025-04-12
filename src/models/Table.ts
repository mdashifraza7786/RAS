import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  number: number;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
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

// Add a pre-save hook to update lastStatusChanged when status changes
tableSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.lastStatusChanged = new Date();
  }
  next();
});

// Check if model already exists to prevent overwrite during hot reload in development
const Table = mongoose.models.Table || mongoose.model<ITable>('Table', tableSchema);

export default Table; 