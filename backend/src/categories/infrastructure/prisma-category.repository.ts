import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { CategoryRepository } from '../domain/category.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaCategoryRepository extends CategoryRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    create(data: { name: string; monthlyLimit: number | null }): Promise<Category> {
        return this.prisma.category.create({ data });
    }

    findById(id: string): Promise<Category | null> {
        return this.prisma.category.findUnique({ where: { id } });
    }

    findByName(name: string): Promise<Category | null> {
        return this.prisma.category.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } },
        });
    }

    update(
        id: string,
        data: { name?: string; monthlyLimit?: number | null },
    ): Promise<Category> {
        return this.prisma.category.update({ where: { id }, data });
    }
}