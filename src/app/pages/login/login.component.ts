import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-page page-container">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <div class="auth-logo">⚡</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your ShopZone account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
          <div class="input-group">
            <label for="email">Email Address</label>
            <input
              id="login-email"
              type="email"
              formControlName="email"
              placeholder="you@shopzone.com"
              [class.error]="isInvalid('email')"
              autocomplete="email"
            />
            <div class="error-msg" *ngIf="isInvalid('email')">
              <ng-container *ngIf="f['email'].errors?.['required']">⚠ Email is required</ng-container>
              <ng-container *ngIf="f['email'].errors?.['email']">⚠ Enter a valid email</ng-container>
            </div>
          </div>

          <div class="input-group">
            <label for="password">Password</label>
            <div class="pw-wrap">
              <input
                id="login-password"
                [type]="showPw ? 'text' : 'password'"
                formControlName="password"
                placeholder="Minimum 8 characters"
                [class.error]="isInvalid('password')"
                autocomplete="current-password"
              />
              <button type="button" class="pw-toggle" (click)="showPw = !showPw">
                {{ showPw ? '🙈' : '👁' }}
              </button>
            </div>
            <div class="error-msg" *ngIf="isInvalid('password')">
              <ng-container *ngIf="f['password'].errors?.['required']">⚠ Password is required</ng-container>
              <ng-container *ngIf="f['password'].errors?.['minlength']">⚠ Minimum 8 characters</ng-container>
            </div>
          </div>

          <div class="form-error" *ngIf="loginError">
            <span>🚫 {{ loginError }}</span>
          </div>

          <button
            type="submit"
            class="btn-primary btn-full"
            [disabled]="loginForm.invalid || loading"
            id="login-submit"
          >
            <span *ngIf="!loading">Sign In →</span>
            <span *ngIf="loading" class="spinner">⟳</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Create one →</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 48px 40px;
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      box-shadow: var(--shadow-card);
      animation: floatIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
    @keyframes floatIn {
      from { opacity: 0; transform: translateY(30px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .auth-header { text-align: center; margin-bottom: 40px; }
    .auth-logo { font-size: 3rem; margin-bottom: 12px; }
    .auth-header h1 { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; letter-spacing: -0.02em; }
    .auth-header p { color: var(--text-secondary); font-size: 1rem; font-weight: 500; }
    .pw-wrap { position: relative; }
    .pw-wrap input { padding-right: 48px; }
    .pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1rem; color: var(--text-secondary); padding: 4px; transition: var(--transition); }
    .pw-toggle:hover { color: var(--text-primary); }
    .form-error {
      background: #fff0f0;
      color: var(--danger);
      border: 1px solid rgba(255, 59, 48, 0.2);
      border-radius: var(--radius-sm);
      padding: 12px 16px;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 20px;
      text-align: center;
    }
    .btn-full { width: 100%; padding: 16px; font-size: 1.05rem; letter-spacing: -0.01em; }
    .spinner { display: inline-block; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer { text-align: center; margin-top: 32px; color: var(--text-secondary); font-size: 0.95rem; font-weight: 500; }
    .auth-footer a { color: var(--secondary); text-decoration: none; font-weight: 600; transition: var(--transition); }
    .auth-footer a:hover { color: var(--secondary-hover); }
  `],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loginError = '';
  loading = false;
  showPw = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/products']);
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.loginError = '';
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (users) => {
        this.loading = false;
        if (users && users.length > 0) {
          this.router.navigate(['/products']);
        } else {
          this.loginError = 'Invalid email or password';
        }
      },
      error: () => {
        this.loading = false;
        this.loginError = 'Connection error. Is JSON Server running?';
      },
    });
  }
}
