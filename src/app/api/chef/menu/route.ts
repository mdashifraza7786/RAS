import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import MenuItem, { IMenuItem } from '@/models/MenuItem';
import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Check user authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Parse query parameters
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const availability = url.searchParams.get('availability') || '';

    // Build query
    const query: mongoose.FilterQuery<IMenuItem> = {};
    
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (availability === 'Available') {
      query.available = true;
    } else if (availability === 'Unavailable') {
      query.available = false;
    }

    // Get menu items directly using the imported MenuItem model
    const menuItems = await (MenuItem as any).find(query).lean();

    // Get all unique categories for filtering
    const allCategories = await (MenuItem as any).distinct('category');

    // Format the response
    const formattedMenuItems = menuItems.map(item => ({
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      available: item.available,
      popular: item.popular || false,
      preparationTime: item.preparationTime,
      ingredients: item.ingredients || [],
      isVegetarian: item.ingredients ? 
        !item.ingredients.some(i => 
          ['chicken', 'meat', 'beef', 'pork', 'fish', 'mutton', 'egg'].includes(i.toLowerCase())
        ) : false,
      isSpecial: item.popular || false,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    return NextResponse.json({ 
      menuItems: formattedMenuItems,
      categories: ['All', ...allCategories]
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
} 