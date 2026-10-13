import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryCommand } from './commands/create-category.command';
import { UpdateCategoryCommand } from './commands/update-category.command';
import { GetCategoriesQuery } from './queries/get-categories.query';

@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Post()
    create(@Body() dto: CreateCategoryDto) {
        return this.commandBus.execute(
            new CreateCategoryCommand(dto.name, dto.monthlyLimit ?? null),
        );
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.commandBus.execute(
            new UpdateCategoryCommand(id, dto.name, dto.monthlyLimit),
        );
    }

    @Get()
    findAll() {
        return this.queryBus.execute(new GetCategoriesQuery());
    }
}