import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreInstance } from '../firebase/init';
import type { ShoppingListItem } from '../models/shoppingList';

/**
 * Get the shopping list collection reference for a user
 */
const getShoppingListCollectionRef = (userId: string) => {
  const db = getFirestoreInstance();
  return collection(db, `users/${userId}/shoppingList`);
};

/**
 * Get a shopping list item document reference
 */
const getShoppingListItemDocRef = (userId: string, itemId: string) => {
  const db = getFirestoreInstance();
  return doc(db, `users/${userId}/shoppingList`, itemId);
};

/**
 * Add an item to the shopping list
 */
export const addToShoppingList = async (
  userId: string,
  itemData: Omit<ShoppingListItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = Timestamp.now();
  const itemWithMeta = {
    ...itemData,
    createdAt: now,
    updatedAt: now,
  };
  
  const collectionRef = getShoppingListCollectionRef(userId);
  const docRef = await addDoc(collectionRef, itemWithMeta);
  return docRef.id;
};

/**
 * Update a shopping list item
 */
export const updateShoppingListItem = async (
  userId: string,
  itemId: string,
  itemData: Partial<Omit<ShoppingListItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const docRef = getShoppingListItemDocRef(userId, itemId);
  await updateDoc(docRef, {
    ...itemData,
    updatedAt: Timestamp.now(),
  });
};

/**
 * Delete a shopping list item
 */
export const deleteFromShoppingList = async (userId: string, itemId: string): Promise<void> => {
  const docRef = getShoppingListItemDocRef(userId, itemId);
  await deleteDoc(docRef);
};

/**
 * Get all shopping list items for a user
 */
export const getShoppingList = async (userId: string): Promise<ShoppingListItem[]> => {
  const collectionRef = getShoppingListCollectionRef(userId);
  const q = query(collectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userId,
      medicineId: data.medicineId,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      unit: data.unit,
      isPurchased: data.isPurchased,
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString(),
    };
  }) as ShoppingListItem[];
};

/**
 * Mark a shopping list item as purchased
 */
export const markAsPurchased = async (userId: string, itemId: string): Promise<void> => {
  await updateShoppingListItem(userId, itemId, { isPurchased: true });
};

/**
 * Mark a shopping list item as not purchased
 */
export const markAsNotPurchased = async (userId: string, itemId: string): Promise<void> => {
  await updateShoppingListItem(userId, itemId, { isPurchased: false });
};

/**
 * Get pending shopping list items
 */
export const getPendingShoppingListItems = async (userId: string): Promise<ShoppingListItem[]> => {
  const allItems = await getShoppingList(userId);
  return allItems.filter(item => !item.isPurchased);
};

/**
 * Get purchased shopping list items
 */
export const getPurchasedShoppingListItems = async (userId: string): Promise<ShoppingListItem[]> => {
  const allItems = await getShoppingList(userId);
  return allItems.filter(item => item.isPurchased);
};
