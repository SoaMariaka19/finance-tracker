import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { DeleteAccountHandler } from './delete-account.handler';
import { DeleteAccountCommand } from './delete-account.command';
import { AccountRepository } from '../domain/account.repository';
import {
    AccountHasTransactionsException,
    AccountNotFoundException,
} from '../domain/account.exceptions';

describe('DeleteAccountHandler', () => {
    let repository: Mocked<AccountRepository>;
    let handler: DeleteAccountHandler;

    const existingAccount = {
        id: 'acc-1',
        name: 'Compte courant',
        type: 'CHECKING' as const,
        balance: 10000,
        createdAt: new Date(),
    };

    beforeEach(() => {
        repository = {
            create: vi.fn(),
            findById: vi.fn(),
            countTransactions: vi.fn(),
            delete: vi.fn(),
        } as unknown as Mocked<AccountRepository>;
        handler = new DeleteAccountHandler(repository);
    });

    it('deletes an account that has no transactions', async () => {
        repository.findById.mockResolvedValue(existingAccount);
        repository.countTransactions.mockResolvedValue(0);

        await handler.execute(new DeleteAccountCommand('acc-1'));

        expect(repository.delete).toHaveBeenCalledWith('acc-1');
    });

    it('refuses to delete an account that has transactions', async () => {
        repository.findById.mockResolvedValue(existingAccount);
        repository.countTransactions.mockResolvedValue(3);

        await expect(
            handler.execute(new DeleteAccountCommand('acc-1')),
        ).rejects.toBeInstanceOf(AccountHasTransactionsException);
        expect(repository.delete).not.toHaveBeenCalled();
    });

    it('throws when the account does not exist', async () => {
        repository.findById.mockResolvedValue(null);

        await expect(
            handler.execute(new DeleteAccountCommand('missing')),
        ).rejects.toBeInstanceOf(AccountNotFoundException);
        expect(repository.delete).not.toHaveBeenCalled();
    });
});