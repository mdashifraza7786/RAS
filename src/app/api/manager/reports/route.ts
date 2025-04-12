import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Order from '@/models/Order';
import MenuItem from '@/models/MenuItem';
import Inventory from '@/models/Inventory';
import User from '@/models/User';
import { Types } from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  tableTurnoverRate: number;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  orderTypes: Array<{
    status: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  topSellingItems: Array<{
    _id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

interface InventorySummary {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  expiringItems: number;
  stockCategories: Array<{
    category: string;
    totalItems: number;
    totalValue: number;
    avgMovement: string;
  }>;
  lowStockItemList: Array<{
    _id: string;
    name: string;
    category: string;
    quantity: number;
    minStockLevel: number;
  }>;
}

interface StaffSummary {
  totalStaff: number;
  staffByRole: Array<{
    role: string;
    count: number;
  }>;
  topPerformers: Array<{
    _id: string;
    name: string;
    role: string;
    ordersHandled?: number;
    tablesServed?: number;
    performance: number;
  }>;
}

interface MenuSummary {
  totalItems: number;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  topItems: Array<{
    _id: string;
    name: string;
    category: string;
    price: number;
    orderedCount: number;
    revenue: number;
    rating: number;
  }>;
  leastOrderedItems: Array<{
    _id: string;
    name: string;
    category: string;
    price: number;
    orderedCount: number;
  }>;
}

interface CustomerSummary {
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  topCustomers: Array<{
    name: string;
    visits: number;
    spent: number;
    lastVisit: string;
    favoriteItem?: string;
    preferredTime?: string;
  }>;
}

// GET /api/manager/reports - Get comprehensive reports data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a manager
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('type') || 'sales';
    const period = searchParams.get('period') || 'month';
    
    // Calculate date range based on period
    let endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(endDate);
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);
        Object.assign(endDate, yesterdayEnd);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'custom':
        const customStart = searchParams.get('startDate');
        const customEnd = searchParams.get('endDate');
        if (customStart) startDate = new Date(customStart);
        if (customEnd) endDate = new Date(customEnd);
        break;
    }
    
    // Process report based on type
    let reportData;
    
    switch (reportType) {
      case 'sales':
        reportData = await generateSalesReport(startDate, endDate);
        break;
      case 'inventory':
        reportData = await generateInventoryReport();
        break;
      case 'staff':
        reportData = await generateStaffReport();
        break;
      case 'menu':
        reportData = await generateMenuReport(startDate, endDate);
        break;
      case 'customers':
        reportData = await generateCustomerReport(startDate, endDate);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      reportType,
      period,
      timeRange: {
        startDate,
        endDate
      },
      data: reportData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Generate sales report
async function generateSalesReport(startDate: Date, endDate: Date): Promise<SalesSummary> {
  // Query for bills in the date range
  const dateQuery = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  // Get all bills in the date range
  const bills = await Bill.find({
    ...dateQuery,
    paymentStatus: 'paid'
  }).populate('order').lean();
  
  // Calculate total revenue and orders
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
  const totalOrders = bills.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Group by day to get revenue by day
  const revenueByDay: Array<{date: string; revenue: number; orderCount: number}> = [];
  const dailyData = new Map<string, {revenue: number; orderCount: number}>();
  
  bills.forEach(bill => {
    const date = new Date(bill.createdAt).toISOString().split('T')[0];
    if (!dailyData.has(date)) {
      dailyData.set(date, { revenue: 0, orderCount: 0 });
    }
    const data = dailyData.get(date)!;
    data.revenue += bill.total;
    data.orderCount += 1;
  });
  
  // Convert map to array
  dailyData.forEach((data, date) => {
    revenueByDay.push({
      date,
      revenue: data.revenue,
      orderCount: data.orderCount
    });
  });
  
  // Sort by date
  revenueByDay.sort((a, b) => a.date.localeCompare(b.date));
  
  // Get payment methods breakdown
  const paymentMethodsMap = new Map<string, {amount: number; count: number}>();
  bills.forEach(bill => {
    const method = bill.paymentMethod;
    if (!paymentMethodsMap.has(method)) {
      paymentMethodsMap.set(method, { amount: 0, count: 0 });
    }
    const data = paymentMethodsMap.get(method)!;
    data.amount += bill.total;
    data.count += 1;
  });
  
  const paymentMethods: Array<{method: string; amount: number; count: number; percentage: number}> = [];
  paymentMethodsMap.forEach((data, method) => {
    paymentMethods.push({
      method,
      amount: data.amount,
      count: data.count,
      percentage: Math.round((data.amount / totalRevenue) * 100) || 0
    });
  });
  
  // Get order types (statuses) breakdown
  const orderStatusMap = new Map<string, {amount: number; count: number}>();
  bills.forEach(bill => {
    if (!bill.order) return;
    const status = bill.order.status || 'unknown';
    if (!orderStatusMap.has(status)) {
      orderStatusMap.set(status, { amount: 0, count: 0 });
    }
    const data = orderStatusMap.get(status)!;
    data.amount += bill.total;
    data.count += 1;
  });
  
  const orderTypes: Array<{status: string; amount: number; count: number; percentage: number}> = [];
  orderStatusMap.forEach((data, status) => {
    orderTypes.push({
      status,
      amount: data.amount,
      count: data.count,
      percentage: Math.round((data.amount / totalRevenue) * 100) || 0
    });
  });
  
  // Get top selling items
  const topSellingItemsMap = new Map<string, {
    _id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>();
  
  for (const bill of bills) {
    if (!bill.order || !bill.order.items) continue;
    
    for (const item of bill.order.items) {
      const itemId = item.menuItem.toString();
      if (!topSellingItemsMap.has(itemId)) {
        topSellingItemsMap.set(itemId, {
          _id: itemId,
          name: item.name || 'Unknown Item',
          quantity: 0,
          revenue: 0
        });
      }
      
      const itemData = topSellingItemsMap.get(itemId)!;
      itemData.quantity += item.quantity;
      itemData.revenue += item.price * item.quantity;
    }
  }
  
  const topSellingItems = Array.from(topSellingItemsMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  // Calculate table turnover rate (approximation based on available data)
  // For simplicity, assuming each bill represents one table and there are 20 tables
  const totalTables = 20;
  const daysInRange = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const tableTurnoverRate = daysInRange > 0 ? (totalOrders / totalTables) / daysInRange : 0;
  
  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    tableTurnoverRate,
    revenueByDay,
    paymentMethods,
    orderTypes,
    topSellingItems
  };
}

// Generate inventory report
async function generateInventoryReport(): Promise<InventorySummary> {
  // Get all inventory items
  const items = await Inventory.find().lean();
  
  // Get orders from the last 30 days to analyze inventory usage
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const orders = await Order.find({
    createdAt: {
      $gte: thirtyDaysAgo
    }
  }).lean();
  
  // Create a map to track ingredient usage
  const ingredientUsageMap = new Map<string, number>();
  
  // Process orders to calculate ingredient usage
  orders.forEach(order => {
    if (!order.items) return;
    
    order.items.forEach((orderItem: any) => {
      // In a real system, we would access the ingredients for each menu item
      // and calculate exact usage amounts
      const menuItemId = orderItem.menuItem.toString();
      const quantity = orderItem.quantity || 1;
      
      // Simulate adding usage for each ingredient
      if (orderItem.ingredients) {
        orderItem.ingredients.forEach((ingredient: any) => {
          const ingredientId = ingredient.toString();
          if (!ingredientUsageMap.has(ingredientId)) {
            ingredientUsageMap.set(ingredientId, 0);
          }
          ingredientUsageMap.set(ingredientId, ingredientUsageMap.get(ingredientId)! + quantity);
        });
      }
    });
  });
  
  // Calculate summary statistics
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  
  // Get low stock items
  const lowStockItems = items.filter(item => 
    item.status === 'Low Stock' || 
    item.status === 'Critical Stock' || 
    item.status === 'Out of Stock' ||
    (item.quantity <= item.minStockLevel)
  ).length;
  
  // Get soon-to-expire items
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const expiringItems = items.filter(item => 
    item.expiryDate && new Date(item.expiryDate) <= sevenDaysLater
  ).length;
  
  // Group items by category with usage data
  const categoriesMap = new Map<string, {
    totalItems: number;
    totalValue: number;
    totalUsage: number;
  }>();
  
  items.forEach(item => {
    const category = item.category || 'Uncategorized';
    if (!categoriesMap.has(category)) {
      categoriesMap.set(category, {
        totalItems: 0,
        totalValue: 0,
        totalUsage: 0
      });
    }
    
    const categoryData = categoriesMap.get(category)!;
    categoryData.totalItems += 1;
    categoryData.totalValue += item.totalCost || 0;
    
    // Add usage data if available
    const itemId = ((item._id as any) || '').toString();
    if (ingredientUsageMap.has(itemId)) {
      categoryData.totalUsage += ingredientUsageMap.get(itemId) || 0;
    }
  });
  
  const stockCategories: Array<{
    category: string;
    totalItems: number;
    totalValue: number;
    avgMovement: string;
  }> = [];
  
  categoriesMap.forEach((data, category) => {
    // Determine movement based on actual usage data
    let avgMovement = 'Medium';
    
    if (data.totalUsage > 0) {
      const avgUsagePerItem = data.totalUsage / data.totalItems;
      if (avgUsagePerItem > 20) avgMovement = 'High';
      else if (avgUsagePerItem < 5) avgMovement = 'Low';
    } else {
      // Fallback to item count if no usage data
      if (data.totalItems > 20) avgMovement = 'High';
      if (data.totalItems < 5) avgMovement = 'Low';
    }
    
    stockCategories.push({
      category,
      totalItems: data.totalItems,
      totalValue: data.totalValue,
      avgMovement
    });
  });
  
  // Sort categories by value
  stockCategories.sort((a, b) => b.totalValue - a.totalValue);
  
  // Get list of low stock items for detailed display
  const lowStockItemList = items
    .filter(item => 
      item.status === 'Low Stock' || 
      item.status === 'Critical Stock' || 
      item.status === 'Out of Stock' ||
      (item.quantity <= item.minStockLevel)
    )
    .map(item => ({
      _id: ((item._id as any) || '').toString(),
      name: item.name as string,
      category: (item.category as string) || 'Uncategorized',
      quantity: item.quantity as number,
      minStockLevel: item.minStockLevel as number
    }))
    .slice(0, 10);
  
  return {
    totalItems,
    totalValue,
    lowStockItems,
    expiringItems,
    stockCategories,
    lowStockItemList
  };
}

// Generate staff report
async function generateStaffReport(): Promise<StaffSummary> {
  // Get all staff members
  const staff = await User.find({ role: { $ne: 'admin' } }).lean();
  
  // Get orders from the last 30 days to analyze staff performance
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const orders = await Order.find({
    createdAt: {
      $gte: thirtyDaysAgo
    }
  }).populate('assignedTo').lean();
  
  // Create a map to track staff performance
  const staffPerformanceMap = new Map<string, {
    ordersHandled: number,
    ordersCompleted: number,
    tablesServed: number,
    orderTotal: number
  }>();
  
  // Initialize performance tracking for all staff
  staff.forEach(member => {
    const memberId = ((member._id as any) || '').toString();
    staffPerformanceMap.set(memberId, {
      ordersHandled: 0,
      ordersCompleted: 0,
      tablesServed: 0,
      orderTotal: 0
    });
  });
  
  // Process orders to calculate staff performance
  orders.forEach(order => {
    if (!order.assignedTo) return;
    
    // Handle staff assignments to orders
    let staffId;
    if (typeof order.assignedTo === 'string') {
      staffId = order.assignedTo;
    } else if (order.assignedTo._id) {
      staffId = ((order.assignedTo._id as any) || '').toString();
    } else {
      return;
    }
    
    if (!staffPerformanceMap.has(staffId)) {
      return;
    }
    
    const staffPerformance = staffPerformanceMap.get(staffId)!;
    
    // Increment orders handled
    staffPerformance.ordersHandled += 1;
    
    // Count completed orders
    if (order.status === 'completed' || order.status === 'served') {
      staffPerformance.ordersCompleted += 1;
    }
    
    // Increment tables served (assuming each order is for a unique table)
    if (order.tableId) {
      staffPerformance.tablesServed += 1;
    }
    
    // Add order total for revenue contribution
    if (order.items && order.items.length > 0) {
      const orderTotal = order.items.reduce((sum: number, item: any) => {
        return sum + ((item.price || 0) * (item.quantity || 1));
      }, 0);
      staffPerformance.orderTotal += orderTotal;
    }
  });
  
  // Total count
  const totalStaff = staff.length;
  
  // Group by role
  const roleMap = new Map();
  staff.forEach(member => {
    const role = member.role || 'other';
    if (!roleMap.has(role)) {
      roleMap.set(role, 0);
    }
    roleMap.set(role, roleMap.get(role) + 1);
  });
  
  const staffByRole: Array<{role: string; count: number}> = [];
  roleMap.forEach((count, role) => {
    staffByRole.push({ role, count });
  });
  
  // Sort by count
  staffByRole.sort((a, b) => b.count - a.count);
  
  // Calculate performance scores based on real metrics
  const topPerformers = staff
    .map(member => {
      const memberId = ((member._id as any) || '').toString();
      const performance = staffPerformanceMap.get(memberId);
      
      if (!performance) {
        // Fallback if no performance data
        return {
          _id: memberId,
          name: member.name as string,
          role: member.role as string,
          performance: 70 // Default score
        };
      }
      
      // Calculate performance score based on completion rate and volume
      let performanceScore = 70; // Base score
      
      // If they've handled orders, calculate performance based on completion rate
      if (performance.ordersHandled > 0) {
        const completionRate = performance.ordersCompleted / performance.ordersHandled;
        performanceScore = Math.round(70 + (completionRate * 25)); // Scale from 70-95
      }
      
      // Add relevant metrics based on role
      let extra = {};
      if (member.role === 'waiter') {
        extra = { tablesServed: performance.tablesServed };
      } else if (member.role === 'chef') {
        extra = { ordersHandled: performance.ordersHandled };
      }
      
      return {
        _id: memberId,
        name: member.name as string,
        role: member.role as string,
        performance: performanceScore,
        ...extra
      };
    })
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 5);
  
  return {
    totalStaff,
    staffByRole,
    topPerformers
  };
}

// Generate menu report
async function generateMenuReport(startDate: Date, endDate: Date): Promise<MenuSummary> {
  // Get all menu items
  const menuItems = await MenuItem.find().lean();
  
  // Get orders in date range to analyze menu item performance
  const orders = await Order.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).lean();
  
  // Count total menu items
  const totalItems = menuItems.length;
  
  // Create a map to track category counts
  const categoryMap = new Map();
  menuItems.forEach(item => {
    const category = item.category || 'Uncategorized';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, 0);
    }
    categoryMap.set(category, categoryMap.get(category) + 1);
  });
  
  const categoryBreakdown: Array<{category: string; count: number; percentage: number}> = [];
  categoryMap.forEach((count, category) => {
    categoryBreakdown.push({
      category,
      count,
      percentage: Math.round((count / totalItems) * 100)
    });
  });
  
  // Sort by count
  categoryBreakdown.sort((a, b) => b.count - a.count);
  
  // Create a map of menu item order counts and revenue
  const menuItemStats = new Map();
  menuItems.forEach(item => {
    menuItemStats.set(((item._id as any) || '').toString(), {
      _id: ((item._id as any) || '').toString(),
      name: item.name as string,
      category: (item.category as string) || 'Uncategorized',
      price: item.price as number,
      orderedCount: 0,
      revenue: 0,
      rating: (item.popularity as number) || Math.random() * 2 + 3 // 3-5 rating if not available
    });
  });
  
  // Process orders to get item stats
  orders.forEach(order => {
    if (!order.items) return;
    
    order.items.forEach((orderItem: any) => {
      const itemId = orderItem.menuItem.toString();
      if (!menuItemStats.has(itemId)) return;
      
      const stats = menuItemStats.get(itemId);
      stats.orderedCount += orderItem.quantity;
      stats.revenue += orderItem.price * orderItem.quantity;
    });
  });
  
  // Convert to array and sort
  const allItems = Array.from(menuItemStats.values());
  
  // Top ordered items
  const topItems = [...allItems]
    .sort((a, b) => b.orderedCount - a.orderedCount)
    .slice(0, 10);
  
  // Least ordered items
  const leastOrderedItems = [...allItems]
    .filter(item => item.orderedCount > 0) // Only include items that were ordered at least once
    .sort((a, b) => a.orderedCount - b.orderedCount)
    .slice(0, 5);
  
  return {
    totalItems,
    categoryBreakdown,
    topItems,
    leastOrderedItems
  };
}

