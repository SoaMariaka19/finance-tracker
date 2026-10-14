import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsDate,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export class AddTransactionDto {
    @IsUUID()
    accountId: string;

    @IsUUID()
    categoryId: string;

    @IsEnum(TransactionType)
    type: TransactionType;

    @IsInt()
    @Min(1)
    @Max(1_000_000_000)
    amount: number;

    @Type(() => Date)
    @IsDate()
    date: Date;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    note?: string;
}