import * as dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import connectToDatabase from '../lib/mongodb';
import User from '../models/User';
import MenuItem from '../models/MenuItem';
import Table from '../models/Table';
import Order from '../models/Order';
import Bill from '../models/Bill';
import Customer from '../models/Customer';
import Counter from '../models/Counter';

// Seed menu items data
const menuItems = [
  {
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese cubes cooked in rich tomato and butter gravy',
    price: 250,
    category: 'Main Course',
    image: '/images/paneer-butter-masala.jpg',
    available: true,
    popular: true,
    preparationTime: 20,
    ingredients: ['Paneer', 'Tomato', 'Butter', 'Cream', 'Spices']
  },
  {
    name: 'Butter Naan',
    description: 'Leavened bread cooked in tandoor and finished with butter',
    price: 40,
    category: 'Bread',
    image: '/images/butter-naan.jpg',
    available: true,
    popular: true,
    preparationTime: 10,
    ingredients: ['Flour', 'Butter', 'Yeast', 'Milk']
  },
  {
    name: 'Veg Biryani',
    description: 'Fragrant basmati rice cooked with mixed vegetables and spices',
    price: 220,
    category: 'Rice',
    image: '/images/veg-biryani.jpg',
    available: true,
    popular: true,
    preparationTime: 25,
    ingredients: ['Rice', 'Mixed Vegetables', 'Spices', 'Ghee']
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy rice pancake served with potato filling, sambar and chutney',
    price: 120,
    category: 'Breakfast',
    image: '/images/masala-dosa.jpg',
    available: true,
    popular: true,
    preparationTime: 15,
    ingredients: ['Rice Batter', 'Potato', 'Onion', 'Spices']
  },
  {
    name: 'Gulab Jamun',
    description: 'Deep-fried milk solids soaked in sugar syrup',
    price: 80,
    category: 'Dessert',
    image: '/images/gulab-jamun.jpg',
    available: true,
    popular: true,
    preparationTime: 5,
    ingredients: ['Milk Powder', 'Sugar', 'Cardamom', 'Rose Water']
  },
  {
    name: 'Chicken Tikka Masala',
    description: 'Grilled chicken pieces in spiced tomato gravy',
    price: 320,
    category: 'Main Course',
    image: '/images/chicken-tikka-masala.jpg',
    available: true,
    popular: true,
    preparationTime: 25,
    ingredients: ['Chicken', 'Yogurt', 'Tomato', 'Spices', 'Cream']
  },
  {
    name: 'Mango Lassi',
    description: 'Sweet yogurt drink with mango pulp',
    price: 80,
    category: 'Beverage',
    image: '/images/mango-lassi.jpg',
    available: true,
    popular: true,
    preparationTime: 5,
    ingredients: ['Yogurt', 'Mango', 'Sugar', 'Cardamom']
  },
  {
    name: 'Masala Chai',
    description: 'Spiced Indian tea with milk',
    price: 30,
    category: 'Beverage',
    image: '/images/masala-chai.jpg',
    available: true,
    popular: true,
    preparationTime: 5,
    ingredients: ['Tea', 'Milk', 'Ginger', 'Cardamom', 'Cloves']
  }
];

// Seed tables data
const tables = [
  {
    number: 1,
    name: 'Table 1',
    capacity: 2,
    status: 'available',
    location: 'Window'
  },
  {
    number: 2,
    name: 'Table 2',
    capacity: 4,
    status: 'available',
    location: 'Window'
  },
  {
    number: 3,
    name: 'Table 3',
    capacity: 6,
    status: 'available',
    location: 'Center'
  },
  {
    number: 4,
    name: 'Table 4',
    capacity: 4,
    status: 'occupied',
    location: 'Center'
  },
  {
    number: 5,
    name: 'Table 5',
    capacity: 2,
    status: 'reserved',
    location: 'Corner'
  },
  {
    number: 6,
    name: 'Table 6',
    capacity: 8,
    status: 'available',
    location: 'Private'
  },
  {
    number: 7,
    name: 'Table 7',
    capacity: 4,
    status: 'cleaning',
    location: 'Outdoor'
  },
  {
    number: 8,
    name: 'Table 8',
    capacity: 2,
    status: 'available',
    location: 'Outdoor'
  }
];

