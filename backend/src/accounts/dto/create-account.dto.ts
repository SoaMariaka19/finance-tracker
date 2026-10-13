import { AccountType } from '@prisma/client';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateAccountDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsEnum(AccountType)
    type: AccountType;

    @IsOptional()
    @IsInt()
    @Min(0)
    initialBalance?: number; // en centimes
}