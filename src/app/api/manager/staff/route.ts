import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { hash } from 'bcryptjs';
import { checkManagerAuth } from '@/lib/api-auth';

// GET /api/manager/staff - Get all staff members with performance metrics
export async function GET(request: NextRequest) {
  try {
    // Check manager authentication
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log("GET staff params:", { role, search, page, limit });
    
    // Build query
    const query: any = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    // Fetch staff members with pagination
    const staff = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    console.log("Raw staff data sample:", JSON.stringify(staff.slice(0, 1), null, 2));
    
    // Get performance metrics for each staff member
    const staffWithMetrics = await Promise.all(staff.map(async (member) => {
      let metrics = {
        totalOrders: 0,
        completedOrders: 0,
        averageOrderTime: 0,
        customerRating: 0
      };
      
      if (member.role === 'waiter' || member.role === 'chef') {
        const orders = await Order.find({
          [member.role]: member._id,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }).lean();
        
        metrics = {
          totalOrders: orders.length,
          completedOrders: orders.filter(o => o.status === 'completed').length,
          averageOrderTime: orders.reduce((acc, order) => {
            const time = new Date(order.completedAt).getTime() - new Date(order.createdAt).getTime();
            return acc + time;
          }, 0) / (orders.length || 1),
          customerRating: orders.reduce((acc, order) => acc + (order.rating || 0), 0) / (orders.length || 1)
        };
      }
      
      return {
        ...member,
        metrics
      };
    }));
    
    console.log("Staff with metrics sample:", JSON.stringify(staffWithMetrics.slice(0, 1), null, 2));
    
    return NextResponse.json({
      staff: staffWithMetrics,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST /api/manager/staff - Create a new staff member
export async function POST(request: NextRequest) {
  try {
    // Check manager authentication
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    const data = await request.json();
    
    console.log("Received data:", JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.name || !data.email || !data.password || !data.role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hash(data.password, 12);
    
    // Create user with all fields
    const userData: Record<string, any> = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      phone: data.phone || undefined,
      address: data.address || undefined,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
      salary: data.salary ? Number(data.salary) : undefined,
      photo: data.photo || undefined
    };
    
    // Remove undefined fields to allow MongoDB defaults to work
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined) {
        delete userData[key];
      }
    });
    
    console.log("Saving userData:", JSON.stringify(userData, null, 2));
    
    // Create user
    const user = await User.create(userData);
    console.log("Created user document:", JSON.stringify(user.toObject(), null, 2));
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}

// PUT /api/manager/staff - Update a staff member
export async function PUT(request: NextRequest) {
  try {
    // Check manager authentication
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    const data = await request.json();
    const { id, ...updateData } = data;
    
    console.log("Update request data:", JSON.stringify(data, null, 2));
    
    if (!id) {
      return NextResponse.json(
        { error: 'Staff member ID is required' },
        { status: 400 }
      );
    }
    
    // If updating email, check for duplicates
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: id }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }
    
    // If updating password, hash it
    if (updateData.password) {
      updateData.password = await hash(updateData.password, 12);
    }
    
    // Create a properly typed update object
    const updateFields: Record<string, any> = { ...updateData };
    
    // Handle date and number conversions
    if (updateFields.joiningDate) {
      updateFields.joiningDate = new Date(updateFields.joiningDate);
    }
    
    if (updateFields.salary) {
      updateFields.salary = Number(updateFields.salary);
    }
    
    // Remove undefined fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined || updateFields[key] === '') {
        delete updateFields[key];
      }
    });
    
    console.log("Update fields:", JSON.stringify(updateFields, null, 2));
    
    const user = await User.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    console.log("Updated user:", JSON.stringify(user.toObject(), null, 2));
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

// DELETE /api/manager/staff - Delete a staff member
export async function DELETE(request: NextRequest) {
  try {
    // Check manager authentication
    const authError = await checkManagerAuth();
    if (authError) return authError;
    
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Staff member ID is required' },
        { status: 400 }
      );
    }
    
    // Check if staff member has any active orders
    const activeOrder = await Order.findOne({
      $or: [
        { waiter: id },
        { chef: id }
      ],
      status: { $in: ['pending', 'in-progress'] }
    });
    
    if (activeOrder) {
      return NextResponse.json(
        { error: 'Cannot delete staff member with active orders' },
        { status: 400 }
      );
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
} 