/**
 * Universal ERP — Offline Resilience & Local-First POS Product Deep Dive Page (/product/offline-pos)
 * Phase 24 — Restored Dedicated Offline Resilience & Local-First Hub
 */

// Client-Side Interactive Controllers for Offline POS Simulator
if (typeof window !== 'undefined') {
  window.offlineSimState = {
    isOnline: true,
    localQueue: [
      { id: 'OFF-1092', items: 2, total: 3949, payment: 'Cash (PKR 4,000)', customer: 'Walk-in Customer', time: '11:04:12 AM', synced: true },
      { id: 'OFF-1093', items: 1, total: 1250, payment: 'Credit Ledger', customer: 'Hassan Trading Co.', time: '11:05:40 AM', synced: true },
    ],
    preCachedCatalogCount: 1048,
  };

  window.toggleNetworkSim = () => {
    window.offlineSimState.isOnline = !window.offlineSimState.isOnline;
    const badge = document.getElementById('offline-sim-net-badge');
    const toggleBtn = document.getElementById('offline-net-toggle-btn');
    const banner = document.getElementById('offline-sim-banner');

    if (badge && toggleBtn) {
      if (window.offlineSimState.isOnline) {
        badge.innerHTML = '● ONLINE (Cloud Connected)';
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
        badge.style.color = '#34d399';
        badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        toggleBtn.innerText = 'Simulate Network Disconnect (Go Offline)';
        toggleBtn.className = 'mkt-btn mkt-btn-secondary';
        if (banner) banner.style.display = 'none';
        window.triggerOfflineToast('Network Restored: Background auto-sync worker active.');
      } else {
        badge.innerHTML = '● OFFLINE (Local Storage Active)';
        badge.style.background = 'rgba(239, 68, 68, 0.15)';
        badge.style.color = '#f87171';
        badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        toggleBtn.innerText = 'Simulate Network Restore (Go Online)';
        toggleBtn.className = 'mkt-btn mkt-btn-primary';
        if (banner) banner.style.display = 'flex';
        window.triggerOfflineToast('Network Disconnected! POS operating 100% locally from IndexedDB/localStorage.', 'warning');
      }
    }
  };

  window.createSimulatedOfflineSale = () => {
    const saleNum = 1094 + window.offlineSimState.localQueue.length - 2;
    const saleId = `OFF-${saleNum}`;
    const now = new Date().toLocaleTimeString();

    const sampleOrders = [
      { items: 3, total: 4740, payment: 'Cash (PKR 5,000)', customer: 'Walk-in Customer' },
      { items: 1, total: 2699, payment: 'Split Tender (Cash + Ledger)', customer: 'Al-Madina Stores' },
      { items: 4, total: 6100, payment: 'Card Terminal Receipt', customer: 'Prime Tech Labs' },
    ];

    const pick = sampleOrders[window.offlineSimState.localQueue.length % sampleOrders.length];
    const isOffline = !window.offlineSimState.isOnline;

    const newSale = {
      id: saleId,
      items: pick.items,
      total: pick.total,
      payment: pick.payment,
      customer: pick.customer,
      time: now,
      synced: !isOffline,
    };

    window.offlineSimState.localQueue.unshift(newSale);
    window.renderOfflineQueueList();

    if (isOffline) {
      window.triggerOfflineToast(`Offline Sale ${saleId} recorded locally! UUID stored in queue. Thermal receipt generated instantly.`);
    } else {
      window.triggerOfflineToast(`Online Sale ${saleId} processed directly through cloud API.`);
    }
  };

  window.syncOfflineQueueSim = () => {
    const pending = window.offlineSimState.localQueue.filter((s) => !s.synced);
    if (pending.length === 0) {
      window.triggerOfflineToast('All sales already synchronized with central cloud database.');
      return;
    }

    window.offlineSimState.isOnline = true;
    const badge = document.getElementById('offline-sim-net-badge');
    const toggleBtn = document.getElementById('offline-net-toggle-btn');
    const banner = document.getElementById('offline-sim-banner');
    if (badge) {
      badge.innerHTML = '● SYNCING BATCH (Idempotent Worker)...';
      badge.style.background = 'rgba(245, 158, 11, 0.15)';
      badge.style.color = '#fbbf24';
      badge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    }

    setTimeout(() => {
      window.offlineSimState.localQueue.forEach((s) => (s.synced = true));
      window.renderOfflineQueueList();

      if (badge) {
        badge.innerHTML = '● ONLINE (All Synced ✓)';
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
        badge.style.color = '#34d399';
        badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      }
      if (toggleBtn) {
        toggleBtn.innerText = 'Simulate Network Disconnect (Go Offline)';
        toggleBtn.className = 'mkt-btn mkt-btn-secondary';
      }
      if (banner) banner.style.display = 'none';

      window.triggerOfflineToast(`Batch Sync Complete: ${pending.length} offline transactions merged idempotently into cloud ledger.`);
    }, 1200);
  };

  window.renderOfflineQueueList = () => {
    const listEl = document.getElementById('offline-queue-list');
    const pendingCountEl = document.getElementById('offline-pending-count');

    if (!listEl) return;

    const pending = window.offlineSimState.localQueue.filter((s) => !s.synced).length;
    if (pendingCountEl) {
      pendingCountEl.innerText = `${pending} Pending Sync`;
      pendingCountEl.style.color = pending > 0 ? '#f87171' : '#34d399';
    }

    listEl.innerHTML = window.offlineSimState.localQueue
      .slice(0, 5)
      .map(
        (s) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid ${s.synced ? 'var(--mkt-border)' : 'rgba(239,68,68,0.3)'}; border-radius:var(--mkt-radius-sm); margin-bottom:8px; font-size:12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="background:${s.synced ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${s.synced ? '#34d399' : '#f87171'}; padding:2px 8px; border-radius:4px; font-family:var(--mkt-font-mono); font-size:11px; font-weight:700;">
            ${s.id}
          </span>
          <div>
            <b style="color:var(--mkt-text-main); display:block;">${s.customer} (${s.items} Items)</b>
            <small style="color:var(--mkt-text-muted);">${s.payment}</small>
          </div>
        </div>
        <div style="text-align:right;">
          <b style="color:${s.synced ? '#34d399' : '#fbbf24'};">PKR ${s.total.toLocaleString()}</b>
          <div style="color:var(--mkt-text-dim); font-size:10px;">${s.synced ? '✓ Cloud Synced' : '⏳ Queued Locally'} • ${s.time}</div>
        </div>
      </div>
    `
      )
      .join('');
  };

  window.triggerOfflineToast = (msg, type = 'success') => {
    const toast = document.getElementById('offline-toast');
    if (toast) {
      toast.innerText = (type === 'success' ? '✓ ' : '⚠ ') + msg;
      toast.style.background = type === 'success' ? '#10b981' : '#f59e0b';
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3500);
    }
  };
}

export function renderProductOfflinePOSPage() {
  return `
    <div class="marketing-wrapper" id="marketing-root">
      <div class="mkt-ambient-glow"></div>

      <!-- Action Feedback Toast -->
      <div id="offline-toast" style="display:none; position:fixed; bottom:24px; right:24px; z-index:9999; background:#10b981; color:#ffffff; padding:12px 20px; border-radius:var(--mkt-radius-md); font-weight:700; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
        ✓ Offline Engine Ready
      </div>

      <!-- Navigation Header -->
      <header class="mkt-navbar" id="mkt-navbar">
        <div class="mkt-container">
          <div class="mkt-nav-inner">
            <div class="mkt-brand" onclick="window.navigateMarketing('/')">
              <div class="mkt-brand-logo">🌐</div>
              <span class="mkt-brand-name">Universal ERP</span>
              <span class="mkt-brand-badge">Business OS</span>
            </div>

            <nav>
              <ul class="mkt-nav-links">
                <li><a class="mkt-nav-link active" href="javascript:void(0)" onclick="window.navigateMarketing('/product')">Product</a></li>
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/industries/retail-ecommerce')">Industries</a></li>
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/solutions/small-business')">Solutions</a></li>
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/pricing')">Pricing</a></li>
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/resources')">Resources</a></li>
              </ul>
            </nav>

            <div class="mkt-nav-actions">
              <button class="mkt-btn mkt-btn-ghost" onclick="window.navigateMarketing('/auth/login')">Sign In</button>
              <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/auth/register')">Get Started Free →</button>
              <button class="mkt-nav-toggle" onclick="window.toggleMarketingMenu()" aria-label="Toggle Menu">☰</button>
            </div>
          </div>
        </div>
      </header>

      <!-- =========================================================================
           SECTION 1: HERO & OFFLINE ARCHITECTURE
           ========================================================================= -->
      <section class="mkt-section" style="padding-top:120px; padding-bottom:60px;">
        <div class="mkt-container">
          <div class="mkt-hero-grid">
            
            <div class="mkt-hero-left">
              <div class="mkt-pill-badge">
                <span class="mkt-pill-pulse"></span>
                <span>LOCAL-FIRST RESILIENCE</span>
              </div>

              <h1 class="mkt-hero-title">
                Zero Downtime.<br>
                <span class="mkt-gradient-text-accent">Never Stop Selling.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Internet outages, power cuts, and spotty 3G shouldn't halt your cash register. Universal ERP runs 100% locally in your browser and synchronizes conflict-free the instant connectivity returns.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Start Selling With Zero Risk</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#offline-demo" style="text-decoration:none;">
                  <span>Interactive Network Simulator</span>
                </a>
              </div>

              <!-- Quick Highlights -->
              <div style="display:flex; gap:16px; margin-top:28px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-muted);">
                <span>✓ 100% In-Browser Local Storage</span>
                <span>•</span>
                <span>✓ Zero Duplicate Sync Guarantee</span>
                <span>•</span>
                <span>✓ Instant Thermal Receipts Without Internet</span>
              </div>
            </div>

            <!-- Interactive Network Simulator & Queue Studio -->
            <div class="mkt-hero-right" id="offline-demo">
              <div class="mkt-dash-preview-frame">
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/pos/offline-sync</span>
                  </div>
                  <div class="mkt-dash-status-pill" id="offline-sim-net-badge">
                    <span style="color:#34d399;">● ONLINE (Cloud Connected)</span>
                  </div>
                </div>

                <div class="mkt-dash-body" style="padding:16px;">
                  
                  <!-- Offline Banner (Visible when offline) -->
                  <div id="offline-sim-banner" style="display:none; align-items:center; justify-content:space-between; padding:10px 14px; background:rgba(239, 68, 68, 0.12); border:1px solid rgba(239, 68, 68, 0.3); border-radius:var(--mkt-radius-sm); margin-bottom:12px;">
                    <div style="display:flex; align-items:center; gap:8px; font-size:12px; color:#f87171; font-weight:700;">
                      <span>📡</span>
                      <span>INTERNET DISCONNECTED — ALL TRANSACTIONS QUEUED LOCALLY</span>
                    </div>
                    <span style="font-size:11px; background:rgba(239,68,68,0.2); color:#fca5a5; padding:2px 6px; border-radius:4px;">100% Operational</span>
                  </div>

                  <!-- Catalog & Cache Status Hub -->
                  <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:14px;">
                    <div style="background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); padding:10px; text-align:center;">
                      <div style="font-size:11px; color:var(--mkt-text-dim);">Pre-Cached SKUs</div>
                      <b style="font-size:14px; color:var(--mkt-text-main);">1,048 Items</b>
                    </div>
                    <div style="background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); padding:10px; text-align:center;">
                      <div style="font-size:11px; color:var(--mkt-text-dim);">Storage Quota</div>
                      <b style="font-size:14px; color:#60a5fa;">0.4 MB / 50 MB</b>
                    </div>
                    <div style="background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); padding:10px; text-align:center;">
                      <div style="font-size:11px; color:var(--mkt-text-dim);">Sync Status</div>
                      <b id="offline-pending-count" style="font-size:14px; color:#34d399;">0 Pending Sync</b>
                    </div>
                  </div>

                  <!-- Simulation Trigger Controls -->
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; gap:8px; flex-wrap:wrap;">
                    <button id="offline-net-toggle-btn" class="mkt-btn mkt-btn-secondary" style="padding:7px 12px; font-size:12px;" onclick="window.toggleNetworkSim()">
                      Simulate Network Disconnect (Go Offline)
                    </button>
                    <div style="display:flex; gap:6px;">
                      <button class="mkt-btn mkt-btn-primary" style="padding:7px 12px; font-size:12px;" onclick="window.createSimulatedOfflineSale()">
                        + Ring Up Sale
                      </button>
                      <button class="mkt-btn mkt-btn-ghost" style="padding:7px 12px; font-size:12px; border:1px solid var(--mkt-border);" onclick="window.syncOfflineQueueSim()">
                        Sync Queue 🔄
                      </button>
                    </div>
                  </div>

                  <!-- Offline Transaction Ledger -->
                  <div style="background:rgba(0,0,0,0.25); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <span style="font-size:12px; font-weight:700; color:var(--mkt-text-main);">Local Transaction Manifest</span>
                      <span style="font-size:11px; color:var(--mkt-text-muted);">Auto-Sync Every 15s</span>
                    </div>
                    <div id="offline-queue-list">
                      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); margin-bottom:8px; font-size:12px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                          <span style="background:rgba(16,185,129,0.15); color:#34d399; padding:2px 8px; border-radius:4px; font-family:var(--mkt-font-mono); font-size:11px; font-weight:700;">OFF-1092</span>
                          <div>
                            <b style="color:var(--mkt-text-main); display:block;">Walk-in Customer (2 Items)</b>
                            <small style="color:var(--mkt-text-muted);">Cash (PKR 4,000)</small>
                          </div>
                        </div>
                        <div style="text-align:right;">
                          <b style="color:#34d399;">PKR 3,949</b>
                          <div style="color:var(--mkt-text-dim); font-size:10px;">✓ Cloud Synced • 11:04 AM</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 2: 3-PILLAR LOCAL-FIRST ARCHITECTURE
           ========================================================================= -->
      <section class="mkt-section mkt-section-alt" style="padding:80px 0;">
        <div class="mkt-container">
          <div class="mkt-section-header">
            <span class="mkt-pill">Under the Hood</span>
            <h2 class="mkt-section-title">The 3-Pillar Local Engine</h2>
            <p class="mkt-section-subtitle">How Universal ERP delivers desktop-class offline reliability on ordinary web browsers.</p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px;">
            <div class="mkt-feature-card">
              <div style="font-size:32px; margin-bottom:16px;">💾</div>
              <h3 style="font-size:18px; font-weight:700; color:var(--mkt-text-main); margin-bottom:10px;">1. Client Catalog Cache</h3>
              <p style="font-size:14px; color:var(--mkt-text-muted); line-height:1.6; margin-bottom:16px;">
                Your top 1,000 products, prices, barcodes, categories, and active tax rates are persisted locally into encrypted browser storage. Barcode lookup works in under 8ms without network calls.
              </p>
              <span class="mkt-badge mkt-badge-blue">Pre-Loaded Manifest</span>
            </div>

            <div class="mkt-feature-card">
              <div style="font-size:32px; margin-bottom:16px;">📦</div>
              <h3 style="font-size:18px; font-weight:700; color:var(--mkt-text-main); margin-bottom:10px;">2. Local Queue & Receipts</h3>
              <p style="font-size:14px; color:var(--mkt-text-muted); line-height:1.6; margin-bottom:16px;">
                Each checkout creates an immutable offline transaction with a cryptographic UUID. 58mm/80mm thermal receipts print instantly via direct USB/ESC-POS commands.
              </p>
              <span class="mkt-badge mkt-badge-cyan">Instant Hardware Print</span>
            </div>

            <div class="mkt-feature-card">
              <div style="font-size:32px; margin-bottom:16px;">🔄</div>
              <h3 style="font-size:18px; font-weight:700; color:var(--mkt-text-main); margin-bottom:10px;">3. Idempotent Ingestion</h3>
              <p style="font-size:14px; color:var(--mkt-text-muted); line-height:1.6; margin-bottom:16px;">
                When WiFi or mobile data restores, the background sync worker flushes queued batches with server-side de-duplication. Exactly 0 duplicate sales or double stock deductions.
              </p>
              <span class="mkt-badge mkt-badge-emerald">Zero Duplicate Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: NO NETWORK DEPENDENCY CHECKOUT
           ========================================================================= -->
      <section class="mkt-section" style="padding:80px 0;">
        <div class="mkt-container">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center;">
            <div>
              <span class="mkt-pill">Full Capabilities</span>
              <h2 class="mkt-section-title" style="text-align:left; margin-top:12px;">Complete POS Workflow Off the Grid</h2>
              <p style="color:var(--mkt-text-muted); font-size:15px; line-height:1.6; margin-bottom:20px;">
                Unlike basic cloud apps that display an error dialog the moment your connection wavers, Universal ERP keeps every cashier function accessible:
              </p>

              <div style="display:flex; flex-direction:column; gap:14px;">
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <span style="color:#34d399; font-weight:bold; font-size:18px;">✓</span>
                  <div>
                    <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Camera & Barcode Gun Scanning</h4>
                    <p style="font-size:13px; color:var(--mkt-text-muted);">Barcode recognition occurs client-side using device CPU, maintaining full 60fps throughput without network lag.</p>
                  </div>
                </div>
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <span style="color:#34d399; font-weight:bold; font-size:18px;">✓</span>
                  <div>
                    <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Split Tender & Change Calculation</h4>
                    <p style="font-size:13px; color:var(--mkt-text-muted);">Integer cents arithmetic calculates discounts, taxes, and exact customer cash change locally.</p>
                  </div>
                </div>
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <span style="color:#34d399; font-weight:bold; font-size:18px;">✓</span>
                  <div>
                    <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Customer Ledger Credit Charging</h4>
                    <p style="font-size:13px; color:var(--mkt-text-muted);">Select pre-cached regular customer accounts and charge outstanding dues to their ledger with offline approval safeguards.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Thermal Receipt Mockup Offline -->
            <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-lg); padding:28px;">
              <div style="font-family:var(--mkt-font-mono); font-size:12px; color:var(--mkt-text-main); background:#0f172a; border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:20px; line-height:1.7;">
                <div style="text-align:center; border-bottom:1px dashed var(--mkt-border); padding-bottom:10px; margin-bottom:10px;">
                  <b>METRO GOURMET MARKET</b><br>
                  <small style="color:var(--mkt-text-muted);">Register #01 • Offline Mode</small>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>Receipt #: OFF-1092</span>
                  <span>11:04 AM</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                  <span>Cashier: Alex S.</span>
                  <span style="color:#fbbf24;">[OFFLINE VOUCHER]</span>
                </div>
                <div style="border-top:1px dashed var(--mkt-border); border-bottom:1px dashed var(--mkt-border); padding:8px 0; margin-bottom:10px;">
                  <div style="display:flex; justify-content:space-between;">
                    <span>1x Colombian Roast (1kg)</span>
                    <span>PKR 2,699</span>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span>1x Hazelnut Spread (400g)</span>
                    <span>PKR 1,250</span>
                  </div>
                </div>
                <div style="display:flex; justify-content:space-between; font-weight:bold;">
                  <span>TOTAL PAID (CASH)</span>
                  <span style="color:#34d399;">PKR 3,949</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--mkt-text-muted);">
                  <span>Cash Tendered: PKR 4,000</span>
                  <span>Change: PKR 51</span>
                </div>
                <div style="text-align:center; font-size:10px; color:var(--mkt-text-dim); margin-top:12px; border-top:1px dashed var(--mkt-border); padding-top:8px;">
                  UUID: 7f8a9b2c-e123-44bb-990a-local<br>
                  Synced automatically on reconnection
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: REAL-WORLD FAILURE SCENARIOS HANDLED
           ========================================================================= -->
      <section class="mkt-section mkt-section-alt" style="padding:80px 0;">
        <div class="mkt-container">
          <div class="mkt-section-header">
            <span class="mkt-pill">Field Tested</span>
            <h2 class="mkt-section-title">Engineered for Harsh Real-World Conditions</h2>
            <p class="mkt-section-subtitle">Real retail stores don't operate in clean datacenter environments. Universal ERP thrives in the wild.</p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px;">
            <div class="mkt-feature-card">
              <div style="font-size:28px; margin-bottom:12px;">⚡</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Sudden Power Outage</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">
                When the main grid fails and WiFi routers power down, staff seamlessly continue checkout on battery-powered tablets and smartphones.
              </p>
            </div>

            <div class="mkt-feature-card">
              <div style="font-size:28px; margin-bottom:12px;">🌧️</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">ISP Fiber Cut / Cellular Drop</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">
                Zero customer queue delays during 4-hour internet provider blackouts. 100+ sales accumulate safely in the local ledger without data loss.
              </p>
            </div>

            <div class="mkt-feature-card">
              <div style="font-size:28px; margin-bottom:12px;">🎪</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Pop-Up Events & Mobile Vans</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">
                Sell at weekend farmers' markets, trade expos, and mobile delivery vans with zero internet; sync everything back at HQ in the evening.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: MULTI-TERMINAL CONFLICT RESOLUTION
           ========================================================================= -->
      <section class="mkt-section" style="padding:80px 0;">
        <div class="mkt-container">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center;">
            <div>
              <span class="mkt-pill">Data Integrity</span>
              <h2 class="mkt-section-title" style="text-align:left; margin-top:12px;">Conflict-Free Multi-Terminal Sync</h2>
              <p style="color:var(--mkt-text-muted); font-size:15px; line-height:1.6; margin-bottom:20px;">
                When 5 different checkout registers operate offline simultaneously, how does Universal ERP avoid corrupted inventory and conflicting order numbers?
              </p>
              <div style="display:flex; flex-direction:column; gap:12px; font-size:14px; color:var(--mkt-text-muted);">
                <div style="display:flex; gap:10px; align-items:flex-start;">
                  <span style="color:#60a5fa; font-weight:bold;">1.</span>
                  <span><strong>Cryptographic Offline UUIDs:</strong> Each register generates globally unique client transaction IDs preventing primary key collisions.</span>
                </div>
                <div style="display:flex; gap:10px; align-items:flex-start;">
                  <span style="color:#60a5fa; font-weight:bold;">2.</span>
                  <span><strong>Immutable Movement Ledger:</strong> Stock deductions are committed as differential decrement ledger events rather than destructive overwrites.</span>
                </div>
                <div style="display:flex; gap:10px; align-items:flex-start;">
                  <span style="color:#60a5fa; font-weight:bold;">3.</span>
                  <span><strong>Server Timestamp Ordering:</strong> Reconnection queues are processed in true transactional sequence with automatic reconciliation notes.</span>
                </div>
              </div>
            </div>

            <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-lg); padding:28px;">
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:16px;">Multi-Register Sync Topology</h4>
              <div style="display:flex; flex-direction:column; gap:10px; font-size:12px;">
                <div style="padding:10px 14px; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.25); border-radius:var(--mkt-radius-sm); display:flex; justify-content:space-between; align-items:center;">
                  <span>Register 01 (Front Counter)</span>
                  <span style="color:#34d399; font-weight:700;">14 Sales Queued → Reconnected</span>
                </div>
                <div style="padding:10px 14px; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.25); border-radius:var(--mkt-radius-sm); display:flex; justify-content:space-between; align-items:center;">
                  <span>Register 02 (Drive-Thru / Aisle)</span>
                  <span style="color:#34d399; font-weight:700;">8 Sales Queued → Reconnected</span>
                </div>
                <div style="padding:10px 14px; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.25); border-radius:var(--mkt-radius-sm); display:flex; justify-content:space-between; align-items:center;">
                  <span>Mobile Van (Delivery Route)</span>
                  <span style="color:#fbbf24; font-weight:700;">22 Sales Queued → Evening Sync</span>
                </div>
                <div style="text-align:center; padding-top:8px; color:var(--mkt-text-dim); font-size:11px;">
                  All registers merge into central tenant database with zero data conflict ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: COMPARISON TABLE (UNIVERSAL ERP VS CLOUD-ONLY POS)
           ========================================================================= -->
      <section class="mkt-section mkt-section-alt" style="padding:80px 0;">
        <div class="mkt-container">
          <div class="mkt-section-header">
            <span class="mkt-pill">Architecture Comparison</span>
            <h2 class="mkt-section-title">Local-First vs Cloud-Only SaaS</h2>
            <p class="mkt-section-subtitle">Why traditional cloud-only POS applications fail in real brick-and-mortar stores.</p>
          </div>

          <div class="mkt-table-container">
            <table class="mkt-table">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th style="color:#60a5fa;">Universal ERP Local-First POS</th>
                  <th>Standard Cloud POS (Shopify/Vend)</th>
                  <th>Legacy Desktop (QuickBooks POS)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Downtime on Internet Drop</b></td>
                  <td><span class="mkt-check">✓ 0 Seconds (Zero Interruption)</span></td>
                  <td><span class="mkt-cross">✕ App Freezes / Error Dialogs</span></td>
                  <td><span class="mkt-check">✓ Local Server Operates</span></td>
                </tr>
                <tr>
                  <td><b>Receipt Printing Offline</b></td>
                  <td><span class="mkt-check">✓ Instant Thermal Slip Printing</span></td>
                  <td><span class="mkt-cross">✕ Disabled Until Reconnected</span></td>
                  <td><span class="mkt-check">✓ Thermal Printer Supported</span></td>
                </tr>
                <tr>
                  <td><b>De-duplication Protection</b></td>
                  <td><span class="mkt-check">✓ Cryptographic Idempotency</span></td>
                  <td><span class="mkt-cross">✕ Potential Double Charging</span></td>
                  <td><span class="mkt-cross">✕ Manual Batch File Overwrites</span></td>
                </tr>
                <tr>
                  <td><b>Cross-Device Portability</b></td>
                  <td><span class="mkt-check">✓ Web Browser on Any OS/Phone</span></td>
                  <td><span class="mkt-check">✓ Web Browser / iPad</span></td>
                  <td><span class="mkt-cross">✕ Windows Server Locked</span></td>
                </tr>
                <tr>
                  <td><b>Multi-Store Cloud Sync</b></td>
                  <td><span class="mkt-check">✓ Automatic Real-Time Ingestion</span></td>
                  <td><span class="mkt-check">✓ Cloud Only</span></td>
                  <td><span class="mkt-cross">✕ Nightly Polling Scripts</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: CLIENT TESTIMONIAL
           ========================================================================= -->
      <section class="mkt-section" style="padding:80px 0;">
        <div class="mkt-container mkt-container-narrow">
          <div style="background:var(--mkt-bg-card); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-lg); padding:36px; text-align:center;">
            <div style="color:#f59e0b; font-size:20px; margin-bottom:16px;">★★★★★</div>
            <blockquote style="font-size:17px; color:var(--mkt-text-main); line-height:1.6; font-style:italic; margin:0 0 20px 0;">
              "During the major underground cable cut last winter, our entire commercial plaza lost internet for almost 36 hours. Every competing shop had to shut down cash registers. Universal ERP kept our 3 cashier counters ringing up sales continuously. When internet returned, all 420 sales synced in 10 seconds."
            </blockquote>
            <div style="font-weight:700; color:var(--mkt-text-main);">Farhan Sheikh</div>
            <div style="font-size:13px; color:var(--mkt-text-muted);">Owner • Sheikh Brothers Department Store</div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: FINAL CALL TO ACTION & FOOTER
           ========================================================================= -->
      <section class="mkt-section mkt-section-alt" style="padding:80px 0;">
        <div class="mkt-container">
          <div style="text-align:center; max-width:800px; margin:0 auto;">
            <h2 style="font-size: clamp(2rem, 4vw, 2.75rem); font-weight:800; color:var(--mkt-text-main); margin-bottom:16px;">
              Protect Your Store From Unplanned Downtime
            </h2>
            <p style="color:var(--mkt-text-muted); font-size:16px; margin-bottom:32px;">
              Get the resilience of an on-premise system with the convenience of modern cloud ERP.
            </p>
            <div style="display:flex; justify-content:center; gap:14px; flex-wrap:wrap;">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                <span>Start 14-Day Free Trial</span>
                <span>→</span>
              </button>
              <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/product/pos')">
                <span>Explore Full POS Suite</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Shared Modern Footer -->
      <footer class="mkt-footer">
        <div class="mkt-container">
          <div class="mkt-footer-grid">
            <div class="mkt-footer-brand">
              <div class="mkt-brand" onclick="window.navigateMarketing('/')">
                <div class="mkt-brand-logo">🌐</div>
                <span class="mkt-brand-name">Universal ERP</span>
              </div>
              <p class="mkt-footer-tagline">The Universal Business Operating System for high-performing commerce and modern retail.</p>
              <div class="mkt-footer-status">
                <span class="mkt-status-dot"></span>
                <span>Universal Cloud OS • All Systems Operational</span>
              </div>
            </div>

            <div class="mkt-footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product')">Platform Overview</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/pos')">Point of Sale (POS)</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory')">Inventory & Stock</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/sales')">Sales & Invoicing</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/purchasing')">Purchasing & POs</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/barcode-scanner')">Barcode Scanner</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/offline-pos')">Offline Mode</a></li>
              </ul>
            </div>

            <div class="mkt-footer-col">
              <h4>Industries</h4>
              <ul>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/industries/retail-ecommerce')">Retail & E-commerce</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/industries/healthcare')">Healthcare & Clinics</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/industries/construction')">Construction</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/industries/wholesale')">Wholesale & Trade</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/industries/services')">Services & Field</a></li>
              </ul>
            </div>

            <div class="mkt-footer-col">
              <h4>Solutions</h4>
              <ul>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/solutions/small-business')">Small Business OS</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/solutions/multi-location')">Multi-Location Retail</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/solutions/online-offline-retail')">Online + In-Store Sync</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/pricing')">Pricing & Plans</a></li>
              </ul>
            </div>

            <div class="mkt-footer-col">
              <h4>Resources & Company</h4>
              <ul>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/resources')">Knowledge Hub</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/resources/getting-started')">Getting Started</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/resources/user-guide')">User Guide</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/resources/faq')">FAQ</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/company/about')">About Us</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/company/contact')">Contact & Demo</a></li>
              </ul>
            </div>
          </div>

          <div class="mkt-footer-bottom">
            <div class="mkt-footer-copy">© 2026 Universal ERP Operating System. All rights reserved. Release Certified v1.0.0.</div>
            <div class="mkt-footer-legal">
              <a href="javascript:void(0)">Privacy Policy</a>
              <a href="javascript:void(0)">Terms of Service</a>
              <a href="javascript:void(0)">Security Standards</a>
            </div>
          </div>
        </div>
      </footer>

      <!-- Mobile Drawer -->
      <div class="mkt-mobile-drawer" id="mkt-mobile-menu">
        <button class="mkt-mobile-close" onclick="window.toggleMarketingMenu()">✕</button>
        <div style="font-weight:700; color:var(--mkt-text-main); margin-bottom:16px;">Navigation</div>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/'); window.toggleMarketingMenu()">Home</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product'); window.toggleMarketingMenu()">Product Overview</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/pos'); window.toggleMarketingMenu()">Point of Sale</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory'); window.toggleMarketingMenu()">Inventory</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/barcode-scanner'); window.toggleMarketingMenu()">Barcode Scanner</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/offline-pos'); window.toggleMarketingMenu()">Offline Mode</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/pricing'); window.toggleMarketingMenu()">Pricing</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/resources'); window.toggleMarketingMenu()">Resources</a>
        <div style="margin-top:24px; display:flex; flex-direction:column; gap:10px;">
          <button class="mkt-btn mkt-btn-ghost" onclick="window.navigateMarketing('/auth/login'); window.toggleMarketingMenu()">Sign In</button>
          <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/auth/register'); window.toggleMarketingMenu()">Get Started Free</button>
        </div>
      </div>

    </div>
  `;
}
