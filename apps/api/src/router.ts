import { router } from './trpc.js';
import plantRouter from './routers/plant.router.js';
export const appRouter = router({
  plant: plantRouter,
});

export type AppRouter = typeof appRouter;
