/**
 * Universal ERP — High-Performance Application Loading Screen
 */

export class LoadingScreenService {
  static loaderEl = null;
  static statusInterval = null;
  static isShown = false;

  static messages = [
    'Preparing your workspace...',
    'Loading your business OS...',
    'Connecting your inventory & POS...',
    'Preparing your dashboard...',
    'Almost ready...'
  ];

  static render() {
    if (document.getElementById('erp-loading-screen')) {
      return document.getElementById('erp-loading-screen');
    }

    const overlay = document.createElement('div');
    overlay.id = 'erp-loading-screen';
    overlay.className = 'erp-loader-overlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.setAttribute('aria-label', 'Loading Universal ERP Workspace');

    overlay.innerHTML = `
      <div class="erp-loader-box">
        <div class="erp-loader-logo-ring">
          <div class="erp-loader-ring"></div>
          <div class="erp-loader-icon">🌐</div>
        </div>
        <div class="erp-loader-title">Universal ERP</div>
        <div class="erp-loader-progress-track">
          <div class="erp-loader-progress-bar"></div>
        </div>
        <div id="erp-loader-status" class="erp-loader-status-msg">${this.messages[0]}</div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.loaderEl = overlay;
    return overlay;
  }

  static show() {
    this.render();
    if (!this.loaderEl) return;
    this.loaderEl.classList.remove('fade-out');
    this.isShown = true;

    let index = 0;
    const statusEl = document.getElementById('erp-loader-status');
    if (this.statusInterval) clearInterval(this.statusInterval);

    this.statusInterval = setInterval(() => {
      index = (index + 1) % this.messages.length;
      if (statusEl) {
        statusEl.style.opacity = '0';
        setTimeout(() => {
          statusEl.textContent = this.messages[index];
          statusEl.style.opacity = '1';
        }, 150);
      }
    }, 450);
  }

  static hide() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }

    const overlay = this.loaderEl || document.getElementById('erp-loading-screen');
    if (overlay) {
      overlay.classList.add('fade-out');
      this.isShown = false;
      setTimeout(() => {
        if (overlay.parentNode && overlay.classList.contains('fade-out')) {
          // Keep element or detach
        }
      }, 500);
    }
  }
}
