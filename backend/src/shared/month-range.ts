export function monthRange(date: Date): { from: Date; to: Date } {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    return {
        from: new Date(Date.UTC(year, month, 1)),
        to: new Date(Date.UTC(year, month + 1, 1)),
    };
}