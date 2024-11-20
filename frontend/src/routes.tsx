import { createBrowserRouter } from 'react-router-dom';
import { ContentPage } from './pages/content/content.page';
import { PlantMinderPage } from './pages/plant-minder/plant-minder.page';
import type { Router as RemixRouter } from '@remix-run/router/dist/router';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Box, LoadingOverlay } from '@mantine/core';
import { ComponentType, FC } from 'react';

interface AuthenticationGuardProps {
  component: ComponentType; // Ensures `component` is a valid React component
}

const AuthenticationGuard: FC<AuthenticationGuardProps> = ({ component }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <Box
        className={
          'fixed top-0 left-0 w-full h-full flex justify-center items-center'
        }
      >
        <LoadingOverlay
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
      </Box>
    ),
  });

  return <Component />;
};

export const routes: RemixRouter = createBrowserRouter([
  {
    path: '/',
    element: <ContentPage />,
    children: [
      {
        path: 'plant-minder',
        element: <AuthenticationGuard component={PlantMinderPage} />,
      },
    ],
  },
]);
