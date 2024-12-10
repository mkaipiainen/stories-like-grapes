import { trpc } from '@/src/util/trpc.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { httpBatchLink } from '@trpc/client';
import { useAuth0 } from '@auth0/auth0-react';
import { Provider } from 'react-redux';
import { store } from '@/src/stores/store.ts';
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import superjson from 'superjson';

const theme = createTheme({
  /** Put your mantine theme override here */
});
export const Layout: FC<{ children: any }> = ({ children }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [queryClient] = useState(() => new QueryClient());
  const isProduction = import.meta.env.MODE === 'production';

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${isProduction ? window.location.origin : 'http://localhost:4201'}/trpc`,
          // You can pass any HTTP headers you wish here
          async headers() {
            const token = await getAccessTokenSilently();
            return {
              authorization: `Bearer ${token}`,
            };
          },
        }),
      ],
      transformer: superjson,
    }),
  );
  return (
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <Notifications />
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </trpc.Provider>
      </MantineProvider>
    </Provider>
  );
};
