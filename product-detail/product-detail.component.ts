import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../cart.service';
import { AuthService } from '../auth.service';

interface Product {
  _id?: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  description?: string;
  category: string;
  model?: string;
  frameWidth?: string;
  frameDimensions?: string;
  frameColor?: string;
  size?: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  cartItems: Product[] = [];
  totalAmount: number = 0;
  error: string | null = null;
  private apiUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
        return;
      }
      this.loadProduct();
    });
  }

  loadProduct() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<Product>(`${this.apiUrl}/products/${id}`, { withCredentials: true }).subscribe({
        next: (data) => {
          this.product = data;
          console.log('Product details:', this.product);
          this.error = null;
        },
        error: (err) => {
          console.error('Error fetching product:', err);
          if (err.status === 404) {
            this.error = `Product with ID ${id} not found. It may have been deleted.`;
          } else if (err.status === 401) {
            this.error = `Unauthorized access. Please log in to view this product.`;
            this.authService.logout();
            this.router.navigate(['/login']);
          } else {
            this.error = `Failed to load product details for ID ${id}. Please ensure the backend API is running and try again.`;
          }
        }
      });
    } else {
      this.error = 'No product ID provided in the route.';
    }
    this.loadCart();
  }

  loadCart() {
    this.cartItems = this.cartService.getCart();
    this.calculateTotal();
  }

  addToCartAndCalculate() {
    if (this.product) {
      this.cartService.addToCart({
        _id: this.product._id,
        name: this.product.name,
        price: this.product.price,
        originalPrice: this.product.originalPrice || this.product.price,
        imageUrl: this.product.imageUrl,
        category: this.product.category,
        description: this.product.description,
        model: this.product.model,
        frameWidth: this.product.frameWidth,
        frameDimensions: this.product.frameDimensions,
        frameColor: this.product.frameColor,
        size: this.product.size
      });
      this.loadCart();
      this.router.navigate(['/cart']);
    }
  }

  calculateTotal() {
    this.totalAmount = this.cartService.getTotal();
  }

  shouldShowFrameFields(): boolean {
    // Ensure the method always returns a boolean by handling the null case
    if (!this.product) {
      return false;
    }
    return ['specs', 'sunglasses'].includes(this.product.category);
  }
}