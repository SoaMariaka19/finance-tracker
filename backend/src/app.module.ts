import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';

@Module({
  imports: [CqrsModule.forRoot(), PrismaModule, AccountsModule],
})
export class AppModule {}