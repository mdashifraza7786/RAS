/**
 * Utility functions for API requests
 */

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  method?: RequestMethod;
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Make an API request with error handling
 */
export async function fetchApi<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    credentials: 'include' // Include cookies for authentication
  };
  
  if (body) {
    requestOptions.body = JSON.stringify(body);
  }
  
  const response = await fetch(`/api/${endpoint}`, requestOptions);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API request failed with status ${response.status}`);
  }
  
  return response.json();
}

/**
 * Menu item API requests
 */
export const menuApi = {
  getAll: () => fetchApi<any[]>('menu'),
  getById: (id: string) => fetchApi<any>(`menu/${id}`),
  create: (data: any) => fetchApi<any>('menu', { method: 'POST', body: data }),
  update: (id: string, data: any) => fetchApi<any>(`menu/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => fetchApi<any>(`menu/${id}`, { method: 'DELETE' })
};

/**
 * Table API requests
 */
export const tableApi = {
  getAll: () => fetchApi<any[]>('tables'),
  getById: (id: string) => fetchApi<any>(`tables/${id}`),
  create: (data: any) => fetchApi<any>('tables', { method: 'POST', body: data }),
  update: (id: string, data: any) => fetchApi<any>(`tables/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => fetchApi<any>(`tables/${id}`, { method: 'DELETE' })
};

/**
 * Order API requests
 */
export const orderApi = {
  getAll: (params?: URLSearchParams) => {
    const queryString = params ? `?${params.toString()}` : '';
    return fetchApi<any>(`orders${queryString}`);
  },
  getById: (id: string) => fetchApi<any>(`orders/${id}`),
  create: (data: any) => fetchApi<any>('orders', { method: 'POST', body: data }),
  update: (id: string, data: any) => fetchApi<any>(`orders/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => fetchApi<any>(`orders/${id}`, { method: 'DELETE' })
};

/**
 * Bill API requests
 */
export const billApi = {
  getAll: (params?: URLSearchParams) => {
    const queryString = params ? `?${params.toString()}` : '';
    return fetchApi<any>(`bills${queryString}`);
  },
  getById: (id: string) => fetchApi<any>(`bills/${id}`),
  create: (data: any) => fetchApi<any>('bills', { method: 'POST', body: data }),
  update: (id: string, data: any) => fetchApi<any>(`bills/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => fetchApi<any>(`bills/${id}`, { method: 'DELETE' })
};

/**
 * Customer API requests
 */
export const customerApi = {
  getAll: (params?: URLSearchParams) => {
    const queryString = params ? `?${params.toString()}` : '';
    return fetchApi<any>(`customers${queryString}`);
  },
  getById: (id: string, includeHistory: boolean = false) => {
    const queryString = includeHistory ? '?history=true' : '';
    return fetchApi<any>(`customers/${id}${queryString}`);
  },
  create: (data: any) => fetchApi<any>('customers', { method: 'POST', body: data }),
  update: (id: string, data: any) => fetchApi<any>(`customers/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => fetchApi<any>(`customers/${id}`, { method: 'DELETE' })
};

/**
 * Stats API requests
 */
export const statsApi = {
  get: () => fetchApi<any>('stats')
};

/**
 * Waiter API requests
 */
export const waiterApi = {
  getOrders: (params?: URLSearchParams) => {
    const queryString = params ? `?${params.toString()}` : '';
    return fetchApi<any>(`waiter/orders${queryString}`);
  },
  getOrderById: (id: string) => fetchApi<any>(`waiter/orders/${id}`),
  createOrder: (data: any) => fetchApi<any>('waiter/orders', { method: 'POST', body: data }),
  updateOrder: (id: string, data: any) => fetchApi<any>(`waiter/orders/${id}`, { method: 'PUT', body: data }),
  updateOrderStatus: (id: string, status: string) => 
    fetchApi<any>(`waiter/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  addItems: (id: string, items: any[]) => 
    fetchApi<any>(`waiter/orders/${id}/items`, { method: 'POST', body: { items } }),
  updateItemStatus: (orderId: string, itemId: string, status: string) =>
    fetchApi<any>(`waiter/orders/${orderId}/items/${itemId}/status`, 
      { method: 'PUT', body: { status } }),
  removeItem: (orderId: string, itemId: string) => 
    fetchApi<any>(`waiter/orders/${orderId}/removeItem`, 
      { method: 'DELETE', body: { itemId } })
}; 