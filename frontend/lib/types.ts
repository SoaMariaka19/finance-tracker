export type AccountType = 'CHECKING' | 'SAVINGS' | 'CASH';
export type TransactionType = 'INCOME' | 'EXPENSE';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
    CHECKING: 'Compte courant',
    SAVINGS: 'Épargne',
    CASH: 'Espèces',
};

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    balance: number; // centimes
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    monthlyLimit: number | null; // centimes
}

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number; // centimes
    date: string;
    note: string | null;
    createdAt: string;
    accountId: string;
    categoryId: string;
}

export interface TransactionListItem extends Transaction {
    category: { id: string; name: string };
}

export interface BudgetWarning {
    type: 'CATEGORY_LIMIT_EXCEEDED';
    categoryId: string;
    categoryName: string;
    limit: number;
    spent: number;
    exceededBy: number;
}

export interface AddTransactionResult {
    transaction: Transaction;
    warnings: BudgetWarning[];
}

export type BudgetStatus = 'NO_LIMIT' | 'OK' | 'NEAR_LIMIT' | 'EXCEEDED';

export interface CategorySummary {
    categoryId: string;
    categoryName: string;
    spent: number;
    limit: number | null;
    percentUsed: number | null;
    status: BudgetStatus;
}

export interface MonthlySummary {
    accountId: string;
    month: string;
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    categories: CategorySummary[];
}