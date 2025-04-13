import { NextResponse } from "next/server";

export async function GET() {
    process.env.MONGODB_URI
  return NextResponse.json({ message: process.env.MONGODB_URI });
}

