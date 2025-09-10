import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Blog {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: Date;
  author: string;
  showFullContent?: boolean;
}

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.css']
})
export class BlogsComponent implements OnInit {
  blogs: Blog[] = [];
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchBlogs();
  }

  fetchBlogs(): void {
    this.http.get<Blog[]>('http://localhost:5000/api/blogs', { withCredentials: true }).subscribe({
      next: (blogs) => {
        console.log('Blogs fetched:', blogs);
        this.blogs = blogs.map(blog => ({ ...blog, showFullContent: false }));
        this.error = null;
      },
      error: (err) => {
        console.error('Error fetching blogs:', err);
        this.error = 'Failed to load blogs. Please try again later.';
        this.blogs = [];
      }
    });
  }

  toggleContent(blog: Blog): void {
    blog.showFullContent = !blog.showFullContent;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}