import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentSlide = 0;
  totalSlides = 3;
  user: any;
  showAccountDropdown = false;
  showProfileDropdown = false;
  currentRoute: string;

  constructor(private authService: AuthService, private router: Router) {
    this.currentRoute = this.router.url;
    this.user = this.authService.getCurrentUser(); // Fetch user on initialization
  }

  ngOnInit() {
    if (!this.user) {
      this.router.navigate(['/register']);
    }
  }

  next() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  prev() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
  }

  logout() {
    this.authService.logout();
    this.showAccountDropdown = false;
    this.showProfileDropdown = false;
  }

  toggleAccountDropdown() {
    this.showAccountDropdown = !this.showAccountDropdown;
    this.showProfileDropdown = false;
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
    this.showAccountDropdown = false;
  }
}