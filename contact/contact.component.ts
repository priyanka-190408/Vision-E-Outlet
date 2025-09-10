import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styles: [`
    .contact {
      padding: 40px 20px;
      text-align: center;
      background-color: #f9f9f9;
    }

    .contact .title {
      font-size: 2.5rem;
      color: #333;
      padding: 1rem;
      margin: 2rem 0;
      text-transform: uppercase;
    }

    .contact .row {
      display: flex;
      justify-content: center;
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
      flex-wrap: wrap;
    }

    .contact form {
      flex: 1;
      max-width: 500px;
      text-align: left;
    }

    .contact form .inputBox {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }

    .contact form .inputBox input,
    .contact form input[type="email"],
    .contact form textarea {
      width: 100%;
      font-size: 1.6rem;
      color: #333;
      padding: 1.5rem;
      margin: 1rem 0;
      border: 0.1rem solid rgba(0, 0, 0, 0.1);
      border-radius: 0.5rem;
      box-sizing: border-box;
    }

    .contact form .inputBox input {
      flex: 1;
      min-width: 48%;
    }

    .contact form textarea {
      width: 100%;
      resize: none;
    }

    .contact form .inputBox input:focus,
    .contact form input[type="email"]:focus,
    .contact form textarea:focus {
      border-color: #e84393;
    }

    .contact form .btn {
      background-color: #333;
      color: #fff;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 10px;
      font-size: 1.6rem;
    }

    .contact form .btn:disabled {
      background-color: #999;
      cursor: not-allowed;
    }

    .contact .map {
      flex: 1;
      max-width: 500px;
      height: 400px;
      border: 0;
    }

    .error-message {
      color: red;
      text-align: center;
      margin-bottom: 20px;
      font-size: 16px;
    }

    @media (max-width: 991px) {
      .contact form {
        padding: 2rem;
      }

      .contact form .inputBox input {
        width: 100%;
      }

      .contact .map {
        width: 100%;
        max-width: 100%;
      }
    }
  `]
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  error: string | null = null;
  isLoggedIn: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      number: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check initial state from localStorage
    const user = this.authService.getCurrentUser();
    if (user) {
      this.isLoggedIn = true;
      this.contactForm.enable();
    } else {
      this.isLoggedIn = false;
      this.contactForm.disable();
      this.error = 'You need to be logged in to send a message.';
    }

    // Subscribe to isLoggedIn$ for updates
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.contactForm.enable();
        this.error = null;
      } else {
        this.contactForm.disable();
        this.error = 'You need to be logged in to send a message.';
      }
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;
      this.http.post('http://localhost:5000/api/contact', formData, { withCredentials: true }).subscribe({
        next: (response) => {
          console.log('Message sent successfully:', response);
          this.error = null;
          alert('Your message has been sent successfully!');
          this.contactForm.reset();
        },
        error: (error) => {
          console.error('Error sending message:', error);
          if (error.status === 401) {
            this.error = 'Session expired. Please log in again.';
            this.authService.logout();
          } else {
            this.error = `Error: ${error.statusText}. Please try again or contact support.`;
          }
        }
      });
    }
  }
}