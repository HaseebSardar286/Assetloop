import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('authToken');
  const expectedRole = route.data['role']; // Role is passed via route data

  if (token) {
    const decoded = authService.decodeToken(token);
    const role = decoded?.role; // Assuming single role for now
    if (role === expectedRole) {
      return true; // Allow navigation
    }
  }
  router.navigate(['/unauthorized']); // Redirect to unauthorized page
  return false; // Deny navigation
};
