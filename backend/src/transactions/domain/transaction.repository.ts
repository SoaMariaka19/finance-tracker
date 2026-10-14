import { Transaction, TransactionType } from '@prisma/client';

export interface NewTransaction {
    accountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number; // centimes, strictement positif
    date: Date;
    note: string | null;
}

export abstract class TransactionRepository {
    abstract record(data: NewTransaction): Promise<Transaction>;

    abstract sumExpenses(
        accountId: string,
        categoryId: string,
        from: Date,
        to: Date,
    ): Promise<number>;
}