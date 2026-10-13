import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { CreateCategoryHandler } from './create-category.handler';
import { CreateCategoryCommand } from './create-category.command';
import { CategoryRepository } from '../domain/category.repository';
import { CategoryNameAlreadyExistsException } from '../domain/category.exceptions';

describe('CreateCategoryHandler', () => {
    let repository: Mocked<CategoryRepository>;
    let handler: CreateCategoryHandler;

    beforeEach(() => {
        repository = {
            create: vi.fn(),
            findById: vi.fn(),
            findByName: vi.fn(),
            update: vi.fn(),
        } as unknown as Mocked<CategoryRepository>;
        handler = new CreateCategoryHandler(repository);
    });

    it('trims the name before creating the category', async () => {
        repository.findByName.mockResolvedValue(null);

        await handler.execute(new CreateCategoryCommand('  Food ', 30000));

        expect(repository.create).toHaveBeenCalledWith({
            name: 'Food',
            monthlyLimit: 30000,
        });
    });

    it('creates a category without limit', async () => {
        repository.findByName.mockResolvedValue(null);

        await handler.execute(new CreateCategoryCommand('Salary', null));

        expect(repository.create).toHaveBeenCalledWith({
            name: 'Salary',
            monthlyLimit: null,
        });
    });

    it('refuses a name that already exists', async () => {
        repository.findByName.mockResolvedValue({
            id: 'cat-1',
            name: 'Food',
            monthlyLimit: null,
        });

        await expect(
            handler.execute(new CreateCategoryCommand('food', null)),
        ).rejects.toBeInstanceOf(CategoryNameAlreadyExistsException);
        expect(repository.create).not.toHaveBeenCalled();
    });
});