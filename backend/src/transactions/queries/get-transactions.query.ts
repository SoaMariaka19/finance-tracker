export class GetTransactionsQuery {
    constructor(
        public readonly accountId?: string,
        public readonly from?: Date,
        public readonly to?: Date,
    ) {}
}