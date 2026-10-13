import { Transform } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';

export class UpdateCategoryDto {
    @ValidateIf((_, value) => value !== undefined)
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    monthlyLimit?: number | null;
}