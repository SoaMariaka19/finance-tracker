import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { UpdateCategoryHandler } from './update-category.handler';
import { UpdateCategoryCommand } from './update-category.command';
import { CategoryRepository } from '../domain/category.repository';
import {
    CategoryNameAlreadyExistsException,
    CategoryNotFoundException,
} from '../domain/category.exceptions';

describe('UpdateCategoryHandler', () => {
    let repository: Mocked<CategoryRepository>;
    let handler: UpdateCategoryHandler;

    const food = { id: 'cat-1', name: 'Food', monthlyLimit: 30000 };
    const transport = { id: 'cat-2', name: 'Transport', monthlyLimit: null };

    beforeEach(() => {
        repository = {
            create: vi.fn(),
            findById: vi.fn(),
            findByName: vi.fn(),
            update: vi.fn(),
        } as unknown as Mocked<CategoryRepository>;
        handler = new UpdateCategoryHandler(repository);
    });

    it('throws when the category does not exist', async () => {
        repository.findById.mockResolvedValue(null);

        await expect(
            handler.execute(new UpdateCategoryCommand('missing', 'New')),
        ).rejects.toBeInstanceOf(CategoryNotFoundException);
        expect(repository.update).not.toHaveBeenCalled();
    });

    it('refuses a name already used by another category', async () => {
        repository.findById.mockResolvedValue(food);
        repository.findByName.mockResolvedValue(transport);

        await expect(
            handler.execute(new UpdateCategoryCommand('cat-1', 'Transport')),
        ).rejects.toBeInstanceOf(CategoryNameAlreadyExistsException);
        expect(repository.update).not.toHaveBeenCalled();
    });

    it('accepts keeping the same name (no conflict with itself)', async () => {
        repository.findById.mockResolvedValue(food);
        repository.findByName.mockResolvedValue(food);

        await handler.execute(new UpdateCategoryCommand('cat-1', 'Food', 40000));

        expect(repository.update).toHaveBeenCalledWith('cat-1', {
            name: 'Food',
            monthlyLimit: 40000,
        });
    });

    it('removes the limit when monthlyLimit is null', async () => {
        repository.findById.mockResolvedValue(food);

        await handler.execute(new UpdateCategoryCommand('cat-1', undefined, null));

        expect(repository.update).toHaveBeenCalledWith('cat-1', {
            monthlyLimit: null,
        });
    });

    it('does not touch the limit when monthlyLimit is not provided', async () => {
        repository.findById.mockResolvedValue(food);
        repository.findByName.mockResolvedValue(null);

        await handler.execute(new UpdateCategoryCommand('cat-1', 'Groceries'));

        expect(repository.update).toHaveBeenCalledWith('cat-1', {
            name: 'Groceries',
        });
    });
});