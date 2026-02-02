import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { HouseholdMember, Chore, ChoreCompletion } from '../types';

export interface HouseholdData {
  id: string;
  code: string;
  createdAt: Date;
  members: HouseholdMember[];
  chores: Chore[];
  completions: ChoreCompletion[];
}

const ADJECTIVES = [
  'SUNNY', 'HAPPY', 'COZY', 'BRIGHT', 'CALM', 'FRESH', 'WARM', 'COOL',
  'SWIFT', 'BOLD', 'KIND', 'NEAT', 'TIDY', 'BUSY', 'JOLLY', 'MERRY'
];

const NOUNS = [
  'KITCHEN', 'GARDEN', 'HOUSE', 'HOME', 'NEST', 'DEN', 'HAVEN', 'CABIN',
  'COTTAGE', 'LODGE', 'MANOR', 'VILLA', 'SUITE', 'SPACE', 'PLACE', 'ZONE'
];

export function generateHouseholdCode(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${adjective}-${noun}-${number}`;
}

export async function createHousehold(firstMember: Omit<HouseholdMember, 'id'>): Promise<{ householdId: string; code: string; member: HouseholdMember }> {
  const code = generateHouseholdCode();
  const householdId = crypto.randomUUID();
  const memberId = crypto.randomUUID();

  const member: HouseholdMember = {
    ...firstMember,
    id: memberId,
    isAdmin: true,
  };

  const householdRef = doc(db, 'households', householdId);
  await setDoc(householdRef, {
    code,
    createdAt: serverTimestamp(),
    members: [member],
    chores: [],
    completions: [],
  });

  return { householdId, code, member };
}

export async function joinHousehold(code: string): Promise<{ householdId: string; data: HouseholdData } | null> {
  const normalizedCode = code.toUpperCase().trim();
  const householdsRef = collection(db, 'households');
  const q = query(householdsRef, where('code', '==', normalizedCode));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();

  return {
    householdId: docSnap.id,
    data: {
      id: docSnap.id,
      code: data.code,
      createdAt: data.createdAt?.toDate() || new Date(),
      members: data.members || [],
      chores: data.chores || [],
      completions: data.completions || [],
    },
  };
}

export async function getHousehold(householdId: string): Promise<HouseholdData | null> {
  const householdRef = doc(db, 'households', householdId);
  const snapshot = await getDoc(householdRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    code: data.code,
    createdAt: data.createdAt?.toDate() || new Date(),
    members: data.members || [],
    chores: data.chores || [],
    completions: data.completions || [],
  };
}

export function subscribeToHousehold(
  householdId: string,
  onData: (data: HouseholdData) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const householdRef = doc(db, 'households', householdId);
  let notFoundCount = 0;

  return onSnapshot(
    householdRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        // Give newly created documents a chance to sync
        notFoundCount++;
        if (notFoundCount > 3) {
          onError(new Error('Household not found'));
        }
        return;
      }

      // Reset counter when document is found
      notFoundCount = 0;
      const data = snapshot.data();
      onData({
        id: snapshot.id,
        code: data.code,
        createdAt: data.createdAt?.toDate() || new Date(),
        members: data.members || [],
        chores: data.chores || [],
        completions: data.completions || [],
      });
    },
    (error) => {
      onError(error);
    }
  );
}

export async function updateMembers(householdId: string, members: HouseholdMember[]): Promise<void> {
  const householdRef = doc(db, 'households', householdId);
  await updateDoc(householdRef, { members });
}

export async function updateChores(householdId: string, chores: Chore[]): Promise<void> {
  const householdRef = doc(db, 'households', householdId);
  await updateDoc(householdRef, { chores });
}

export async function updateCompletions(householdId: string, completions: ChoreCompletion[]): Promise<void> {
  const householdRef = doc(db, 'households', householdId);
  await updateDoc(householdRef, { completions });
}

export async function regenerateHouseholdCode(householdId: string): Promise<string> {
  const newCode = generateHouseholdCode();
  const householdRef = doc(db, 'households', householdId);
  await updateDoc(householdRef, { code: newCode });
  return newCode;
}
