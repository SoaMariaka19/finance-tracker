import { describe, expect, it } from 'vitest';
import {
    currentMonthValue,
    formatDate,
    isValidMonth,
    todayInputValue,
} from './dates';

describe('todayInputValue', () => {
    it('formats a local date with zero padding', () => {
        expect(todayInputValue(new Date(2026, 9, 5))).toBe('2026-10-05');
    });
});

describe('currentMonthValue', () => {
    it('returns the year and month only', () => {
        expect(currentMonthValue(new Date(2026, 0, 31))).toBe('2026-01');
    });
});

describe('isValidMonth', () => {
    it.each(['2026-10', '1999-01'])('accepts "%s"', (value) => {
        expect(isValidMonth(value)).toBe(true);
    });

    it.each(['2026-13', '2026-00', '26-10', '2026-1', ''])('rejects "%s"', (value) => {
        expect(isValidMonth(value)).toBe(false);
    });
});

describe('formatDate', () => {
    it('shows the UTC calendar day, whatever the local timezone', () => {
        expect(formatDate('2026-10-13T00:00:00.000Z')).toBe('13/10/2026');
    });
});