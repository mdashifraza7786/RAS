# Restaurant Management System

A comprehensive web application for restaurant management with different user roles (manager, waiter, chef, and guest), built with Next.js, TypeScript, MongoDB, and TailwindCSS.

## Features

- **Role-based access control**: Different interfaces for managers, waiters, chefs, and guests
- **Order management**: Create, track, and update orders
- **Menu management**: Add, edit, or remove menu items
- **Table management**: View and update table status
- **Billing system**: Generate and manage bills
- **Customer database**: Track customer information and preferences
- **Kitchen view**: Priority-based order queue for chefs
- **Guest portal**: Self-service menu browsing and ordering

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **State Management**: React Context API
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- MongoDB instance (local or Atlas)

### Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/restaurant-management.git
   cd restaurant-management
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Environment Setup
   Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Seed the database
   ```
   npm run seed
   ```
   This will create sample users, menu items, tables, and other necessary data.

5. Run the development server
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## User Accounts

After running the seed script, the following user accounts are available:

- **Manager**:
  - Email: manager@restaurant.com
  - Password: manager123

- **Waiter**:
  - Email: waiter@restaurant.com
  - Password: waiter123

- **Chef**:
  - Email: chef@restaurant.com
  - Password: chef123

## Directory Structure

- `/src/app` - Next.js app router pages and layouts
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and database connection
- `/src/models` - Mongoose models
- `/src/scripts` - Database seeding scripts
- `/src/utils` - Helper functions and utilities

## Development

### Adding New Features

1. Create new components in the `/src/components` directory
2. Add new pages in the appropriate role directory under `/src/app`
3. Create or update models in the `/src/models` directory

### Model Structure

- **User**: Authentication and role management
- **MenuItem**: Food and beverage items
- **Table**: Restaurant tables and their status
- **Order**: Customer orders with items and status
- **Bill**: Payment information for completed orders
- **Customer**: Customer details and preferences
- **Counter**: Auto-incrementing counters for order/bill numbers

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by [React Icons](https://react-icons.github.io/react-icons/)
- UI components styled with [TailwindCSS](https://tailwindcss.com/)
