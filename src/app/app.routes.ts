import { Routes } from '@angular/router';
import { UsersComponent } from './features/users/users';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'users',
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [authGuard],
  },
];
