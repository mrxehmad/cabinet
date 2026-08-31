import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import * as medicineService from '../services/medicineService';
import type { Medicine } from '../models/medicine';

interface UseMedicinesResult {
  medicines: Medicine[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createMedicine: (data: Omit<Medicine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateMedicine: (id: string, data: Partial<Omit<Medicine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
}

export const useMedicines = (): UseMedicinesResult => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMedicines = useCallback(async () => {
    if (!user) {
      setMedicines([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await medicineService.getMedicines(user.uid);
      setMedicines(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load medicines:', err);
      setError('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const createMedicineHandler = async (
    data: Omit<Medicine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const id = await medicineService.createMedicine(user.uid, data);
    await loadMedicines();
    return id;
  };

  const updateMedicineHandler = async (
    id: string,
    data: Partial<Omit<Medicine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    await medicineService.updateMedicine(user.uid, id, data);
    await loadMedicines();
  };

  const deleteMedicineHandler = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    await medicineService.deleteMedicine(user.uid, id);
    await loadMedicines();
  };

  return {
    medicines,
    loading,
    error,
    refresh: loadMedicines,
    createMedicine: createMedicineHandler,
    updateMedicine: updateMedicineHandler,
    deleteMedicine: deleteMedicineHandler,
  };
};
