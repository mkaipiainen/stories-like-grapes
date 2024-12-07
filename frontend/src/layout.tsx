import { trpc } from '@/util/trpc.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { httpBatchLink } from '@trpc/client';
import { useAuth0 } from '@auth0/auth0-react';

export const Layout: FC<{ children: any }> = ({ children }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:4200/trpc',
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
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
