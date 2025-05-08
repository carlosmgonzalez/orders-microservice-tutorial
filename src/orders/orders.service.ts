import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, PrismaClient } from '../../generated/prisma';
import { RpcException } from '@nestjs/microservices';
import { PaginationOrdersDto } from './dto/pagination-orders.dto';
import { ChangeOrderStatusDto } from './dto/change-status-orden.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrderService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({
      data: createOrderDto,
    });
  }

  async findAll(paginationOrdersDto: PaginationOrdersDto) {
    const { status, page, limit } = paginationOrdersDto;
    const skip = limit! * (page! - 1);

    let totalOrders: number;
    let orders: Order[];

    if (!status) {
      totalOrders = await this.order.count({
        where: {
          status,
        },
      });

      orders = await this.order.findMany({
        where: {
          status,
        },
        skip,
        take: limit,
      });
    } else {
      totalOrders = await this.order.count({
        where: {
          status,
        },
      });

      orders = await this.order.findMany({
        where: {
          status,
        },
        skip,
        take: limit,
      });
    }

    const totalPages = Math.ceil(totalOrders / limit!);

    if (page! > totalPages)
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Number of max pages is ${totalPages}`,
      });

    return {
      meta: {
        totalPages,
        page,
      },
      orders,
    };
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: { id },
    });

    if (!order)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
      });

    return order;
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;

    await this.findOne(id);

    return this.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}
