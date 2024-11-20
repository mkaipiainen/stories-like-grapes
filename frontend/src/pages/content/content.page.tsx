import React from 'react';
import { Outlet } from 'react-router-dom';

export function ContentPage() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}
