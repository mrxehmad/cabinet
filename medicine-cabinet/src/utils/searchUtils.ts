/**
 * Utility functions for search and filtering
 */

import type { Medicine } from '../models/medicine';

export interface SearchFilters {
  query?: string;
  types?: string[];
  tags?: string[];
  expiryStatus?: ('expired' | 'expiring-soon' | 'valid')[];
  stockStatus?: ('low' | 'in-stock')[];
}

/**
 * Normalize a string for case-insensitive comparison
 */
const normalizeString = (str: string): string => {
  return str.toLowerCase().trim();
};

/**
 * Check if a medicine matches the search query
 * Searches across name, description, and tags
 */
export const matchesSearchQuery = (medicine: Medicine, query: string): boolean => {
  if (!query || query.trim() === '') {
    return true;
  }
  
  const normalizedQuery = normalizeString(query);
  
  // Search in name
  if (normalizeString(medicine.name).includes(normalizedQuery)) {
    return true;
  }
  
  // Search in description
  if (normalizeString(medicine.description).includes(normalizedQuery)) {
    return true;
  }
  
  // Search in tags
  if (medicine.tags.some(tag => normalizeString(tag).includes(normalizedQuery))) {
    return true;
  }
  
  return false;
};

/**
 * Filter medicines based on all filter criteria
 */
export const filterMedicines = (medicines: Medicine[], filters: SearchFilters): Medicine[] => {
  return medicines.filter(medicine => {
    // Search query filter
    if (filters.query && !matchesSearchQuery(medicine, filters.query)) {
      return false;
    }
    
    // Type filter
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(medicine.type)) {
        return false;
      }
    }
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const normalizedFilterTags = filters.tags.map(t => normalizeString(t));
      const normalizedMedicineTags = medicine.tags.map(t => normalizeString(t));
      if (!normalizedFilterTags.some(tag => normalizedMedicineTags.includes(tag))) {
        return false;
      }
    }
    
    // Expiry status filter
    if (filters.expiryStatus && filters.expiryStatus.length > 0) {
      // Import dynamically to avoid circular dependency
      const { calculateExpiryInfo } = require('../utils/expiryUtils');
      const expiryInfo = calculateExpiryInfo(medicine.expiryDate);
      if (!filters.expiryStatus.includes(expiryInfo.status)) {
        return false;
      }
    }
    
    // Stock status filter
    if (filters.stockStatus && filters.stockStatus.length > 0) {
      // Import dynamically to avoid circular dependency
      const { isLowStock } = require('../utils/lowStockUtils');
      const lowStock = isLowStock(medicine.quantity, medicine.initialQuantity);
      
      if (filters.stockStatus.includes('low') && !lowStock) {
        return false;
      }
      
      if (filters.stockStatus.includes('in-stock') && lowStock) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Sort medicines by various criteria
 */
export const sortMedicines = (
  medicines: Medicine[], 
  sortBy: 'recently-added' | 'name-asc' | 'expiry-date' | 'quantity-low-to-high'
): Medicine[] => {
  const sorted = [...medicines];
  
  switch (sortBy) {
    case 'recently-added':
      return sorted.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'expiry-date':
      return sorted.sort((a, b) => {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });
    
    case 'quantity-low-to-high':
      return sorted.sort((a, b) => a.quantity - b.quantity);
    
    default:
      return sorted;
  }
};

/**
 * Get all unique tags from a list of medicines
 */
export const getUniqueTags = (medicines: Medicine[]): string[] => {
  const tagSet = new Set<string>();
  medicines.forEach(medicine => {
    medicine.tags.forEach(tag => {
      tagSet.add(tag.toLowerCase());
    });
  });
  return Array.from(tagSet).sort();
};

/**
 * Get all unique types from a list of medicines
 */
export const getUniqueTypes = (medicines: Medicine[]): string[] => {
  const typeSet = new Set<string>(medicines.map(m => m.type));
  return Array.from(typeSet).sort();
};
