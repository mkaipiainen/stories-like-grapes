import { Redis } from 'ioredis';
const isProduction = process.env.ENVIRONMENT === 'production';

export const redis = new Redis({
  host: isProduction ? 'redis' : 'localhost',
  password: undefined,
});
