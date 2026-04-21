import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-hero">
        <h1 class="page-title">👤 My Profile</h1>
        <p class="page-subtitle">Your account details and settings</p>
      </div>

      <div class="profile-layout" *ngIf="user">
        <!-- Avatar Card -->
        <div class="profile-avatar-card glass-card">
          <div class="avatar-ring">
            <div class="big-avatar">{{ userInitial }}</div>
          </div>
          <h2 class="profile-name">{{ user.name }}</h2>
          <span class="role-badge" [class.admin]="user.role === 'admin'">
            {{ user.role === 'admin' ? '⭐ Admin' : '👤 User' }}
          </span>
          <button class="btn-logout" (click)="logout()" id="logout-btn">
            🚪 Sign Out
          </button>
        </div>

        <!-- Info Cards -->
        <div class="profile-info">
          <div class="info-card glass-card">
            <div class="info-icon">📧</div>
            <div class="info-body">
              <span class="info-label">Email Address</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
          </div>

          <div class="info-card glass-card">
            <div class="info-icon">🆔</div>
            <div class="info-body">
              <span class="info-label">User ID</span>
              <span class="info-value id-value">{{ userId }}</span>
            </div>
            <div class="interceptor-note">
              <span class="note-badge">🔐 Interceptor</span>
              <span class="note-text">This ID is sent as <code>Authorization: Bearer {{ userId }}</code> on every API request</span>
            </div>
          </div>

          <div class="info-card glass-card">
            <div class="info-icon">🛡</div>
            <div class="info-body">
              <span class="info-label">Account Role</span>
              <span class="info-value role-val" [class.admin]="user.role === 'admin'">
                {{ user.role | titlecase }}
              </span>
            </div>
          </div>

          <div class="info-card glass-card">
            <div class="info-icon">📅</div>
            <div class="info-body">
              <span class="info-label">Session Active</span>
              <span class="info-value">Since login — stored in localStorage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-hero { margin-bottom: 36px; }
    .profile-layout { display: grid; grid-template-columns: 300px 1fr; gap: 28px; align-items: start; }
    .profile-avatar-card { padding: 40px 28px; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; position: sticky; top: 100px; }
    .avatar-ring {
      width: 110px; height: 110px;
      border-radius: 50%;
      padding: 4px;
      background: #f5f5f7;
      border: 1px solid var(--border-color);
    }
    .big-avatar {
      width: 100%; height: 100%;
      border-radius: 50%;
      background: var(--bg-card);
      display: flex; align-items: center; justify-content: center;
      font-size: 2.8rem; font-weight: 800;
      color: var(--text-primary);
    }
    .profile-name { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
    .role-badge {
      display: inline-block;
      background: #f5f5f7;
      color: var(--text-secondary);
      border: none;
      padding: 6px 16px;
      border-radius: var(--radius-pill);
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .role-badge.admin { background: #fff8e6; color: var(--warning); }
    .btn-logout {
      background: transparent;
      color: var(--danger);
      border: 1px solid rgba(255, 59, 48, 0.3);
      padding: 14px 28px;
      border-radius: var(--radius-pill);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      width: 100%;
      margin-top: 8px;
    }
    .btn-logout:hover { background: rgba(255, 59, 48, 0.05); }
    .profile-info { display: flex; flex-direction: column; gap: 16px; }
    .info-card { padding: 24px; display: flex; align-items: flex-start; gap: 20px; }
    .info-icon { font-size: 1.6rem; padding-top: 2px; color: var(--primary); filter: grayscale(1); opacity: 0.8;}
    .info-body { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .info-label { font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .info-value { font-size: 1.05rem; color: var(--text-primary); font-weight: 600; }
    .id-value { font-family: monospace; font-size: 1.2rem; color: var(--text-primary); }
    .role-val { color: var(--text-primary); text-transform: capitalize; }
    .role-val.admin { color: var(--warning); }
    .interceptor-note { margin-top: 16px; padding: 12px 16px; background: #f5f5f7; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
    .note-badge { background: #ffffff; color: var(--primary); border: 1px solid var(--border-color); padding: 4px 12px; border-radius: var(--radius-pill); font-size: 0.8rem; font-weight: 600; white-space: nowrap; }
    .note-text { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; font-weight: 500; }
    .note-text code { color: var(--primary); background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color); font-weight: 600;}
    @media (max-width: 820px) { .profile-layout { grid-template-columns: 1fr; } .profile-avatar-card { position: static; } }
  `],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  userId = '';

  get userInitial(): string {
    return this.user?.name?.charAt(0).toUpperCase() ?? '?';
  }

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.userId = localStorage.getItem('userId') ?? '';
  }

  logout(): void {
    this.authService.logout();
  }
}
