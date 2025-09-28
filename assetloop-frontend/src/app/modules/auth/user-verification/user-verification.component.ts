import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../interfaces/user';
import { VerificationService } from '../../../services/verification.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-verification',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-verification.component.html',
  styleUrls: ['./user-verification.component.css'],
})
export class UserVerificationComponent implements OnInit {
  currentStep = 1;
  progress = 25; // 25% per step
  role: string = 'user';
  error: string | null = null;
  user: User | null = null;

  verificationData = {
    fullName: '',
    dateOfBirth: '',
    issueDate: '',
    expiryDate: '',
    cnicNumber: '',
    address: '',
    idFront: '',
    idBack: '',
    selfie: '',
  };

  idFrontName: string | null = null;
  idBackName: string | null = null;
  selfieName: string | null = null;

  constructor(
    private verificationService: VerificationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.role = this.authService.getUserRole() || 'user';
    // If redirected from register, capture pendingUserId
    this.route.queryParams.subscribe((params) => {
      const pendingUserId = params['pendingUserId'];
      if (pendingUserId) {
        // Attach to payload on submit via closure variable
        (this.verificationData as any).pendingUserId = pendingUserId;
      }
    });
    if (this.user) {
      this.verificationData.fullName = `${this.user.firstName} ${
        this.user.middleName ? this.user.middleName + ' ' : ''
      }${this.user.lastName}`;
      this.verificationData.address = this.user.address || '';
    }
  }

  onFileChange(event: any, type: string): void {
    const file = event.target.files[0];
    if (!file) {
      this.error = 'Please select a file!';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'File size must be under 5MB!';
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.error = 'File must be an image (jpg, jpeg, png)!';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1]; // Remove data:image/...;base64, prefix
      if (type === 'idFront') {
        this.verificationData.idFront = base64String;
        this.idFrontName = file.name;
      }
      if (type === 'idBack') {
        this.verificationData.idBack = base64String;
        this.idBackName = file.name;
      }
      if (type === 'selfie') {
        this.verificationData.selfie = base64String;
        this.selfieName = file.name;
      }
      this.error = null;
    };
    reader.onerror = () => {
      this.error = 'Error reading file!';
    };
    reader.readAsDataURL(file);
  }

  nextStep(form: NgForm): void {
    if (form.invalid) {
      this.error = 'Please fill all required fields!';
      form.form.markAllAsTouched();
      return;
    }
    if (
      this.currentStep === 1 &&
      (!this.verificationData.idFront || !this.verificationData.idBack)
    ) {
      this.error = 'Please upload both ID front and back images!';
      return;
    }
    if (this.currentStep === 3 && !this.verificationData.selfie) {
      this.error = 'Please upload your selfie!';
      return;
    }
    if (this.currentStep < 4) {
      this.currentStep++;
      this.progress += 25;
      this.error = null;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.progress -= 25;
      this.error = null;
    }
  }

  submit(): void {
    if (
      !this.verificationData.idFront ||
      !this.verificationData.idBack ||
      !this.verificationData.selfie
    ) {
      this.error = 'Please upload all required files!';
      return;
    }
    if (
      !this.verificationData.fullName ||
      !this.verificationData.dateOfBirth ||
      !this.verificationData.issueDate ||
      !this.verificationData.expiryDate ||
      !this.verificationData.cnicNumber ||
      !this.verificationData.address
    ) {
      this.error = 'Please fill all required fields!';
      return;
    }

    this.verificationService
      .submitVerification(this.verificationData)
      .subscribe({
        next: (response) => {
          alert(
            response.message ||
              'Verification submitted successfully. Please wait for admin approval.'
          );
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          console.error('Error submitting verification:', err);
          this.error =
            err.error?.message || 'Submission failed! Please try again.';
        },
      });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
