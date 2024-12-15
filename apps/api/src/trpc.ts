import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import * as trpcExpress from "@trpc/server/adapters/express";

export const createContext = ({req}: trpcExpress.CreateExpressContextOptions) => {
  return {
    user: 'auth' in req ? req.auth : null
  } as {
    user: Record<string, any>
  }
}
export type Context = Awaited<ReturnType<typeof createContext>>;
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

