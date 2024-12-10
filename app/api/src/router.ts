import { router } from './trpc';
import plantRouter from './routers/plant.router';
export const appRouter = router({
  plant: plantRouter,
});

export type AppRouter = typeof appRouter;
