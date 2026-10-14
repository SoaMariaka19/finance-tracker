import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoryRepository } from './domain/category.repository';
import { PrismaCategoryRepository } from './infrastructure/prisma-category.repository';
import { CreateCategoryHandler } from './commands/create-category.handler';
import { UpdateCategoryHandler } from './commands/update-category.handler';
import { GetCategoriesHandler } from './queries/get-categories.handler';

const CommandHandlers = [CreateCategoryHandler, UpdateCategoryHandler];
const QueryHandlers = [GetCategoriesHandler];

@Module({
    controllers: [CategoriesController],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        { provide: CategoryRepository, useClass: PrismaCategoryRepository },
    ],
    exports: [CategoryRepository],
})
export class CategoriesModule {}