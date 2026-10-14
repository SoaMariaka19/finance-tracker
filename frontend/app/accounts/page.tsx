import { AccountForm } from '@/components/accounts/account-form';
import { AccountList } from '@/components/accounts/account-list';

export const metadata = { title: 'Comptes · Finance Tracker' };

export default function AccountsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-semibold">Comptes</h1>
            <AccountForm />
            <AccountList />
        </div>
    );
}