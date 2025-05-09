import 'dotenv/config';
import * as joi from 'joi';

interface Envs {
  PORT: number;
  NATS_SERVERS: string[];
  PRODUCTS_MICROSERVICE_HOST: string;
  PRODUCTS_MICROSERVICE_PORT: number;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    PRODUCTS_MICROSERVICE_HOST: joi.string().required(),
    PRODUCTS_MICROSERVICE_PORT: joi.number().required(),
  })
  .unknown();

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { value, error } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) throw new Error(`Config validation error: ${error.message}`);

const {
  PORT,
  NATS_SERVERS,
  PRODUCTS_MICROSERVICE_HOST,
  PRODUCTS_MICROSERVICE_PORT,
} = value as Envs;

export const envs = {
  port: PORT,
  natsServers: NATS_SERVERS,
  productsMicroserviceHost: PRODUCTS_MICROSERVICE_HOST,
  productsMicroservicePort: PRODUCTS_MICROSERVICE_PORT,
};
