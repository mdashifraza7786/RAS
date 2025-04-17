import connectToDatabase from './mongodb';

export default async function connectDB() {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
} 
