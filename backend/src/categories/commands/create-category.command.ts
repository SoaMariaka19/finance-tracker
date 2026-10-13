export class CreateCategoryCommand {
    constructor(
        public readonly name: string,
        public readonly monthlyLimit: number | null, // en centimes
    ) {}
}