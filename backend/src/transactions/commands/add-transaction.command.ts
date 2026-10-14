import { TransactionType } from '@prisma/client';

export class AddTransactionCommand {
    constructor(
        public readonly accountId: string,
        public readonly categoryId: string,
        public readonly type: TransactionType,
        public readonly amount: number, // centimes
        public readonly date: Date,
        public readonly note: string | null,
    ) {}
}