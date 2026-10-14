import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsController } from './transactions.controller';
import { TransactionRepository } from './domain/transaction.repository';
import { PrismaTransactionRepository } from './infrastructure/prisma-transaction.repository';
import { AddTransactionHandler } from './commands/add-transaction.handler';
import { GetTransactionsHandler } from './queries/get-transactions.handler';

@Module({
    imports: [AccountsModule, CategoriesModule],
    controllers: [TransactionsController],
    providers: [
        AddTransactionHandler,
        GetTransactionsHandler,
        { provide: TransactionRepository, useClass: PrismaTransactionRepository },
    ],
})
export class TransactionsModule {}