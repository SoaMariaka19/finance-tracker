import { Injectable } from '@nestjs/common';
import { Transaction, TransactionType } from '@prisma/client';
import {
    NewTransaction,
    TransactionRepository,
} from '../domain/transaction.repository';
import { InsufficientFundsException } from '../domain/transaction.exceptions';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaTransactionRepository extends TransactionRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    record(data: NewTransaction): Promise<Transaction> {
        return this.prisma.$transaction(async (tx) => {
            const isExpense = data.type === TransactionType.EXPENSE;

            const updated = await tx.account.updateMany({
                where: isExpense
                    ? { id: data.accountId, balance: { gte: data.amount } }
                    : { id: data.accountId },
                data: {
                    balance: isExpense
                        ? { decrement: data.amount }
                        : { increment: data.amount },
                },
            });

            if (updated.count === 0) {
                throw new InsufficientFundsException();
            }

            return tx.transaction.create({ data });
        });
    }

    async sumExpenses(
        accountId: string,
        categoryId: string,
        from: Date,
        to: Date,
    ): Promise<number> {
        const result = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                accountId,
                categoryId,
                type: TransactionType.EXPENSE,
                date: { gte: from, lt: to },
            },
        });
        return result._sum.amount ?? 0;
    }
}