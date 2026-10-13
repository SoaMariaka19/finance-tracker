import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import {CategoriesModule} from "./categories/categories.module";

@Module({
  imports: [CqrsModule.forRoot(), PrismaModule, AccountsModule, CategoriesModule],
})
export class AppModule {}