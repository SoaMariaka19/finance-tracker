import { describe, expect, it } from 'vitest';
import { TransactionType } from '@prisma/client';
import { computeNewBalance } from './balance.policy';
import { InsufficientFundsException } from './transaction.exceptions';

describe('computeNewBalance', () => {
    it('adds an income to the balance', () => {
        expect(computeNewBalance(1000, TransactionType.INCOME, 500)).toBe(1500);
    });

    it('subtracts an expense from the balance', () => {
        expect(computeNewBalance(1000, TransactionType.EXPENSE, 400)).toBe(600);
    });

    it('allows an expense that brings the balance to exactly zero', () => {
        expect(computeNewBalance(1000, TransactionType.EXPENSE, 1000)).toBe(0);
    });

    it('refuses an expense that brings the balance below zero', () => {
        expect(() => computeNewBalance(1000, TransactionType.EXPENSE, 1001)).toThrow(
            InsufficientFundsException,
        );
    });
});