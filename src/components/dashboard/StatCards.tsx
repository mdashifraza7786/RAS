import React from 'react';
import { ManagerStats, WaiterStats, ChefStats } from '@/hooks/useStats';
import { FaMoneyBillWave, FaUtensils, FaUsers, FaClipboardList, FaTable, FaCheck, FaBell, FaExclamationTriangle } from 'react-icons/fa';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`p-4 rounded-lg shadow-md ${color} text-white`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  );
};

interface ManagerStatCardsProps {
  stats: ManagerStats;
}

export const ManagerStatCards: React.FC<ManagerStatCardsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Today's Orders"
        value={stats.todayOrders}
        icon={<FaClipboardList />}
        color="bg-blue-600"
      />
      <StatCard
        title="Today's Revenue"
        value={formatCurrency(stats.todayRevenue)}
        icon={<FaMoneyBillWave />}
        color="bg-green-600"
      />
      <StatCard
        title="Available Tables"
        value={`${stats.tableStats.available} / ${stats.tableStats.total}`}
        icon={<FaTable />}
        color="bg-purple-600"
      />
      <StatCard
        title="Customers"
        value={stats.recentCustomers.length}
        icon={<FaUsers />}
        color="bg-amber-600"
      />
    </div>
  );
};

interface WaiterStatCardsProps {
  stats: WaiterStats;
}

export const WaiterStatCards: React.FC<WaiterStatCardsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const availableTables = stats.tables.filter(table => table.status === 'available').length;
  const occupiedTables = stats.tables.filter(table => table.status === 'occupied').length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Orders Today"
        value={stats.todayOrders}
        icon={<FaClipboardList />}
        color="bg-blue-600"
      />
      <StatCard
        title="Sales Today"
        value={formatCurrency(stats.todayRevenue)}
        icon={<FaMoneyBillWave />}
        color="bg-green-600"
      />
      <StatCard
        title="Available Tables"
        value={availableTables}
        icon={<FaTable />}
        color="bg-purple-600"
      />
      <StatCard
        title="Occupied Tables"
        value={occupiedTables}
        icon={<FaUsers />}
        color="bg-amber-600"
      />
    </div>
  );
};

interface ChefStatCardsProps {
  stats: ChefStats;
}

export const ChefStatCards: React.FC<ChefStatCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Pending Orders"
        value={stats.orderCounts.pending}
        icon={<FaClipboardList />}
        color="bg-amber-600"
      />
      <StatCard
        title="In Progress"
        value={stats.orderCounts.inProgress}
        icon={<FaUtensils />}
        color="bg-blue-600"
      />
      <StatCard
        title="Ready to Serve"
        value={stats.orderCounts.ready}
        icon={<FaCheck />}
        color="bg-green-600"
      />
      <StatCard
        title="Low Inventory"
        value={stats.lowInventory.length}
        icon={<FaExclamationTriangle />}
        color="bg-red-600"
      />
    </div>
  );
}; 