import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class OrderItemDto {
  @IsNumber()
  @IsPositive()
  readonly productId: number;

  @IsInt()
  @IsPositive()
  readonly quantity: number;
}
