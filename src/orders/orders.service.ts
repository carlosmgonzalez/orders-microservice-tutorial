import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, PrismaClient } from '../../generated/prisma';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationOrdersDto } from './dto/pagination-orders.dto';
import { ChangeOrderStatusDto } from './dto/change-status-orden.dto';
import { NATS_SERVICE } from 'src/config/services';
import { firstValueFrom } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  price: number;
}

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrderService');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const ids = createOrderDto.items.map((item) => item.productId);

      const products: Product[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, ids),
      );

      const totalAmount = createOrderDto.items.reduce((acc, item) => {
        const price = products.find((pr) => pr.id === item.productId)!.price;

        acc += price * item.quantity;

        return acc;
      }, 0);

      const totalItems = createOrderDto.items.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );

      // Crear una transaccion de base de datos;
      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          orderItem: {
            createMany: {
              data: createOrderDto.items.map(({ productId, quantity }) => {
                const price = products.find((p) => p.id === productId)!.price;
                return {
                  productId,
                  price,
                  quantity,
                };
              }),
            },
          },
        },
        include: {
          orderItem: {
            select: {
              productId: true,
              price: true,
              quantity: true,
            },
          },
        },
      });

      return {
        ...order,
        orderItem: order.orderItem.map((item) => {
          return {
            name: products.find((p) => p.id === item.productId)?.name,
            ...item,
          };
        }),
      };
    } catch (error) {
      throw new RpcException(error as object);
    }
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
    try {
      const order = await this.order.findUnique({
        where: { id },
        include: {
          orderItem: {
            select: {
              productId: true,
              price: true,
              quantity: true,
            },
          },
        },
      });

      if (!order)
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Order with id ${id} not found`,
        });

      const productsIds = order.orderItem.map((item) => item.productId);

      const products: Product[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, productsIds),
      );

      return {
        ...order,
        orderItem: order.orderItem.map((item) => {
          return {
            name: products.find((p) => p.id === item.productId)?.name,
            ...item,
          };
        }),
      };
    } catch (error) {
      throw new RpcException(error as object);
    }
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
