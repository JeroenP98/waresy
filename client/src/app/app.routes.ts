import { Routes } from '@angular/router';
import {LayoutComponent} from './core/layout/layout.component';
import {DashboardComponent} from './features/dashboard/dashboard/dashboard.component';
import {LoginComponent} from './core/auth/pages/login/login.component';
import {AuthGuard} from './core/auth/guards/auth.guard';
import {SuppliersComponent} from './features/suppliers/pages/suppliers/suppliers.component';
import {AssetTypeComponent} from './features/asset-types/pages/asset-type/asset-type.component';
import {AssetsComponent} from './features/assets/pages/assets/assets.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'suppliers', component: SuppliersComponent },
      { path: 'asset-types', component: AssetTypeComponent},
      { path: 'assets', component: AssetsComponent}
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];
