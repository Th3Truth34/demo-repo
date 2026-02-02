import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatDate,
  parseDate,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isToday,
  isPast,
  isFuture,
  getStartOfWeek,
  getEndOfWeek,
  formatDisplayDate,
} from './dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD string', () => {
      const date = new Date('2024-03-15T12:00:00Z');
      expect(formatDate(date)).toBe('2024-03-15');
    });

    it('should handle dates at midnight UTC', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      expect(formatDate(date)).toBe('2024-01-01');
    });

    it('should handle end of year dates', () => {
      const date = new Date('2024-12-31T23:59:59Z');
      expect(formatDate(date)).toBe('2024-12-31');
    });
  });

  describe('parseDate', () => {
    it('should parse YYYY-MM-DD string to Date at midnight local time', () => {
      const result = parseDate('2024-03-15');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2); // March is 2 (0-indexed)
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });

    it('should parse first day of year', () => {
      const result = parseDate('2024-01-01');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(1);
    });

    it('should parse last day of year', () => {
      const result = parseDate('2024-12-31');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(31);
    });
  });

  describe('addDays', () => {
    it('should add positive days', () => {
      const date = new Date('2024-03-15T12:00:00');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
      expect(result.getMonth()).toBe(2);
    });

    it('should handle month overflow', () => {
      const date = new Date('2024-03-30T12:00:00');
      const result = addDays(date, 5);
      expect(result.getMonth()).toBe(3); // April
      expect(result.getDate()).toBe(4);
    });

    it('should handle negative days', () => {
      const date = new Date('2024-03-15T12:00:00');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });

    it('should not mutate original date', () => {
      const date = new Date('2024-03-15T12:00:00');
      const originalTime = date.getTime();
      addDays(date, 5);
      expect(date.getTime()).toBe(originalTime);
    });

    it('should handle year overflow', () => {
      const date = new Date('2024-12-30T12:00:00');
      const result = addDays(date, 5);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January
    });
  });

  describe('addWeeks', () => {
    it('should add weeks correctly', () => {
      const date = new Date('2024-03-01T12:00:00');
      const result = addWeeks(date, 2);
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(2);
    });

    it('should handle single week', () => {
      const date = new Date('2024-03-01T12:00:00');
      const result = addWeeks(date, 1);
      expect(result.getDate()).toBe(8);
    });

    it('should not mutate original date', () => {
      const date = new Date('2024-03-01T12:00:00');
      const originalTime = date.getTime();
      addWeeks(date, 2);
      expect(date.getTime()).toBe(originalTime);
    });
  });

  describe('addMonths', () => {
    it('should add months correctly', () => {
      const date = new Date('2024-01-15T12:00:00');
      const result = addMonths(date, 3);
      expect(result.getMonth()).toBe(3); // April
      expect(result.getDate()).toBe(15);
    });

    it('should handle year overflow', () => {
      const date = new Date('2024-11-15T12:00:00');
      const result = addMonths(date, 3);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(1); // February
    });

    it('should not mutate original date', () => {
      const date = new Date('2024-01-15T12:00:00');
      const originalTime = date.getTime();
      addMonths(date, 3);
      expect(date.getTime()).toBe(originalTime);
    });

    it('should handle negative months', () => {
      const date = new Date('2024-06-15T12:00:00');
      const result = addMonths(date, -3);
      expect(result.getMonth()).toBe(2); // March
    });
  });

  describe('addYears', () => {
    it('should add years correctly', () => {
      const date = new Date('2024-03-15T12:00:00');
      const result = addYears(date, 2);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(15);
    });

    it('should not mutate original date', () => {
      const date = new Date('2024-03-15T12:00:00');
      const originalTime = date.getTime();
      addYears(date, 2);
      expect(date.getTime()).toBe(originalTime);
    });

    it('should handle negative years', () => {
      const date = new Date('2024-03-15T12:00:00');
      const result = addYears(date, -2);
      expect(result.getFullYear()).toBe(2022);
    });
  });

  describe('isToday', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true for today', () => {
      const today = new Date('2024-03-15T08:30:00');
      expect(isToday(today)).toBe(true);
    });

    it('should return true for today at different times', () => {
      // Use times that won't cause timezone issues when converted to UTC
      const todayMorning = new Date('2024-03-15T06:00:00');
      const todayAfternoon = new Date('2024-03-15T14:00:00');
      expect(isToday(todayMorning)).toBe(true);
      expect(isToday(todayAfternoon)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date('2024-03-14T12:00:00');
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date('2024-03-16T12:00:00');
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isPast', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true for past dates', () => {
      const past = new Date('2024-03-10T12:00:00');
      expect(isPast(past)).toBe(true);
    });

    it('should return false for today at midnight', () => {
      const today = new Date('2024-03-15T00:00:00');
      expect(isPast(today)).toBe(false);
    });

    it('should return false for future dates', () => {
      const future = new Date('2024-03-20T12:00:00');
      expect(isPast(future)).toBe(false);
    });
  });

  describe('isFuture', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true for future dates', () => {
      const future = new Date('2024-03-20T12:00:00');
      expect(isFuture(future)).toBe(true);
    });

    it('should return false for today at end of day', () => {
      const today = new Date('2024-03-15T23:59:59');
      expect(isFuture(today)).toBe(false);
    });

    it('should return false for past dates', () => {
      const past = new Date('2024-03-10T12:00:00');
      expect(isFuture(past)).toBe(false);
    });
  });

  describe('getStartOfWeek', () => {
    it('should return Sunday for a mid-week date (Wednesday)', () => {
      const wednesday = new Date('2024-03-13T12:00:00'); // Wednesday
      const result = getStartOfWeek(wednesday);
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getDate()).toBe(10);
    });

    it('should return the same day for Sunday', () => {
      const sunday = new Date('2024-03-10T12:00:00');
      const result = getStartOfWeek(sunday);
      expect(result.getDate()).toBe(10);
      expect(result.getDay()).toBe(0);
    });

    it('should return previous Sunday for Saturday', () => {
      const saturday = new Date('2024-03-16T12:00:00'); // Saturday
      const result = getStartOfWeek(saturday);
      expect(result.getDay()).toBe(0);
      expect(result.getDate()).toBe(10);
    });

    it('should not mutate original date', () => {
      const date = new Date('2024-03-13T12:00:00');
      const originalTime = date.getTime();
      getStartOfWeek(date);
      expect(date.getTime()).toBe(originalTime);
    });
  });

  describe('getEndOfWeek', () => {
    it('should return Saturday for a mid-week date', () => {
      const wednesday = new Date('2024-03-13T12:00:00');
      const result = getEndOfWeek(wednesday);
      expect(result.getDay()).toBe(6); // Saturday
      expect(result.getDate()).toBe(16);
    });

    it('should return the same day for Saturday', () => {
      const saturday = new Date('2024-03-16T12:00:00');
      const result = getEndOfWeek(saturday);
      expect(result.getDate()).toBe(16);
      expect(result.getDay()).toBe(6);
    });

    it('should return following Saturday for Sunday', () => {
      const sunday = new Date('2024-03-10T12:00:00');
      const result = getEndOfWeek(sunday);
      expect(result.getDay()).toBe(6);
      expect(result.getDate()).toBe(16);
    });
  });

  describe('formatDisplayDate', () => {
    it('should format date for display with weekday, month, and day', () => {
      const date = new Date('2024-03-15T12:00:00');
      const result = formatDisplayDate(date);
      // The exact format may vary by locale, but should contain these elements
      expect(result).toContain('Mar');
      expect(result).toContain('15');
    });

    it('should include weekday abbreviation', () => {
      const friday = new Date('2024-03-15T12:00:00'); // Friday
      const result = formatDisplayDate(friday);
      expect(result).toContain('Fri');
    });
  });
});
