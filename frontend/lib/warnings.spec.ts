import { describe, expect, it } from 'vitest';
import { describeWarning } from './warnings';

describe('describeWarning', () => {
    it('states the category, the total spent, the limit and the overrun', () => {
        const text = describeWarning({
            type: 'CATEGORY_LIMIT_EXCEEDED',
            categoryId: 'cat-1',
            categoryName: 'Food',
            limit: 30000,
            spent: 31000,
            exceededBy: 1000,
        });

        expect(text.replace(/\s/g, ' ')).toBe(
            'Limite mensuelle de « Food » dépassée : 310,00 € dépensés ce mois-ci ' +
            'pour une limite de 300,00 € (dépassement de 10,00 €).',
        );
    });
});