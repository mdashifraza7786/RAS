import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  popular: boolean;
  preparationTime: number; 
  ingredients: string[];
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true
    },
    image: {
      type: String,
      default: '/images/default-food.jpg'
    },
    available: {
      type: Boolean,
      default: true
    },
    popular: {
      type: Boolean,
      default: false
    },
    preparationTime: {
      type: Number,
      default: 15, // Default 15 minutes
      min: 0
    },
    ingredients: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const MenuItem = mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', menuItemSchema);

export default MenuItem; 
