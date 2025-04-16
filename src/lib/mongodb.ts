import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable'
  );
}

// Define the type for our mongoose cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Define the global namespace
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Initialize the cached connection
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// For development mode, where we might need to refresh connections
if (process.env.NODE_ENV === 'development') {
  global.mongoose = cached;
}

// Ensure Counter model is defined
function initializeCounter() {
  // Define schema if it doesn't exist already
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
    // Ensure Counter model is initialized even if connection is cached
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
    
    // Initialize Counter model
    initializeCounter();
    
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase; 