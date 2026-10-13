import { AccountType } from '@prisma/client';

export class CreateAccountCommand {
    constructor(
        public readonly name: string,
        public readonly type: AccountType,
        public readonly initialBalance: number, // en centimes
    ) {}
}