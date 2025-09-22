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
    idFront: string;
    idBack: string;
    selfie: string;
  }): Observable<any> {
    return this.authService.post(this.apiUrl, data);
  }
}
