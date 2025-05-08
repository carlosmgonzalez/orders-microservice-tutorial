import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [OrdersModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
