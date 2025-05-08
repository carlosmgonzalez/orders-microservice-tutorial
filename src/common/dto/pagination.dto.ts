import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  readonly limit?: number = 10;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  readonly page?: number = 1;
}
