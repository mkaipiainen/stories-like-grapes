import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app.tsx';
import { store } from './stores/store.ts';
import { Provider } from 'react-redux';
import { createTheme, MantineProvider } from '@mantine/core';
import { Auth0Provider } from '@auth0/auth0-react';

const theme = createTheme({
  /** Put your mantine theme override here */
});

const isProduction = import.meta.env.MODE === 'production';
const clientId = isProduction
  ? 'vlPaAflsi4YGyYO7ssyEnjrQxvo4GtDs'
  : 'lqTQ2LfvM5yyicwSy5mCq6nPiVBWSPM7';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Auth0Provider
        domain="dev-ev7m3p4bucka4la6.us.auth0.com"
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
      >
        <MantineProvider theme={theme}>
          <App />
        </MantineProvider>
      </Auth0Provider>
    </Provider>
  </StrictMode>,
);
