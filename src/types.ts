export interface HouseholdMember {
  id: string;
  name: string;
  color: string;
  isAdmin: boolean;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  endDate?: string;
}

export interface Chore {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  dueDate: string;
  recurrence: RecurrencePattern | null;
  completed: boolean;
  completedDate?: string;
  category: 'cleaning' | 'maintenance' | 'outdoor' | 'kitchen' | 'other';
}

export interface ChoreCompletion {
  id: string;
  choreId: string;
  instanceDate: string;    // Which occurrence (e.g., "2024-02-15")
  completedDate: string;   // When it was completed
  completedBy: string;     // Member ID who completed it
}

export type ChoreCategory = Chore['category'];
export type RecurrenceFrequency = RecurrencePattern['frequency'];
