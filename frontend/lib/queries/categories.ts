import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';

export const categoriesKey = ['categories'] as const;

export interface CreateCategoryInput {
    name: string;
    monthlyLimit?: number; // centimes ; absent = pas de limite
}

export interface UpdateCategoryInput {
    id: string;
    name?: string;
    monthlyLimit?: number | null;
}

export function useCategories() {
    return useQuery({
        queryKey: categoriesKey,
        queryFn: () => api.get<Category[]>('/categories'),
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateCategoryInput) =>
            api.post<Category>('/categories', input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesKey }),
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...body }: UpdateCategoryInput) =>
            api.patch<Category>(`/categories/${id}`, body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriesKey }),
    });
}