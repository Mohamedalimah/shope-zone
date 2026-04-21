import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-hero">
        <h1 class="page-title">Explore Products</h1>
        <p class="page-subtitle">Discover premium items from the future</p>
      </div>

      <!-- Filters -->
      <div class="filters-bar glass-card">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            id="product-search"
            type="text"
            [(ngModel)]="searchTerm"
            placeholder="Search products..."
            class="search-input"
          />
        </div>
        <div class="category-wrap">
          <select
            id="category-filter"
            [(ngModel)]="selectedCategory"
            class="category-select"
          >
            <option value="">All Categories</option>
            <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="filter-info">
          <span class="result-count">{{ filteredProducts.length }} items</span>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-grid" *ngIf="filteredProducts.length > 0">
        <div
          *ngFor="let product of filteredProducts"
          class="product-card glass-card"
        >
          <a [routerLink]="['/products', product.id]" class="card-image-wrap">
            <img [src]="product.image" [alt]="product.name" class="card-img" loading="lazy" />
            <div class="card-overlay">
              <span class="view-btn">View Details →</span>
            </div>
            <span class="out-of-stock-badge oos-corner" *ngIf="product.stock === 0">Out of Stock</span>
          </a>
          <div class="card-body">
            <span class="cat-tag">{{ product.category }}</span>
            <a [routerLink]="['/products', product.id]" class="card-name">{{ product.name }}</a>
            <div class="card-meta">
              <div class="stars">{{ getStars(product.rating) }} <span class="rating-num">{{ product.rating }}</span></div>
              <span class="stock-info" [class.low-stock]="product.stock > 0 && product.stock <= 5">
                {{ product.stock === 0 ? '—' : product.stock + ' left' }}
              </span>
            </div>
            <div class="card-footer">
              <span class="price">EGP {{ product.price | number }}</span>
              <button
                class="btn-add-cart"
                (click)="addToCart(product)"
                [disabled]="product.stock === 0 || addingId === product.id"
                id="add-cart-{{ product.id }}"
              >
                <span *ngIf="addingId !== product.id">🛒 Add</span>
                <span *ngIf="addingId === product.id">✓</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredProducts.length === 0 && !loading">
        <div class="empty-icon">🌌</div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filter</p>
        <button class="btn-secondary" (click)="resetFilters()">Reset Filters</button>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="loader"></div>
        <p>Loading products...</p>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" *ngIf="showToast">✅ Added to cart!</div>
  `,
  styles: [`
    .page-hero { margin-bottom: 48px; text-align: center; }
    .filters-bar { display: flex; align-items: center; gap: 16px; padding: 16px 24px; margin-bottom: 40px; flex-wrap: wrap; background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-sm); }
    .search-wrap { position: relative; flex: 1; min-width: 260px; }
    .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: var(--text-secondary); }
    .search-input { width: 100%; background: #f5f5f7; border: 1px solid transparent; color: var(--text-primary); padding: 14px 16px 14px 44px; border-radius: var(--radius-pill); font-size: 0.95rem; font-family: inherit; outline: none; transition: var(--transition); font-weight: 500; }
    .search-input:focus { border-color: var(--secondary); background: #ffffff; box-shadow: 0 0 0 4px rgba(0,113,227,0.1); }
    .search-input::placeholder { color: var(--text-muted); }
    .category-select { background: #f5f5f7; border: 1px solid transparent; color: var(--text-primary); padding: 14px 40px 14px 20px; border-radius: var(--radius-pill); font-size: 0.95rem; font-family: inherit; font-weight: 500; outline: none; cursor: pointer; transition: var(--transition); appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%231d1d1f' stroke-width='2' fill='none'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; }
    .category-select:focus { border-color: var(--secondary); background: #ffffff; box-shadow: 0 0 0 4px rgba(0,113,227,0.1); }
    .category-select option { background: #ffffff; color: var(--text-primary); }
    .result-count { color: var(--text-secondary); font-size: 0.9rem; white-space: nowrap; font-weight: 500; }
    .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
    .product-card { overflow: hidden; padding: 0; display: flex; flex-direction: column; border: none; }
    .card-image-wrap { display: block; position: relative; aspect-ratio: 4/3; overflow: hidden; }
    .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); }
    .product-card:hover .card-img { transform: scale(1.04); }
    .card-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; }
    .product-card:hover .card-overlay { opacity: 1; }
    .view-btn { color: var(--primary); background: #ffffff; padding: 10px 24px; border-radius: var(--radius-pill); font-weight: 600; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .oos-corner { position: absolute; top: 12px; right: 12px; background: rgba(255,59,48,0.1); color: var(--danger); border: none; }
    .card-body { padding: 24px; display: flex; flex-direction: column; flex: 1; }
    .cat-tag { display: inline-block; color: var(--text-secondary); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .card-name { display: block; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); text-decoration: none; margin-bottom: 12px; line-height: 1.3; letter-spacing: -0.01em; }
    .card-name:hover { color: var(--secondary); }
    .card-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; margin-top: auto; }
    .stars { color: var(--primary); font-size: 0.85rem; }
    .rating-num { color: var(--text-secondary); font-size: 0.85rem; margin-left: 6px; font-weight: 500; }
    .stock-info { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
    .low-stock { color: var(--warning) !important; }
    .card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid var(--border-color); }
    .price { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
    .btn-add-cart { background: #f5f5f7; color: var(--text-primary); border: none; padding: 10px 20px; border-radius: var(--radius-pill); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: var(--transition); display: flex; align-items: center; gap: 6px; }
    .btn-add-cart:hover:not(:disabled) { background: var(--primary); color: #ffffff; transform: scale(1.05); }
    .btn-add-cart:disabled { opacity: 0.4; cursor: not-allowed; }
    .loading-state { text-align: center; padding: 120px 20px; color: var(--text-secondary); }
    .loader { width: 44px; height: 44px; border: 3px solid rgba(0,0,0,0.05); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 768px) { .products-grid { grid-template-columns: 1fr; } .filters-bar { flex-direction: column; align-items: stretch; } .search-wrap { width: 100%; } }
  `],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  searchTerm = '';
  selectedCategory = '';
  categories: string[] = [];
  loading = true;
  showToast = false;
  addingId: number | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.categories = [...new Set(products.map((p) => p.category))].sort();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  get filteredProducts(): Product[] {
    return this.products.filter((p) => {
      const matchSearch = p.name
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase().trim());
      const matchCat =
        !this.selectedCategory || p.category === this.selectedCategory;
      return matchSearch && matchCat;
    });
  }

  getStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
  }

  addToCart(product: Product): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    this.addingId = product.id;
    const item = {
      userId: user.id,
      productId: product.id,
      quantity: 1,
      name: product.name,
      price: product.price,
    };
    this.cartService.addToCart(item).subscribe({
      next: () => {
        this.addingId = null;
        this.showToast = true;
        setTimeout(() => (this.showToast = false), 3000);
      },
      error: () => (this.addingId = null),
    });
  }
}
