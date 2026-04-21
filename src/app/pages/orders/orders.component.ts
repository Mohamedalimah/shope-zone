import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-hero">
        <h1 class="page-title">📦 Order History</h1>
        <p class="page-subtitle">Track all your past orders</p>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="loading">
        <div class="loader"></div>
        <p>Loading orders...</p>
      </div>

      <!-- Empty -->
      <div class="empty-state" *ngIf="!loading && orders.length === 0">
        <div class="empty-icon">🚀</div>
        <h3>No orders yet</h3>
        <p>Start shopping to see your orders here</p>
        <a routerLink="/products" class="btn-ghost">Browse Products →</a>
      </div>

      <!-- Orders List -->
      <div class="orders-list" *ngIf="!loading && orders.length > 0">
        <div class="order-card glass-card" *ngFor="let order of orders">
          <!-- Header -->
          <div class="order-header">
            <div class="order-id-wrap">
              <span class="order-label">Order</span>
              <span class="order-id">#{{ order.id }}</span>
            </div>
            <span [class]="'badge badge-' + order.status">
              {{ order.status | titlecase }}
            </span>
          </div>

          <!-- Meta -->
          <div class="order-meta">
            <div class="meta-item">
              <span class="meta-label">📅 Date</span>
              <span class="meta-val">{{ order.date | date:'mediumDate' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">💰 Total</span>
              <span class="meta-val total-val">EGP {{ order.total | number }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">🛍 Items</span>
              <span class="meta-val">{{ order.items.length }}</span>
            </div>
            <div class="meta-item" *ngIf="order.paymentMethod">
              <span class="meta-label">💳 Payment</span>
              <span class="meta-val">{{ getPaymentLabel(order.paymentMethod) }}</span>
            </div>
          </div>

          <!-- Expandable items -->
          <div class="order-toggle" (click)="toggleOrder(order.id)">
            <span>{{ expanded.has(order.id) ? '▲ Hide Items' : '▼ View Items' }}</span>
          </div>

          <div class="order-items" *ngIf="expanded.has(order.id)">
            <div class="order-item-row" *ngFor="let item of order.items">
              <span class="oi-name">{{ item.name }}</span>
              <span class="oi-qty">× {{ item.quantity }}</span>
              <span class="oi-price">EGP {{ item.price * item.quantity | number }}</span>
            </div>

            <!-- Delivery Info -->
            <div class="delivery-block" *ngIf="order.delivery">
              <div class="delivery-header">📍 Delivery Details</div>
              <div class="delivery-row">
                <span class="dl-label">Name</span>
                <span class="dl-val">{{ order.delivery.fullName }}</span>
              </div>
              <div class="delivery-row">
                <span class="dl-label">Phone</span>
                <span class="dl-val">{{ order.delivery.phone }}</span>
              </div>
              <div class="delivery-row">
                <span class="dl-label">Address</span>
                <span class="dl-val">{{ order.delivery.address }}, {{ order.delivery.city }}</span>
              </div>
              <div class="delivery-row" *ngIf="order.delivery.notes">
                <span class="dl-label">Notes</span>
                <span class="dl-val">{{ order.delivery.notes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-hero { margin-bottom: 32px; }
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 40vh; gap: 16px; color: var(--text-secondary); }
    .loader { width: 44px; height: 44px; border: 3px solid rgba(0,0,0,0.05); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .orders-list { display: flex; flex-direction: column; gap: 20px; }
    .order-card { padding: 24px 28px; }
    .order-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .order-id-wrap { display: flex; flex-direction: column; gap: 2px; }
    .order-label { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .order-id { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
    .order-meta { display: flex; gap: 32px; flex-wrap: wrap; margin-bottom: 16px; }
    .meta-item { display: flex; flex-direction: column; gap: 4px; }
    .meta-label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; }
    .meta-val { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
    .total-val { font-weight: 700; color: var(--text-primary); }
    .order-toggle { cursor: pointer; font-size: 0.9rem; font-weight: 500; color: var(--secondary); padding: 12px 0; border-top: 1px solid var(--border-color); margin-top: 12px; user-select: none; transition: var(--transition); display: inline-flex; }
    .order-toggle:hover { color: var(--secondary-hover); }
    .order-items { padding-top: 12px; display: flex; flex-direction: column; gap: 12px; }
    .order-item-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f5f5f7; border-radius: var(--radius-sm); }
    .oi-name { font-size: 0.95rem; font-weight: 500; color: var(--text-primary); flex: 1; }
    .oi-qty { font-size: 0.9rem; color: var(--text-secondary); padding: 0 16px; font-weight: 500;}
    .oi-price { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
    /* Delivery Block */
    .delivery-block { margin-top: 16px; padding: 20px; background: #f5f5f7; border-radius: var(--radius-sm); }
    .delivery-header { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; letter-spacing: -0.01em; }
    .delivery-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
    .delivery-row + .delivery-row { border-top: 1px solid var(--border-color); }
    .dl-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
    .dl-val { font-size: 0.9rem; color: var(--text-primary); font-weight: 600; text-align: right; }
  `],
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  expanded = new Set<number>();

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.orderService.getOrders(user.id).subscribe({
      next: (orders) => {
        this.orders = orders.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  toggleOrder(id: number): void {
    this.expanded.has(id) ? this.expanded.delete(id) : this.expanded.add(id);
  }

  getPaymentLabel(method: string): string {
    const labels: Record<string, string> = {
      cash: 'Cash on Delivery',
      instapay: 'InstaPay',
      vodafone_cash: 'Vodafone Cash',
    };
    return labels[method] || method;
  }
}
