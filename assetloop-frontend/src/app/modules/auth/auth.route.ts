import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserVerificationComponent } from './user-verification/user-verification.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { OtpComponent } from './otp/otp.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Login' },
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { title: 'Register' },
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    data: { title: 'Forgot Password' },
  },
  {
    path: 'otp',
    component: OtpComponent,
    data: { title: 'Otp' },
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    data: { title: 'Change Password' },
  },
  {
    path: 'verification',
    component: UserVerificationComponent,
    data: { title: 'User Verification' },
  },
];
