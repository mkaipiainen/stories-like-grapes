import { createBrowserRouter } from 'react-router-dom';
import { ContentPage } from './pages/content/content.page';
import { PlantMinderPage } from './pages/plant-minder/plant-minder.page';
import type { Router as RemixRouter } from '@remix-run/router/dist/router';

export const routes: RemixRouter = createBrowserRouter([
  {
    path: '/',
    element: <ContentPage />,
    children: [
      {
        path: 'plant-minder',
        element: <PlantMinderPage />,
      },
    ],
  },
]);
