import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import * as shoppingListService from '../services/shoppingListService';
import type { ShoppingListItem } from '../models/shoppingList';

interface UseShoppingListResult {
  items: ShoppingListItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addItem: (item: Omit<ShoppingListItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateItem: (id: string, data: Partial<Omit<ShoppingListItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  markAsPurchased: (id: string) => Promise<void>;
  markAsNotPurchased: (id: string) => Promise<void>;
}

export const useShoppingList = (): UseShoppingListResult => {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await shoppingListService.getShoppingList(user.uid);
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load shopping list:', err);
      setError('Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const addItemHandler = async (
    item: Omit<ShoppingListItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const id = await shoppingListService.addToShoppingList(user.uid, item);
    await loadItems();
    return id;
  };

  const updateItemHandler = async (
    id: string,
    data: Partial<Omit<ShoppingListItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    await shoppingListService.updateShoppingListItem(user.uid, id, data);
    await loadItems();
  };

  const deleteItemHandler = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    await shoppingListService.deleteFromShoppingList(user.uid, id);
    await loadItems();
  };

  const markAsPurchasedHandler = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    await shoppingListService.markAsPurchased(user.uid, id);
    await loadItems();
  };

  const markAsNotPurchasedHandler = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    await shoppingListService.markAsNotPurchased(user.uid, id);
    await loadItems();
  };

  return {
    items,
    loading,
    error,
    refresh: loadItems,
    addItem: addItemHandler,
    updateItem: updateItemHandler,
    deleteItem: deleteItemHandler,
    markAsPurchased: markAsPurchasedHandler,
    markAsNotPurchased: markAsNotPurchasedHandler,
  };
};
