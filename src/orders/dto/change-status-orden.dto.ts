import { IsEnum, IsUUID } from 'class-validator';
import { OrderStatus } from 'generated/prisma';
import { OrderStatusList } from './create-order.dto';

export class ChangeOrderStatusDto {
  @IsUUID()
  readonly id: string;

  @IsEnum(OrderStatusList)
  readonly status: OrderStatus;
}
