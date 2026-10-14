import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTransactionsQuery } from './get-transactions.query';
import { PrismaService } from '../../prisma/prisma.service';

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler implements IQueryHandler<GetTransactionsQuery> {
    constructor(private readonly prisma: PrismaService) {}

    execute({ accountId, from, to }: GetTransactionsQuery) {
        return this.prisma.transaction.findMany({
            where: {
                accountId,
                date: from || to ? { gte: from, lte: to } : undefined,
            },
            include: { category: { select: { id: true, name: true } } },
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        });
    }
}