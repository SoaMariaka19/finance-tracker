import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteAccountCommand } from './delete-account.command';
import { AccountRepository } from '../domain/account.repository';
import {
    AccountHasTransactionsException,
    AccountNotFoundException,
} from '../domain/account.exceptions';

@CommandHandler(DeleteAccountCommand)
export class DeleteAccountHandler
    implements ICommandHandler<DeleteAccountCommand, void>
{
    constructor(private readonly accounts: AccountRepository) {}

    async execute({ accountId }: DeleteAccountCommand): Promise<void> {
        const account = await this.accounts.findById(accountId);
        if (!account) {
            throw new AccountNotFoundException(accountId);
        }

        const transactionCount = await this.accounts.countTransactions(accountId);
        if (transactionCount > 0) {
            throw new AccountHasTransactionsException(accountId);
        }

        await this.accounts.delete(accountId);
    }
}