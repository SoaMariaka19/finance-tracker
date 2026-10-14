import { SummaryView } from '@/components/summary/summary-view';

export const metadata = { title: 'Résumé · Finance Tracker' };

export default function SummaryPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-semibold">Résumé mensuel</h1>
            <SummaryView />
        </div>
    );
}