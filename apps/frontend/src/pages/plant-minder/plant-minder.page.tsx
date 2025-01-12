import { Outlet } from 'react-router-dom';
import { Image } from '@mantine/core';
import background from '@/src/assets/images/plant-background.webp';

export function PlantMinderPage() {
  return (
    <div
      className={
        'flex flex-col h-full w-full max-w-5xl relative overflow-y-auto'
      }
    >
      <Image
        src={background}
        style={{ filter: 'url(#bg-filter)' }}
        className={'absolute h-full w-full opacity-50 object-contain -z-10'}
      ></Image>
      <svg
        className={'fixed top-0 left-0'}
        height="0"
        width="0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="bg-filter" x="0" y="0" xmlns="http://www.w3.org/2000/svg">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>
        <rect width="90" height="90" fill="yellow" filter="url(#f1)" />
      </svg>
      <Outlet></Outlet>
    </div>
  );
}
