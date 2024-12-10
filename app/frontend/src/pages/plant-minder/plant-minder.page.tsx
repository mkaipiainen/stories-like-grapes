import { Outlet } from 'react-router-dom';

export function PlantMinderPage() {
  return (
    <div className={'flex flex-col h-full w-full'}>
      <Outlet></Outlet>
    </div>
  );
}