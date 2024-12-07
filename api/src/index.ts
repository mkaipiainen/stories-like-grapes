import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './router';

createHTTPServer({
  router: appRouter,
  createContext() {
    return {};
  },
}).listen(80);