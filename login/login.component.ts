import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error: string | null = null;
  message: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)]],
      rememberMe: [false] // Add rememberMe control, default to false
    });
  }

  ngOnInit() {
    this.authService.testBackend().subscribe({
      next: (res) => console.log('Test backend response:', res),
      error: (err) => console.error('Test backend error:', err)
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.error = 'Please fix the errors in the form.';
      return;
    }

    const userData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    const rememberMe = this.loginForm.value.rememberMe; // Access rememberMe value

    console.log('Submitting login:', userData);
    this.authService.login(userData).subscribe({
      next: (res) => {
        console.log('Login response in component:', res);
        if (res.message === 'Login successful') {
          if (rememberMe) {
            localStorage.setItem('userEmail', userData.email);
          }
          this.message = 'Login successful';
          this.error = null;
          setTimeout(() => {
            this.message = null;
          }, 2000);
        } else {
          this.error = res.message || 'Login failed';
          this.message = null;
        }
      },
      error: (err) => {
        console.error('Login error in component:', err);
        this.error = err.error?.error || err.message || 'Login failed. Please try again.';
        this.message = null;
      }
    });
  }
}