import { trpc } from '@/util/trpc.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { httpBatchLink } from '@trpc/client';
import { useAuth0 } from '@auth0/auth0-react';
import { Provider } from 'react-redux';
import { store } from '@store/store.ts';
import { createTheme, MantineProvider } from '@mantine/core';
const theme = createTheme({
  /** Put your mantine theme override here */
});
export const Layout: FC<{ children: any }> = ({ children }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${window.location.origin}/trpc`,
          // You can pass any HTTP headers you wish here
          async headers() {
            const token = await getAccessTokenSilently();
            return {
              authorization: `Bearer ${token}`,
            };
          },
        }),
      ],
    }),
  );
  return (
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </trpc.Provider>
      </MantineProvider>
    </Provider>
  );
};
