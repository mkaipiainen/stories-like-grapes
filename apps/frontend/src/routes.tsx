import { createBrowserRouter, Outlet, useNavigate } from 'react-router-dom';
import { PlantMinderPage } from './pages/plant-minder/plant-minder.page';
import {
  Auth0Provider,
  useAuth0,
  withAuthenticationRequired,
} from '@auth0/auth0-react';
import { ComponentType, FC } from 'react';
import { LoadingOverlay } from '@mantine/core';
import { Layout } from '@/src/layout.tsx';
import { PlantMinderListPage } from '@/src/pages/plant-minder/list/plant-minder.list.page.tsx';
import { PlantMinderCreatePage } from '@/src/pages/plant-minder/create/plant-minder.create.page.tsx';
import { PlantMinderRedirect } from '@/src/pages/plant-minder/plant-minder-redirect.tsx';
import { PlantMinderDetailPage } from '@/src/pages/plant-minder/detail/plant-minder.detail.page.tsx';
import { LandingPage } from '@/src/pages/landing/landing.page.tsx';
import { AppWrapper } from '@/src/app-wrapper.tsx';

interface AuthenticationGuardProps {
  component: ComponentType; // Ensures `component` is a valid React component
}

const AuthenticationGuard: FC<AuthenticationGuardProps> = ({
  component,
  ...props
}) => {
  const { isLoading } = useAuth0();
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
  const redirectUri = window.location.origin;

  const onRedirectCallback = (appState: any) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

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

export const routes = createBrowserRouter([
  {
    path: '',
    element: (
      <Auth0ProviderWithNavigate>
        <Layout>
          <AppWrapper>
            <Outlet />
          </AppWrapper>
        </Layout>
      </Auth0ProviderWithNavigate>
    ),
    children: [
      {
        path: '',
        element: <AuthenticationGuard component={LandingPage} />,
      },
      {
        path: 'plant-minder',
        element: <AuthenticationGuard component={PlantMinderPage} />,
        children: [
          {
            index: true,
            element: <AuthenticationGuard component={PlantMinderRedirect} />,
          },
          {
            path: 'new',
            element: <PlantMinderCreatePage />,
          },
          {
            path: 'list',
            element: <PlantMinderListPage />,
          },
          {
            path: 'detail/:id',
            element: <PlantMinderDetailPage />,
          },
        ],
      },
    ],
  },
]);
