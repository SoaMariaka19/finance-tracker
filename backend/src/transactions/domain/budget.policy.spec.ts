import { describe, expect, it } from 'vitest';
import { evaluateBudget } from './budget.policy';

const base = { categoryId: 'cat-1', categoryName: 'Food' };

describe('evaluateBudget', () => {
    it('returns no warning when the category has no limit', () => {
        expect(
            evaluateBudget({ ...base, limit: null, spentBefore: 999999, amount: 5000 }),
        ).toBeNull();
    });

    it('returns no warning when the total stays under the limit', () => {
        expect(
            evaluateBudget({ ...base, limit: 30000, spentBefore: 10000, amount: 5000 }),
        ).toBeNull();
    });

    it('returns no warning when the total reaches exactly the limit', () => {
        expect(
            evaluateBudget({ ...base, limit: 30000, spentBefore: 25000, amount: 5000 }),
        ).toBeNull();
    });

    it('returns a warning with the overrun when the limit is exceeded', () => {
        expect(
            evaluateBudget({ ...base, limit: 30000, spentBefore: 25000, amount: 6000 }),
        ).toEqual({
            type: 'CATEGORY_LIMIT_EXCEEDED',
            categoryId: 'cat-1',
            categoryName: 'Food',
            limit: 30000,
            spent: 31000,
            exceededBy: 1000,
        });
    });
});