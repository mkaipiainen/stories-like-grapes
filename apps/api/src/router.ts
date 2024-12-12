import { router } from './trpc.js';
import plantRouter from './routers/plant.router.js';
import {imageRouter} from "./routers/image.router.js";
import {tagRouter} from "./routers/tag.router.js";
export const appRouter = router({
  plant: plantRouter,
  image: imageRouter,
  tag: tagRouter
});

export type AppRouter = typeof appRouter;
