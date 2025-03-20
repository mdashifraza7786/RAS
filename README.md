# Restaurant Automation System (RAS)

A modern web-based restaurant management system built with Next.js and Tailwind CSS. This system helps restaurant owners computerize their order processing, billing, accounting activities, and inventory management.

## Features

- **Role-based Access Control**:
  - Manager: Dashboard, Sales Reports, Menu Management, Staff Management, Settings
  - Sales Clerk: Dashboard, New Order, Menu
  - Kitchen Staff: Dashboard, Orders, Ingredients
  - Inventory Manager: Dashboard, Inventory, Purchase Orders, Reports

- **Menu Management**:
  - Add/Edit/Delete menu items
  - Update prices
  - Categorize items

- **Order Processing**:
  - Create new orders
  - View order status
  - Process payments

- **Inventory Management**:
  - Track ingredient stock levels
  - Generate purchase orders
  - Receive deliveries

- **Reporting**:
  - Sales reports
  - Inventory reports
  - Daily/Monthly summaries

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: Heroicons, Custom Components
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js (v18.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/restaurant-management-system.git
   cd restaurant-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. The application will redirect you to the dashboard.
2. Currently, the application uses dummy data for demonstration purposes.
3. Different interfaces are available based on the user role.
4. You can change the user role in the respective components for testing different views.

## Project Structure

```
src/
├── app/                   # Next.js application routes
│   ├── dashboard/         # Dashboard page
│   ├── menu/              # Menu management
│   ├── orders/            # Order management
│   ├── inventory/         # Inventory management
│   └── purchase-orders/   # Purchase orders management
├── components/            # Reusable components
│   └── layout/            # Layout components
├── styles/                # Global styles
└── types/                 # TypeScript type definitions
```

## Future Enhancements

- User authentication and authorization
- Database integration
- Real-time notifications
- Mobile responsiveness improvements
- Printing receipts and reports
- Integration with payment gateways

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Next.js
- Tailwind CSS
- Heroicons
