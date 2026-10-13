import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Category } from '@prisma/client';
import { GetCategoriesQuery } from './get-categories.query';
import { PrismaService } from '../../prisma/prisma.service';

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler
    implements IQueryHandler<GetCategoriesQuery, Category[]>
{
    constructor(private readonly prisma: PrismaService) {}

    execute(): Promise<Category[]> {
        return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    }
}