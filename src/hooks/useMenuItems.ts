'use client';

import { useMenu, MenuItem } from './useMenu';

// Export the MenuItem interface
export type { MenuItem };

/**
 * Hook for fetching and managing menu items
 * This is an alias for useMenu for better naming consistency with other hooks
 */
export function useMenuItems() {
  return useMenu();
} 