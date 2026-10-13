import { Category } from '@prisma/client';

export abstract class CategoryRepository {
    abstract create(data: {
        name: string;
        monthlyLimit: number | null;
    }): Promise<Category>;
    abstract findById(id: string): Promise<Category | null>;
    abstract findByName(name: string): Promise<Category | null>;
    abstract update(
        id: string,
        data: { name?: string; monthlyLimit?: number | null },
    ): Promise<Category>;
}