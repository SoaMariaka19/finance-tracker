const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? '€';

const numberFormat = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function formatAmount(cents: number): string {
    const sign = cents < 0 ? '-' : '';
    return `${sign}${numberFormat.format(Math.abs(cents) / 100)} ${CURRENCY}`;
}

export function parseAmountToCents(input: string): number | null {
    const normalized = input.trim().replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
        return null;
    }
    const [units, decimals = ''] = normalized.split('.');
    return Number(units) * 100 + Number(decimals.padEnd(2, '0'));
}

export function centsToInput(cents: number): string {
    const decimals = String(cents % 100).padStart(2, '0');
    return `${Math.floor(cents / 100)}.${decimals}`;
}