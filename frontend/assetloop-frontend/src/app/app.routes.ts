import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './modules/auth/register/register.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { UserVerificationComponent } from './modules/auth/user-verification/user-verification.component';
import { RenterDashboardComponent } from './modules/renter/renter-dashboard/renter-dashboard.component';
import { ErrorPageComponent } from './modules/error-page/error-page.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'verification', component: UserVerificationComponent },
  { path: '', component: RenterDashboardComponent },
  // {
  //   path: '',
  //   component: LayoutComponent,
  //   loadChildren: () => import('./views/views.route').then((mod) => mod.VIEWS_ROUTES),
  //   canActivate: [
  //     (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  //       const router = inject(Router);
  //       const authService = inject(AuthenticationService);
  //       if (!authService.session) {
  //         return router.createUrlTree(['/auth/login'], {
  //           queryParams: { returnUrl: state.url },
  //         });
  //       }
  //       return true;
  //     },
  //   ],
  // },
  // {
  //   path: 'auth',
  //   component: AuthLayoutComponent,
  //   loadChildren: () => import('./views/auth/auth.route').then((mod) => mod.AUTH_ROUTES),
  // },
  {
    path: '**',
    component: ErrorPageComponent,
  },
];
