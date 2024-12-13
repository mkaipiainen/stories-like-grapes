import { router } from './trpc';
import plantRouter from './routers/plant.router';
import {imageRouter} from "./routers/image.router";
import {tagRouter} from "./routers/tag.router";
export const appRouter = router({
  plant: plantRouter,
  image: imageRouter,
  tag: tagRouter
});

export type AppRouter = typeof appRouter;
