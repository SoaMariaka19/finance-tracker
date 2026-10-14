export type AccountType = 'CHECKING' | 'SAVINGS' | 'CASH';

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