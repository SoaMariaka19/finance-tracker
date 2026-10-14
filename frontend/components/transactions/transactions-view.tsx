'use client';

import Link from 'next/link';
import { toMessages } from '@/lib/api';
import { useAccounts } from '@/lib/queries/accounts';
import { useCategories } from '@/lib/queries/categories';
import { Alert, secondaryButtonClass } from '@/components/ui';
import { TransactionForm } from './transaction-form';
import { TransactionList } from './transaction-list';

export function TransactionsView() {
    const accounts = useAccounts();
    const categories = useCategories();

    if (accounts.isPending || categories.isPending) {
        return <p className="text-sm text-slate-500">Chargement…</p>;
    }

    if (accounts.isError || categories.isError) {
        return (
            <Alert variant="error" messages={toMessages(accounts.error ?? categories.error)}>
                <button
                    className={`${secondaryButtonClass} mt-2`}
                    onClick={() => {
                        void accounts.refetch();
                        void categories.refetch();
                    }}
                >
                    Réessayer
                </button>
            </Alert>
        );
    }

    if (accounts.data.length === 0 || categories.data.length === 0) {
        return (
            <Alert variant="warning" title="Il manque quelque chose pour saisir une transaction">
                <p>
                    {accounts.data.length === 0 && (
                        <>
                            Créez d&apos;abord un{' '}
                            <Link className="underline" href="/accounts">
                                compte
                            </Link>
                            .{' '}
                        </>
                    )}
                    {categories.data.length === 0 && (
                        <>
                            Créez d&apos;abord une{' '}
                            <Link className="underline" href="/categories">
                                catégorie
                            </Link>
                            .
                        </>
                    )}
                </p>
            </Alert>
        );
    }

    return (
        <>
            <TransactionForm accounts={accounts.data} categories={categories.data} />
            <TransactionList accounts={accounts.data} />
        </>
    );
}