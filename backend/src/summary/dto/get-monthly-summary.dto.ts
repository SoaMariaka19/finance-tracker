import { Matches } from 'class-validator';

export class GetMonthlySummaryDto {
    @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
        message: 'month must be formatted as YYYY-MM (e.g. 2026-10)',
    })
    month: string;
}