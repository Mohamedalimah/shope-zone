import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container" *ngIf="product && !loading">
      <a routerLink="/products" class="back-link">← Back to Products</a>

      <div class="detail-grid">
        <!-- Image -->
        <div class="image-panel glass-card">
          <img [src]="product.image" [alt]="product.name" class="detail-img" />
          <span class="out-of-stock-badge oos-abs" *ngIf="product.stock === 0">Out of Stock</span>
        </div>

        <!-- Info -->
        <div class="info-panel">
          <span class="cat-tag">{{ product.category }}</span>
          <h1 class="product-name">{{ product.name }}</h1>

          <div class="rating-row">
            <span class="stars">{{ getStars(product.rating) }}</span>
            <span class="rating-val">{{ product.rating }}/5</span>
          </div>

          <div class="price-row">
            <span class="big-price">EGP {{ product.price | number }}</span>
          </div>

          <div class="stock-row">
            <span class="stock-label">Availability:</span>
            <span class="stock-val" [class.low]="product.stock > 0 && product.stock <= 5" [class.out]="product.stock === 0">
              {{ product.stock === 0 ? 'Out of Stock' : product.stock + ' units available' }}
            </span>
          </div>

          <!-- Qty -->
          <div class="qty-section" *ngIf="product.stock > 0">
            <label class="qty-label">Quantity</label>
            <div class="qty-controls">
              <button class="qty-btn" (click)="decreaseQty()" [disabled]="quantity <= 1" id="qty-decrease">−</button>
              <input
                id="qty-input"
                type="number"
                [(ngModel)]="quantity"
                [min]="1"
                [max]="product.stock"
                class="qty-input"
                (change)="clampQty()"
              />
              <button class="qty-btn" (click)="increaseQty()" [disabled]="quantity >= product.stock" id="qty-increase">+</button>
            </div>
            <div class="error-msg" *ngIf="quantity < 1 || quantity > product.stock">
              ⚠ Quantity must be between 1 and {{ product.stock }}
            </div>
          </div>

          <!-- Actions -->
          <div class="action-row">
            <button
              class="btn-primary btn-cart"
              (click)="addToCart()"
              [disabled]="product.stock === 0 || quantity < 1 || quantity > product.stock || adding"
              id="add-to-cart-btn"
            >
              <span *ngIf="!adding">🛒 Add to Cart</span>
              <span *ngIf="adding">✓ Added!</span>
            </button>
            <a routerLink="/cart" class="btn-ghost">View Cart →</a>
          </div>

          <!-- Success toast inline -->
          <div class="success-inline" *ngIf="showSuccess">
            ✅ Successfully added to cart!
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div class="page-container loading-state" *ngIf="loading">
      <div class="loader"></div>
      <p>Loading product...</p>
    </div>

    <!-- Toast -->
    <div class="toast" *ngIf="showToast">✅ Added to cart!</div>
  `,
  styles: [`
    .back-link { display: inline-flex; align-items: center; color: var(--secondary); text-decoration: none; font-size: 0.95rem; font-weight: 500; margin-bottom: 40px; transition: all 0.25s; letter-spacing: -0.01em; }
    .back-link:hover { opacity: 0.8; transform: translateX(-4px); }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
    .image-panel { overflow: hidden; padding: 0; position: relative; border-radius: var(--radius); }
    .detail-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius); }
    .oos-abs { position: absolute; top: 16px; right: 16px; }
    .info-panel { display: flex; flex-direction: column; gap: 20px; }
    .cat-tag { display: inline-block; background: #f5f5f7; color: var(--text-secondary); border: none; padding: 6px 14px; border-radius: var(--radius-pill); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; width: fit-content; }
    .product-name { font-size: 2.5rem; font-weight: 800; line-height: 1.1; color: var(--text-primary); letter-spacing: -0.03em; }
    .rating-row { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
    .stars { color: var(--text-primary); font-size: 1.1rem; }
    .rating-val { color: var(--text-secondary); font-size: 0.95rem; }
    .price-row { margin: 8px 0; }
    .big-price { font-size: 2.5rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
    .stock-row { display: flex; align-items: center; gap: 10px; }
    .stock-label { color: var(--text-secondary); font-size: 0.95rem; font-weight: 500; }
    .stock-val { font-size: 0.95rem; font-weight: 600; color: var(--success); }
    .stock-val.low { color: var(--warning); }
    .stock-val.out { color: var(--danger); }
    .qty-section { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
    .qty-label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .qty-controls { display: flex; align-items: center; gap: 0; width: fit-content; background: #f5f5f7; border: none; border-radius: var(--radius-pill); overflow: hidden; padding: 4px; }
    .qty-btn { background: #ffffff; border: none; border-radius: 50%; color: var(--text-primary); width: 36px; height: 36px; font-size: 1.2rem; cursor: pointer; transition: var(--transition); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .qty-btn:hover:not(:disabled) { transform: scale(1.05); }
    .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
    .qty-input { background: transparent; border: none; color: var(--text-primary); text-align: center; font-size: 1rem; font-weight: 600; width: 48px; padding: 0; outline: none; height: 36px; }
    .action-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 16px; }
    .btn-cart { padding: 16px 36px; font-size: 1.05rem; letter-spacing: -0.01em; }
    .success-inline { background: rgba(52,199,89,0.1); border: none; color: var(--success); padding: 16px 24px; border-radius: var(--radius-sm); font-size: 0.95rem; text-align: center; font-weight: 500; }
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; gap: 16px; color: var(--text-secondary); }
    .loader { width: 40px; height: 40px; border: 3px solid rgba(0,0,0,0.05); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } .product-name { font-size: 2rem; } .big-price { font-size: 2rem; } }
  `],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity = 1;
  loading = true;
  adding = false;
  showToast = false;
  showSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(id).subscribe({
      next: (p) => {
        this.product = p;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/products']);
      },
    });
  }

  getStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
  }

  increaseQty(): void {
    if (this.product && this.quantity < this.product.stock) this.quantity++;
  }

  decreaseQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  clampQty(): void {
    if (!this.product) return;
    if (this.quantity < 1) this.quantity = 1;
    if (this.quantity > this.product.stock) this.quantity = this.product.stock;
  }

  addToCart(): void {
    if (!this.product) return;
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.adding = true;
    const item = {
      userId: user.id,
      productId: this.product.id,
      quantity: this.quantity,
      name: this.product.name,
      price: this.product.price,
    };
    this.cartService.addToCart(item).subscribe({
      next: () => {
        this.adding = false;
        this.showSuccess = true;
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
          this.showSuccess = false;
          this.adding = false;
        }, 3000);
      },
      error: () => (this.adding = false),
    });
  }
}
