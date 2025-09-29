import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  progress = 25;
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
    pendingUserId: '',
  };

  idFrontFile: File | null = null;
  idBackFile: File | null = null;
  selfieFile: File | null = null;
  idFrontName: string | null = null;
  idBackName: string | null = null;
  selfieName: string | null = null;

  constructor(
    private verificationService: VerificationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.role = this.authService.getUserRole() || 'user';
    this.route.queryParams.subscribe((params) => {
      const pendingUserId = params['pendingUserId'];
      console.log('PendingUserId:', pendingUserId);
      if (pendingUserId) {
        this.verificationData.pendingUserId = pendingUserId;
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
      console.error(`No file selected for ${type}`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'File size must be under 5MB!';
      console.error(`File too large for ${type}: ${file.size} bytes`);
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.error = 'File must be an image (jpg, jpeg, png)!';
      console.error(`Invalid file type for ${type}: ${file.type}`);
      return;
    }

    if (type === 'idFront') {
      this.idFrontFile = file;
      this.idFrontName = file.name;
    }
    if (type === 'idBack') {
      this.idBackFile = file;
      this.idBackName = file.name;
    }
    if (type === 'selfie') {
      this.selfieFile = file;
      this.selfieName = file.name;
    }
    this.error = null;
    console.log(`File selected for ${type}: ${file.name} (${file.size} bytes)`);

    // Trigger change detection to stabilize bindings
    this.cdr.detectChanges();
  }

  nextStep(form: NgForm): void {
    console.log('Form State:', {
      valid: form.valid,
      touched: form.touched,
      values: form.value,
      verificationData: this.verificationData,
      files: {
        idFront: this.idFrontFile?.name,
        idBack: this.idBackFile?.name,
        selfie: this.selfieFile?.name,
      },
    });
    if (form.invalid) {
      this.error = 'Please fill all required fields!';
      form.form.markAllAsTouched();
      return;
    }
    if (this.currentStep === 1 && (!this.idFrontFile || !this.idBackFile)) {
      this.error = 'Please upload both ID front and back images!';
      console.error('Missing files:', {
        idFront: !!this.idFrontFile,
        idBack: !!this.idBackFile,
      });
      return;
    }
    if (this.currentStep === 3 && !this.selfieFile) {
      this.error = 'Please upload your selfie!';
      console.error('Missing selfie:', !!this.selfieFile);
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
    console.log('Submitting verification data:', {
      verificationData: this.verificationData,
      files: {
        idFront: this.idFrontFile?.name,
        idBack: this.idBackFile?.name,
        selfie: this.selfieFile?.name,
      },
    });
    if (!this.idFrontFile || !this.idBackFile || !this.selfieFile) {
      this.error = 'Please upload all required files!';
      console.error('Missing files:', {
        idFront: !!this.idFrontFile,
        idBack: !!this.idBackFile,
        selfie: !!this.selfieFile,
      });
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
      console.error('Missing fields:', {
        fullName: !!this.verificationData.fullName,
        dateOfBirth: !!this.verificationData.dateOfBirth,
        issueDate: !!this.verificationData.issueDate,
        expiryDate: !!this.verificationData.expiryDate,
        cnicNumber: !!this.verificationData.cnicNumber,
        address: !!this.verificationData.address,
      });
      return;
    }

    const formData = new FormData();
    formData.append('fullName', this.verificationData.fullName);
    formData.append('dateOfBirth', this.verificationData.dateOfBirth);
    formData.append('issueDate', this.verificationData.issueDate);
    formData.append('expiryDate', this.verificationData.expiryDate);
    formData.append('cnicNumber', this.verificationData.cnicNumber);
    formData.append('address', this.verificationData.address);
    formData.append('pendingUserId', this.verificationData.pendingUserId);
    if (this.idFrontFile)
      formData.append('idFront', this.idFrontFile, this.idFrontFile.name);
    if (this.idBackFile)
      formData.append('idBack', this.idBackFile, this.idBackFile.name);
    if (this.selfieFile)
      formData.append('selfie', this.selfieFile, this.selfieFile.name);

    console.log('FormData contents:');
    formData.forEach((value, key) => {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    });

    this.verificationService.submitVerification(formData).subscribe({
      next: (response) => {
        console.log('Submission Response:', response);
        alert(
          response.message ||
            'Verification submitted successfully. Please wait for admin approval.'
        );
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Submission Error:', err);
        this.error =
          err.error?.message || 'Submission failed! Please try again.';
      },
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  getFilePreview(file: File | null): string {
    return file ? URL.createObjectURL(file) : '';
  }
}
