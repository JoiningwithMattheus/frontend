import { Routes } from '@angular/router';
import { UsersComponent } from './features/users/users';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'journal',
  },
  {
    path: 'users',
    component: UsersComponent,
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks').then((m) => m.TaskComponent),
  },
  {
    path: 'journal',
    loadComponent: () =>
      import('./journal/journal').then((m) => m.JournalComponent),
  },
  {
    path: 'unauthorized',
    redirectTo: 'journal',
  },
  {
    path: '**',
    redirectTo: 'journal',
  },
];