// Generate customer report
async function generateCustomerReport(startDate: Date, endDate: Date): Promise<CustomerSummary> {
  // Get all bills in the date range to analyze customer behavior
  const bills = await Bill.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('order').lean();
  
  // Get a previous period of the same length for comparison
  const periodLength = endDate.getTime() - startDate.getTime();
  const previousPeriodEndDate = new Date(startDate.getTime());
  const previousPeriodStartDate = new Date(previousPeriodEndDate.getTime() - periodLength);
  
  const previousPeriodBills = await Bill.find({
    createdAt: {
      $gte: previousPeriodStartDate,
      $lte: previousPeriodEndDate
    }
  }).lean();
  
  // Get all previous customers for identifying new vs. returning
  const allPreviousCustomers = new Set();
  previousPeriodBills.forEach(bill => {
    if (bill.customerName && bill.customerName !== 'Guest') {
      allPreviousCustomers.add(bill.customerName);
    } else if (bill.customerPhone) {
      allPreviousCustomers.add(bill.customerPhone);
    }
  });
  
  // Create a map to track customer visits and spending with more details
  const customerMap = new Map<string, {
    name: string,
    visits: number,
    spent: number,
    lastVisit: Date,
    isNew: boolean,
    preferredItems: Map<string, number>,
    averageSpend: number,
    visitTimes: number[] // Store hour of day for each visit
  }>();
  
  // Process current period bills
  bills.forEach(bill => {
    let customerKey = 'Guest';
    
    if (bill.customerName && bill.customerName !== 'Guest') {
      customerKey = bill.customerName;
    } else if (bill.customerPhone) {
      customerKey = bill.customerPhone;
    }
    
    if (!customerMap.has(customerKey)) {
      // Check if this is a new customer (not present in previous period)
      const isNew = !allPreviousCustomers.has(customerKey);
      
      customerMap.set(customerKey, {
        name: bill.customerName || 'Guest',
        visits: 0,
        spent: 0,
        lastVisit: bill.createdAt,
        isNew,
        preferredItems: new Map<string, number>(),
        averageSpend: 0,
        visitTimes: []
      });
    }
    
    const customer = customerMap.get(customerKey)!;
    customer.visits += 1;
    customer.spent += bill.total;
    
    // Track visit time (hour of day)
    const visitHour = new Date(bill.createdAt).getHours();
    customer.visitTimes.push(visitHour);
    
    // Update last visit if this bill is more recent
    if (new Date(bill.createdAt) > new Date(customer.lastVisit)) {
      customer.lastVisit = bill.createdAt;
    }
    
    // Track ordered items if available
    if (bill.order && bill.order.items) {
      bill.order.items.forEach((item: any) => {
        const itemName = item.name || 'Unknown Item';
        if (!customer.preferredItems.has(itemName)) {
          customer.preferredItems.set(itemName, 0);
        }
        customer.preferredItems.set(itemName, customer.preferredItems.get(itemName)! + 1);
      });
    }
  });
  
  // Process map and calculate averages
  customerMap.forEach(customer => {
    customer.averageSpend = customer.visits > 0 ? customer.spent / customer.visits : 0;
  });
  
  // Convert to array with simplified format for API response
  const customers = Array.from(customerMap.entries()).map(([key, data]) => {
    // Find most ordered item if any
    let favoriteItem = '';
    let maxCount = 0;
    data.preferredItems.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteItem = item;
      }
    });
    
    // Calculate preferred visit time
    let preferredTime = 'No data';
    if (data.visitTimes.length > 0) {
      const times = data.visitTimes.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      let maxVisits = 0;
      let preferredHour = 0;
      
      Object.entries(times).forEach(([hour, count]) => {
        if (count > maxVisits) {
          maxVisits = count;
          preferredHour = Number(hour);
        }
      });
      
      // Convert hour to time period
      if (preferredHour < 12) {
        preferredTime = 'Morning';
      } else if (preferredHour < 17) {
        preferredTime = 'Afternoon';
      } else {
        preferredTime = 'Evening';
      }
    }
    
    return {
      name: data.name,
      visits: data.visits,
      spent: data.spent,
      lastVisit: data.lastVisit instanceof Date ? data.lastVisit.toISOString() : String(data.lastVisit),
      isNew: data.isNew,
      averageSpend: data.averageSpend,
      favoriteItem: favoriteItem || 'None',
      preferredTime
    };
  });
  
  // Calculate metrics
  const totalCustomers = customers.length;
  
  // Customers flagged as new based on previous period comparison
  const newCustomers = customers.filter(c => c.isNew).length;
  
  // Customers with more than one visit are repeat customers
  const repeatCustomers = customers.filter(c => c.visits > 1).length;
  
  // Get top customers by amount spent
  const topCustomers = customers
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 10)
    .map(c => ({
      name: c.name,
      visits: c.visits,
      spent: c.spent,
      lastVisit: c.lastVisit,
      favoriteItem: c.favoriteItem,
      preferredTime: c.preferredTime
    }));
  
  return {
    totalCustomers,
    newCustomers,
    repeatCustomers,
    topCustomers
  };
} 