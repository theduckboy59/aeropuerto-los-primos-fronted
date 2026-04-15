import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Portal } from './features/portal/portal';
import { Register } from './features/register/register';
import { Users } from './features/users/users';

export const routes: Routes = [
  {
    path: '',
    component: Portal
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'users',
    component: Users
  },
];
