import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ProductInsertComponent } from '../product-insert/product-insert.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserListComponent } from '../user-list/user-list.component';

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

interface Blog {
  _id?: string;
  title: string;
  author: string;
  content: string;
  imageUrl: string;
  createdAt?: Date;
}

interface User {
  _id?: string;
  username?: string;
  email: string;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, ProductInsertComponent, FormsModule, RouterModule, UserListComponent],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  activeSection: string = 'dashboard';
  products: Product[] = [];
  blogs: Blog[] = [];
  users: User[] = [];
  editingProduct: Product | null = null;
  editingBlog: Blog | null = null;
  showProductForm = false;
  showBlogForm = false;
  showDeleteProductForm = false;
  showDeleteBlogForm = false;
  newProduct: Product = { name: '', imageUrl: '', price: 0, originalPrice: 0, description: '', category: '', model: '', frameWidth: '', frameDimensions: '', frameColor: '', size: '' };
  newBlog: Blog = { title: '', author: '', content: '', imageUrl: '' };
  deleteProductId = '';
  deleteBlogId = '';

  blogTitle: string = '';
  blogAuthor: string = '';
  blogContent: string = '';
  blogImageUrl: string = '';

  private apiUrl = 'http://localhost:5000/api';

  @ViewChild(ProductInsertComponent) productInsertComponent: ProductInsertComponent | undefined;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.activeSection === 'dashboard' || this.activeSection === 'products') {
      this.loadProducts();
    }
    if (this.activeSection === 'dashboard' || this.activeSection === 'blogs') {
      this.loadBlogs();
    }
    if (this.activeSection === 'users') {
      this.loadUsers();
    }
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    this.showProductForm = false;
    this.showBlogForm = false;
    this.showDeleteProductForm = false;
    this.showDeleteBlogForm = false;
    this.editingProduct = null;
    this.editingBlog = null;
    this.loadData();
  }

  // Product CRUD Operations
  loadProducts(): void {
    this.http.get<Product[]>(`${this.apiUrl}/products`, { withCredentials: true }).subscribe({
      next: (products) => {
        this.products = products;
        if (products.length > 0 && !products[0]._id) {
          console.error('Products loaded from backend are missing _id fields.');
          alert('Error: Products loaded from backend are missing _id fields.');
        }
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        alert('Error fetching products: ' + (err.error?.message || err.message));
      }
    });
  }

  addProduct(): void {
    console.log('newProduct before POST:', this.newProduct);

    // Validate required fields
    if (
      !this.newProduct.name ||
      !this.newProduct.imageUrl ||
      this.newProduct.price <= 0 ||
      this.newProduct.originalPrice <= 0 ||
      !this.newProduct.category
    ) {
      alert('Please ensure all required fields are filled: Name, Image URL, Price, Original Price, and Category.');
      return;
    }

    const validCategories = ['specs', 'sunglasses', 'lenses', 'lens-solutions'];
    if (!validCategories.includes(this.newProduct.category)) {
      alert('Category must be one of: specs, sunglasses, lenses, lens-solutions');
      return;
    }

    // Validate optional fields
    const optionalFields: (keyof Product)[] = ['model', 'frameWidth', 'frameDimensions', 'frameColor', 'size'];
    for (const field of optionalFields) {
      if (this.newProduct[field] && typeof this.newProduct[field] !== 'string') {
        alert(`${field} must be a valid string if provided.`);
        return;
      }
    }

    // Create payload without _id
    const productPayload: Product = {
      name: this.newProduct.name,
      imageUrl: this.newProduct.imageUrl,
      price: this.newProduct.price,
      originalPrice: this.newProduct.originalPrice,
      description: this.newProduct.description || undefined,
      category: this.newProduct.category,
      model: this.newProduct.model || undefined,
      frameWidth: this.newProduct.frameWidth || undefined,
      frameDimensions: this.newProduct.frameDimensions || undefined,
      frameColor: this.newProduct.frameColor || undefined,
      size: this.newProduct.size || undefined
    };

    console.log('productPayload being sent to backend:', productPayload);

    this.http.post(`${this.apiUrl}/products`, productPayload, { withCredentials: true }).subscribe({
      next: (response) => {
        alert('Product added successfully!');
        this.newProduct = { name: '', imageUrl: '', price: 0, originalPrice: 0, description: '', category: '', model: '', frameWidth: '', frameDimensions: '', frameColor: '', size: '' };
        this.showProductForm = false;
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error adding product:', err);
        alert('Error adding product: ' + (err.error?.message || err.message));
      }
    });
  }

  startEdit(product: Product): void {
    this.editingProduct = { ...product };
    if (!this.editingProduct._id) {
      alert('Error: Product ID is missing during edit. Cannot update product.');
      return;
    }
    this.showProductForm = true;
  }

  updateProduct(): void {
    if (!this.editingProduct?._id) {
      alert('Error: Product ID is missing. Cannot update product.');
      return;
    }

    const selectedField = this.productInsertComponent?.selectedField;
    if (!selectedField) {
      alert('Please select a field to update.');
      return;
    }

    // Validate the selected field
    if (
      (selectedField === 'name' && !this.editingProduct.name) ||
      (selectedField === 'imageUrl' && !this.editingProduct.imageUrl) ||
      (selectedField === 'price' && this.editingProduct.price <= 0) ||
      (selectedField === 'originalPrice' && this.editingProduct.originalPrice <= 0) ||
      (selectedField === 'category' && !this.editingProduct.category)
    ) {
      alert(`Please provide a valid value for ${selectedField}.`);
      return;
    }

    if (selectedField === 'category') {
      const validCategories = ['specs', 'sunglasses', 'lenses', 'lens-solutions'];
      if (!validCategories.includes(this.editingProduct.category)) {
        alert('Category must be one of: specs, sunglasses, lenses, lens-solutions');
        return;
      }
    }

    // Create update payload with only the selected field
    const updatePayload: any = {};
    updatePayload[selectedField] = this.editingProduct[selectedField as keyof Product];

    this.http.put(`${this.apiUrl}/products/${this.editingProduct._id}`, updatePayload, { withCredentials: true }).subscribe({
      next: () => {
        alert('Product updated successfully!');
        this.editingProduct = null;
        this.showProductForm = false;
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error updating product:', err);
        alert('Error updating product: ' + (err.error?.message || err.message));
      }
    });
  }

  deleteProduct(): void {
    if (!this.deleteProductId) {
      alert('Please provide a valid Product ID to delete.');
      return;
    }

    if (confirm('Are you sure you want to delete this product?')) {
      this.http.delete(`${this.apiUrl}/products/${this.deleteProductId}`, { withCredentials: true }).subscribe({
        next: () => {
          alert('Product deleted successfully!');
          this.deleteProductId = '';
          this.showDeleteProductForm = false;
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          alert('Error deleting product: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  // Blog CRUD Operations
  loadBlogs(): void {
    this.http.get<Blog[]>(`${this.apiUrl}/blogs`, { withCredentials: true }).subscribe({
      next: (blogs) => {
        this.blogs = blogs;
      },
      error: (err) => {
        console.error('Error fetching blogs:', err);
        alert('Error fetching blogs: ' + (err.error?.message || err.message));
      }
    });
  }

  startEditBlog(blog: Blog): void {
    this.editingBlog = { ...blog };
    this.showBlogForm = true;
    this.blogTitle = this.editingBlog.title;
    this.blogAuthor = this.editingBlog.author;
    this.blogContent = this.editingBlog.content;
    this.blogImageUrl = this.editingBlog.imageUrl;
  }

  addBlog(): void {
    if (!this.blogTitle || !this.blogContent || !this.blogImageUrl) {
      alert('All blog fields (title, content, image URL) are required.');
      return;
    }

    const newBlogPayload = {
      title: this.blogTitle,
      author: this.blogAuthor || 'admin',
      content: this.blogContent,
      imageUrl: this.blogImageUrl
    };

    this.http.post(`${this.apiUrl}/blogs`, newBlogPayload, { withCredentials: true }).subscribe({
      next: () => {
        alert('Blog added successfully!');
        this.newBlog = { title: '', author: '', content: '', imageUrl: '' };
        this.blogTitle = '';
        this.blogAuthor = '';
        this.blogContent = '';
        this.blogImageUrl = '';
        this.showBlogForm = false;
        this.loadBlogs();
      },
      error: (err) => {
        console.error('Error adding blog:', err);
        alert('Error adding blog: ' + (err.error?.message || err.message));
      }
    });
  }

  updateBlog(): void {
    if (!this.blogTitle || !this.blogContent || !this.blogImageUrl) {
      alert('All blog fields (title, content, image URL) are required.');
      return;
    }

    if (this.editingBlog) {
      const updateBlogPayload = {
        title: this.blogTitle,
        author: this.blogAuthor || 'admin',
        content: this.blogContent,
        imageUrl: this.blogImageUrl
      };

      this.http.put(`${this.apiUrl}/blogs/${this.editingBlog._id}`, updateBlogPayload, { withCredentials: true }).subscribe({
        next: () => {
          alert('Blog updated successfully!');
          this.editingBlog = null;
          this.blogTitle = '';
          this.blogAuthor = '';
          this.blogContent = '';
          this.blogImageUrl = '';
          this.showBlogForm = false;
          this.loadBlogs();
        },
        error: (err) => {
          console.error('Error updating blog:', err);
          alert('Error updating blog: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  deleteBlog(): void {
    if (!this.deleteBlogId) {
      alert('Please provide a valid Blog ID to delete.');
      return;
    }

    if (confirm('Are you sure you want to delete this blog?')) {
      this.http.delete(`${this.apiUrl}/blogs/${this.deleteBlogId}`, { withCredentials: true }).subscribe({
        next: () => {
          alert('Blog deleted successfully!');
          this.deleteBlogId = '';
          this.showDeleteBlogForm = false;
          this.loadBlogs();
        },
        error: (err) => {
          console.error('Error deleting blog:', err);
          alert('Error deleting blog: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  // User Operations
  loadUsers(): void {
    const url = `${this.apiUrl}/users`;
    console.log('Fetching users from:', url);
    this.http.get<User[]>(url, { withCredentials: true }).subscribe({
      next: (users) => {
        this.users = users;
        console.log('Users loaded:', users);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        alert('Failed to load users: ' + (err.error?.message || err.message));
        this.users = [];
      }
    });
  }

  cancelEdit(): void {
    this.editingProduct = null;
    this.editingBlog = null;
    this.blogTitle = '';
    this.blogAuthor = '';
    this.blogContent = '';
    this.blogImageUrl = '';
    this.showProductForm = false;
    this.showBlogForm = false;
  }

  showBlogFormToggle(): void {
    this.showBlogForm = !this.showBlogForm;
    if (this.showBlogForm && !this.editingBlog) {
      this.blogTitle = '';
      this.blogAuthor = '';
      this.blogContent = '';
      this.blogImageUrl = '';
    }
  }
}