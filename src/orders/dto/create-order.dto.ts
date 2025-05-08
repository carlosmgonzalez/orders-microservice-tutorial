import {
  IsNumber,
  IsPositive,
  Min,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { OrderStatus } from 'generated/prisma';

export const OrderStatusList = [
  OrderStatus.CANCELLED,
  OrderStatus.DELIVERED,
  OrderStatus.PENDING,
];

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  readonly totalAmount: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  readonly totalItems: number;

  @IsBoolean()
  @IsOptional()
  readonly paid?: boolean = false;

  @IsEnum(OrderStatusList, {
    message: `Posible status values are: ${JSON.stringify(OrderStatusList, null, 2)}`,
  })
  @IsOptional()
  readonly status: OrderStatus = OrderStatus.PENDING;
}
