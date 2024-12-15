import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './router';
import express from 'express';
import cors from 'cors';
import { expressjwt, type GetVerificationKey } from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
import {createContext} from "./trpc";
import {SchedulerService} from "./services/scheduler.service";

const app = express();
const isProduction = process.env.ENVIRONMENT === 'production';
if(!isProduction) {
    app.use(cors());
}

export const secured = (req: any, res: any, next: any) => expressjwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 1,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as unknown as GetVerificationKey,
  getToken: (req: any) => {
    return req?.headers?.authorization?.replace('Bearer ', '') ?? '';
  },
  audience: process.env.AUTH0_AUDIENCE,
  algorithms: ['RS256'],
})(req, res, next) as Promise<void>
// created for each request

app.use(
    '/trpc',
    secured,
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
);
SchedulerService();
console.log(`Listening for requests on port ${isProduction ? 80 : 4201}`);
app.listen(isProduction ? 80 : 4201);
