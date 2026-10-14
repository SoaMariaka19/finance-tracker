'use client';

import { useState, type FormEvent } from 'react';
import { toMessages } from '@/lib/api';
import { parseAmountToCents } from '@/lib/money';
import { useCreateCategory } from '@/lib/queries/categories';
import { Alert, Card, inputClass, primaryButtonClass } from '@/components/ui';

export function CategoryForm() {
    const create = useCreateCategory();
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setFormError(null);

        if (!name.trim()) {
            setFormError('Le nom est obligatoire.');
            return;
        }

        let monthlyLimit: number | undefined;
        if (limit.trim() !== '') {
            const parsed = parseAmountToCents(limit);
            if (parsed === null || parsed <= 0) {
                setFormError('Limite invalide : saisissez un montant supérieur à 0 (ex : 300 ou 300,50).');
                return;
            }
            monthlyLimit = parsed;
        }

        create.mutate(
            { name: name.trim(), monthlyLimit },
            {
                onSuccess: () => {
                    setName('');
                    setLimit('');
                },
            },
        );
    }

    return (
        <Card>
            <h2 className="mb-3 font-medium">Nouvelle catégorie</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Nom</span>
                        <input
                            className={inputClass}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                            placeholder="Alimentation"
                        />
                    </label>
                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">
                          Limite mensuelle (optionnelle)
                        </span>
                        <input
                            className={inputClass}
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            inputMode="decimal"
                            placeholder="300,00"
                        />
                    </label>
                </div>

                {formError && <Alert variant="error" messages={[formError]} />}
                {create.isError && (
                    <Alert variant="error" messages={toMessages(create.error)} />
                )}

                <button type="submit" className={primaryButtonClass} disabled={create.isPending}>
                    {create.isPending ? 'Création…' : 'Créer la catégorie'}
                </button>
            </form>
        </Card>
    );
}