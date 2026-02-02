import { createContext, useContext, useCallback, ReactNode } from 'react';
import { Chore, ChoreCompletion } from '../types';
import { useHouseholdContext } from './HouseholdContext';
import { formatDate } from '../utils/dateUtils';

interface ChoreContextValue {
  chores: Chore[];
  completions: ChoreCompletion[];
  addChore: (chore: Omit<Chore, 'id'>) => Chore;
  updateChore: (chore: Chore) => void;
  deleteChore: (id: string) => void;
  completeChore: (id: string, completed: boolean) => void;
  completeInstance: (choreId: string, instanceDate: string, completedBy: string, completed: boolean) => void;
  isInstanceCompleted: (choreId: string, instanceDate: string) => boolean;
  getChoreById: (id: string) => Chore | undefined;
  getChoresByAssignee: (assigneeId: string) => Chore[];
  getChoresByCategory: (category: Chore['category']) => Chore[];
}

const ChoreContext = createContext<ChoreContextValue | null>(null);

export function ChoreProvider({ children }: { children: ReactNode }) {
  const { chores, completions, setChores, setCompletions } = useHouseholdContext();

  const addChore = useCallback((choreData: Omit<Chore, 'id'>): Chore => {
    const newChore: Chore = {
      ...choreData,
      id: crypto.randomUUID(),
    };
    setChores(prev => [...prev, newChore]);
    return newChore;
  }, [setChores]);

  const updateChore = useCallback((chore: Chore) => {
    setChores(prev => prev.map(c => c.id === chore.id ? chore : c));
  }, [setChores]);

  const deleteChore = useCallback((id: string) => {
    setChores(prev => prev.filter(c => c.id !== id));
    setCompletions(prev => prev.filter(c => c.choreId !== id));
  }, [setChores, setCompletions]);

  const completeChore = useCallback((id: string, completed: boolean) => {
    setChores(prev => prev.map(c =>
      c.id === id
        ? {
            ...c,
            completed,
            completedDate: completed ? formatDate(new Date()) : undefined,
          }
        : c
    ));
  }, [setChores]);

  const completeInstance = useCallback((choreId: string, instanceDate: string, completedBy: string, completed: boolean) => {
    if (completed) {
      const completion: ChoreCompletion = {
        id: crypto.randomUUID(),
        choreId,
        instanceDate,
        completedDate: formatDate(new Date()),
        completedBy,
      };
      setCompletions(prev => [...prev, completion]);
    } else {
      setCompletions(prev => prev.filter(
        c => !(c.choreId === choreId && c.instanceDate === instanceDate)
      ));
    }
  }, [setCompletions]);

  const isInstanceCompleted = useCallback((choreId: string, instanceDate: string): boolean => {
    return completions.some(c => c.choreId === choreId && c.instanceDate === instanceDate);
  }, [completions]);

  const getChoreById = useCallback((id: string) => {
    return chores.find(c => c.id === id);
  }, [chores]);

  const getChoresByAssignee = useCallback((assigneeId: string) => {
    return chores.filter(c => c.assigneeId === assigneeId);
  }, [chores]);

  const getChoresByCategory = useCallback((category: Chore['category']) => {
    return chores.filter(c => c.category === category);
  }, [chores]);

  return (
    <ChoreContext.Provider
      value={{
        chores,
        completions,
        addChore,
        updateChore,
        deleteChore,
        completeChore,
        completeInstance,
        isInstanceCompleted,
        getChoreById,
        getChoresByAssignee,
        getChoresByCategory,
      }}
    >
      {children}
    </ChoreContext.Provider>
  );
}

export function useChoreContext() {
  const context = useContext(ChoreContext);
  if (!context) {
    throw new Error('useChoreContext must be used within a ChoreProvider');
  }
  return context;
}
