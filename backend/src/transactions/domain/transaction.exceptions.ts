import { UnprocessableEntityException } from '@nestjs/common';

export class InsufficientFundsException extends UnprocessableEntityException {
    constructor() {
        super('Insufficient funds: this transaction would bring the account balance below zero');
    }
}