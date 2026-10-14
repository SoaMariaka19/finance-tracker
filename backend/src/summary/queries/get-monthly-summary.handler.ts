import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMonthlySummaryQuery } from './get-monthly-summary.query';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountNotFoundException } from '../../accounts/domain/account.exceptions';
import { monthRange, parseMonth } from '../../shared/month-range';
import {
    buildMonthlySummary,
    MonthlySummary,
} from '../domain/monthly-summary';

@QueryHandler(GetMonthlySummaryQuery)
export class GetMonthlySummaryHandler
    implements IQueryHandler<GetMonthlySummaryQuery, MonthlySummary>
{
    constructor(private readonly prisma: PrismaService) {}

    async execute({
                      accountId,
                      month,
                  }: GetMonthlySummaryQuery): Promise<MonthlySummary> {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
            select: { id: true },
        });
        if (!account) {
            throw new AccountNotFoundException(accountId);
        }

        const { from, to } = monthRange(parseMonth(month));

        const [grouped, categories] = await Promise.all([
            this.prisma.transaction.groupBy({
                by: ['type', 'categoryId'],
                where: { accountId, date: { gte: from, lt: to } },
                _sum: { amount: true },
            }),
            this.prisma.category.findMany(),
        ]);

        return buildMonthlySummary({
            accountId,
            month,
            totals: grouped.map((row) => ({
                type: row.type,
                categoryId: row.categoryId,
                total: row._sum.amount ?? 0,
            })),
            categories,
        });
    }
}