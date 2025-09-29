import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class VerificationService {
  private apiUrl = 'http://localhost:5000/api/auth/verification';

  constructor(private authService: AuthService) {}

  submitVerification(formData: FormData): Observable<any> {
    return this.authService.post(this.apiUrl, formData); // AuthService.post should handle FormData
  }
}
