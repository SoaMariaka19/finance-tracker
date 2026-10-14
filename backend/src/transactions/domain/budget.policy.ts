export interface BudgetWarning {
    type: 'CATEGORY_LIMIT_EXCEEDED';
    categoryId: string;
    categoryName: string;
    limit: number; // centimes
    spent: number; // total du mois, avec cette dépense
    exceededBy: number;
}

export function evaluateBudget(input: {
    categoryId: string;
    categoryName: string;
    limit: number | null;
    spentBefore: number;
    amount: number;
}): BudgetWarning | null {
    if (input.limit === null) {
        return null;
    }
    const spent = input.spentBefore + input.amount;
    if (spent <= input.limit) {
        return null;
    }
    return {
        type: 'CATEGORY_LIMIT_EXCEEDED',
        categoryId: input.categoryId,
        categoryName: input.categoryName,
        limit: input.limit,
        spent,
        exceededBy: spent - input.limit,
    };
}