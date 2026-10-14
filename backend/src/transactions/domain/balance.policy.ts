import { TransactionType } from '@prisma/client';
import { InsufficientFundsException } from './transaction.exceptions';

export function computeNewBalance(
    balance: number,
    type: TransactionType,
    amount: number,
): number {
    const next = type === TransactionType.INCOME ? balance + amount : balance - amount;
    if (next < 0) {
        throw new InsufficientFundsException();
    }
    return next;
}