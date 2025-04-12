import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  name: string;
  value: number;
}

const counterSchema = new Schema<ICounter>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: Number,
    default: 1
  }
});

// Check if model already exists to prevent overwrite during hot reload in development
const Counter = mongoose.models.Counter || mongoose.model<ICounter>('Counter', counterSchema);

export default Counter; 