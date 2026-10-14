import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { GetMonthlySummaryHandler } from './queries/get-monthly-summary.handler';

@Module({
    controllers: [SummaryController],
    providers: [GetMonthlySummaryHandler],
})
export class SummaryModule {}