import { describe, expect, it } from 'vitest';
import {monthRange, parseMonth} from './month-range';

describe('monthRange', () => {
    it('returns the first day of the month and the first day of the next', () => {
        const { from, to } = monthRange(new Date('2026-10-13T08:00:00Z'));
        expect(from).toEqual(new Date('2026-10-01T00:00:00.000Z'));
        expect(to).toEqual(new Date('2026-11-01T00:00:00.000Z'));
    });

    it('rolls over to January of the next year in December', () => {
        const { from, to } = monthRange(new Date('2026-12-31T23:59:59Z'));
        expect(from).toEqual(new Date('2026-12-01T00:00:00.000Z'));
        expect(to).toEqual(new Date('2027-01-01T00:00:00.000Z'));
    });
});

describe('parseMonth', () => {
    it('returns the first day of the month in UTC', () => {
        expect(parseMonth('2026-10')).toEqual(new Date('2026-10-01T00:00:00.000Z'));
    });

    it.each(['2026-13', '2026-00', '26-10', '2026/10', ''])(
        'rejects the invalid month "%s"',
        (value) => {
            expect(() => parseMonth(value)).toThrow();
        },
    );
});