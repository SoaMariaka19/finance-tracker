'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import { toMessages } from '@/lib/api';
import { currentMonthValue, isValidMonth } from '@/lib/dates';
import { formatAmount } from '@/lib/money';
import { useAccounts } from '@/lib/queries/accounts';
import { useMonthlySummary } from '@/lib/queries/summary';
import type { BudgetStatus, CategorySummary, MonthlySummary } from '@/lib/types';
import { Alert, Card, inputClass, secondaryButtonClass } from '@/components/ui';

const STATUS_STYLES: Record<
    BudgetStatus,
    { bar: string; text: string; label: string | null }
> = {
    NO_LIMIT: { bar: 'bg-slate-400', text: 'text-slate-600', label: null },
    OK: { bar: 'bg-green-500', text: 'text-green-700', label: null },
    NEAR_LIMIT: { bar: 'bg-amber-500', text: 'text-amber-700', label: 'Proche de la limite' },
    EXCEEDED: { bar: 'bg-red-500', text: 'text-red-700', label: 'Limite dépassée' },
};

function StatCard({ label, value, tone }: { label: string; value: string; tone: string }) {
    return (
        <Card>
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`mt-1 text-lg font-semibold tabular-nums ${tone}`}>{value}</p>
        </Card>
    );
}

function CategoryProgress({ category }: { category: CategorySummary }) {
    const style = STATUS_STYLES[category.status];
    const hasLimit = category.limit !== null && category.percentUsed !== null;
    const barWidth = hasLimit ? Math.min(category.percentUsed ?? 0, 100) : 0;

    return (
        <li>
            <Card>
                <div className="flex items-baseline justify-between gap-4">
                    <p className="font-medium">{category.categoryName}</p>
                    <p className="text-sm tabular-nums">
                        {formatAmount(category.spent)}
                        {hasLimit && (
                            <span className="text-slate-500"> / {formatAmount(category.limit ?? 0)}</span>
                        )}
                    </p>
                </div>

                {hasLimit ? (
                    <>
                        <div
                            role="progressbar"
                            aria-label={`Budget ${category.categoryName}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={barWidth}
                            className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                        >
                            <div className={`h-full ${style.bar}`} style={{ width: `${barWidth}%` }} />
                        </div>
                        <p className={`mt-1 text-xs ${style.text}`}>
                            {category.percentUsed} % de la limite
                            {style.label && ` · ${style.label}`}
                        </p>
                    </>
                ) : (
                    <p className="mt-1 text-xs text-slate-500">Pas de limite définie</p>
                )}
            </Card>
        </li>
    );
}

function SummaryContent({ summary, stale }: { summary: MonthlySummary; stale: boolean }) {
    const exceeded = summary.categories.filter((c) => c.status === 'EXCEEDED');
    const isEmpty =
        summary.totalIncome === 0 && summary.totalExpenses === 0 && summary.categories.length === 0;

    return (
        <div className={`space-y-4 transition-opacity ${stale ? 'opacity-50' : ''}`}>
            {exceeded.length > 0 && (
                <Alert
                    variant="warning"
                    title={
                        exceeded.length === 1
                            ? '1 catégorie a dépassé sa limite ce mois-ci'
                            : `${exceeded.length} catégories ont dépassé leur limite ce mois-ci`
                    }
                    messages={[exceeded.map((c) => c.categoryName).join(', ')]}
                />
            )}

            <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                    label="Revenus"
                    value={formatAmount(summary.totalIncome)}
                    tone="text-green-700"
                />
                <StatCard
                    label="Dépenses"
                    value={formatAmount(summary.totalExpenses)}
                    tone="text-red-700"
                />
                <StatCard
                    label="Solde net du mois"
                    value={formatAmount(summary.netBalance)}
                    tone={summary.netBalance < 0 ? 'text-red-700' : 'text-slate-900'}
                />
            </div>

            {isEmpty ? (
                <p className="text-sm text-slate-500">Aucune transaction ce mois-ci pour ce compte.</p>
            ) : (
                <section className="space-y-3">
                    <h2 className="font-medium">Dépenses par catégorie</h2>
                    <ul className="space-y-2">
                        {summary.categories.map((category) => (
                            <CategoryProgress key={category.categoryId} category={category} />
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

export function SummaryView() {
    const accounts = useAccounts();
    const [accountId, setAccountId] = useState('');
    const [month, setMonth] = useState('');

    useEffect(() => {
        setMonth(currentMonthValue());
    }, []);

    const effectiveAccountId = accountId || accounts.data?.[0]?.id;
    const summary = useMonthlySummary(effectiveAccountId, month);

    if (accounts.isPending) {
        return <p className="text-sm text-slate-500">Chargement…</p>;
    }

    if (accounts.isError) {
        return (
            <Alert variant="error" messages={toMessages(accounts.error)}>
                <button className={`${secondaryButtonClass} mt-2`} onClick={() => accounts.refetch()}>
                    Réessayer
                </button>
            </Alert>
        );
    }

    if (accounts.data.length === 0) {
        return (
            <Alert variant="warning" title="Aucun compte">
                <p>
                    Créez d&apos;abord un{' '}
                    <Link className="underline" href="/accounts">
                        compte
                    </Link>{' '}
                    pour consulter son résumé.
                </p>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                    <span className="mb-1 block text-slate-600">Compte</span>
                    <select
                        className={inputClass}
                        value={effectiveAccountId}
                        onChange={(e) => setAccountId(e.target.value)}
                    >
                        {accounts.data.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-sm">
                    <span className="mb-1 block text-slate-600">Mois</span>
                    <input
                        type="month"
                        className={inputClass}
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                    />
                </label>
            </div>

            {!isValidMonth(month) && (
                <Alert variant="warning" messages={['Choisissez un mois valide (ex : 2026-10).']} />
            )}

            {isValidMonth(month) && summary.isPending && (
                <p className="text-sm text-slate-500">Calcul du résumé…</p>
            )}

            {summary.isError && (
                <Alert variant="error" messages={toMessages(summary.error)}>
                    <button className={`${secondaryButtonClass} mt-2`} onClick={() => summary.refetch()}>
                        Réessayer
                    </button>
                </Alert>
            )}

            {summary.data && (
                <SummaryContent summary={summary.data} stale={summary.isPlaceholderData} />
            )}
        </div>
    );
}