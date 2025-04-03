# Restaurant Management System - Backend Setup

This document outlines the steps to set up and run the backend for the restaurant management system.

## Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local or Atlas)

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Configure Environment Variables:**

Create a `.env.local` file in the root of your project with the following variables:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/restaurant
# Or your MongoDB Atlas URI
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/restaurant

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-in-production

# App Configuration
NODE_ENV=development
```

3. **Seed Initial Users:**

Run the seed script to create initial users:

```bash
npm run seed-users
```

This will create the following user accounts:
- Manager: manager@example.com / password123
- Waiter: waiter@example.com / password123
- Chef: chef@example.com / password123

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

## API Routes

The API routes are organized as follows:

- `/api/auth/[...nextauth]` - Authentication endpoints handled by NextAuth.js
- `/api/manager/...` - Manager-specific endpoints
- `/api/waiter/...` - Waiter-specific endpoints
- `/api/chef/...` - Chef-specific endpoints

## Authentication

Authentication is handled by NextAuth.js with a credentials provider. User sessions are stored as JWTs.

## Role-Based Access Control

The application implements role-based access control:
- Manager users can access `/manager/*` routes
- Waiter users can access `/waiter/*` routes
- Chef users can access `/chef/*` routes

Roles are checked on both client and server sides to ensure proper authorization.

## Data Models

The following models are implemented:

- `User` - User accounts with role-based access control

## Adding More Features

To extend the backend:

1. Create additional models in `src/models/`
2. Add API routes in `src/app/api/`
3. Implement route handlers with proper authentication and authorization checks 