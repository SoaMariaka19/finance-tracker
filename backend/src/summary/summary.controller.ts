import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetMonthlySummaryDto } from './dto/get-monthly-summary.dto';
import { GetMonthlySummaryQuery } from './queries/get-monthly-summary.query';

@Controller('accounts/:accountId/summary')
export class SummaryController {
    constructor(private readonly queryBus: QueryBus) {}

    @Get()
    getMonthlySummary(
        @Param('accountId', ParseUUIDPipe) accountId: string,
        @Query() dto: GetMonthlySummaryDto,
    ) {
        return this.queryBus.execute(
            new GetMonthlySummaryQuery(accountId, dto.month),
        );
    }
}