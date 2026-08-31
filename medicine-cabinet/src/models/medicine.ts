/**
 * Medicine data model
 */
export interface Medicine {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: MedicineType;
  quantity: number;
  initialQuantity: number;
  unit: MedicineUnit | string;
  expiryDate: string; // ISO date string
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MedicineType = 
  | 'Tablet'
  | 'Capsule'
  | 'Syrup'
  | 'Cream'
  | 'Ointment'
  | 'Drops'
  | 'Sachet'
  | 'Spray'
  | 'Injection'
  | 'Liquid'
  | 'Other';

export type MedicineUnit = 
  | 'tablets'
  | 'capsules'
  | 'sachets'
  | 'bottles'
  | 'tubes'
  | 'packs'
  | 'drops'
  | 'ml'
  | 'pieces'
  | 'other';

export const MEDICINE_TYPES: MedicineType[] = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Cream',
  'Ointment',
  'Drops',
  'Sachet',
  'Spray',
  'Injection',
  'Liquid',
  'Other',
];

export const MEDICINE_UNITS: MedicineUnit[] = [
  'tablets',
  'capsules',
  'sachets',
  'bottles',
  'tubes',
  'packs',
  'drops',
  'ml',
  'pieces',
  'other',
];
