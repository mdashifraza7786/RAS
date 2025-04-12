// API base URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'restaurant_token',
  USER: 'restaurant_user',
  ROLE: 'restaurant_role',
  TABLE: 'restaurant_selected_table'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10
};

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  READY: 'ready',
  SERVED: 'served',
  CANCELLED: 'cancelled'
};

// Table statuses
export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance'
};

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi'
};

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid'
}; 