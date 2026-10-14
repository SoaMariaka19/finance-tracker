import type { ReactNode } from 'react';

export const inputClass =
    'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60';

export const primaryButtonClass =
    'inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60';

export const secondaryButtonClass =
    'inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60';

export const dangerButtonClass =
    'inline-flex items-center justify-center rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60';

type AlertVariant = 'error' | 'warning' | 'success';

const alertStyles: Record<AlertVariant, string> = {
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-300 bg-amber-50 text-amber-900',
    success: 'border-green-200 bg-green-50 text-green-800',
};

export function Alert({
                          variant,
                          messages,
                          children,
                      }: {
    variant: AlertVariant;
    messages?: string[];
    children?: ReactNode;
}) {
    return (
        <div
            role={variant === 'error' ? 'alert' : 'status'}
            className={`rounded-md border px-4 py-3 text-sm ${alertStyles[variant]}`}
        >
            {messages?.map((message) => <p key={message}>{message}</p>)}
            {children}
        </div>
    );
}

export function Card({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            {children}
        </div>
    );
}