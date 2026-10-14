import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Account, AccountType } from '@/lib/types';

export const accountsKey = ['accounts'] as const;

export interface CreateAccountInput {
    name: string;
    type: AccountType;
    initialBalance: number; // centimes
}

export function useAccounts() {
    return useQuery({
        queryKey: accountsKey,
        queryFn: () => api.get<Account[]>('/accounts'),
    });
}

export function useCreateAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateAccountInput) =>
            api.post<Account>('/accounts', input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: accountsKey }),
    });
}

export function useDeleteAccount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete<void>(`/accounts/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: accountsKey }),
    });
}