import { Routes } from '@angular/router';
import { ErrorPageComponent } from './modules/error-page/error-page.component';
import { roleGuard } from './modules/gaurds/single-role.gaurd';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.route').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'owner',
    canActivate: [roleGuard],
    data: { role: 'owner' },
    loadChildren: () =>
      import('./modules/owner/owner.route').then((m) => m.OWNER_ROUTES),
  },
  {
    path: 'renter',
    canActivate: [roleGuard],
    data: { role: 'renter' },
    loadChildren: () =>
      import('./modules/renter/renter.route').then((m) => m.RENTER_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { role: 'admin' },
    loadChildren: () =>
      import('./modules/admin/admin.route').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    component: ErrorPageComponent, // 404 page for unmatched routes
  },
];
