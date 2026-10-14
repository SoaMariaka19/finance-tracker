import { TransactionsView } from '@/components/transactions/transactions-view';

export const metadata = { title: 'Transactions · Finance Tracker' };

export default function TransactionsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-semibold">Transactions</h1>
            <TransactionsView />
        </div>
    );
}