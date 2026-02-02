import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  HouseholdData,
  createHousehold,
  joinHousehold,
  subscribeToHousehold,
  updateMembers,
  updateChores,
  updateCompletions,
} from '../services/householdService';
import { HouseholdMember, Chore, ChoreCompletion } from '../types';

interface HouseholdContextValue {
  // State
  householdId: string | null;
  householdCode: string | null;
  isLoading: boolean;
  error: string | null;

  // Data
  members: HouseholdMember[];
  chores: Chore[];
  completions: ChoreCompletion[];

  // Actions
  createNewHousehold: (firstMember: Omit<HouseholdMember, 'id'>) => Promise<HouseholdMember>;
  joinExistingHousehold: (code: string) => Promise<boolean>;
  leaveHousehold: () => void;

  // Data mutations
  setMembers: (members: HouseholdMember[]) => Promise<void>;
  setChores: (chores: Chore[] | ((prev: Chore[]) => Chore[])) => Promise<void>;
  setCompletions: (completions: ChoreCompletion[] | ((prev: ChoreCompletion[]) => ChoreCompletion[])) => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextValue | null>(null);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  console.log('HouseholdProvider rendering...');
  const [storedHouseholdId, setStoredHouseholdId] = useLocalStorage<string | null>('household-id', null);
  const [householdData, setHouseholdData] = useState<HouseholdData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs to track latest data for use in callbacks (avoids stale closure)
  const latestChoresRef = useRef<Chore[]>([]);
  const latestCompletionsRef = useRef<ChoreCompletion[]>([]);

  console.log('HouseholdProvider state:', { storedHouseholdId, isLoading, error });

  // Subscribe to household updates when we have an ID
  useEffect(() => {
    console.log('useEffect: storedHouseholdId =', storedHouseholdId);

    if (!storedHouseholdId) {
      setIsLoading(false);
      setHouseholdData(null);
      return;
    }

    setError(null);

    // Subscribe to real-time updates directly
    console.log('useEffect: subscribing to household', storedHouseholdId);
    const unsubscribe = subscribeToHousehold(
      storedHouseholdId,
      (data) => {
        console.log('subscription: got data', data);
        setHouseholdData(data);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('subscription: error', err);
        // Don't clear - let the user stay on whatever screen they're on
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [storedHouseholdId, setStoredHouseholdId]);

  // Keep refs in sync with householdData for use in callbacks
  useEffect(() => {
    latestChoresRef.current = householdData?.chores || [];
    latestCompletionsRef.current = householdData?.completions || [];
  }, [householdData?.chores, householdData?.completions]);

  const createNewHousehold = useCallback(async (firstMember: Omit<HouseholdMember, 'id'>): Promise<HouseholdMember> => {
    console.log('createNewHousehold: starting');
    setIsLoading(true);
    setError(null);

    try {
      const result = await createHousehold(firstMember);
      console.log('createNewHousehold: created', result);
      setStoredHouseholdId(result.householdId);
      // Set the household data immediately so we don't have to wait for subscription
      setHouseholdData({
        id: result.householdId,
        code: result.code,
        createdAt: new Date(),
        members: [result.member],
        chores: [],
        completions: [],
      });
      setIsLoading(false);
      console.log('createNewHousehold: done, returning member');
      return result.member;
    } catch (err) {
      console.error('createNewHousehold: error', err);
      setError(err instanceof Error ? err.message : 'Failed to create household');
      setIsLoading(false);
      throw err;
    }
  }, [setStoredHouseholdId]);

  const joinExistingHousehold = useCallback(async (code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await joinHousehold(code);
      if (!result) {
        setError('Invalid household code');
        setIsLoading(false);
        return false;
      }

      setStoredHouseholdId(result.householdId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join household');
      setIsLoading(false);
      return false;
    }
  }, [setStoredHouseholdId]);

  const leaveHousehold = useCallback(() => {
    setStoredHouseholdId(null);
    setHouseholdData(null);
  }, [setStoredHouseholdId]);

  const setMembers = useCallback(async (members: HouseholdMember[]) => {
    if (!storedHouseholdId) return;
    try {
      await updateMembers(storedHouseholdId, members);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update members');
    }
  }, [storedHouseholdId]);

  const setChores = useCallback(async (choresOrUpdater: Chore[] | ((prev: Chore[]) => Chore[])) => {
    if (!storedHouseholdId) return;
    // Use ref for latest value to avoid stale closure
    const currentChores = latestChoresRef.current;
    const newChores = typeof choresOrUpdater === 'function'
      ? choresOrUpdater(currentChores)
      : choresOrUpdater;
    try {
      await updateChores(storedHouseholdId, newChores);
      // Update ref immediately for subsequent rapid calls
      latestChoresRef.current = newChores;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chores');
    }
  }, [storedHouseholdId]);

  const setCompletions = useCallback(async (completionsOrUpdater: ChoreCompletion[] | ((prev: ChoreCompletion[]) => ChoreCompletion[])) => {
    if (!storedHouseholdId) return;
    // Use ref for latest value to avoid stale closure
    const currentCompletions = latestCompletionsRef.current;
    const newCompletions = typeof completionsOrUpdater === 'function'
      ? completionsOrUpdater(currentCompletions)
      : completionsOrUpdater;
    try {
      await updateCompletions(storedHouseholdId, newCompletions);
      // Update ref immediately for subsequent rapid calls
      latestCompletionsRef.current = newCompletions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update completions');
    }
  }, [storedHouseholdId]);

  return (
    <HouseholdContext.Provider
      value={{
        householdId: storedHouseholdId,
        householdCode: householdData?.code || null,
        isLoading,
        error,
        members: householdData?.members || [],
        chores: householdData?.chores || [],
        completions: householdData?.completions || [],
        createNewHousehold,
        joinExistingHousehold,
        leaveHousehold,
        setMembers,
        setChores,
        setCompletions,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHouseholdContext() {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHouseholdContext must be used within a HouseholdProvider');
  }
  return context;
}
