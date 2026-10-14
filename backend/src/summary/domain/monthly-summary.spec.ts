import { describe, expect, it } from 'vitest';
import { buildMonthlySummary, type TotalRow } from './monthly-summary';

const food = { id: 'cat-food', name: 'Food', monthlyLimit: 30000 };
const transport = { id: 'cat-transport', name: 'Transport', monthlyLimit: 10000 };
const salary = { id: 'cat-salary', name: 'Salary', monthlyLimit: null };
const health = { id: 'cat-health', name: 'Health', monthlyLimit: null };
const categories = [food, transport, salary, health];

const base = { accountId: 'acc-1', month: '2026-10' };
const expense = (categoryId: string, total: number): TotalRow => ({
    type: 'EXPENSE',
    categoryId,
    total,
});
const income = (categoryId: string, total: number): TotalRow => ({
    type: 'INCOME',
    categoryId,
    total,
});

const summarize = (totals: TotalRow[]) =>
    buildMonthlySummary({ ...base, totals, categories });

describe('buildMonthlySummary', () => {
    it('computes total income, total expenses and net balance', () => {
        const summary = summarize([
            income('cat-salary', 200000),
            expense('cat-food', 12000),
            expense('cat-transport', 3000),
        ]);

        expect(summary.totalIncome).toBe(200000);
        expect(summary.totalExpenses).toBe(15000);
        expect(summary.netBalance).toBe(185000);
    });

    it('handles an empty month: zero totals, limited categories shown at 0%', () => {
        const summary = summarize([]);

        expect(summary.totalIncome).toBe(0);
        expect(summary.totalExpenses).toBe(0);
        expect(summary.netBalance).toBe(0);
        expect(summary.categories.map((c) => c.categoryName)).toEqual([
            'Food',
            'Transport',
        ]);
        expect(summary.categories[0]).toMatchObject({
            spent: 0,
            percentUsed: 0,
            status: 'OK',
        });
    });

    it('reports NO_LIMIT and no percentage for a category without limit', () => {
        const summary = summarize([expense('cat-health', 9000)]);

        expect(summary.categories[0]).toMatchObject({
            categoryName: 'Health',
            spent: 9000,
            limit: null,
            percentUsed: null,
            status: 'NO_LIMIT',
        });
    });

    it('stays OK just under 80% of the limit', () => {
        const [transportSummary] = summarize([expense('cat-transport', 7900)]).categories;

        expect(transportSummary).toMatchObject({ percentUsed: 79, status: 'OK' });
    });

    it('switches to NEAR_LIMIT at exactly 80%', () => {
        const [transportSummary] = summarize([expense('cat-transport', 8000)]).categories;

        expect(transportSummary).toMatchObject({
            percentUsed: 80,
            status: 'NEAR_LIMIT',
        });
    });

    it('is NEAR_LIMIT, not EXCEEDED, when spending exactly reaches the limit', () => {
        const [transportSummary] = summarize([expense('cat-transport', 10000)]).categories;

        expect(transportSummary).toMatchObject({
            percentUsed: 100,
            status: 'NEAR_LIMIT',
        });
    });

    it('is EXCEEDED with a percentage above 100 when over the limit', () => {
        const [foodSummary] = summarize([expense('cat-food', 31000)]).categories;

        expect(foodSummary).toMatchObject({
            spent: 31000,
            limit: 30000,
            percentUsed: 103,
            status: 'EXCEEDED',
        });
    });

    it('does not list income categories in the spending breakdown', () => {
        const summary = summarize([income('cat-salary', 50000)]);

        expect(summary.categories.map((c) => c.categoryName)).not.toContain('Salary');
    });

    it('sorts categories by amount spent, highest first', () => {
        const summary = summarize([
            expense('cat-transport', 5000),
            expense('cat-food', 20000),
            expense('cat-health', 9000),
        ]);

        expect(summary.categories.map((c) => c.categoryName)).toEqual([
            'Food',
            'Health',
            'Transport',
        ]);
    });
});