import { Account, AccountType } from '@prisma/client';

export abstract class AccountRepository {
    abstract create(data: {
        name: string;
        type: AccountType;
        balance: number;
    }): Promise<Account>;
    abstract findById(id: string): Promise<Account | null>;
    abstract countTransactions(accountId: string): Promise<number>;
    abstract delete(id: string): Promise<void>;
}