import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Category } from '@prisma/client';
import { UpdateCategoryCommand } from './update-category.command';
import { CategoryRepository } from '../domain/category.repository';
import {
    CategoryNameAlreadyExistsException,
    CategoryNotFoundException,
} from '../domain/category.exceptions';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler
    implements ICommandHandler<UpdateCategoryCommand, Category>
{
    constructor(private readonly categories: CategoryRepository) {}

    async execute(command: UpdateCategoryCommand): Promise<Category> {
        const category = await this.categories.findById(command.categoryId);
        if (!category) {
            throw new CategoryNotFoundException(command.categoryId);
        }

        const changes: { name?: string; monthlyLimit?: number | null } = {};

        if (command.name !== undefined) {
            const name = command.name.trim();
            const sameName = await this.categories.findByName(name);
            if (sameName && sameName.id !== category.id) {
                throw new CategoryNameAlreadyExistsException(name);
            }
            changes.name = name;
        }

        if (command.monthlyLimit !== undefined) {
            changes.monthlyLimit = command.monthlyLimit;
        }

        return this.categories.update(category.id, changes);
    }
}