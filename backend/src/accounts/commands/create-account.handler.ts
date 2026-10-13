import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Account } from '@prisma/client';
import { CreateAccountCommand } from './create-account.command';
import { AccountRepository } from '../domain/account.repository';

@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler
    implements ICommandHandler<CreateAccountCommand, Account>
{
    constructor(private readonly accounts: AccountRepository) {}

    async execute(command: CreateAccountCommand): Promise<Account> {
        return this.accounts.create({
            name: command.name.trim(),
            type: command.type,
            balance: command.initialBalance,
        });
    }
}