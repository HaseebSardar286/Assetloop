import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // { path: '', redirectTo: '/renter/search', pathMatch: 'full' },
  // { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },
  // { path: 'renter', loadChildren: () => import('./modules/renter/renter.module').then(m => m.RenterModule), canActivate: [AuthGuard] },
  // { path: 'owner', loadChildren: () => import('./modules/owner/owner.module').then(m => m.OwnerModule), canActivate: [AuthGuard] },
  // { path: 'admin', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule), canActivate: [AuthGuard] },
  // { path: '**', redirectTo: '/renter/search' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
