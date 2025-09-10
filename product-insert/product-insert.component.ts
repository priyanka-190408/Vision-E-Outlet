import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  _id?: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  description?: string;
  category: string; // Added category field
}

@Component({
  selector: 'app-product-insert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form #productForm="ngForm" (ngSubmit)="onSubmit()">
      <!-- Show _id (read-only) if updating -->
      <div *ngIf="product._id">
        <label>
          Product ID:
          <input type="text" [ngModel]="product._id" name="_id" readonly>
        </label>
      </div>

      <!-- Show field selection dropdown if updating -->
      <div *ngIf="product._id">
        <label>
          Select Field to Update:
          <select [(ngModel)]="selectedField" name="selectedField" (change)="onFieldChange()" required>
            <option value="" disabled>Select a field</option>
            <option value="name">Name</option>
            <option value="imageUrl">Image URL</option>
            <option value="price">Price</option>
            <option value="originalPrice">Original Price</option>
            <option value="description">Description</option>
            <option value="category">Category</option> <!-- Added category option -->
          </select>
        </label>
      </div>

      <!-- Dynamically show input for the selected field -->
      <div *ngIf="product._id && selectedField">
        <label *ngIf="selectedField === 'name'">
          New Name:
          <input type="text" [(ngModel)]="product.name" name="name" required>
        </label>
        <label *ngIf="selectedField === 'imageUrl'">
          New Image URL:
          <input type="text" [(ngModel)]="product.imageUrl" name="imageUrl" required>
        </label>
        <label *ngIf="selectedField === 'price'">
          New Price:
          <input type="number" [(ngModel)]="product.price" name="price" required>
        </label>
        <label *ngIf="selectedField === 'originalPrice'">
          New Original Price:
          <input type="number" [(ngModel)]="product.originalPrice" name="originalPrice" required>
        </label>
        <label *ngIf="selectedField === 'description'">
          New Description:
          <textarea [(ngModel)]="product.description" name="description"></textarea>
        </label>
        <label *ngIf="selectedField === 'category'">
          New Category:
          <select [(ngModel)]="product.category" name="category" required>
            <option value="" disabled>Select Category</option>
            <option value="specs">Specs</option>
            <option value="sunglasses">Sunglasses</option>
            <option value="lenses">Lenses</option>
            <option value="lens-solutions">Lens Solutions</option>
          </select>
        </label>
      </div>

      <!-- Show full form for adding a new product -->
      <div *ngIf="!product._id">
        <label>
          Product Name:
          <input type="text" [(ngModel)]="product.name" name="name" required>
        </label>
        <label>
          Image URL:
          <input type="text" [(ngModel)]="product.imageUrl" name="imageUrl" required>
        </label>
        <label>
          Price:
          <input type="number" [(ngModel)]="product.price" name="price" required>
        </label>
        <label>
          Original Price:
          <input type="number" [(ngModel)]="product.originalPrice" name="originalPrice" required>
        </label>
        <label>
          Description:
          <textarea [(ngModel)]="product.description" name="description"></textarea>
        </label>
        <label>
          Category:
          <select [(ngModel)]="product.category" name="category" required>
            <option value="" disabled selected>Select Category</option>
            <option value="specs">Specs</option>
            <option value="sunglasses">Sunglasses</option>
            <option value="lenses">Lenses</option>
            <option value="lens-solutions">Lens Solutions</option>
          </select>
        </label>
      </div>

      <button type="submit">{{ product._id ? 'Update' : 'Add' }} Product</button>
      <button type="button" (click)="onCancel()">Cancel</button>
    </form>
  `,
  styleUrls: ['./product-insert.component.css']
})
export class ProductInsertComponent {
  @Input() product: Product = { name: '', imageUrl: '', price: 0, originalPrice: 0, description: '', category: '' }; // Added category
  @Output() productAdded = new EventEmitter<void>();
  @Output() productUpdated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  selectedField: string = ''; // Track the selected field to update

  onFieldChange() {
    // Reset other fields to their original values or empty to avoid sending unchanged fields
    if (this.selectedField !== 'name') this.product.name = this.product.name || '';
    if (this.selectedField !== 'imageUrl') this.product.imageUrl = this.product.imageUrl || '';
    if (this.selectedField !== 'price') this.product.price = this.product.price || 0;
    if (this.selectedField !== 'originalPrice') this.product.originalPrice = this.product.originalPrice || 0;
    if (this.selectedField !== 'description') this.product.description = this.product.description || '';
    if (this.selectedField !== 'category') this.product.category = this.product.category || ''; // Added category
  }

  onSubmit() {
    if (this.product._id) {
      // Update mode: Validate only the selected field
      if (!this.selectedField) {
        alert('Please select a field to update.');
        return;
      }
      if (
        (this.selectedField === 'name' && !this.product.name) ||
        (this.selectedField === 'imageUrl' && !this.product.imageUrl) ||
        (this.selectedField === 'price' && this.product.price <= 0) ||
        (this.selectedField === 'originalPrice' && this.product.originalPrice <= 0) ||
        (this.selectedField === 'category' && !this.product.category)
      ) {
        alert('Please provide a valid value for the selected field.');
        return;
      }
      if (this.selectedField === 'category') {
        const validCategories = ['specs', 'sunglasses', 'lenses', 'lens-solutions'];
        if (!validCategories.includes(this.product.category)) {
          alert('Category must be one of: specs, sunglasses, lenses, lens-solutions');
          return;
        }
      }
      this.productUpdated.emit();
    } else {
      // Add mode: Validate all required fields
      if (!this.product.name || !this.product.imageUrl || this.product.price <= 0 || this.product.originalPrice <= 0 || !this.product.category) {
        alert('Please fill all required fields, including category.');
        return;
      }
      const validCategories = ['specs', 'sunglasses', 'lenses', 'lens-solutions'];
      if (!validCategories.includes(this.product.category)) {
        alert('Category must be one of: specs, sunglasses, lenses, lens-solutions');
        return;
      }
      this.productAdded.emit();
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}