'use client';

import { useState, type FormEvent } from 'react';
import { toMessages } from '@/lib/api';
import { parseAmountToCents } from '@/lib/money';
import { useCreateAccount } from '@/lib/queries/accounts';
import { ACCOUNT_TYPE_LABELS, type AccountType } from '@/lib/types';
import { Alert, Card, inputClass, primaryButtonClass } from '@/components/ui';

export function AccountForm() {
    const create = useCreateAccount();
    const [name, setName] = useState('');
    const [type, setType] = useState<AccountType>('CHECKING');
    const [balance, setBalance] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setFormError(null);

        if (!name.trim()) {
            setFormError('Le nom est obligatoire.');
            return;
        }
        const initialBalance = balance.trim() === '' ? 0 : parseAmountToCents(balance);
        if (initialBalance === null) {
            setFormError('Solde initial invalide (exemples : 1250 ou 12,50).');
            return;
        }

        create.mutate(
            { name: name.trim(), type, initialBalance },
            {
                onSuccess: () => {
                    setName('');
                    setBalance('');
                },
            },
        );
    }

    return (
        <Card>
            <h2 className="mb-3 font-medium">Nouveau compte</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Nom</span>
                        <input
                            className={inputClass}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                            placeholder="Compte courant"
                        />
                    </label>
                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Type</span>
                        <select
                            className={inputClass}
                            value={type}
                            onChange={(e) => setType(e.target.value as AccountType)}
                        >
                            {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Solde initial</span>
                        <input
                            className={inputClass}
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            inputMode="decimal"
                            placeholder="0,00"
                        />
                    </label>
                </div>

                {formError && <Alert variant="error" messages={[formError]} />}
                {create.isError && (
                    <Alert variant="error" messages={toMessages(create.error)} />
                )}

                <button type="submit" className={primaryButtonClass} disabled={create.isPending}>
                    {create.isPending ? 'Création…' : 'Créer le compte'}
                </button>
            </form>
        </Card>
    );
}