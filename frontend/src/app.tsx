import { RouterProvider } from 'react-router-dom';
import { routes } from './routes.tsx';
import { Fragment } from 'react';

function App() {
  return (
    <Fragment>
      <div className={'fixed top-0 left-0 w-full h-full p-4 box-border'}>
        <RouterProvider router={routes} />
      </div>
    </Fragment>
  );
}

export default App;
