import { createBrowserRouter, Outlet, useNavigate } from 'react-router-dom';
import { PlantMinderPage } from './pages/plant-minder/plant-minder.page';
import type { Router as RemixRouter } from '@remix-run/router/dist/router';
import {
  Auth0Provider,
  useAuth0,
  withAuthenticationRequired,
} from '@auth0/auth0-react';
import { ComponentType, FC } from 'react';
import { LoadingOverlay } from '@mantine/core';
import { ApolloProviderWithAuth0 } from '@/apollo.tsx';

interface AuthenticationGuardProps {
  component: ComponentType; // Ensures `component` is a valid React component
}

const AuthenticationGuard: FC<AuthenticationGuardProps> = ({
  component,
  ...props
}) => {
  const { isLoading, isAuthenticated } = useAuth0();
  if (isLoading) {
    return (
      <LoadingOverlay
        visible={true}
        zIndex={1000}
        overlayProps={{ radius: 'lg', blur: 2 }}
        pos={'absolute'}
      ></LoadingOverlay>
    );
  } else {
    const Component = withAuthenticationRequired(component);
    return <Component {...props} />;
  }
};

export const Auth0ProviderWithNavigate: FC<{ children: any }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const isProduction = import.meta.env.MODE === 'production';

  const domain = 'dev-ev7m3p4bucka4la6.us.auth0.com';
  const clientId = isProduction
    ? 'vlPaAflsi4YGyYO7ssyEnjrQxvo4GtDs'
    : 'lqTQ2LfvM5yyicwSy5mCq6nPiVBWSPM7';
  const redirectUri = 'http://localhost:4200';

  const onRedirectCallback = (appState: any) => {
    console.log('REDIRECT', appState);
    navigate(appState?.returnTo || window.location.pathname);
  };
  console.log('AUTH0 AUDIENCE', import.meta.env.VITE_AUTH0_AUDIENCE);

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export const routes: RemixRouter = createBrowserRouter([
  {
    path: '',
    element: (
      <Auth0ProviderWithNavigate>
        <ApolloProviderWithAuth0>
          <Outlet />
        </ApolloProviderWithAuth0>
      </Auth0ProviderWithNavigate>
    ),
    errorElement: (
      <h1
        className={
          'w-full h-full fixed top-0 left-0 flex justify-center items-center'
        }
      >
        404 - Page not found
      </h1>
    ),
    children: [
      {
        path: 'plant-minder',
        element: <AuthenticationGuard component={PlantMinderPage} />,
      },
    ],
  },
]);
