'use client';

import { useState } from 'react';
import { toMessages } from '@/lib/api';
import { formatDate } from '@/lib/dates';
import { formatAmount } from '@/lib/money';
import { useTransactions } from '@/lib/queries/transactions';
import type { Account } from '@/lib/types';
import { Alert, Card, inputClass, secondaryButtonClass } from '@/components/ui';
import {Loading} from "@/components/loading";

export function TransactionList({ accounts }: { accounts: Account[] }) {
    const [filter, setFilter] = useState('');
    const {
        data: transactions,
        isPending,
        isError,
        error,
        refetch,
        isPlaceholderData,
    } = useTransactions(filter || undefined);

    const accountNames = new Map(accounts.map((account) => [account.id, account.name]));

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <h2 className="font-medium">Historique</h2>
                <select
                    aria-label="Filtrer par compte"
                    className={`${inputClass} max-w-48`}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="">Tous les comptes</option>
                    {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.name}
                        </option>
                    ))}
                </select>
            </div>

            {isPending && <Loading label="Chargement des transactions…" />}

            {isError && (
                <Alert variant="error" messages={toMessages(error)}>
                    <button className={`${secondaryButtonClass} mt-2`} onClick={() => refetch()}>
                        Réessayer
                    </button>
                </Alert>
            )}

            {transactions && transactions.length === 0 && (
                <p className="text-sm text-slate-500">Aucune transaction pour le moment.</p>
            )}

            {transactions && transactions.length > 0 && (
                <ul className={`space-y-2 transition-opacity ${isPlaceholderData ? 'opacity-50' : ''}`}>
                    {transactions.map((transaction) => {
                        const isIncome = transaction.type === 'INCOME';
                        return (
                            <li key={transaction.id}>
                                <Card>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="font-medium">{transaction.category.name}</p>
                                            <p className="truncate text-xs text-slate-500">
                                                {formatDate(transaction.date)}
                                                {!filter && ` · ${accountNames.get(transaction.accountId) ?? ''}`}
                                                {transaction.note && ` · ${transaction.note}`}
                                            </p>
                                        </div>
                                        <p
                                            className={`shrink-0 font-semibold tabular-nums ${
                                                isIncome ? 'text-green-700' : 'text-red-700'
                                            }`}
                                        >
                                            {isIncome ? '+' : '−'} {formatAmount(transaction.amount)}
                                        </p>
                                    </div>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}