import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import {CategoriesModule} from "./categories/categories.module";
import {TransactionsModule} from "./transactions/transactions.module";
import {SummaryModule} from "./summary/summary.module";
import {HealthController} from "./health/health.controller";

@Module({
  imports: [CqrsModule.forRoot(), PrismaModule, AccountsModule, CategoriesModule, TransactionsModule, SummaryModule],
  controllers: [HealthController],
})
export class AppModule {}