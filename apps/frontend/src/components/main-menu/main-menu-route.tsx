import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function MainMenuRoute(props: { route: string; icon: any }) {
  return (
    <NavLink
      className={({ isActive }) => {
        return `w-12 h-12 transition hover:bg-tertiary-700 color-tertiary-foreground hover:color-tertiary-foreground rounded border flex items-center justify-center bg-tertiary ${isActive ? 'bg-tertiary-800' : ''}`;
      }}
      to={props.route}
    >
      <FontAwesomeIcon icon={props.icon}></FontAwesomeIcon>
    </NavLink>
  );
}
