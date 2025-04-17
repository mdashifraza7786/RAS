import connectToDatabase from './mongodb';

/**
 * Helper function to connect to the database
 */
export default async function connectDB() {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
} 