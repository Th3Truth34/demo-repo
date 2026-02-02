import { createContext, useContext, ReactNode } from 'react';
import { HouseholdMember } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMemberContext } from './MemberContext';

interface AuthContextValue {
  currentUser: HouseholdMember | null;
  setCurrentUser: (userId: string | null) => void;
  isAdmin: boolean;
  canEditChore: (choreAssigneeId: string) => boolean;
  canDeleteChore: (choreAssigneeId: string) => boolean;
  canManageMembers: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('current-user-id', null);
  const { getMemberById } = useMemberContext();

  const currentUser = currentUserId ? getMemberById(currentUserId) || null : null;
  const isAdmin = currentUser?.isAdmin ?? false;

  const canEditChore = (choreAssigneeId: string): boolean => {
    if (!currentUser) return false;
    return isAdmin || choreAssigneeId === currentUser.id;
  };

  const canDeleteChore = (choreAssigneeId: string): boolean => {
    if (!currentUser) return false;
    return isAdmin || choreAssigneeId === currentUser.id;
  };

  const canManageMembers = isAdmin;

  const setCurrentUser = (userId: string | null) => {
    setCurrentUserId(userId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAdmin,
        canEditChore,
        canDeleteChore,
        canManageMembers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
