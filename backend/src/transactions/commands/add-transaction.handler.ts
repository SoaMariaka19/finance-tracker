import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Transaction, TransactionType } from '@prisma/client';
import { AddTransactionCommand } from './add-transaction.command';
import { AccountRepository } from '../../accounts/domain/account.repository';
import { AccountNotFoundException } from '../../accounts/domain/account.exceptions';
import { CategoryRepository } from '../../categories/domain/category.repository';
import { CategoryNotFoundException } from '../../categories/domain/category.exceptions';
import { TransactionRepository } from '../domain/transaction.repository';
import { computeNewBalance } from '../domain/balance.policy';
import { BudgetWarning, evaluateBudget } from '../domain/budget.policy';
import { monthRange } from '../../shared/month-range';

export interface AddTransactionResult {
    transaction: Transaction;
    warnings: BudgetWarning[];
}

@CommandHandler(AddTransactionCommand)
export class AddTransactionHandler
    implements ICommandHandler<AddTransactionCommand, AddTransactionResult>
{
    constructor(
        private readonly accounts: AccountRepository,
        private readonly categories: CategoryRepository,
        private readonly transactions: TransactionRepository,
    ) {}

    async execute(command: AddTransactionCommand): Promise<AddTransactionResult> {
        const account = await this.accounts.findById(command.accountId);
        if (!account) {
            throw new AccountNotFoundException(command.accountId);
        }

        const category = await this.categories.findById(command.categoryId);
        if (!category) {
            throw new CategoryNotFoundException(command.categoryId);
        }

        computeNewBalance(account.balance, command.type, command.amount);

        const warnings: BudgetWarning[] = [];
        if (command.type === TransactionType.EXPENSE && category.monthlyLimit !== null) {
            const { from, to } = monthRange(command.date);
            const spentBefore = await this.transactions.sumExpenses(
                account.id,
                category.id,
                from,
                to,
            );
            const warning = evaluateBudget({
                categoryId: category.id,
                categoryName: category.name,
                limit: category.monthlyLimit,
                spentBefore,
                amount: command.amount,
            });
            if (warning) {
                warnings.push(warning);
            }
        }

        const transaction = await this.transactions.record({
            accountId: account.id,
            categoryId: category.id,
            type: command.type,
            amount: command.amount,
            date: command.date,
            note: command.note,
        });

        return { transaction, warnings };
    }
}