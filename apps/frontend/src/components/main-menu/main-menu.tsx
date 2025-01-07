import { faCalendar, faHouse, faLeaf } from '@fortawesome/free-solid-svg-icons';
import { MainMenuRoute } from '@/src/components/main-menu/main-menu-route.tsx';

export function MainMenu() {
  const routes = [
    {
      route: '',
      icon: faHouse,
    },
    {
      route: '/calendar',
      icon: faCalendar,
    },
    {
      route: '/plant-minder/list',
      icon: faLeaf,
    },
  ];
  return (
    <div className={'flex-initial h-24 flex items-center'}>
      {routes.map((route) => {
        return (
          <MainMenuRoute route={route.route} icon={route.icon}></MainMenuRoute>
        );
      })}
    </div>
  );
}
