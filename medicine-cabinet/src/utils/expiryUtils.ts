/**
 * Utility functions for expiry date calculations
 */

const EXPIRING_SOON_DAYS = 30;

export type ExpiryStatus = 'expired' | 'expiring-soon' | 'valid';

export interface ExpiryInfo {
  status: ExpiryStatus;
  daysUntilExpiry: number;
  displayText: string;
}

/**
 * Calculate expiry status from an ISO date string
 */
export const calculateExpiryInfo = (expiryDateIso: string): ExpiryInfo => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day in local timezone
  
  const expiryDate = new Date(expiryDateIso);
  expiryDate.setHours(0, 0, 0, 0);
  
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      status: 'expired',
      daysUntilExpiry: diffDays,
      displayText: 'Expired',
    };
  } else if (diffDays <= EXPIRING_SOON_DAYS) {
    const daysText = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `in ${diffDays} days`;
    return {
      status: 'expiring-soon',
      daysUntilExpiry: diffDays,
      displayText: `Expires ${daysText}`,
    };
  } else {
    return {
      status: 'valid',
      daysUntilExpiry: diffDays,
      displayText: 'Valid',
    };
  }
};

/**
 * Check if a medicine is expired
 */
export const isExpired = (expiryDateIso: string): boolean => {
  return calculateExpiryInfo(expiryDateIso).status === 'expired';
};

/**
 * Check if a medicine is expiring soon (within 30 days)
 */
export const isExpiringSoon = (expiryDateIso: string): boolean => {
  return calculateExpiryInfo(expiryDateIso).status === 'expiring-soon';
};

/**
 * Get formatted expiry display text
 */
export const getExpiryDisplayText = (expiryDateIso: string): string => {
  return calculateExpiryInfo(expiryDateIso).displayText;
};
