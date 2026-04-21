import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { CartItem } from '../../models/cart-item.model';
import { DeliveryInfo } from '../../models/order.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-hero">
        <h1 class="page-title">🛒 Your Cart</h1>
        <p class="page-subtitle">Review and manage your selected items</p>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="loader"></div>
        <p>Loading cart...</p>
      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="!loading && cartItems.length === 0">
        <div class="empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Explore our collection and add items!</p>
        <a routerLink="/products" class="btn-ghost">Browse Products →</a>
      </div>

      <!-- Cart content -->
      <div class="cart-layout" *ngIf="!loading && cartItems.length > 0">
        <div class="cart-left">
          <!-- Cart Items -->
          <div class="cart-items">
            <div class="cart-card glass-card" *ngFor="let item of cartItems">
              <div class="item-info">
                <div class="item-avatar">{{ item.name.charAt(0) }}</div>
                <div class="item-details">
                  <h3 class="item-name">{{ item.name }}</h3>
                  <span class="item-unit">EGP {{ item.price | number }} / unit</span>
                </div>
              </div>
              <div class="item-controls">
                <div class="qty-controls">
                  <button class="qty-btn" (click)="decreaseQty(item)" [disabled]="item.quantity <= 1">−</button>
                  <input
                    type="number"
                    [(ngModel)]="item.quantity"
                    [min]="1"
                    class="qty-input"
                    (change)="onQtyChange(item)"
                    [id]="'qty-' + item.id"
                  />
                  <button class="qty-btn" (click)="increaseQty(item)">+</button>
                </div>
                <span class="item-subtotal">EGP {{ item.price * item.quantity | number }}</span>
                <button class="btn-danger btn-remove" (click)="removeItem(item)" [id]="'remove-' + item.id">🗑</button>
              </div>
            </div>
          </div>

          <!-- Delivery Details -->
          <div class="section-card glass-card">
            <h2 class="section-title">📍 Delivery Details</h2>
            <p class="section-desc">Enter your shipping information</p>
            <div class="delivery-form">
              <div class="form-row">
                <div class="input-group">
                  <label for="delivery-name">Full Name</label>
                  <input
                    id="delivery-name"
                    type="text"
                    [(ngModel)]="delivery.fullName"
                    placeholder="e.g. Ahmed Mohamed"
                    [class.error]="submitted && !delivery.fullName"
                  />
                  <div class="error-msg" *ngIf="submitted && !delivery.fullName">⚠ Full name is required</div>
                </div>
                <div class="input-group">
                  <label for="delivery-phone">Phone Number</label>
                  <input
                    id="delivery-phone"
                    type="tel"
                    [(ngModel)]="delivery.phone"
                    placeholder="e.g. 01012345678"
                    [class.error]="submitted && !delivery.phone"
                  />
                  <div class="error-msg" *ngIf="submitted && !delivery.phone">⚠ Phone number is required</div>
                </div>
              </div>
              <div class="form-row">
                <div class="input-group full-width">
                  <label for="delivery-address">Street Address</label>
                  <input
                    id="delivery-address"
                    type="text"
                    [(ngModel)]="delivery.address"
                    placeholder="e.g. 15 Tahrir Street, Dokki"
                    [class.error]="submitted && !delivery.address"
                  />
                  <div class="error-msg" *ngIf="submitted && !delivery.address">⚠ Address is required</div>
                </div>
              </div>
              <div class="form-row">
                <div class="input-group">
                  <label for="delivery-city">City</label>
                  <select
                    id="delivery-city"
                    [(ngModel)]="delivery.city"
                    [class.error]="submitted && !delivery.city"
                  >
                    <option value="">Select City</option>
                    <option *ngFor="let city of cities" [value]="city">{{ city }}</option>
                  </select>
                  <div class="error-msg" *ngIf="submitted && !delivery.city">⚠ City is required</div>
                </div>
                <div class="input-group">
                  <label for="delivery-notes">Notes (optional)</label>
                  <input
                    id="delivery-notes"
                    type="text"
                    [(ngModel)]="delivery.notes"
                    placeholder="e.g. Ring the bell twice"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="section-card glass-card">
            <h2 class="section-title">💳 Payment Method</h2>
            <p class="section-desc">Choose how you'd like to pay</p>
            <div class="payment-options">
              <label
                class="payment-option"
                *ngFor="let method of paymentMethods"
                [class.selected]="selectedPayment === method.value"
              >
                <input
                  type="radio"
                  name="payment"
                  [value]="method.value"
                  [(ngModel)]="selectedPayment"
                  class="payment-radio"
                />
                <div class="payment-icon">{{ method.icon }}</div>
                <div class="payment-info">
                  <span class="payment-name">{{ method.name }}</span>
                  <span class="payment-desc">{{ method.desc }}</span>
                </div>
                <div class="payment-check" *ngIf="selectedPayment === method.value">✓</div>
              </label>
            </div>
            <div class="error-msg" *ngIf="submitted && !selectedPayment" style="margin-top:12px;">⚠ Please select a payment method</div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="cart-summary glass-card">
          <h2 class="summary-title">Order Summary</h2>
          <div class="summary-rows">
            <div class="summary-row" *ngFor="let item of cartItems">
              <span class="s-name">{{ item.name }} ×{{ item.quantity }}</span>
              <span class="s-val">EGP {{ item.price * item.quantity | number }}</span>
            </div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-total">
            <span>Total</span>
            <span class="total-price">EGP {{ total | number }}</span>
          </div>

          <!-- Mini delivery preview -->
          <div class="delivery-preview" *ngIf="delivery.fullName || delivery.address">
            <div class="preview-label">📍 Deliver to</div>
            <div class="preview-name" *ngIf="delivery.fullName">{{ delivery.fullName }}</div>
            <div class="preview-addr" *ngIf="delivery.address">{{ delivery.address }}<span *ngIf="delivery.city">, {{ delivery.city }}</span></div>
            <div class="preview-phone" *ngIf="delivery.phone">📞 {{ delivery.phone }}</div>
          </div>

          <button
            class="btn-primary btn-checkout"
            (click)="placeOrder()"
            [disabled]="orderPlacing"
            id="checkout-btn"
          >
            <span *ngIf="!orderPlacing">✓ Place Order</span>
            <span *ngIf="orderPlacing" class="spinner">⟳</span>
          </button>
          <a routerLink="/products" class="continue-link">← Continue Shopping</a>
        </div>
      </div>
    </div>

    <div class="toast" *ngIf="showToast">{{ toastMsg }}</div>
  `,
  styles: [`
    .page-hero { margin-bottom: 32px; }
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 40vh; gap: 16px; color: var(--text-secondary); }
    .loader { width: 44px; height: 44px; border: 3px solid rgba(0,0,0,0.05); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
    .cart-left { display: flex; flex-direction: column; gap: 24px; }
    .cart-items { display: flex; flex-direction: column; gap: 16px; }
    .cart-card { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; gap: 20px; flex-wrap: wrap; }
    .item-info { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 180px; }
    .item-avatar {
      width: 56px; height: 56px; flex-shrink: 0;
      background: #f5f5f7; border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; font-weight: 700; color: var(--text-primary);
    }
    .item-details { display: flex; flex-direction: column; gap: 6px; }
    .item-name { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em; }
    .item-unit { font-size: 0.85rem; color: var(--text-secondary); }
    .item-controls { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
    .qty-controls { display: flex; align-items: center; background: #f5f5f7; border-radius: var(--radius-pill); overflow: hidden; padding: 4px; }
    .qty-btn { background: #ffffff; border: none; color: var(--text-primary); width: 32px; height: 32px; font-size: 1rem; cursor: pointer; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: var(--transition); }
    .qty-btn:hover:not(:disabled) { transform: scale(1.05); }
    .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
    .qty-input { background: transparent; border: none; color: var(--text-primary); text-align: center; font-size: 0.95rem; font-weight: 600; width: 44px; padding: 0; outline: none; height: 32px; }
    .item-subtotal { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); min-width: 90px; text-align: right; letter-spacing: -0.01em; }
    .btn-remove { padding: 8px 16px; font-size: 0.9rem; }

    /* Section Card */
    .section-card { padding: 28px 32px; }
    .section-title { font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px; letter-spacing: -0.02em; }
    .section-desc { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px; font-weight: 500; }

    /* Delivery Form */
    .delivery-form { display: flex; flex-direction: column; gap: 4px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-row .full-width { grid-column: 1 / -1; }

    /* Payment Section */
    .payment-options { display: flex; flex-direction: column; gap: 10px; }
    .payment-option {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 18px;
      background: #f5f5f7;
      border: 2px solid transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);
      position: relative;
    }
    .payment-option:hover { background: #efefef; }
    .payment-option.selected {
      background: #ffffff;
      border-color: var(--primary);
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    .payment-radio { display: none; }
    .payment-icon { font-size: 1.6rem; flex-shrink: 0; width: 40px; text-align: center; }
    .payment-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .payment-name { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
    .payment-desc { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; }
    .payment-check {
      width: 28px; height: 28px;
      background: var(--primary);
      color: #ffffff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700;
      animation: popIn 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    }
    @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }

    /* Summary Sidebar */
    .cart-summary { padding: 32px; position: sticky; top: 100px; }
    .summary-title { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin-bottom: 24px; letter-spacing: -0.02em; }
    .summary-rows { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; }
    .s-name { font-size: 0.9rem; color: var(--text-secondary); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
    .s-val { font-size: 0.95rem; color: var(--text-primary); font-weight: 600; }
    .summary-divider { height: 1px; background: var(--border-color); margin: 20px 0; }
    .summary-total { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
    .total-price { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }

    /* Delivery Preview */
    .delivery-preview {
      background: #f5f5f7;
      border-radius: var(--radius-sm);
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .preview-label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .preview-name { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
    .preview-addr { font-size: 0.9rem; color: var(--text-secondary); font-weight: 500; }
    .preview-phone { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; margin-top: 4px; }

    .btn-checkout { width: 100%; padding: 16px; font-size: 1.05rem; margin-bottom: 12px; letter-spacing: -0.01em; }
    .spinner { display: inline-block; animation: spin 1s linear infinite; }
    .continue-link { display: block; text-align: center; color: var(--secondary); font-size: 0.9rem; text-decoration: none; font-weight: 500; transition: var(--transition); }
    .continue-link:hover { color: var(--text-primary); }
    @media (max-width: 1024px) { .cart-layout { grid-template-columns: 1fr; } .cart-summary { position: static; } }
    @media (max-width: 600px) {
      .cart-card { flex-direction: column; align-items: flex-start; }
      .item-controls { width: 100%; justify-content: space-between; }
      .form-row { grid-template-columns: 1fr; }
    }
  `],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  loading = true;
  orderPlacing = false;
  showToast = false;
  toastMsg = '';
  submitted = false;
  selectedPayment: 'cash' | 'instapay' | 'vodafone_cash' | '' = '';

  delivery: DeliveryInfo = {
    fullName: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  };

  cities = [
    'Cairo', 'Giza', 'Alexandria', 'Luxor', 'Aswan',
    'Port Said', 'Suez', 'Mansoura', 'Tanta', 'Ismailia',
    'Faiyum', 'Zagazig', 'Damietta', 'Minya', 'Beni Suef',
    'Sohag', 'Hurghada', 'Sharm El Sheikh', '6th of October', 'New Cairo',
  ];

  paymentMethods = [
    { value: 'cash' as const, icon: '💵', name: 'Cash on Delivery', desc: 'Pay when you receive your order' },
    { value: 'instapay' as const, icon: '🏦', name: 'InstaPay', desc: 'Instant bank transfer' },
    { value: 'vodafone_cash' as const, icon: '📱', name: 'Vodafone Cash', desc: 'Pay via Vodafone Cash wallet' },
  ];

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  get total(): number {
    return this.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  loadCart(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.cartService.getCartItems(user.id).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onQtyChange(item: CartItem): void {
    if (item.quantity < 1) item.quantity = 1;
    this.cartService.updateQuantity(item.id, item.quantity).subscribe();
  }

  increaseQty(item: CartItem): void {
    item.quantity++;
    this.cartService.updateQuantity(item.id, item.quantity).subscribe();
  }

  decreaseQty(item: CartItem): void {
    if (item.quantity <= 1) return;
    item.quantity--;
    this.cartService.updateQuantity(item.id, item.quantity).subscribe();
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id).subscribe(() => {
      this.cartItems = this.cartItems.filter((i) => i.id !== item.id);
    });
  }

  get isDeliveryValid(): boolean {
    return !!(this.delivery.fullName && this.delivery.phone && this.delivery.address && this.delivery.city);
  }

  placeOrder(): void {
    this.submitted = true;
    const user = this.authService.getCurrentUser();
    if (!user || this.cartItems.length === 0) return;
    if (!this.isDeliveryValid || !this.selectedPayment) return;

    this.orderPlacing = true;

    const order = {
      userId: user.id,
      total: this.total,
      status: 'pending' as const,
      date: new Date().toISOString(),
      paymentMethod: this.selectedPayment as 'cash' | 'instapay' | 'vodafone_cash',
      delivery: { ...this.delivery },
      items: this.cartItems.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    };

    this.orderService.placeOrder(order).subscribe({
      next: () => {
        // Reduce stock for each product
        this.cartItems.forEach((item) =>
          this.productService.getProductById(item.productId).subscribe((product) => {
            const newStock = Math.max(0, product.stock - item.quantity);
            this.productService.updateProduct(product.id, { stock: newStock }).subscribe();
          })
        );

        // Clear cart items
        this.cartItems.forEach((i) =>
          this.cartService.removeFromCart(i.id).subscribe()
        );
        this.cartItems = [];
        this.cartService.setCartCount(0);
        this.orderPlacing = false;
        this.submitted = false;
        this.selectedPayment = '';
        this.delivery = { fullName: '', phone: '', address: '', city: '', notes: '' };
        this.toastMsg = '🎉 Order placed successfully!';
        this.showToast = true;
        setTimeout(() => (this.showToast = false), 3000);
      },
      error: () => (this.orderPlacing = false),
    });
  }
}
