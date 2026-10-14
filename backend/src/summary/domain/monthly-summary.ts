import { TransactionType } from '@prisma/client';

const NEAR_LIMIT_PERCENT = 80;

export type BudgetStatus = 'NO_LIMIT' | 'OK' | 'NEAR_LIMIT' | 'EXCEEDED';

export interface CategorySummary {
    categoryId: string;
    categoryName: string;
    spent: number; // centimes
    limit: number | null;
    percentUsed: number | null; // entier
    status: BudgetStatus;
}

export interface MonthlySummary {
    accountId: string;
    month: string; // "YYYY-MM"
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    categories: CategorySummary[];
}

export interface TotalRow {
    type: TransactionType;
    categoryId: string;
    total: number;
}

export interface CategoryInfo {
    id: string;
    name: string;
    monthlyLimit: number | null;
}

export function budgetStatus(spent: number, limit: number | null): BudgetStatus {
    if (limit === null) return 'NO_LIMIT';
    if (spent > limit) return 'EXCEEDED';
    if (spent * 100 >= limit * NEAR_LIMIT_PERCENT) return 'NEAR_LIMIT';
    return 'OK';
}

export function buildMonthlySummary(input: {
    accountId: string;
    month: string;
    totals: TotalRow[];
    categories: CategoryInfo[];
}): MonthlySummary {
    let totalIncome = 0;
    let totalExpenses = 0;
    const spentByCategory = new Map<string, number>();

    for (const row of input.totals) {
        if (row.type === TransactionType.INCOME) {
            totalIncome += row.total;
        } else {
            totalExpenses += row.total;
            spentByCategory.set(
                row.categoryId,
                (spentByCategory.get(row.categoryId) ?? 0) + row.total,
            );
        }
    }

    const categories: CategorySummary[] = input.categories
        .map((category) => ({
            category,
            spent: spentByCategory.get(category.id) ?? 0,
        }))
        .filter(({ category, spent }) => spent > 0 || category.monthlyLimit !== null)
        .map(({ category, spent }) => ({
            categoryId: category.id,
            categoryName: category.name,
            spent,
            limit: category.monthlyLimit,
            percentUsed:
                category.monthlyLimit === null
                    ? null
                    : Math.floor((spent * 100) / category.monthlyLimit),
            status: budgetStatus(spent, category.monthlyLimit),
        }))
        .sort(
            (a, b) =>
                b.spent - a.spent || a.categoryName.localeCompare(b.categoryName),
        );

    return {
        accountId: input.accountId,
        month: input.month,
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        categories,
    };
}