import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { isValidMonth } from '@/lib/dates';
import type { MonthlySummary } from '@/lib/types';

export function useMonthlySummary(accountId: string | undefined, month: string) {
    return useQuery({
        queryKey: ['summary', accountId, month],
        queryFn: () =>
            api.get<MonthlySummary>(`/accounts/${accountId}/summary?month=${month}`),
        enabled: Boolean(accountId) && isValidMonth(month),
        placeholderData: (previous) =>
            previous?.accountId === accountId ? previous : undefined,
    });
}