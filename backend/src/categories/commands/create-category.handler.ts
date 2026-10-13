import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Category } from '@prisma/client';
import { CreateCategoryCommand } from './create-category.command';
import { CategoryRepository } from '../domain/category.repository';
import { CategoryNameAlreadyExistsException } from '../domain/category.exceptions';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
    implements ICommandHandler<CreateCategoryCommand, Category>
{
    constructor(private readonly categories: CategoryRepository) {}

    async execute(command: CreateCategoryCommand): Promise<Category> {
        const name = command.name.trim();

        const existing = await this.categories.findByName(name);
        if (existing) {
            throw new CategoryNameAlreadyExistsException(name);
        }

        return this.categories.create({
            name,
            monthlyLimit: command.monthlyLimit,
        });
    }
}