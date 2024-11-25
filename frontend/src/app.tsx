import { RouterProvider } from 'react-router-dom';
import { routes } from './routes.tsx';

function App() {
  return (
    <div className={'fixed top-0 left-0 w-full h-full p-4 box-border'}>
      <RouterProvider router={routes} />
    </div>
  );
}

export default App;
