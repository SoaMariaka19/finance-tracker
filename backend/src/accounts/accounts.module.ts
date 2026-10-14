import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountRepository } from './domain/account.repository';
import { PrismaAccountRepository } from './infrastructure/prisma-account.repository';
import { CreateAccountHandler } from './commands/create-account.handler';
import { DeleteAccountHandler } from './commands/delete-account.handler';
import { GetAccountsHandler } from './queries/get-accounts.handler';
import { GetAccountHandler } from './queries/get-account.handler';

const CommandHandlers = [CreateAccountHandler, DeleteAccountHandler];
const QueryHandlers = [GetAccountsHandler, GetAccountHandler];

@Module({
    controllers: [AccountsController],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        { provide: AccountRepository, useClass: PrismaAccountRepository },
    ],
    exports: [AccountRepository],
})
export class AccountsModule {}