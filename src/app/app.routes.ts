import { Routes } from '@angular/router';
import { UsersComponent } from './features/users/users';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'users',
  },
  {
    path: 'users',
    component: UsersComponent,
  },
  {
    path: 'unauthorized',
    redirectTo: 'users',
  },
  {
    path: '**',
    redirectTo: 'users',
  },
];
