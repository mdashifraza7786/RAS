import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'manager' | 'waiter' | 'chef';
  phone?: string;
  address?: string;
  joiningDate?: Date;
  salary?: number;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
      type: String,
      enum: ['manager', 'waiter', 'chef'],
      default: 'waiter'
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    joiningDate: {
      type: Date
    },
    salary: {
      type: Number
    },
    photo: {
      type: String
    }
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true
  }
);

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

if (process.env.NODE_ENV === 'development' && mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 
