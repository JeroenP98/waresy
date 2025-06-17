import { Routes } from '@angular/router';
import {LayoutComponent} from './core/layout/layout.component';
import {DashboardComponent} from './features/dashboard/dashboard/dashboard.component';
import {LoginComponent} from './core/auth/pages/login/login.component';
import {AuthGuard} from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      //{ path: 'assets', component: AssetComponent },
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];
