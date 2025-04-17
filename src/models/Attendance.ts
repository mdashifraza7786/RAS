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

attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance; 
