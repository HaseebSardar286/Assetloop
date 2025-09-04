// src/app/guards/dual-role.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const dualRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('authToken');

  if (token) {
    const decoded = authService.decodeToken(token);
    const roles = decoded?.roles || [];
    if (roles.includes('owner') && roles.includes('renter')) {
      return true; // Allow navigation
    }
  }
  router.navigate(['/unauthorized']); // Redirect to an unauthorized page
  return false; // Deny navigation
};
