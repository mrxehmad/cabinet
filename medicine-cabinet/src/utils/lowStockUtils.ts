/**
 * Utility functions for low stock calculations
 */

const LOW_STOCK_THRESHOLD_PERCENT = 0.20; // 20%
const MINIMUM_LOW_STOCK_THRESHOLD = 1; // Minimum threshold for very small quantities

export interface LowStockInfo {
  isLowStock: boolean;
  threshold: number;
  displayText: string;
}

/**
 * Calculate low stock status
 * 
 * Logic: quantity <= initialQuantity * 0.20
 * With a minimum threshold of 1 for very small initial quantities
 */
export const calculateLowStockInfo = (quantity: number, initialQuantity: number): LowStockInfo => {
  if (initialQuantity <= 0) {
    return {
      isLowStock: false,
      threshold: 0,
      displayText: '',
    };
  }
  
  // Calculate the percentage-based threshold
  const percentageThreshold = initialQuantity * LOW_STOCK_THRESHOLD_PERCENT;
  
  // Use the maximum of percentage threshold and minimum threshold
  // This ensures sensible behavior for very small quantities
  const threshold = Math.max(percentageThreshold, MINIMUM_LOW_STOCK_THRESHOLD);
  
  const isLowStock = quantity <= threshold;
  
  return {
    isLowStock,
    threshold: Math.ceil(threshold),
    displayText: isLowStock ? '⚠ Low stock' : '',
  };
};

/**
 * Check if medicine is low stock
 */
export const isLowStock = (quantity: number, initialQuantity: number): boolean => {
  return calculateLowStockInfo(quantity, initialQuantity).isLowStock;
};

/**
 * Get low stock threshold for display or validation
 */
export const getLowStockThreshold = (initialQuantity: number): number => {
  const percentageThreshold = initialQuantity * LOW_STOCK_THRESHOLD_PERCENT;
  return Math.ceil(Math.max(percentageThreshold, MINIMUM_LOW_STOCK_THRESHOLD));
};
