import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Account } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountNotFoundException } from '../domain/account.exceptions';
import {GetAccountQuery} from "./get-accounts.query";

@QueryHandler(GetAccountQuery)
export class GetAccountHandler
    implements IQueryHandler<GetAccountQuery, Account>
{
    constructor(private readonly prisma: PrismaService) {}

    async execute({ accountId }: GetAccountQuery): Promise<Account> {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
        });
        if (!account) {
            throw new AccountNotFoundException(accountId);
        }
        return account;
    }
}