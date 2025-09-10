import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../cart.service';
import { AuthService } from '../auth.service';

interface GroupedProducts {
  specs: any[];
  sunglasses: any[];
  lenses: any[];
  'lens-solutions': any[];
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  groupedProducts: GroupedProducts = {
    specs: [],
    sunglasses: [],
    lenses: [],
    'lens-solutions': []
  };
  user: any;
  showAccountDropdown = false;
  showProfileDropdown = false;
  currentRoute: string;
  cartMessage: string | null = null;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentRoute = this.router.url;
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    // Check authentication status on component initialization
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn && !this.user) {
        this.router.navigate(['/login']);
        return;
      }
      this.fetchProducts();
    });
  }

  fetchProducts() {
    this.http.get<any[]>('http://localhost:5000/api/products', { withCredentials: true }).subscribe({
      next: (data) => {
        console.log('Fetched products:', data);
        this.products = data;
        this.groupProductsByCategory();
        this.error = null;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.error = 'Failed to load products. Please try again later.';
        if (err.status === 401) {
          // Unauthorized: redirect to login
          this.authService.logout();
        } else {
          this.groupProductsByCategory();
        }
      }
    });
  }

  groupProductsByCategory() {
    this.groupedProducts = {
      specs: [],
      sunglasses: [],
      lenses: [],
      'lens-solutions': []
    };

    const validCategories = ['specs', 'sunglasses', 'lenses', 'lens-solutions'];

    this.products.forEach(product => {
      const category = product.category;
      if (category && validCategories.includes(category)) {
        (this.groupedProducts as any)[category].push(product);
      } else {
        console.warn(`Product with unknown or missing category:`, product);
      }
    });

    console.log('Grouped products:', this.groupedProducts);
  }

  addToCart(product: any, event: Event) {
    event.stopPropagation();
    this.cartService.addToCart(product);
    this.cartMessage = `${product.name} added to cart`;
    setTimeout(() => {
      this.cartMessage = null;
    }, 3000);
  }

  viewProduct(productId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/product', productId]);
  }

  copyProductUrl(productId: string, event: Event) {
    event.stopPropagation();
    const productUrl = `${window.location.origin}/product/${productId}`;
    navigator.clipboard.writeText(productUrl).then(() => {
      console.log('Product URL copied to clipboard:', productUrl);
      alert('Product URL copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy URL:', err);
    });
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