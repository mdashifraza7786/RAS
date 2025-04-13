import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  console.log(process.env.MONGODB_URI)

  try {
    // Try to connect to the database
    const mongoose = await connectToDatabase();
    
    // Get the connection status
    const connectionState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    // Get database name 
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    
    return NextResponse.json({
      status: 'success',
      message: 'API is operational',
      database: {
        status: states[connectionState] || 'unknown',
        connected: connectionState === 1,
        name: dbName,
        host: mongoose.connection.host,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to the database',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 