'use client';

import { toMessages } from '@/lib/api';
import { formatAmount } from '@/lib/money';
import { useAccounts, useDeleteAccount } from '@/lib/queries/accounts';
import { ACCOUNT_TYPE_LABELS } from '@/lib/types';
import { Alert, Card, dangerButtonClass, secondaryButtonClass } from '@/components/ui';

export function AccountList() {
    const { data: accounts, isPending, isError, error, refetch } = useAccounts();
    const remove = useDeleteAccount();

    if (isPending) {
        return <p className="text-sm text-slate-500">Chargement des comptes…</p>;
    }

    if (isError) {
        return (
            <Alert variant="error" messages={toMessages(error)}>
                <button className={`${secondaryButtonClass} mt-2`} onClick={() => refetch()}>
                    Réessayer
                </button>
            </Alert>
        );
    }

    return (
        <section className="space-y-3">
            <h2 className="font-medium">Mes comptes</h2>

            {remove.isError && (
                <Alert variant="error" messages={toMessages(remove.error)} />
            )}

            {accounts.length === 0 ? (
                <p className="text-sm text-slate-500">
                    Aucun compte pour le moment. Créez-en un avec le formulaire ci-dessus.
                </p>
            ) : (
                <ul className="space-y-2">
                    {accounts.map((account) => (
                        <li key={account.id}>
                            <Card>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-medium">{account.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {ACCOUNT_TYPE_LABELS[account.type]}
                                        </p>
                                    </div>
                                    <p className="text-lg font-semibold tabular-nums">
                                        {formatAmount(account.balance)}
                                    </p>
                                    <button
                                        className={dangerButtonClass}
                                        disabled={remove.isPending && remove.variables === account.id}
                                        onClick={() => {
                                            if (window.confirm(`Supprimer le compte « ${account.name} » ?`)) {
                                                remove.mutate(account.id);
                                            }
                                        }}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}