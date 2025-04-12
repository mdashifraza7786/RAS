import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/models/Order';

// Define interface for feedback entries
interface FeedbackEntry {
  id: string;
  rating: number;
  comment: string;
  orderId: string | null;
  timestamp: Date;
}

// Define a simple in-memory store for feedback
// In a real app, you would create a proper model for this
const feedbackStorage: FeedbackEntry[] = [];

export async function POST(request: Request) {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { error: 'Database connection string is not defined' },
        { status: 500 }
      );
    }
    await mongoose.connect(mongoUri);

    // Parse request body
    const body = await request.json();
    const { rating, comment, orderId } = body;

    // Validate rating
    if (rating === undefined || rating === null || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    // If orderId is provided, verify it exists
    if (orderId) {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return NextResponse.json(
          { error: 'Invalid order ID format' },
          { status: 400 }
        );
      }

      const order = await Order.findById(orderId).select('_id').lean();
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
    }

    // Create feedback entry
    const feedback: FeedbackEntry = {
      id: Date.now().toString(),
      rating,
      comment: comment || '',
      orderId: orderId || null,
      timestamp: new Date()
    };

    // Store feedback
    feedbackStorage.push(feedback);

    // Return success
    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your feedback!'
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// Get all feedback (for staff/admin interfaces)
export async function GET() {
  try {
    // Return all feedback entries
    const feedback = [...feedbackStorage].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return NextResponse.json({ feedback }, { status: 200 });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
} 