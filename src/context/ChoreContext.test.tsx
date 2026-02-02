import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { ChoreProvider, useChoreContext } from './ChoreContext';
import { useHouseholdContext } from './HouseholdContext';
import { Chore, ChoreCompletion } from '../types';

vi.mock('./HouseholdContext', () => ({
  useHouseholdContext: vi.fn(),
}));

describe('ChoreContext', () => {
  let mockSetChores: Mock;
  let mockSetCompletions: Mock;
  let currentChores: Chore[];
  let currentCompletions: ChoreCompletion[];

  beforeEach(() => {
    vi.clearAllMocks();
    currentChores = [];
    currentCompletions = [];

    mockSetChores = vi.fn().mockImplementation((choresOrUpdater) => {
      if (typeof choresOrUpdater === 'function') {
        currentChores = choresOrUpdater(currentChores);
      } else {
        currentChores = choresOrUpdater;
      }
      return Promise.resolve();
    });

    mockSetCompletions = vi.fn().mockImplementation((completionsOrUpdater) => {
      if (typeof completionsOrUpdater === 'function') {
        currentCompletions = completionsOrUpdater(currentCompletions);
      } else {
        currentCompletions = completionsOrUpdater;
      }
      return Promise.resolve();
    });

    (useHouseholdContext as Mock).mockImplementation(() => ({
      chores: currentChores,
      completions: currentCompletions,
      setChores: mockSetChores,
      setCompletions: mockSetCompletions,
    }));
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ChoreProvider>{children}</ChoreProvider>
  );

  describe('addChore', () => {
    it('should add a new chore with generated ID', () => {
      const { result } = renderHook(() => useChoreContext(), { wrapper });

      const choreData = {
        title: 'New Chore',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning' as const,
        completed: false,
        recurrence: null,
      };

      act(() => {
        result.current.addChore(choreData);
      });

      expect(mockSetChores).toHaveBeenCalledTimes(1);
      expect(currentChores).toHaveLength(1);
      expect(currentChores[0].title).toBe('New Chore');
      expect(currentChores[0].id).toBeDefined();
    });

    it('should return the created chore', () => {
      const { result } = renderHook(() => useChoreContext(), { wrapper });

      const choreData = {
        title: 'Test Chore',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning' as const,
        completed: false,
        recurrence: null,
      };

      let createdChore: Chore | undefined;
      act(() => {
        createdChore = result.current.addChore(choreData);
      });

      expect(createdChore).toBeDefined();
      expect(createdChore?.title).toBe('Test Chore');
      expect(createdChore?.id).toBeDefined();
    });

    it('should append to existing chores without overwriting', () => {
      const existingChore: Chore = {
        id: 'existing-1',
        title: 'Existing Chore',
        assigneeId: 'member-1',
        dueDate: '2024-03-10',
        category: 'cleaning',
        completed: false,
        recurrence: null,
      };

      currentChores = [existingChore];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      const choreData = {
        title: 'New Chore',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning' as const,
        completed: false,
        recurrence: null,
      };

      act(() => {
        result.current.addChore(choreData);
      });

      expect(currentChores).toHaveLength(2);
      expect(currentChores[0].id).toBe('existing-1');
      expect(currentChores[1].title).toBe('New Chore');
    });

    it('should include all provided fields', () => {
      const { result } = renderHook(() => useChoreContext(), { wrapper });

      const choreData = {
        title: 'Full Chore',
        description: 'A description',
        assigneeId: 'member-2',
        dueDate: '2024-04-01',
        category: 'maintenance' as const,
        completed: false,
        recurrence: { frequency: 'weekly' as const },
      };

      act(() => {
        result.current.addChore(choreData);
      });

      expect(currentChores[0]).toMatchObject({
        title: 'Full Chore',
        description: 'A description',
        assigneeId: 'member-2',
        dueDate: '2024-04-01',
        category: 'maintenance',
        recurrence: { frequency: 'weekly' },
      });
    });
  });

  describe('updateChore', () => {
    it('should update an existing chore', () => {
      const existingChore: Chore = {
        id: 'chore-1',
        title: 'Original Title',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        completed: false,
        recurrence: null,
      };

      currentChores = [existingChore];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      const updatedChore: Chore = {
        ...existingChore,
        title: 'Updated Title',
      };

      act(() => {
        result.current.updateChore(updatedChore);
      });

      expect(currentChores[0].title).toBe('Updated Title');
    });

    it('should not affect other chores', () => {
      const chore1: Chore = {
        id: 'chore-1',
        title: 'Chore 1',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        completed: false,
        recurrence: null,
      };
      const chore2: Chore = {
        id: 'chore-2',
        title: 'Chore 2',
        assigneeId: 'member-1',
        dueDate: '2024-03-16',
        category: 'outdoor',
        completed: false,
        recurrence: null,
      };

      currentChores = [chore1, chore2];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      act(() => {
        result.current.updateChore({ ...chore1, title: 'Updated' });
      });

      expect(currentChores).toHaveLength(2);
      expect(currentChores[0].title).toBe('Updated');
      expect(currentChores[1].title).toBe('Chore 2');
    });

    it('should preserve all other fields when updating', () => {
      const existingChore: Chore = {
        id: 'chore-1',
        title: 'Original',
        description: 'Description',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        completed: false,
        recurrence: { frequency: 'weekly' },
      };

      currentChores = [existingChore];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      act(() => {
        result.current.updateChore({ ...existingChore, title: 'Updated' });
      });

      expect(currentChores[0]).toMatchObject({
        id: 'chore-1',
        description: 'Description',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        recurrence: { frequency: 'weekly' },
      });
    });
  });

  describe('deleteChore', () => {
    it('should remove a chore by ID', () => {
      const chore: Chore = {
        id: 'chore-to-delete',
        title: 'Delete Me',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        completed: false,
        recurrence: null,
      };

      currentChores = [chore];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      act(() => {
        result.current.deleteChore('chore-to-delete');
      });

      expect(currentChores).toHaveLength(0);
    });

    it('should also remove associated completions', () => {
      const chore: Chore = {
        id: 'chore-1',
        title: 'Chore',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        completed: false,
        recurrence: null,
      };
      const completion: ChoreCompletion = {
        id: 'comp-1',
        choreId: 'chore-1',
        instanceDate: '2024-03-15',
        completedDate: '2024-03-15',
        completedBy: 'member-1',
      };

      currentChores = [chore];
      currentCompletions = [completion];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      act(() => {
        result.current.deleteChore('chore-1');
      });

      expect(mockSetCompletions).toHaveBeenCalled();
      expect(currentCompletions).toHaveLength(0);
    });

    it('should not remove completions for other chores', () => {
      const chore1: Chore = {
        id: 'chore-1',
        title: 'Chore 1',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        completed: false,
        recurrence: null,
      };
      const chore2: Chore = {
        id: 'chore-2',
        title: 'Chore 2',
        assigneeId: 'member-1',
        dueDate: '2024-03-16',
        category: 'cleaning',
        completed: false,
        recurrence: null,
      };
      const completion1: ChoreCompletion = {
        id: 'comp-1',
        choreId: 'chore-1',
        instanceDate: '2024-03-15',
        completedDate: '2024-03-15',
        completedBy: 'member-1',
      };
      const completion2: ChoreCompletion = {
        id: 'comp-2',
        choreId: 'chore-2',
        instanceDate: '2024-03-16',
        completedDate: '2024-03-16',
        completedBy: 'member-1',
      };

      currentChores = [chore1, chore2];
      currentCompletions = [completion1, completion2];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      act(() => {
        result.current.deleteChore('chore-1');
      });

      expect(currentCompletions).toHaveLength(1);
      expect(currentCompletions[0].choreId).toBe('chore-2');
    });
  });

  describe('completeChore', () => {
    it('should mark a chore as completed', () => {
      const chore: Chore = {
        id: 'chore-1',
        title: 'Chore',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        completed: false,
        recurrence: null,
      };

      currentChores = [chore];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      act(() => {
        result.current.completeChore('chore-1', true);
      });

      expect(currentChores[0].completed).toBe(true);
      expect(currentChores[0].completedDate).toBeDefined();
    });

    it('should unmark a chore as completed', () => {
      const chore: Chore = {
        id: 'chore-1',
        title: 'Chore',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        completed: true,
        completedDate: '2024-03-15',
        recurrence: null,
      };

      currentChores = [chore];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      act(() => {
        result.current.completeChore('chore-1', false);
      });

      expect(currentChores[0].completed).toBe(false);
      expect(currentChores[0].completedDate).toBeUndefined();
    });
  });

  describe('completeInstance', () => {
    it('should add a completion record when completing an instance', () => {
      const chore: Chore = {
        id: 'chore-1',
        title: 'Chore',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        completed: false,
        recurrence: { frequency: 'daily' },
      };

      currentChores = [chore];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      act(() => {
        result.current.completeInstance('chore-1', '2024-03-15', 'member-1', true);
      });

      expect(mockSetCompletions).toHaveBeenCalled();
      expect(currentCompletions).toHaveLength(1);
      expect(currentCompletions[0]).toMatchObject({
        choreId: 'chore-1',
        instanceDate: '2024-03-15',
        completedBy: 'member-1',
      });
    });

    it('should remove a completion record when uncompleting an instance', () => {
      const completion: ChoreCompletion = {
        id: 'comp-1',
        choreId: 'chore-1',
        instanceDate: '2024-03-15',
        completedDate: '2024-03-15',
        completedBy: 'member-1',
      };

      currentCompletions = [completion];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      act(() => {
        result.current.completeInstance('chore-1', '2024-03-15', 'member-1', false);
      });

      expect(currentCompletions).toHaveLength(0);
    });
  });

  describe('isInstanceCompleted', () => {
    it('should return true for completed instances', () => {
      const completion: ChoreCompletion = {
        id: 'comp-1',
        choreId: 'chore-1',
        instanceDate: '2024-03-15',
        completedDate: '2024-03-15',
        completedBy: 'member-1',
      };

      currentCompletions = [completion];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      expect(result.current.isInstanceCompleted('chore-1', '2024-03-15')).toBe(true);
    });

    it('should return false for uncompleted instances', () => {
      currentCompletions = [];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      expect(result.current.isInstanceCompleted('chore-1', '2024-03-15')).toBe(false);
    });
  });

  describe('getChoreById', () => {
    it('should return chore by ID', () => {
      const chore: Chore = {
        id: 'chore-1',
        title: 'Test Chore',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        completed: false,
        recurrence: null,
      };

      currentChores = [chore];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      expect(result.current.getChoreById('chore-1')).toEqual(chore);
    });

    it('should return undefined for non-existent ID', () => {
      currentChores = [];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      expect(result.current.getChoreById('non-existent')).toBeUndefined();
    });
  });

  describe('getChoresByAssignee', () => {
    it('should return chores for a specific assignee', () => {
      const chore1: Chore = {
        id: 'chore-1',
        title: 'Chore 1',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        completed: false,
        recurrence: null,
      };
      const chore2: Chore = {
        id: 'chore-2',
        title: 'Chore 2',
        assigneeId: 'member-2',
        dueDate: '2024-03-16',
        category: 'cleaning',
        completed: false,
        recurrence: null,
      };

      currentChores = [chore1, chore2];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      const assigneeChores = result.current.getChoresByAssignee('member-1');
      expect(assigneeChores).toHaveLength(1);
      expect(assigneeChores[0].id).toBe('chore-1');
    });
  });

  describe('getChoresByCategory', () => {
    it('should return chores for a specific category', () => {
      const chore1: Chore = {
        id: 'chore-1',
        title: 'Chore 1',
        assigneeId: 'member-1',
        dueDate: '2024-03-15',
        category: 'cleaning',
        completed: false,
        recurrence: null,
      };
      const chore2: Chore = {
        id: 'chore-2',
        title: 'Chore 2',
        assigneeId: 'member-1',
        dueDate: '2024-03-16',
        category: 'outdoor',
        completed: false,
        recurrence: null,
      };

      currentChores = [chore1, chore2];

      const { result } = renderHook(() => useChoreContext(), { wrapper });

      const cleaningChores = result.current.getChoresByCategory('cleaning');
      expect(cleaningChores).toHaveLength(1);
      expect(cleaningChores[0].id).toBe('chore-1');
    });
  });
});
