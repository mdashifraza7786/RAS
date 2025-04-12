import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IAttendance extends Document {
  staff: IUser['_id'];
  date: Date;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'leave';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    staff: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Staff ID is required']
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'leave'],
      required: [true, 'Status is required']
    },
    checkInTime: {
      type: String
    },
    checkOutTime: {
      type: String
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Create a compound index to ensure one record per staff per day
attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

// Check if model already exists to prevent overwrite during hot reload in development
const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance; 