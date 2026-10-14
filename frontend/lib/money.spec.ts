import { describe, expect, it } from 'vitest';
import { centsToInput, formatAmount, parseAmountToCents } from './money';

describe('parseAmountToCents', () => {
    it.each([
        ['12', 1200],
        ['12.5', 1250],
        ['12,50', 1250],
        ['0.05', 5],
        ['  7 ', 700],
        ['0', 0],
    ])('parses "%s" as %d cents', (input, expected) => {
        expect(parseAmountToCents(input)).toBe(expected);
    });

    it.each(['', '-5', '1.234', 'abc', '1e3', '12,5,0'])(
        'rejects the invalid input "%s"',
        (input) => {
            expect(parseAmountToCents(input)).toBeNull();
        },
    );
});

describe('formatAmount', () => {
    it('formats cents with two decimals and the currency', () => {
        expect(formatAmount(1250).replace(/\s/g, ' ')).toBe('12,50 €');
    });

    it('formats a negative amount', () => {
        expect(formatAmount(-5).replace(/\s/g, ' ')).toBe('-0,05 €');
    });
});

describe('centsToInput', () => {
    it.each([
        [1250, '12.50'],
        [5, '0.05'],
        [0, '0.00'],
    ])('converts %d cents to "%s"', (cents, expected) => {
        expect(centsToInput(cents)).toBe(expected);
    });
});