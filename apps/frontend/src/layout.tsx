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
  colors: {
    primary: [
      '#f2f8e7',
      '#ddecc3',
      '#c6e09c',
      '#afd373',
      '#9dca52',
      '#8cc130',
      '#7cb128',
      '#679d1e',
      '#538a14',
      '#2c6800',
    ],
    secondary: [
      '#fbfae6',
      '#f5f2c2',
      '#eee89b',
      '#e8e075',
      '#e4da5a',
      '#e1d442',
      '#dec33c',
      '#dbad34',
      '#d7972b',
      '#cf721d',
    ],
    tertiary: [
      '#e0f2f2',
      '#b2dfde',
      '#80cbc9',
      '#4db6b2',
      '#26a6a0',
      '#00968f',
      '#008981',
      '#017971',
      '#036961',
      '#044d44',
    ],
    background: [
      '#fbf7ea',
      '#efd6a5',
      '#e3bc6b',
      '#d9a22c',
      '#d28f00',
      '#cd7d00',
      '#ca7300',
      '#c66400',
      '#c05400',
      '#b83900',
    ],
  },
  primaryColor: 'primary',
  fontFamily: 'Cabin, sans-serif',
  headings: {
    fontFamily: 'Libre Franklin, sans-serif',
  },
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
          async headers() {
            const token = await getAccessTokenSilently();
            return {
              authorization: `Bearer ${token}`,
            };
          },
          transformer: superjson,
        }),
      ],
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
