import { createContext, useContext, useCallback, ReactNode } from 'react';
import { HouseholdMember } from '../types';
import { useHouseholdContext } from './HouseholdContext';

interface MemberContextValue {
  members: HouseholdMember[];
  addMember: (member: Omit<HouseholdMember, 'id'>) => HouseholdMember;
  updateMember: (member: HouseholdMember) => void;
  deleteMember: (id: string) => void;
  getMemberById: (id: string) => HouseholdMember | undefined;
}

const MemberContext = createContext<MemberContextValue | null>(null);

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
];

export function MemberProvider({ children }: { children: ReactNode }) {
  const { members, setMembers } = useHouseholdContext();

  const addMember = useCallback((memberData: Omit<HouseholdMember, 'id'>): HouseholdMember => {
    const newMember: HouseholdMember = {
      ...memberData,
      id: crypto.randomUUID(),
    };
    setMembers([...members, newMember]);
    return newMember;
  }, [members, setMembers]);

  const updateMember = useCallback((member: HouseholdMember) => {
    setMembers(members.map(m => m.id === member.id ? member : m));
  }, [members, setMembers]);

  const deleteMember = useCallback((id: string) => {
    setMembers(members.filter(m => m.id !== id));
  }, [members, setMembers]);

  const getMemberById = useCallback((id: string) => {
    return members.find(m => m.id === id);
  }, [members]);

  return (
    <MemberContext.Provider
      value={{
        members,
        addMember,
        updateMember,
        deleteMember,
        getMemberById,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
}

export function useMemberContext() {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMemberContext must be used within a MemberProvider');
  }
  return context;
}

export { DEFAULT_COLORS };
