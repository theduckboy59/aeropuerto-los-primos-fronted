import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Users } from './features/users/users';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'users',
    component: Users
  },
];
