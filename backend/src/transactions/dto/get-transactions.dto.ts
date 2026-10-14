import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsUUID } from 'class-validator';

export class GetTransactionsDto {
    @IsOptional()
    @IsUUID()
    accountId?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    from?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    to?: Date;
}