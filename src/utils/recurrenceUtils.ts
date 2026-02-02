import { Chore, RecurrencePattern, ChoreCompletion } from '../types';
import { parseDate, formatDate, addDays, addWeeks, addMonths, addYears } from './dateUtils';

export interface ExpandedChoreEvent {
  id: string;
  choreId: string;
  title: string;
  date: string;
  assigneeId: string;
  category: Chore['category'];
  completed: boolean;
  isRecurring: boolean;
  originalChore: Chore;
}

function getNextDate(date: Date, frequency: RecurrencePattern['frequency']): Date {
  switch (frequency) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addWeeks(date, 1);
    case 'biweekly':
      return addWeeks(date, 2);
    case 'monthly':
      return addMonths(date, 1);
    case 'yearly':
      return addYears(date, 1);
  }
}

function isInstanceCompletedCheck(
  choreId: string,
  instanceDate: string,
  completions: ChoreCompletion[]
): boolean {
  return completions.some(c => c.choreId === choreId && c.instanceDate === instanceDate);
}

export function expandRecurringChore(
  chore: Chore,
  rangeStart: Date,
  rangeEnd: Date,
  completions: ChoreCompletion[] = []
): ExpandedChoreEvent[] {
  const events: ExpandedChoreEvent[] = [];
  const startDate = parseDate(chore.dueDate);

  if (!chore.recurrence) {
    if (startDate >= rangeStart && startDate <= rangeEnd) {
      events.push({
        id: chore.id,
        choreId: chore.id,
        title: chore.title,
        date: chore.dueDate,
        assigneeId: chore.assigneeId,
        category: chore.category,
        completed: chore.completed,
        isRecurring: false,
        originalChore: chore,
      });
    }
    return events;
  }

  const endDate = chore.recurrence.endDate
    ? parseDate(chore.recurrence.endDate)
    : rangeEnd;

  let currentDate = startDate;
  let occurrenceIndex = 0;

  while (currentDate <= rangeEnd && currentDate <= endDate) {
    if (currentDate >= rangeStart) {
      const instanceDate = formatDate(currentDate);
      const isCompleted = isInstanceCompletedCheck(chore.id, instanceDate, completions);
      events.push({
        id: `${chore.id}-${occurrenceIndex}`,
        choreId: chore.id,
        title: chore.title,
        date: instanceDate,
        assigneeId: chore.assigneeId,
        category: chore.category,
        completed: isCompleted,
        isRecurring: true,
        originalChore: chore,
      });
    }
    currentDate = getNextDate(currentDate, chore.recurrence.frequency);
    occurrenceIndex++;
  }

  return events;
}

export function expandAllChores(
  chores: Chore[],
  rangeStart: Date,
  rangeEnd: Date,
  completions: ChoreCompletion[] = []
): ExpandedChoreEvent[] {
  return chores.flatMap(chore => expandRecurringChore(chore, rangeStart, rangeEnd, completions));
}

export function getFrequencyLabel(frequency: RecurrencePattern['frequency']): string {
  const labels: Record<RecurrencePattern['frequency'], string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Every 2 weeks',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };
  return labels[frequency];
}
