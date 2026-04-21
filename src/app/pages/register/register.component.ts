import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

function mustMatch(pw: string, confirm: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const p = group.get(pw)?.value;
    const c = group.get(confirm)?.value;
    return p === c ? null : { mustMatch: true };
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-page page-container">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <div class="auth-logo">🚀</div>
          <h1>Create Account</h1>
          <p>Join ShopZone today</p>
        </div>

        <div class="success-msg" *ngIf="successMsg">
          <span>✅ {{ successMsg }}</span>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
          <div class="input-group">
            <label>Full Name</label>
            <input id="reg-name" type="text" formControlName="name" placeholder="Ahmed Ali" [class.error]="isInvalid('name')" />
            <div class="error-msg" *ngIf="isInvalid('name')">
              <ng-container *ngIf="f['name'].errors?.['required']">⚠ Full name is required</ng-container>
              <ng-container *ngIf="f['name'].errors?.['minlength']">⚠ Minimum 3 characters</ng-container>
            </div>
          </div>

          <div class="input-group">
            <label>Email Address</label>
            <input id="reg-email" type="email" formControlName="email" placeholder="you@shopzone.com" [class.error]="isInvalid('email')" autocomplete="email" />
            <div class="error-msg" *ngIf="isInvalid('email')">
              <ng-container *ngIf="f['email'].errors?.['required']">⚠ Email is required</ng-container>
              <ng-container *ngIf="f['email'].errors?.['email']">⚠ Enter a valid email</ng-container>
            </div>
          </div>

          <div class="input-group">
            <label>Password</label>
            <div class="pw-wrap">
              <input id="reg-password" [type]="showPw ? 'text':'password'" formControlName="password" placeholder="Minimum 8 characters" [class.error]="isInvalid('password')" autocomplete="new-password" />
              <button type="button" class="pw-toggle" (click)="showPw=!showPw">{{ showPw ? '🙈' : '👁' }}</button>
            </div>
            <div class="error-msg" *ngIf="isInvalid('password')">
              <ng-container *ngIf="f['password'].errors?.['required']">⚠ Password is required</ng-container>
              <ng-container *ngIf="f['password'].errors?.['minlength']">⚠ Minimum 8 characters</ng-container>
            </div>
          </div>

          <div class="input-group">
            <label>Confirm Password</label>
            <input id="reg-confirm" [type]="showPw ? 'text':'password'" formControlName="confirmPassword" placeholder="Repeat your password" [class.error]="confirmInvalid" autocomplete="new-password" />
            <div class="error-msg" *ngIf="confirmInvalid">⚠ Passwords do not match</div>
          </div>

          <div class="form-error" *ngIf="apiError">🚫 {{ apiError }}</div>

          <button type="submit" class="btn-primary btn-full" [disabled]="registerForm.invalid || loading" id="register-submit">
            <span *ngIf="!loading">Create Account →</span>
            <span *ngIf="loading" class="spinner">⟳</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Sign in →</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; align-items: center; justify-content: center; }
    .auth-card { width: 100%; max-width: 440px; padding: 48px 40px; position: relative; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius); box-shadow: var(--shadow-card); animation: floatIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
    @keyframes floatIn { from { opacity:0; transform:translateY(30px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
    .auth-header { text-align: center; margin-bottom: 40px; }
    .auth-logo { font-size: 3rem; margin-bottom: 12px; }
    .auth-header h1 { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; letter-spacing: -0.02em; }
    .auth-header p { color: var(--text-secondary); font-size: 1rem; font-weight: 500; }
    .pw-wrap { position: relative; }
    .pw-wrap input { padding-right: 48px; }
    .pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1rem; color: var(--text-secondary); transition: var(--transition); }
    .pw-toggle:hover { color: var(--text-primary); }
    .form-error { background: #fff0f0; border: 1px solid rgba(255, 59, 48, 0.2); border-radius: var(--radius-sm); padding: 12px 16px; color: var(--danger); font-size: 0.9rem; font-weight: 500; margin-bottom: 20px; text-align: center; }
    .success-msg { background: #f0fdf4; border: 1px solid rgba(52, 199, 89, 0.2); border-radius: var(--radius-sm); padding: 12px 16px; color: var(--success); font-size: 0.9rem; font-weight: 500; margin-bottom: 20px; text-align: center; }
    .btn-full { width: 100%; padding: 16px; font-size: 1.05rem; letter-spacing: -0.01em; }
    .spinner { display: inline-block; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-footer { text-align: center; margin-top: 32px; color: var(--text-secondary); font-size: 0.95rem; font-weight: 500; }
    .auth-footer a { color: var(--secondary); text-decoration: none; font-weight: 600; transition: var(--transition); }
    .auth-footer a:hover { color: var(--secondary-hover); }
  `],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  apiError = '';
  successMsg = '';
  loading = false;
  showPw = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: mustMatch('password', 'confirmPassword') }
    );
  }

  get f() {
    return this.registerForm.controls;
  }

  get confirmInvalid(): boolean {
    const c = this.registerForm.get('confirmPassword');
    return !!(
      (c?.dirty || c?.touched) &&
      (this.registerForm.errors?.['mustMatch'] || c?.errors?.['required'])
    );
  }

  isInvalid(field: string): boolean {
    const ctrl = this.registerForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.apiError = '';
    const { name, email, password } = this.registerForm.value;
    this.authService
      .register({ name, email, password, role: 'user' })
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMsg = 'Account created! Please log in.';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: () => {
          this.loading = false;
          this.apiError = 'Registration failed. Please try again.';
        },
      });
  }
}
