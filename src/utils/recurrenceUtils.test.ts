import { describe, it, expect } from 'vitest';
import {
  expandRecurringChore,
  expandAllChores,
  getFrequencyLabel,
  ExpandedChoreEvent,
} from './recurrenceUtils';
import { Chore, ChoreCompletion } from '../types';

describe('recurrenceUtils', () => {
  const createChore = (overrides: Partial<Chore> = {}): Chore => ({
    id: 'chore-1',
    title: 'Test Chore',
    assigneeId: 'member-1',
    dueDate: '2024-03-15',
    category: 'cleaning',
    completed: false,
    recurrence: null,
    ...overrides,
  });

  describe('expandRecurringChore', () => {
    describe('non-recurring chores', () => {
      it('should return single event for non-recurring chore within range', () => {
        const chore = createChore({ dueDate: '2024-03-15' });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(1);
        expect(events[0]).toMatchObject({
          id: 'chore-1',
          choreId: 'chore-1',
          title: 'Test Chore',
          date: '2024-03-15',
          isRecurring: false,
          completed: false,
        });
      });

      it('should return empty array for non-recurring chore outside range', () => {
        const chore = createChore({ dueDate: '2024-02-15' });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(0);
      });

      it('should include non-recurring chore on range boundary (start)', () => {
        const chore = createChore({ dueDate: '2024-03-01' });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(1);
        expect(events[0].date).toBe('2024-03-01');
      });

      it('should include non-recurring chore on range boundary (end)', () => {
        const chore = createChore({ dueDate: '2024-03-31' });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(1);
        expect(events[0].date).toBe('2024-03-31');
      });

      it('should preserve completion status for non-recurring chores', () => {
        const chore = createChore({ dueDate: '2024-03-15', completed: true });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events[0].completed).toBe(true);
      });
    });

    describe('daily recurring chores', () => {
      it('should expand daily chore correctly', () => {
        const chore = createChore({
          dueDate: '2024-03-01',
          recurrence: { frequency: 'daily' },
        });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-05T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(5);
        expect(events[0].date).toBe('2024-03-01');
        expect(events[1].date).toBe('2024-03-02');
        expect(events[2].date).toBe('2024-03-03');
        expect(events[3].date).toBe('2024-03-04');
        expect(events[4].date).toBe('2024-03-05');
        events.forEach(e => expect(e.isRecurring).toBe(true));
      });

      it('should generate unique IDs for each occurrence', () => {
        const chore = createChore({
          dueDate: '2024-03-01',
          recurrence: { frequency: 'daily' },
        });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-03T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);
        const ids = events.map(e => e.id);
        const uniqueIds = new Set(ids);

        expect(uniqueIds.size).toBe(ids.length);
        expect(events[0].id).toBe('chore-1-0');
        expect(events[1].id).toBe('chore-1-1');
        expect(events[2].id).toBe('chore-1-2');
      });
    });

    describe('weekly recurring chores', () => {
      it('should expand weekly chore correctly', () => {
        const chore = createChore({
          dueDate: '2024-03-01',
          recurrence: { frequency: 'weekly' },
        });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(5);
        expect(events[0].date).toBe('2024-03-01');
        expect(events[1].date).toBe('2024-03-08');
        expect(events[2].date).toBe('2024-03-15');
        expect(events[3].date).toBe('2024-03-22');
        expect(events[4].date).toBe('2024-03-29');
      });
    });

    describe('biweekly recurring chores', () => {
      it('should expand biweekly chore correctly', () => {
        const chore = createChore({
          dueDate: '2024-03-01',
          recurrence: { frequency: 'biweekly' },
        });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(3);
        expect(events[0].date).toBe('2024-03-01');
        expect(events[1].date).toBe('2024-03-15');
        expect(events[2].date).toBe('2024-03-29');
      });
    });

    describe('monthly recurring chores', () => {
      it('should expand monthly chore correctly', () => {
        const chore = createChore({
          dueDate: '2024-01-15',
          recurrence: { frequency: 'monthly' },
        });
        const rangeStart = new Date('2024-01-01T00:00:00');
        const rangeEnd = new Date('2024-04-30T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(4);
        expect(events[0].date).toBe('2024-01-15');
        expect(events[1].date).toBe('2024-02-15');
        expect(events[2].date).toBe('2024-03-15');
        expect(events[3].date).toBe('2024-04-15');
      });
    });

    describe('yearly recurring chores', () => {
      it('should expand yearly chore correctly', () => {
        const chore = createChore({
          dueDate: '2023-03-15',
          recurrence: { frequency: 'yearly' },
        });
        const rangeStart = new Date('2023-01-01T00:00:00');
        const rangeEnd = new Date('2025-12-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(3);
        expect(events[0].date).toBe('2023-03-15');
        expect(events[1].date).toBe('2024-03-15');
        expect(events[2].date).toBe('2025-03-15');
      });
    });

    describe('recurrence end date', () => {
      it('should respect recurrence end date', () => {
        const chore = createChore({
          dueDate: '2024-03-01',
          recurrence: { frequency: 'weekly', endDate: '2024-03-15' },
        });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(3);
        expect(events[0].date).toBe('2024-03-01');
        expect(events[1].date).toBe('2024-03-08');
        expect(events[2].date).toBe('2024-03-15');
      });

      it('should not generate events after end date even if within view range', () => {
        const chore = createChore({
          dueDate: '2024-03-01',
          recurrence: { frequency: 'daily', endDate: '2024-03-05' },
        });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(5);
        expect(events.every(e => e.date <= '2024-03-05')).toBe(true);
      });

      it('should handle end date before range start', () => {
        const chore = createChore({
          dueDate: '2024-02-01',
          recurrence: { frequency: 'daily', endDate: '2024-02-10' },
        });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(0);
      });
    });

    describe('completion tracking', () => {
      it('should mark completed instances correctly', () => {
        const chore = createChore({
          dueDate: '2024-03-01',
          recurrence: { frequency: 'daily' },
        });
        const completions: ChoreCompletion[] = [
          {
            id: 'comp-1',
            choreId: 'chore-1',
            instanceDate: '2024-03-02',
            completedDate: '2024-03-02',
            completedBy: 'member-1',
          },
        ];
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-03T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd, completions);

        expect(events[0].completed).toBe(false); // Mar 1
        expect(events[1].completed).toBe(true);  // Mar 2 - completed
        expect(events[2].completed).toBe(false); // Mar 3
      });

      it('should handle multiple completions', () => {
        const chore = createChore({
          dueDate: '2024-03-01',
          recurrence: { frequency: 'daily' },
        });
        const completions: ChoreCompletion[] = [
          {
            id: 'comp-1',
            choreId: 'chore-1',
            instanceDate: '2024-03-01',
            completedDate: '2024-03-01',
            completedBy: 'member-1',
          },
          {
            id: 'comp-2',
            choreId: 'chore-1',
            instanceDate: '2024-03-03',
            completedDate: '2024-03-03',
            completedBy: 'member-1',
          },
        ];
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-03T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd, completions);

        expect(events[0].completed).toBe(true);  // Mar 1
        expect(events[1].completed).toBe(false); // Mar 2
        expect(events[2].completed).toBe(true);  // Mar 3
      });

      it('should not mark instances from different chores as completed', () => {
        const chore = createChore({
          id: 'chore-1',
          dueDate: '2024-03-01',
          recurrence: { frequency: 'daily' },
        });
        const completions: ChoreCompletion[] = [
          {
            id: 'comp-1',
            choreId: 'chore-2', // Different chore!
            instanceDate: '2024-03-01',
            completedDate: '2024-03-01',
            completedBy: 'member-1',
          },
        ];
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-01T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd, completions);

        expect(events[0].completed).toBe(false);
      });
    });

    describe('range filtering', () => {
      it('should only return events within the date range', () => {
        const chore = createChore({
          dueDate: '2024-02-01',
          recurrence: { frequency: 'weekly' },
        });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-15T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events.every(e => e.date >= '2024-03-01' && e.date <= '2024-03-15')).toBe(true);
      });

      it('should handle chores starting before range', () => {
        const chore = createChore({
          dueDate: '2024-01-01',
          recurrence: { frequency: 'monthly' },
        });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-05-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(3);
        expect(events[0].date).toBe('2024-03-01');
        expect(events[1].date).toBe('2024-04-01');
        expect(events[2].date).toBe('2024-05-01');
      });

      it('should handle empty range (start equals end)', () => {
        const chore = createChore({
          dueDate: '2024-03-15',
          recurrence: null,
        });
        const rangeStart = new Date('2024-03-15T00:00:00');
        const rangeEnd = new Date('2024-03-15T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events).toHaveLength(1);
      });
    });

    describe('event properties', () => {
      it('should include all required properties', () => {
        const chore = createChore({
          id: 'test-chore',
          title: 'Test Title',
          assigneeId: 'assignee-123',
          category: 'maintenance',
          dueDate: '2024-03-15',
        });
        const rangeStart = new Date('2024-03-01T00:00:00');
        const rangeEnd = new Date('2024-03-31T23:59:59');

        const events = expandRecurringChore(chore, rangeStart, rangeEnd);

        expect(events[0]).toMatchObject({
          choreId: 'test-chore',
          title: 'Test Title',
          assigneeId: 'assignee-123',
          category: 'maintenance',
          originalChore: chore,
        });
      });
    });
  });

  describe('expandAllChores', () => {
    it('should expand multiple chores', () => {
      const chores: Chore[] = [
        createChore({ id: 'chore-1', dueDate: '2024-03-15', recurrence: null }),
        createChore({ id: 'chore-2', dueDate: '2024-03-01', recurrence: { frequency: 'weekly' } }),
      ];
      const rangeStart = new Date('2024-03-01T00:00:00');
      const rangeEnd = new Date('2024-03-31T23:59:59');

      const events = expandAllChores(chores, rangeStart, rangeEnd);

      const chore1Events = events.filter(e => e.choreId === 'chore-1');
      const chore2Events = events.filter(e => e.choreId === 'chore-2');

      expect(chore1Events).toHaveLength(1);
      expect(chore2Events).toHaveLength(5);
    });

    it('should handle empty chores array', () => {
      const rangeStart = new Date('2024-03-01T00:00:00');
      const rangeEnd = new Date('2024-03-31T23:59:59');

      const events = expandAllChores([], rangeStart, rangeEnd);

      expect(events).toHaveLength(0);
    });

    it('should pass completions to individual expansions', () => {
      const chores: Chore[] = [
        createChore({ id: 'chore-1', dueDate: '2024-03-01', recurrence: { frequency: 'daily' } }),
      ];
      const completions: ChoreCompletion[] = [
        {
          id: 'comp-1',
          choreId: 'chore-1',
          instanceDate: '2024-03-01',
          completedDate: '2024-03-01',
          completedBy: 'member-1',
        },
      ];
      const rangeStart = new Date('2024-03-01T00:00:00');
      const rangeEnd = new Date('2024-03-02T23:59:59');

      const events = expandAllChores(chores, rangeStart, rangeEnd, completions);

      expect(events[0].completed).toBe(true);
      expect(events[1].completed).toBe(false);
    });

    it('should handle completions for different chores', () => {
      const chores: Chore[] = [
        createChore({ id: 'chore-1', dueDate: '2024-03-15' }),
        createChore({ id: 'chore-2', dueDate: '2024-03-15', completed: true }),
      ];
      const rangeStart = new Date('2024-03-01T00:00:00');
      const rangeEnd = new Date('2024-03-31T23:59:59');

      const events = expandAllChores(chores, rangeStart, rangeEnd);

      const chore1Event = events.find(e => e.choreId === 'chore-1');
      const chore2Event = events.find(e => e.choreId === 'chore-2');

      expect(chore1Event?.completed).toBe(false);
      expect(chore2Event?.completed).toBe(true);
    });
  });

  describe('getFrequencyLabel', () => {
    it('should return correct labels for all frequencies', () => {
      expect(getFrequencyLabel('daily')).toBe('Daily');
      expect(getFrequencyLabel('weekly')).toBe('Weekly');
      expect(getFrequencyLabel('biweekly')).toBe('Every 2 weeks');
      expect(getFrequencyLabel('monthly')).toBe('Monthly');
      expect(getFrequencyLabel('yearly')).toBe('Yearly');
    });
  });
});
