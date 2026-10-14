'use client';

import { useState } from 'react';
import { toMessages } from '@/lib/api';
import { centsToInput, formatAmount, parseAmountToCents } from '@/lib/money';
import { useCategories, useUpdateCategory } from '@/lib/queries/categories';
import type { Category } from '@/lib/types';
import {
    Alert,
    Card,
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
} from '@/components/ui';

function CategoryRow({ category }: { category: Category }) {
    const update = useUpdateCategory();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(category.name);
    const [limit, setLimit] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    function startEditing() {
        setName(category.name);
        setLimit(category.monthlyLimit === null ? '' : centsToInput(category.monthlyLimit));
        setFormError(null);
        update.reset();
        setEditing(true);
    }

    function save() {
        setFormError(null);
        if (!name.trim()) {
            setFormError('Le nom est obligatoire.');
            return;
        }

        const limitIsEmpty = limit.trim() === '';
        const parsedLimit = limitIsEmpty ? null : parseAmountToCents(limit);
        if (!limitIsEmpty && (parsedLimit === null || parsedLimit <= 0)) {
            setFormError(
                'Limite invalide : montant supérieur à 0, ou champ vide pour supprimer la limite.',
            );
            return;
        }

        update.mutate(
            { id: category.id, name: name.trim(), monthlyLimit: parsedLimit },
            { onSuccess: () => setEditing(false) },
        );
    }

    if (!editing) {
        return (
            <Card>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-xs text-slate-500">
                            {category.monthlyLimit === null
                                ? 'Pas de limite mensuelle'
                                : `Limite mensuelle : ${formatAmount(category.monthlyLimit)}`}
                        </p>
                    </div>
                    <button className={secondaryButtonClass} onClick={startEditing}>
                        Modifier
                    </button>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Nom</span>
                        <input
                            className={inputClass}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                        />
                    </label>
                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">
                          Limite mensuelle (vide = aucune)
                        </span>
                        <input
                            className={inputClass}
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            inputMode="decimal"
                        />
                    </label>
                </div>

                {formError && <Alert variant="error" messages={[formError]} />}
                {update.isError && (
                    <Alert variant="error" messages={toMessages(update.error)} />
                )}

                <div className="flex gap-2">
                    <button className={primaryButtonClass} onClick={save} disabled={update.isPending}>
                        {update.isPending ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                    <button
                        className={secondaryButtonClass}
                        onClick={() => setEditing(false)}
                        disabled={update.isPending}
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </Card>
    );
}

export function CategoryList() {
    const { data: categories, isPending, isError, error, refetch } = useCategories();

    if (isPending) {
        return <p className="text-sm text-slate-500">Chargement des catégories…</p>;
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
            <h2 className="font-medium">Mes catégories</h2>
            {categories.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune catégorie pour le moment.</p>
            ) : (
                <ul className="space-y-2">
                    {categories.map((category) => (
                        <li key={category.id}>
                            <CategoryRow category={category} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}