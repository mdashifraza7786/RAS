import * as dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import connectToDatabase from '../lib/mongodb';
import User from '../models/User';

async function seedUsers() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    console.log('Connected to MongoDB, starting seed...');
    
    // Define our initial users
    const users = [
      {
        name: 'Restaurant Manager',
        email: 'manager@example.com',
        password: 'password123',
        role: 'manager'
      },
      {
        name: 'John Waiter',
        email: 'waiter@example.com',
        password: 'password123',
        role: 'waiter'
      },
      {
        name: 'Alex Chef',
        email: 'chef@example.com',
        password: 'password123',
        role: 'chef'
      }
    ];
    
    // Check if users already exist
    const existingUsers = await User.find({ email: { $in: users.map(u => u.email) } });
    if (existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} existing users. Skipping insertion.`);
      
      // Print existing users
      existingUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.role}`);
      });
      
      // Exit early if all users exist
      if (existingUsers.length === users.length) {
        console.log('All users already exist. No new users added.');
        process.exit(0);
      }
      
      // Filter out existing users by email
      const existingEmails = new Set(existingUsers.map(u => u.email));
      users.filter(u => !existingEmails.has(u.email));
    }
    
    // Insert users
    const result = await User.create(users);
    
    console.log(`Successfully added ${result.length} users:`);
    result.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });
    
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedUsers();