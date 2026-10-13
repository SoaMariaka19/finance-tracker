import { Injectable } from '@nestjs/common';
import { Account, AccountType } from '@prisma/client';
import { AccountRepository } from '../domain/account.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaAccountRepository extends AccountRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    create(data: {
        name: string;
        type: AccountType;
        balance: number;
    }): Promise<Account> {
        return this.prisma.account.create({ data });
    }

    findById(id: string): Promise<Account | null> {
        return this.prisma.account.findUnique({ where: { id } });
    }

    countTransactions(accountId: string): Promise<number> {
        return this.prisma.transaction.count({ where: { accountId } });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.account.delete({ where: { id } });
    }
}