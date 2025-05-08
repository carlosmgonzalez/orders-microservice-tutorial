import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { OrderStatus } from 'generated/prisma';
import { OrderStatusList } from './create-order.dto';

export class PaginationOrdersDto extends PaginationDto {
  @IsEnum(OrderStatusList, {
    message: `Order status posible values are: ${JSON.stringify(OrderStatusList)}`,
  })
  @IsOptional()
  readonly status?: OrderStatus;
}
