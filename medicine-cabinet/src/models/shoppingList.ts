/**
 * Shopping list item model
 */
export interface ShoppingListItem {
  id: string;
  userId: string;
  medicineId?: string; // Reference to medicine if added from existing medicine
  name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  isPurchased: boolean;
  createdAt: string;
  updatedAt: string;
}
