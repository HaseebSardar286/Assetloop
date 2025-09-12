// verification.component.ts
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
// import { VerificationService } from '../../verification.service';
@Component({
  selector: 'app-user-verification',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-verification.component.html',
  styleUrl: './user-verification.component.css',
})
export class UserVerificationComponent {
  currentStep = 1;
  progress = 25; // 25% per step

  constructor(
    // private service: VerificationService,
    // private toastr: ToastrService,
    // private http: HttpClient,
    private router: Router
  ) {}

  nextStep(form: NgForm) {
    if (form.invalid) {
      alert('Please fill all required fields!');
      return;
    }
    if (this.currentStep < 4) {
      this.currentStep++;
      this.progress += 25;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.progress -= 25;
    }
  }

  onFileChange(event: any, type: string) {
    const file = event.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB!');
      return;
    }
    // if (type === 'idFront') this.service.data.idFront = file;
    // if (type === 'idBack') this.service.data.idBack = file;
    // if (type === 'selfie') this.service.data.selfie = file;
  }

  submit() {
    const formData = new FormData();
    // formData.append('idFront', this.service.data.idFront || '');
    // formData.append('idBack', this.service.data.idBack || '');
    // formData.append('fullName', this.service.data.fullName);
    // formData.append('idNumber', this.service.data.idNumber);
    // formData.append('dateOfBirth', this.service.data.dateOfBirth);
    // formData.append('address', this.service.data.address);
    // formData.append('selfie', this.service.data.selfie || '');

    // Submit to backend
    // this.http.post('/api/verify-seller', formData).subscribe(
    //   () => {
    //     alert('Verification submitted!');
    //     // this.service.clearData();
    //     this.router.navigate(['/dashboard']);
    //   },
    //   (error) => {
    //     alert('Submission failed!');
    //   }
    // );

    this.router.navigate(['/renter-dashboard']);
  }
}
