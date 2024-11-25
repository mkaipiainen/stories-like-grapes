import { useAuth0 } from '@auth0/auth0-react';
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  ApolloProvider,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useRef } from 'react';

export function ApolloProviderWithAuth0(props: { children: any }) {
  const { getAccessTokenSilently } = useAuth0();

  const httpLink = new HttpLink({
    uri: '/graphql',
    credentials: 'same-origin',
  });

  const authLink = setContext(async (_, { headers, ...rest }) => {
    let token;
    try {
      token = await getAccessTokenSilently();
      console.log('Here we are', token);
    } catch (error) {
      console.log(error);
    }

    if (!token) return { headers, ...rest };

    return {
      ...rest,
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    };
  });

  const client = useRef(
    new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    }),
  );

  return (
    <ApolloProvider client={client.current}>{props.children}</ApolloProvider>
  );
}
