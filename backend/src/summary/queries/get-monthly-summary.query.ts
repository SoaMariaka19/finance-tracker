export class GetMonthlySummaryQuery {
    constructor(
        public readonly accountId: string,
        public readonly month: string, // "YYYY-MM"
    ) {}
}