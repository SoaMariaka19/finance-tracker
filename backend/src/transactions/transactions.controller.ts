import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddTransactionDto } from './dto/add-transaction.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { AddTransactionCommand } from './commands/add-transaction.command';
import { GetTransactionsQuery } from './queries/get-transactions.query';

@Controller('transactions')
export class TransactionsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Post()
    add(@Body() dto: AddTransactionDto) {
        return this.commandBus.execute(
            new AddTransactionCommand(
                dto.accountId,
                dto.categoryId,
                dto.type,
                dto.amount,
                dto.date,
                dto.note?.trim() || null,
            ),
        );
    }

    @Get()
    findAll(@Query() dto: GetTransactionsDto) {
        return this.queryBus.execute(
            new GetTransactionsQuery(dto.accountId, dto.from, dto.to),
        );
    }
}