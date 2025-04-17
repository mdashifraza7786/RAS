import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable'
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (process.env.NODE_ENV === 'development') {
  global.mongoose = cached;
}

function initializeCounter() {
  if (!mongoose.models.Counter) {
    const CounterSchema = new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      value: { type: Number, default: 0 }
    });
    mongoose.model('Counter', CounterSchema);
    console.log('Counter model initialized');
  }
}

async function connectToDatabase() {
  if (cached.conn) {
    initializeCounter();
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    initializeCounter();
    
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase; 
