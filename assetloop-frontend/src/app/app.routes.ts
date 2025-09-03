import { Routes } from '@angular/router';
import { ErrorPageComponent } from './modules/error-page/error-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'renter/home',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.route').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'owner',
    loadChildren: () =>
      import('./modules/owner/owner.route').then((m) => m.OWNER_ROUTES),
  },
  {
    path: 'renter',
    loadChildren: () =>
      import('./modules/renter/renter.route').then((m) => m.RENTER_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.route').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    component: ErrorPageComponent,
  },
];
