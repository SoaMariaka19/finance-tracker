'use client';

import { useState, type FormEvent } from 'react';
import { ApiError, toMessages } from '@/lib/api';
import { todayInputValue } from '@/lib/dates';
import { formatAmount, parseAmountToCents } from '@/lib/money';
import { useAddTransaction } from '@/lib/queries/transactions';
import type { Account, Category, TransactionType } from '@/lib/types';
import { describeWarning } from '@/lib/warnings';
import { Alert, Card, inputClass, primaryButtonClass } from '@/components/ui';

const TYPE_LABELS: Record<TransactionType, string> = {
    EXPENSE: 'Dépense',
    INCOME: 'Revenu',
};

export function TransactionForm({
                                    accounts,
                                    categories,
                                }: {
    accounts: Account[];
    categories: Category[];
}) {
    const add = useAddTransaction();
    const [accountId, setAccountId] = useState(accounts[0].id);
    const [categoryId, setCategoryId] = useState(categories[0].id);
    const [type, setType] = useState<TransactionType>('EXPENSE');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(todayInputValue);
    const [note, setNote] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    const selectedAccount = accounts.find((account) => account.id === accountId);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setFormError(null);

        const cents = parseAmountToCents(amount);
        if (cents === null || cents <= 0) {
            setFormError('Montant invalide : saisissez un montant supérieur à 0 (ex : 25 ou 25,50).');
            return;
        }
        if (!date) {
            setFormError('La date est obligatoire.');
            return;
        }
        if (type === 'EXPENSE' && selectedAccount && cents > selectedAccount.balance) {
            setFormError(
                `Solde insuffisant : le compte « ${selectedAccount.name} » ne contient que ${formatAmount(selectedAccount.balance)}.`,
            );
            return;
        }

        add.mutate(
            { accountId, categoryId, type, amount: cents, date, note: note.trim() || undefined },
            {
                onSuccess: () => {
                    setAmount('');
                    setNote('');
                },
            },
        );
    }

    const serverMessages = !add.isError
        ? []
        : add.error instanceof ApiError && add.error.status === 422
            ? ['Solde insuffisant : cette dépense ferait passer le compte sous zéro.']
            : toMessages(add.error);

    return (
        <Card>
            <h2 className="mb-3 font-medium">Nouvelle transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                <fieldset className="flex gap-2">
                    <legend className="sr-only">Type de transaction</legend>
                    {(['EXPENSE', 'INCOME'] as const).map((value) => (
                        <label
                            key={value}
                            className={`cursor-pointer rounded-md border px-4 py-2 text-sm font-medium focus-within:ring-2 focus-within:ring-indigo-300 ${
                                type === value
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <input
                                type="radio"
                                name="type"
                                value={value}
                                checked={type === value}
                                onChange={() => setType(value)}
                                className="sr-only"
                            />
                            {TYPE_LABELS[value]}
                        </label>
                    ))}
                </fieldset>

                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Compte</span>
                        <select
                            className={inputClass}
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                        >
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </select>
                        {selectedAccount && (
                            <span className="mt-1 block text-xs text-slate-500">
                Solde disponible : {formatAmount(selectedAccount.balance)}
              </span>
                        )}
                    </label>

                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Catégorie</span>
                        <select
                            className={inputClass}
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Montant</span>
                        <input
                            className={inputClass}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            inputMode="decimal"
                            placeholder="25,50"
                        />
                    </label>

                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Date</span>
                        <input
                            type="date"
                            className={inputClass}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </label>
                </div>

                <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Note (optionnelle)</span>
                    <input
                        className={inputClass}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={255}
                    />
                </label>

                {formError && <Alert variant="error" messages={[formError]} />}
                {serverMessages.length > 0 && <Alert variant="error" messages={serverMessages} />}

                {add.isSuccess && (
                    <div className="space-y-2">
                        <Alert variant="success" messages={['Transaction enregistrée.']} />
                        {add.data.warnings.map((warning) => (
                            <Alert
                                key={warning.categoryId}
                                variant="warning"
                                title="Attention : limite dépassée"
                                messages={[describeWarning(warning)]}
                            />
                        ))}
                    </div>
                )}

                <button type="submit" className={primaryButtonClass} disabled={add.isPending}>
                    {add.isPending ? 'Enregistrement…' : 'Ajouter la transaction'}
                </button>
            </form>
        </Card>
    );
}