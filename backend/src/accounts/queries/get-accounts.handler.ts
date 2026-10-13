import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Account } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {GetAccountsQuery} from "./get-account.query";

@QueryHandler(GetAccountsQuery)
export class GetAccountsHandler
    implements IQueryHandler<GetAccountsQuery, Account[]>
{
    constructor(private readonly prisma: PrismaService) {}

    execute(): Promise<Account[]> {
        return this.prisma.account.findMany({ orderBy: { createdAt: 'asc' } });
    }
}