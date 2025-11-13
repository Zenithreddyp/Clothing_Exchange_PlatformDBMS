/**
 * Valid ENUM values from database schema
 * These must match the database ENUM definitions exactly
 */

export const CATEGORIES = ['Men', 'Women', 'Kids', 'Unisex'];

export const ITEM_CONDITIONS = ['New', 'Gently Used', 'Worn'];

export const ITEM_STATUSES = ['All', 'Available', 'Exchange', 'Donated'];

export const EXCHANGE_STATUSES = ['Pending', 'Accepted', 'Rejected'];

export const TRANSACTION_TYPES = ['Earn', 'Spend'];

/**
 * Helper function to validate if a value is a valid enum
 */
export function isValidCategory(value) {
  return CATEGORIES.includes(value);
}

export function isValidItemCondition(value) {
  return ITEM_CONDITIONS.includes(value);
}

export function isValidItemStatus(value) {
  return ITEM_STATUSES.includes(value);
}

export function isValidExchangeStatus(value) {
  return EXCHANGE_STATUSES.includes(value);
}

export function isValidTransactionType(value) {
  return TRANSACTION_TYPES.includes(value);
}

