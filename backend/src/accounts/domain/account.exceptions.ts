import { ConflictException, NotFoundException } from '@nestjs/common';

export class AccountNotFoundException extends NotFoundException {
    constructor(accountId: string) {
        super(`Account ${accountId} not found`);
    }
}

export class AccountHasTransactionsException extends ConflictException {
    constructor(accountId: string) {
        super(`Account ${accountId} has transactions and cannot be deleted`);
    }
}