// Seed customers data
const customers = [
  {
    name: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul.sharma@example.com',
    visits: 5,
    totalSpent: 3800,
    lastVisit: new Date('2023-03-15'),
    preferences: 'Prefers window seating, vegetarian'
  },
  {
    name: 'Priya Singh',
    phone: '8765432109',
    email: 'priya.singh@example.com',
    visits: 3,
    totalSpent: 2400,
    lastVisit: new Date('2023-03-20'),
    preferences: 'Allergic to nuts'
  },
  {
    name: 'Amit Patel',
    phone: '7654321098',
    visits: 1,
    totalSpent: 800,
    lastVisit: new Date('2023-03-25')
  },
  {
    name: 'Deepika Shah',
    phone: '6543210987',
    email: 'deepika.shah@example.com',
    visits: 2,
    totalSpent: 1600,
    lastVisit: new Date('2023-03-22'),
    preferences: 'Prefers spicy food'
  }
];

// Initialize counters
const counters = [
  { name: 'orderNumber', value: 1 },
  { name: 'billNumber', value: 1 }
];

// Seed function
async function seedData() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    console.log('Connected to MongoDB, starting seed...');
    
    // 1. Clear all collections first
    await Promise.all([
      MenuItem.deleteMany({}),
      Table.deleteMany({}),
      Customer.deleteMany({}),
      Order.deleteMany({}),
      Bill.deleteMany({}),
      Counter.deleteMany({})
    ]);
    
    console.log('Cleared existing data');
    
    // 2. Seed menu items
    const createdMenuItems = await MenuItem.create(menuItems);
    console.log(`Added ${createdMenuItems.length} menu items`);
    
    // 3. Seed tables
    const createdTables = await Table.create(tables);
    console.log(`Added ${createdTables.length} tables`);
    
    // 4. Seed customers
    const createdCustomers = await Customer.create(customers);
    console.log(`Added ${createdCustomers.length} customers`);
    
    // 5. Set up counters
    const createdCounters = await Counter.create(counters);
    console.log(`Added ${createdCounters.length} counters`);
    
    // 6. Create sample orders
    const waiter = await User.findOne({ role: 'waiter' });
    if (!waiter) {
      throw new Error('No waiter user found. Please run seed-users first.');
    }
    
    // Get a table for the order (using table #4 which is occupied)
    const table = createdTables.find(table => table.number === 4);
    
    if (!table) {
      throw new Error('Table #4 not found');
    }
    
    // Get some menu items for the order
    const paneerButterMasala = createdMenuItems.find(item => item.name === 'Paneer Butter Masala');
    const butterNaan = createdMenuItems.find(item => item.name === 'Butter Naan');
    const mangoLassi = createdMenuItems.find(item => item.name === 'Mango Lassi');
    
    if (!paneerButterMasala || !butterNaan || !mangoLassi) {
      throw new Error('Required menu items not found');
    }
    
    // Create a sample order
    const orderItems = [
      {
        menuItem: paneerButterMasala._id,
        name: paneerButterMasala.name,
        price: paneerButterMasala.price,
        quantity: 1,
        status: 'served'
      },
      {
        menuItem: butterNaan._id,
        name: butterNaan.name,
        price: butterNaan.price,
        quantity: 2,
        status: 'served'
      },
      {
        menuItem: mangoLassi._id,
        name: mangoLassi.name,
        price: mangoLassi.price,
        quantity: 2,
        status: 'served'
      }
    ];
    
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% tax
    const total = subtotal + tax;
    
    // Create the order
    const order = await Order.create({
      orderNumber: 1001,
      table: table._id,
      items: orderItems,
      status: 'completed',
      subtotal,
      tax,
      total,
      paymentStatus: 'paid',
      paymentMethod: 'card',
      customerName: 'Rahul Sharma',
      waiter: waiter._id
    });
    
    console.log(`Created sample order #${order.orderNumber}`);
    
    // Create a bill for the order
    const bill = await Bill.create({
      billNumber: 1001,
      order: order._id,
      subtotal,
      tax,
      tip: 50,
      total: subtotal + tax + 50,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      customerName: 'Rahul Sharma',
      customerPhone: '9876543210',
      waiter: waiter._id
    });
    
    console.log(`Created sample bill #${bill.billNumber}`);
    
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedData(); 