'use client';

import { useEffect, useState } from 'react';

export function Loading({ label }: { label: string }) {
    const [slow, setSlow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setSlow(true), 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div role="status" className="text-sm text-slate-500">
            <p>{label}</p>
            {slow && (
                <p className="mt-1">
                    Le serveur se réveille après une période d&apos;inactivité : cela peut
                    prendre jusqu&apos;à une minute. Merci de patienter…
                </p>
            )}
        </div>
    );
}