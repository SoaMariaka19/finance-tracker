const pad = (n: number) => String(n).padStart(2, '0');

export function todayInputValue(now: Date = new Date()): string {
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function currentMonthValue(now: Date = new Date()): string {
    return todayInputValue(now).slice(0, 7);
}

export function isValidMonth(month: string): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'UTC' });
}