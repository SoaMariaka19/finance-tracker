const MONTH_FORMAT = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function monthRange(date: Date): { from: Date; to: Date } {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    return {
        from: new Date(Date.UTC(year, month, 1)),
        to: new Date(Date.UTC(year, month + 1, 1)),
    };
}

export function parseMonth(month: string): Date {
    const match = MONTH_FORMAT.exec(month);
    if (!match) {
        throw new Error(`Invalid month "${month}", expected YYYY-MM`);
    }
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
}