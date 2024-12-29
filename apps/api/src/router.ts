import { router } from './trpc';
import plantRouter from './routers/plant.router';
import { imageRouter } from './routers/image.router';
import { tagRouter } from './routers/tag.router';
import { subscriptionRouter } from './routers/subscription.router';
export const appRouter = router({
  plant: plantRouter,
  image: imageRouter,
  tag: tagRouter,
  sub: subscriptionRouter,
});

export type AppRouter = typeof appRouter;
