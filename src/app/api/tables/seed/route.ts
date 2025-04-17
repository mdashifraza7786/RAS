import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Table, { ITable } from "@/models/Table";
import { Model } from "mongoose";

const initialTables = [
  {
    number: 1,
    name: "Table 1",
    capacity: 2,
    status: "available",
    location: "Main"
  },
  {
    number: 2,
    name: "Table 2",
    capacity: 4,
    status: "available",
    location: "Main"
  },
  {
    number: 3,
    name: "Table 3",
    capacity: 4,
    status: "available",
    location: "Main"
  },
  {
    number: 4,
    name: "Table 4",
    capacity: 6,
    status: "available",
    location: "Main"
  },
  {
    number: 5,
    name: "Table 5",
    capacity: 6,
    status: "available",
    location: "Main"
  },
  {
    number: 6,
    name: "Table 6",
    capacity: 8,
    status: "available",
    location: "Main"
  }
];

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Clear existing tables
    await (Table as Model<ITable>).deleteMany({});

    // Insert new tables
    await (Table as Model<ITable>).insertMany(initialTables);

    return NextResponse.json({
      message: "Tables seeded successfully",
      tables: initialTables
    });
  } catch (error: any) {
    console.error("Error seeding tables:", error);
    return NextResponse.json(
      { error: "Failed to seed tables" },
      { status: 500 }
    );
  }
} 