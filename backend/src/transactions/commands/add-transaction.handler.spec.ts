import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { AddTransactionHandler } from './add-transaction.handler';
import { AddTransactionCommand } from './add-transaction.command';
import { AccountRepository } from '../../accounts/domain/account.repository';
import { AccountNotFoundException } from '../../accounts/domain/account.exceptions';
import { CategoryRepository } from '../../categories/domain/category.repository';
import { CategoryNotFoundException } from '../../categories/domain/category.exceptions';
import { TransactionRepository } from '../domain/transaction.repository';
import { InsufficientFundsException } from '../domain/transaction.exceptions';

const DATE = new Date('2026-10-13');

const account = (balance: number) => ({
    id: 'acc-1',
    name: 'Compte courant',
    type: 'CHECKING' as const,
    balance,
    createdAt: new Date(),
});

const category = (monthlyLimit: number | null) => ({
    id: 'cat-1',
    name: 'Food',
    monthlyLimit,
});

const savedTransaction = {
    id: 'tx-1',
    type: 'EXPENSE' as const,
    amount: 0,
    date: DATE,
    note: null,
    createdAt: new Date(),
    accountId: 'acc-1',
    categoryId: 'cat-1',
};

describe('AddTransactionHandler', () => {
    let accounts: Mocked<AccountRepository>;
    let categories: Mocked<CategoryRepository>;
    let transactions: Mocked<TransactionRepository>;
    let handler: AddTransactionHandler;

    const expense = (amount: number, date = DATE) =>
        new AddTransactionCommand('acc-1', 'cat-1', 'EXPENSE', amount, date, null);
    const income = (amount: number) =>
        new AddTransactionCommand('acc-1', 'cat-1', 'INCOME', amount, DATE, null);

    beforeEach(() => {
        accounts = { findById: vi.fn() } as unknown as Mocked<AccountRepository>;
        categories = { findById: vi.fn() } as unknown as Mocked<CategoryRepository>;
        transactions = {
            record: vi.fn().mockResolvedValue(savedTransaction),
            sumExpenses: vi.fn().mockResolvedValue(0),
        } as unknown as Mocked<TransactionRepository>;
        handler = new AddTransactionHandler(accounts, categories, transactions);

        accounts.findById.mockResolvedValue(account(100000));
        categories.findById.mockResolvedValue(category(30000));
    });

    it('records an income without checking the category budget', async () => {
        const result = await handler.execute(income(5000));

        expect(transactions.record).toHaveBeenCalledOnce();
        expect(transactions.sumExpenses).not.toHaveBeenCalled();
        expect(result.warnings).toEqual([]);
    });

    it('records an expense under the limit without warning', async () => {
        transactions.sumExpenses.mockResolvedValue(10000);

        const result = await handler.execute(expense(5000));

        expect(result.warnings).toEqual([]);
        expect(transactions.record).toHaveBeenCalledOnce();
    });

    it('still records the expense but returns a warning when the limit is exceeded', async () => {
        transactions.sumExpenses.mockResolvedValue(25000);

        const result = await handler.execute(expense(6000));

        expect(transactions.record).toHaveBeenCalledOnce();
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toMatchObject({
            type: 'CATEGORY_LIMIT_EXCEEDED',
            limit: 30000,
            spent: 31000,
            exceededBy: 1000,
        });
    });

    it('returns no warning when the total reaches exactly the limit', async () => {
        transactions.sumExpenses.mockResolvedValue(25000);

        const result = await handler.execute(expense(5000));

        expect(result.warnings).toEqual([]);
    });

    it('does not query spending when the category has no limit', async () => {
        categories.findById.mockResolvedValue(category(null));

        const result = await handler.execute(expense(5000));

        expect(transactions.sumExpenses).not.toHaveBeenCalled();
        expect(result.warnings).toEqual([]);
    });

    it('refuses an expense larger than the balance and records nothing', async () => {
        accounts.findById.mockResolvedValue(account(4000));

        await expect(handler.execute(expense(4001))).rejects.toBeInstanceOf(
            InsufficientFundsException,
        );
        expect(transactions.record).not.toHaveBeenCalled();
    });

    it('accepts an expense equal to the balance', async () => {
        accounts.findById.mockResolvedValue(account(4000));

        await handler.execute(expense(4000));

        expect(transactions.record).toHaveBeenCalledOnce();
    });

    it('throws when the account does not exist', async () => {
        accounts.findById.mockResolvedValue(null);

        await expect(handler.execute(expense(100))).rejects.toBeInstanceOf(
            AccountNotFoundException,
        );
        expect(transactions.record).not.toHaveBeenCalled();
    });

    it('throws when the category does not exist', async () => {
        categories.findById.mockResolvedValue(null);

        await expect(handler.execute(expense(100))).rejects.toBeInstanceOf(
            CategoryNotFoundException,
        );
        expect(transactions.record).not.toHaveBeenCalled();
    });

    it("computes the monthly total from the transaction's month, not today's", async () => {
        await handler.execute(expense(1000, new Date('2026-03-15')));

        expect(transactions.sumExpenses).toHaveBeenCalledWith(
            'acc-1',
            'cat-1',
            new Date('2026-03-01T00:00:00.000Z'),
            new Date('2026-04-01T00:00:00.000Z'),
        );
    });
});