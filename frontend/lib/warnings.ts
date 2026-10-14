import { formatAmount } from './money';
import type { BudgetWarning } from './types';

export function describeWarning(warning: BudgetWarning): string {
    return (
        `Limite mensuelle de « ${warning.categoryName} » dépassée : ` +
        `${formatAmount(warning.spent)} dépensés ce mois-ci pour une limite de ` +
        `${formatAmount(warning.limit)} (dépassement de ${formatAmount(warning.exceededBy)}).`
    );
}