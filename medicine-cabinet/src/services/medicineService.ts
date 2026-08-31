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
  type QueryConstraint,
} from 'firebase/firestore';
import { getFirestoreInstance } from '../firebase/init';
import type { Medicine } from '../models/medicine';

/**
 * Get the medicines collection reference for a user
 */
const getMedicinesCollectionRef = (userId: string) => {
  const db = getFirestoreInstance();
  return collection(db, `users/${userId}/medicines`);
};

/**
 * Get a medicine document reference
 */
const getMedicineDocRef = (userId: string, medicineId: string) => {
  const db = getFirestoreInstance();
  return doc(db, `users/${userId}/medicines`, medicineId);
};

/**
 * Create a new medicine
 */
export const createMedicine = async (userId: string, medicineData: Omit<Medicine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = Timestamp.now();
  const medicineWithMeta = {
    ...medicineData,
    createdAt: now,
    updatedAt: now,
  };
  
  const collectionRef = getMedicinesCollectionRef(userId);
  const docRef = await addDoc(collectionRef, medicineWithMeta);
  return docRef.id;
};

/**
 * Update an existing medicine
 */
export const updateMedicine = async (
  userId: string,
  medicineId: string,
  medicineData: Partial<Omit<Medicine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const docRef = getMedicineDocRef(userId, medicineId);
  await updateDoc(docRef, {
    ...medicineData,
    updatedAt: Timestamp.now(),
  });
};

/**
 * Delete a medicine
 */
export const deleteMedicine = async (userId: string, medicineId: string): Promise<void> => {
  const docRef = getMedicineDocRef(userId, medicineId);
  await deleteDoc(docRef);
};

/**
 * Get a single medicine by ID
 */
export const getMedicine = async (userId: string, medicineId: string): Promise<Medicine | null> => {
  const docRef = getMedicineDocRef(userId, medicineId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    userId,
    name: data.name,
    description: data.description,
    type: data.type,
    quantity: data.quantity,
    initialQuantity: data.initialQuantity,
    unit: data.unit,
    expiryDate: data.expiryDate.toDate().toISOString(),
    tags: data.tags || [],
    notes: data.notes,
    createdAt: data.createdAt.toDate().toISOString(),
    updatedAt: data.updatedAt.toDate().toISOString(),
  } as Medicine;
};

/**
 * Get all medicines for a user
 */
export const getMedicines = async (userId: string): Promise<Medicine[]> => {
  const collectionRef = getMedicinesCollectionRef(userId);
  const q = query(collectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    userId,
    name: doc.data().name,
    description: doc.data().description,
    type: doc.data().type,
    quantity: doc.data().quantity,
    initialQuantity: doc.data().initialQuantity,
    unit: doc.data().unit,
    expiryDate: doc.data().expiryDate.toDate().toISOString(),
    tags: doc.data().tags || [],
    notes: doc.data().notes,
    createdAt: doc.data().createdAt.toDate().toISOString(),
    updatedAt: doc.data().updatedAt.toDate().toISOString(),
  })) as Medicine[];
};

/**
 * Search medicines by query (client-side filtering for V1)
 * For small datasets, fetch all and filter client-side
 */
export const searchMedicines = async (
  userId: string,
  searchQuery: string
): Promise<Medicine[]> => {
  const allMedicines = await getMedicines(userId);
  
  if (!searchQuery || searchQuery.trim() === '') {
    return allMedicines;
  }
  
  const normalizedQuery = searchQuery.toLowerCase().trim();
  
  return allMedicines.filter(medicine => {
    // Search in name
    if (medicine.name.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Search in description
    if (medicine.description.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Search in tags
    if (medicine.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
      return true;
    }
    
    return false;
  });
};

/**
 * Get low stock medicines
 */
export const getLowStockMedicines = async (userId: string): Promise<Medicine[]> => {
  const allMedicines = await getMedicines(userId);
  
  return allMedicines.filter(medicine => {
    const threshold = Math.max(medicine.initialQuantity * 0.20, 1);
    return medicine.quantity <= threshold;
  });
};

/**
 * Get expiring soon medicines (within 30 days)
 */
export const getExpiringMedicines = async (userId: string): Promise<Medicine[]> => {
  const allMedicines = await getMedicines(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return allMedicines.filter(medicine => {
    const expiryDate = new Date(medicine.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
  });
};

/**
 * Get expired medicines
 */
export const getExpiredMedicines = async (userId: string): Promise<Medicine[]> => {
  const allMedicines = await getMedicines(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return allMedicines.filter(medicine => {
    const expiryDate = new Date(medicine.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
  });
};
