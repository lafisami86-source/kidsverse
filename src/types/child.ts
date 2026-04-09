// Child Profile Types

export type AgeGroup = 'toddler' | 'early' | 'kid';

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  ageGroup: string;
  screenTimeLimit: number;
  contentFilter: string;
  parentId: string;
  createdAt: Date;
  updatedAt: Date;
}
