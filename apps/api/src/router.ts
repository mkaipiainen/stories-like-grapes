import { router } from './trpc';
import plantRouter from './routers/plant.router';
import { imageRouter } from './routers/image.router';
import { tagRouter } from './routers/tag.router';
import { subscriptionRouter } from './routers/subscription.router';
import { authRouter } from './routers/auth.router';
import { tenantRouter } from './routers/tenant.router';
export const appRouter = router({
  plant: plantRouter,
  auth: authRouter,
  image: imageRouter,
  tag: tagRouter,
  sub: subscriptionRouter,
  tenant: tenantRouter,
});

export type AppRouter = typeof appRouter;
