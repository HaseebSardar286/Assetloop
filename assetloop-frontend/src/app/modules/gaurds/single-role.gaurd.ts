import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const expectedRole = route.data['role']; // Role is passed via route data

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Check if user has the required role
  if (authService.hasRole(expectedRole)) {
    return true; // Allow navigation
  }

  // User is authenticated but doesn't have the required role
  const userRole = authService.getUserRole();
  if (userRole) {
    // Redirect to their appropriate dashboard
    switch (userRole) {
      case 'owner':
        router.navigate(['/owner/dashboard']);
        break;
      case 'renter':
        router.navigate(['/renter/dashboard']);
        break;
      case 'admin':
        router.navigate(['/admin/dashboard']);
        break;
      default:
        router.navigate(['/']);
    }
  } else {
    router.navigate(['/auth/login']);
  }
  
  return false; // Deny navigation
};
