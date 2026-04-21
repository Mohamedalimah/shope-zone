import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  template: `
    <div class="nf-page">
      <div class="nf-bg-orb o1"></div>
      <div class="nf-bg-orb o2"></div>
      <div class="nf-content">
        <div class="nf-number">404</div>
        <div class="nf-icon">🌌</div>
        <h1 class="nf-title">Lost in Space</h1>
        <p class="nf-desc">This page doesn't exist in our universe.<br/>It may have been moved or never existed.</p>
        <button class="btn-primary nf-btn" (click)="goHome()" id="go-home-btn">
          <span>🚀 Return to ShopZone</span>
        </button>
      </div>
      <div class="nf-orbit">
        <div class="nf-planet"></div>
        <div class="nf-moon"></div>
      </div>
    </div>
  `,
  styles: [`
    .nf-page {
      min-height: calc(100vh - 80px);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      text-align: center;
    }
    .nf-bg-orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; }
    .o1 { width: 500px; height: 500px; background: rgba(139,92,246,0.2); top: -100px; left: -100px; }
    .o2 { width: 400px; height: 400px; background: rgba(34,211,238,0.15); bottom: -80px; right: -80px; }
    .nf-content { position: relative; z-index: 1; padding: 40px 20px; }
    .nf-number {
      font-size: clamp(6rem, 15vw, 12rem);
      font-weight: 900;
      line-height: 1;
      background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(34,211,238,0.3));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -4px;
      filter: blur(0);
      text-shadow: none;
      position: relative;
      animation: flicker 4s ease-in-out infinite;
    }
    @keyframes flicker {
      0%,100% { opacity: 1; }
      48% { opacity: 1; }
      50% { opacity: 0.8; }
      52% { opacity: 1; }
    }
    .nf-icon { font-size: 4rem; margin: 8px 0; animation: float 3s ease-in-out infinite; }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
    .nf-title { font-size: 2.2rem; font-weight: 800; background: linear-gradient(135deg,#fff,#a78bfa,#22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 16px; }
    .nf-desc { color: #64748b; font-size: 1rem; line-height: 1.7; margin-bottom: 40px; }
    .nf-btn { padding: 16px 40px; font-size: 1rem; }
    .nf-btn span { position: relative; z-index: 1; }
    .nf-orbit {
      position: absolute;
      width: 300px; height: 300px;
      border: 1px dashed rgba(139,92,246,0.2);
      border-radius: 50%;
      animation: orbit-spin 20s linear infinite;
      bottom: 5%;
      right: 5%;
    }
    .nf-planet {
      position: absolute;
      width: 30px; height: 30px;
      background: linear-gradient(135deg,#7c3aed,#3b82f6);
      border-radius: 50%;
      top: -15px; left: 50%;
      transform: translateX(-50%);
      box-shadow: 0 0 20px rgba(139,92,246,0.8);
    }
    .nf-moon {
      position: absolute;
      width: 14px; height: 14px;
      background: linear-gradient(135deg,#22d3ee,#60a5fa);
      border-radius: 50%;
      bottom: -7px; right: -7px;
      box-shadow: 0 0 12px rgba(34,211,238,0.6);
    }
    @keyframes orbit-spin { to { transform: rotate(360deg); } }
  `],
})
export class NotFoundComponent {
  constructor(private router: Router) {}
  goHome(): void { this.router.navigate(['/products']); }
}
