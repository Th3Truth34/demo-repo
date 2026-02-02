import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock crypto.randomUUID for consistent test IDs
let uuidCounter = 0;
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${++uuidCounter}`,
});

// Reset UUID counter before each test
beforeEach(() => {
  uuidCounter = 0;
});

// Mock Firebase
vi.mock('../config/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(),
}));
