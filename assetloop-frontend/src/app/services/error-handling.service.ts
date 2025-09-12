import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ErrorMessage {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private errorsSubject = new BehaviorSubject<ErrorMessage[]>([]);
  public errors$ = this.errorsSubject.asObservable();

  constructor() { }

  addError(message: string, type: 'error' | 'warning' | 'info' | 'success' = 'error'): void {
    const error: ErrorMessage = {
      message,
      type,
      timestamp: new Date()
    };

    const currentErrors = this.errorsSubject.value;
    this.errorsSubject.next([error, ...currentErrors].slice(0, 10)); // Keep only last 10 errors

    // Auto-remove success and info messages after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        this.removeError(error);
      }, 5000);
    }
  }

  removeError(errorToRemove: ErrorMessage): void {
    const currentErrors = this.errorsSubject.value;
    const filteredErrors = currentErrors.filter(error => error !== errorToRemove);
    this.errorsSubject.next(filteredErrors);
  }

  clearAllErrors(): void {
    this.errorsSubject.next([]);
  }

  handleHttpError(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (error.status === 0) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    
    if (error.status === 401) {
      return 'You are not authorized to perform this action. Please login again.';
    }
    
    if (error.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    
    if (error.status === 404) {
      return 'The requested resource was not found.';
    }
    
    if (error.status >= 500) {
      return 'A server error occurred. Please try again later.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }
}
