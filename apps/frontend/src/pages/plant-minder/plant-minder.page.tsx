import { Outlet } from 'react-router-dom';

export function PlantMinderPage() {
  return (
    <div className={'flex flex-col h-full w-full max-w-5xl overflow-y-scroll'}>
      <Outlet></Outlet>
    </div>
  );
}
