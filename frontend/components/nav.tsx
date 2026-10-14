'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
    { href: '/accounts', label: 'Comptes' },
    { href: '/categories', label: 'Catégories' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/summary', label: 'Résumé' },
];

export function Nav() {
    const pathname = usePathname();

    return (
        <header className="border-b border-slate-200 bg-white">
            <nav className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
                <span className="font-semibold text-slate-900">Finance Tracker</span>
                {LINKS.map((link) => {
                    const active = pathname.startsWith(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={active ? 'page' : undefined}
                            className={
                                active
                                    ? 'text-sm font-medium text-indigo-700'
                                    : 'text-sm text-slate-600 hover:text-slate-900'
                            }
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}