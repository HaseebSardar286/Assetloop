import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgIf], // Add FormsModule here for template-driven forms
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: '',
    terms: false,
  };

  onSubmit() {
    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Form submitted:', this.user);
    // Add API call or further logic here if needed
  }
}
