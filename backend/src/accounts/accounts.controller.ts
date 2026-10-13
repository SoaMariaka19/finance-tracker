import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateAccountCommand } from './commands/create-account.command';
import { DeleteAccountCommand } from './commands/delete-account.command';
import {GetAccountsQuery} from "./queries/get-account.query";
import {GetAccountQuery} from "./queries/get-accounts.query";

@Controller('accounts')
export class AccountsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Post()
    create(@Body() dto: CreateAccountDto) {
        return this.commandBus.execute(
            new CreateAccountCommand(dto.name, dto.type, dto.initialBalance ?? 0),
        );
    }

    @Get()
    findAll() {
        return this.queryBus.execute(new GetAccountsQuery());
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.queryBus.execute(new GetAccountQuery(id));
    }

    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id') id: string): Promise<void> {
        await this.commandBus.execute(new DeleteAccountCommand(id));
    }
}