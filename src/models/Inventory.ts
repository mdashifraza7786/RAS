import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  supplier: string;
  lastRestocked: Date;
  expiryDate: Date;
  status: 'In Stock' | 'Low Stock' | 'Critical Stock' | 'Out of Stock';
  location: string;
  minStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide a quantity'],
      min: 0
    },
    unit: {
      type: String,
      required: [true, 'Please provide a unit'],
      trim: true,
      enum: ['kg', 'liter', 'unit', 'dozen', 'g', 'ml', 'piece']
    },
    costPerUnit: {
      type: Number,
      required: [true, 'Please provide a cost per unit'],
      min: 0
    },
    totalCost: {
      type: Number,
      default: function(this: IInventory) {
        return this.quantity * this.costPerUnit;
      }
    },
    supplier: {
      type: String,
      required: [true, 'Please provide a supplier'],
      trim: true
    },
    lastRestocked: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide an expiry date']
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Critical Stock', 'Out of Stock'],
      default: 'In Stock'
    },
    location: {
      type: String,
      trim: true,
      default: 'Main Storage'
    },
    minStockLevel: {
      type: Number,
      required: [true, 'Please provide a minimum stock level'],
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Middleware to calculate totalCost and update status before saving
inventorySchema.pre('save', function(next) {
  // Calculate total cost
  this.totalCost = this.quantity * this.costPerUnit;
  
  // Update status based on quantity and minStockLevel
  if (this.quantity <= 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.minStockLevel * 0.3) {
    this.status = 'Critical Stock';
  } else if (this.quantity <= this.minStockLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  
  next();
});

// Add middleware for findOneAndUpdate operations to update status
inventorySchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update && update.quantity !== undefined) {
    const quantity = update.quantity;
    const minStockLevel = update.minStockLevel || 0;
    
    // Update status based on quantity and minStockLevel
    if (quantity <= 0) {
      update.status = 'Out of Stock';
    } else if (quantity <= minStockLevel * 0.3) {
      update.status = 'Critical Stock';
    } else if (quantity <= minStockLevel) {
      update.status = 'Low Stock';
    } else {
      update.status = 'In Stock';
    }
    
    // Recalculate total cost if we have costPerUnit
    if (update.costPerUnit !== undefined) {
      update.totalCost = quantity * update.costPerUnit;
    }
  }
  
  next();
});

// Virtual for days until expiry
inventorySchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const expiryDate = new Date(this.expiryDate);
  const diffTime = expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Delete and recreate model for dev purposes
if (process.env.NODE_ENV === 'development' && mongoose.models.Inventory) {
  delete mongoose.models.Inventory;
}

// Create the model with the schema
const Inventory = mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', inventorySchema);

export default Inventory; 