import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled">
      <div class="nav-inner">
        <!-- Logo -->
        <a routerLink="/products" class="nav-logo">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="logo-svg">
            <path d="M4 7l16 0" />
            <path d="M10 11l0 6" />
            <path d="M14 11l0 6" />
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
          </svg>
          <span class="logo-text">Shop<span class="logo-accent">Zone.</span></span>
        </a>

        <!-- Nav Links -->
        <div class="nav-links" [class.open]="menuOpen">
          <ng-container *ngIf="!isLoggedIn">
            <a routerLink="/login" routerLinkActive="active" class="nav-link" (click)="menuOpen=false">Login</a>
            <a routerLink="/register" routerLinkActive="active" class="nav-link" (click)="menuOpen=false">Register</a>
          </ng-container>

          <ng-container *ngIf="isLoggedIn">
            <a routerLink="/products" routerLinkActive="active" class="nav-link" (click)="menuOpen=false">
              <span>Products</span>
            </a>
            <a routerLink="/cart" routerLinkActive="active" class="nav-link cart-link" (click)="menuOpen=false">
              <span>Cart</span>
              <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
            </a>
            <a routerLink="/orders" routerLinkActive="active" class="nav-link" (click)="menuOpen=false">Orders</a>
            <a routerLink="/profile" routerLinkActive="active" class="nav-link" (click)="menuOpen=false">Profile</a>
            <div class="nav-user">
              <span class="user-avatar">{{ userInitial }}</span>
              <span class="user-name">{{ currentUser?.name }}</span>
            </div>
            <button class="btn-logout" (click)="logout()">Logout</button>
          </ng-container>
        </div>

        <!-- Hamburger -->
        <button class="hamburger" (click)="menuOpen = !menuOpen" aria-label="Toggle menu">
          <span [class.open]="menuOpen"></span>
          <span [class.open]="menuOpen"></span>
          <span [class.open]="menuOpen"></span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      padding: 0 24px;
      height: 72px;
      display: flex;
      align-items: center;
      background: rgba(251, 251, 253, 0.8);
      backdrop-filter: saturate(180%) blur(20px);
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      border-bottom: 1px solid var(--border-color);
      transition: all 0.3s ease;
    }
    .navbar.scrolled {
      background: rgba(255, 255, 255, 0.95);
      box-shadow: var(--shadow-navbar);
    }
    .nav-inner {
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary);
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.05em;
      flex-shrink: 0;
    }
    .logo-svg { color: var(--text-primary); }
    .logo-accent { font-weight: 400; color: var(--text-secondary); }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
      text-decoration: none;
      padding: 8px 14px;
      border-radius: var(--radius-pill);
      font-size: 0.95rem;
      font-weight: 500;
      transition: var(--transition);
      position: relative;
    }
    .nav-link:hover { color: var(--text-primary); background: #f5f5f7; }
    .nav-link.active { color: var(--text-primary); background: #f5f5f7; font-weight: 600; }
    .cart-link { position: relative; }
    .cart-badge {
      background: var(--secondary);
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      min-width: 20px;
      height: 20px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
    }
    .nav-user {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 30px;
      margin-left: 4px;
    }
    .user-avatar {
      width: 28px; height: 28px;
      background: #f5f5f7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .user-name { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .btn-logout {
      background: transparent;
      color: var(--text-secondary);
      border: none;
      padding: 8px 16px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      margin-left: 4px;
    }
    .btn-logout:hover { color: var(--danger); }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 6px; }
    .hamburger span {
      display: block; width: 24px; height: 2px;
      background: var(--text-primary); border-radius: 2px;
      transition: all 0.3s ease;
    }
    .hamburger span.open:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
    .hamburger span.open:nth-child(2) { opacity: 0; }
    .hamburger span.open:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }

    @media (max-width: 768px) {
      .hamburger { display: flex; }
      .nav-links {
        display: none;
        position: absolute;
        top: 72px; left: 0; right: 0;
        flex-direction: column;
        background: rgba(255,255,255,0.98);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--border-color);
        padding: 20px 24px;
        gap: 8px;
        align-items: flex-start;
        box-shadow: 0 20px 40px rgba(0,0,0,0.05);
      }
      .nav-links.open { display: flex; }
      .nav-user { width: 100%; border: none; padding: 0; background: none; margin-bottom: 12px; }
      .btn-logout { width: 100%; text-align: left; padding-left: 0; }
    }
  `],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: User | null = null;
  cartCount = 0;
  scrolled = false;
  menuOpen = false;
  private sub!: Subscription;

  get userInitial(): string {
    return this.currentUser?.name?.charAt(0).toUpperCase() ?? '?';
  }

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.sub = this.cartService.cartCount.subscribe(
      (count) => (this.cartCount = count)
    );
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkAuth();
    });
    window.addEventListener('storage', () => this.checkAuth());
    window.addEventListener('scroll', this.onScroll);
  }

  checkAuth(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.authService.getCurrentUser();
    if (this.isLoggedIn && this.currentUser) {
      this.cartService
        .getCartItems(this.currentUser.id)
        .subscribe((items) => this.cartService.setCartCount(items.length));
    }
  }

  onScroll = (): void => {
    this.scrolled = window.scrollY > 20;
  };

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.currentUser = null;
    this.cartService.setCartCount(0);
    this.menuOpen = false;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    window.removeEventListener('scroll', this.onScroll);
  }
}
