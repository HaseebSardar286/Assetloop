import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class VerificationService {
  private apiUrl = 'http://localhost:5000/api/auth/verification';

  constructor(private authService: AuthService) {}

  submitVerification(data: {
    fullName: string;
    dateOfBirth: string;
    issueDate: string;
    expiryDate: string;
    cnicNumber: string;
    address: string;
    idFront: string; // base64 data URL
    idBack: string; // base64 data URL
    selfie: string; // base64 data URL
    pendingUserId?: string;
  }): Observable<any> {
    // Send JSON with base64 strings
    return this.authService.post(this.apiUrl, data);
  }
}
