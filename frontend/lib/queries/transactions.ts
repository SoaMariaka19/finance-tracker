import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import { accountsKey } from '@/lib/queries/accounts';
import type {
    AddTransactionResult,
    TransactionListItem,
    TransactionType,
} from '@/lib/types';

export const transactionsKey = ['transactions'] as const;

export interface AddTransactionInput {
    accountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number; // centimes
    date: string; // "YYYY-MM-DD"
    note?: string;
}

export function useTransactions(accountId?: string) {
    return useQuery({
        queryKey: [...transactionsKey, { accountId: accountId ?? null }],
        queryFn: () =>
            api.get<TransactionListItem[]>(
                accountId
                    ? `/transactions?accountId=${encodeURIComponent(accountId)}`
                    : '/transactions',
            ),
        placeholderData: keepPreviousData,
    });
}

export function useAddTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: AddTransactionInput) =>
            api.post<AddTransactionResult>('/transactions', input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: accountsKey });
            void queryClient.invalidateQueries({ queryKey: transactionsKey });
            void queryClient.invalidateQueries({ queryKey: ['summary'] });
        },
    });
}