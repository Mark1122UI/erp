/**
 * Universal ERP — Integrations & API Dedicated Product Page (/product/integrations)
 * Phase 23 — Step 12: Dedicated Integrations, Webhooks & Developer API Hub
 */

// Client-Side Interactive Controllers
if (typeof window !== 'undefined') {
  window.switchIntegrationCategory = (catKey) => {
    const cards = document.querySelectorAll('.integration-mkt-card');
    const filterBtns = document.querySelectorAll('.int-cat-btn');

    filterBtns.forEach((btn) => {
      if (btn.getAttribute('data-cat') === catKey) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    cards.forEach((c) => {
      const cardCat = c.getAttribute('data-cat');
      if (catKey === 'all' || cardCat === catKey) {
        c.style.display = 'flex';
      } else {
        c.style.display = 'none';
      }
    });
  };

  window.switchIntegrationConsoleTab = (tabKey) => {
    const tabs = ['overview', 'api', 'webhooks', 'apps', 'logs'];
    tabs.forEach((k) => {
      const tabEl = document.getElementById(`dev-tab-${k}`);
      if (tabEl) {
        if (k === tabKey) tabEl.classList.add('active');
        else tabEl.classList.remove('active');
      }
    });

    const contentBox = document.getElementById('dev-console-tab-content');
    if (!contentBox) return;

    if (tabKey === 'api') {
      contentBox.innerHTML = `
        <div style="background:rgba(0,0,0,0.4); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border); font-family:var(--mkt-font-mono); font-size:12px;">
          <div style="color:#60a5fa; margin-bottom:8px;">// Example: Authenticated Product Inventory Query</div>
          <div style="color:#93c5fd;">GET /api/v1/inventory?sku=SKU-COFFEE-001 HTTP/1.1</div>
          <div style="color:#94a3b8;">Authorization: Bearer uerp_live_sec_892019482910</div>
          <div style="color:#34d399; margin-top:10px;">HTTP/1.1 200 OK</div>
          <div style="color:#cbd5e1; white-space:pre;">{
  "status": "success",
  "sku": "SKU-COFFEE-001",
  "name": "Dark Roast Arabica Coffee (1kg)",
  "total_stock": 601,
  "locations": [
    { "name": "Central Warehouse", "on_hand": 430 },
    { "name": "Store 01 (Commercial)", "on_hand": 98 },
    { "name": "Store 02 (Mall)", "on_hand": 73 }
  ]
}</div>
        </div>
      `;
    } else if (tabKey === 'webhooks') {
      contentBox.innerHTML = `
        <div class="mkt-mockup-table">
          <div class="mkt-tbl-row head"><span>Event</span><span>Endpoint</span><span>Status</span><span>Latency</span></div>
          <div class="mkt-tbl-row"><span style="font-family:var(--mkt-font-mono);">sale.created</span><span>https://api.mystore.com/sync</span><span class="badge in-stock">200 OK</span><span>142ms</span></div>
          <div class="mkt-tbl-row"><span style="font-family:var(--mkt-font-mono);">stock.threshold_low</span><span>https://logistics.hub.pk/reorder</span><span class="badge in-stock">200 OK</span><span>186ms</span></div>
          <div class="mkt-tbl-row"><span style="font-family:var(--mkt-font-mono);">payment.received</span><span>https://accounting.cloud/ledger</span><span class="badge in-stock">200 OK</span><span>118ms</span></div>
        </div>
      `;
    } else if (tabKey === 'apps') {
      contentBox.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="display:flex; justify-content:space-between; align-items:center;"><b>Shopify Sync App</b><span class="badge in-stock">Active</span></div>
            <div style="font-size:11px; color:var(--mkt-text-muted); margin-top:4px;">Two-way inventory and order dispatch.</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="display:flex; justify-content:space-between; align-items:center;"><b>MBL Banking Gateway</b><span class="badge in-stock">Active</span></div>
            <div style="font-size:11px; color:var(--mkt-text-muted); margin-top:4px;">Automated payment reconciliation.</div>
          </div>
        </div>
      `;
    } else if (tabKey === 'logs') {
      contentBox.innerHTML = `
        <div style="background:rgba(0,0,0,0.3); padding:14px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border); font-family:var(--mkt-font-mono); font-size:11px; color:#cbd5e1; display:flex; flex-direction:column; gap:6px;">
          <div><span style="color:#34d399;">[2026-08-30 14:32:01]</span> POST /api/v1/orders 201 Created (124ms) • App: WebStoreSync</div>
          <div><span style="color:#34d399;">[2026-08-30 14:30:45]</span> GET /api/v1/products 200 OK (84ms) • App: CatalogFeed</div>
          <div><span style="color:#60a5fa;">[2026-08-30 14:28:10]</span> WEBHOOK sale.created delivered to endpoint https://api.mystore.com/sync (200 OK)</div>
        </div>
      `;
    } else {
      // Default: Overview
      contentBox.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="font-size:11px; color:var(--mkt-text-muted);">Connected Integrations</div>
            <div style="font-size:16px; font-weight:800; color:#34d399; margin-top:2px;">6 Active Apps</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="font-size:11px; color:var(--mkt-text-muted);">Monthly API Calls</div>
            <div style="font-size:16px; font-weight:800; color:var(--mkt-text-main); margin-top:2px; font-family:var(--mkt-font-mono);">12,842 Calls</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="font-size:11px; color:var(--mkt-text-muted);">Webhook Reliability</div>
            <div style="font-size:16px; font-weight:800; color:#60a5fa; margin-top:2px;">99.9% Delivered</div>
          </div>
        </div>
      `;
    }
  };

  window.filterWebhookEvents = (status) => {
    const rows = document.querySelectorAll('.webhook-row');
    const filterBtns = document.querySelectorAll('.webhook-filter-btn');

    filterBtns.forEach((btn) => {
      if (btn.getAttribute('data-status') === status) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    rows.forEach((r) => {
      const rowStatus = r.getAttribute('data-status');
      if (status === 'all' || rowStatus === status) {
        c.style.display = 'flex';
      } else {
        c.style.display = 'none';
      }
    });
  };

  window.runImportDemo = () => {
    const toast = document.getElementById('int-action-toast');
    if (toast) {
      toast.innerText = '✓ Demo import completed — 1,420 product records validated.';
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 4000);
    }
  };

  window.triggerIntegrationAction = (actionName, targetApp) => {
    const toast = document.getElementById('int-action-toast');
    if (toast) {
      toast.innerText = `✓ Demo action: "${actionName}" completed for ${targetApp}.`;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3500);
    }
  };
}

export function renderProductIntegrationsPage() {
  return `
    <div class="marketing-wrapper" id="marketing-root">
      <div class="mkt-ambient-glow"></div>

      <!-- Action Feedback Toast -->
      <div id="int-action-toast" style="display:none; position:fixed; bottom:24px; right:24px; z-index:9999; background:#10b981; color:#ffffff; padding:12px 20px; border-radius:var(--mkt-radius-md); font-weight:700; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
        ✓ Action executed
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
           SECTION 1: HERO & INTEGRATION COMMAND CENTER
           ========================================================================= -->
      <section class="mkt-section" style="padding-top:120px; padding-bottom:60px;">
        <div class="mkt-container">
          <div class="mkt-hero-grid">
            
            <div class="mkt-hero-left">
              <div class="mkt-pill-badge">
                <span class="mkt-pill-pulse"></span>
                <span>INTEGRATIONS & API</span>
              </div>

              <h1 class="mkt-hero-title">
                Connect Your Business.<br>
                <span class="mkt-gradient-text-accent">Keep Your Data In Sync.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Connect your online store, accounting workflows, payment systems and custom tools with one connected business platform.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Start Connecting</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#integrations-demo" style="text-decoration:none;">
                  <span>Explore Integrations</span>
                </a>
              </div>

              <!-- Quick Badges -->
              <div style="display:flex; gap:16px; margin-top:28px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-muted);">
                <span>✓ REST API & Webhooks</span>
                <span>•</span>
                <span>✓ Omnichannel Stock Sync</span>
                <span>•</span>
                <span>✓ Automated Data Ingestion</span>
              </div>
            </div>

            <!-- Integration Command Center Mockup -->
            <div class="mkt-hero-right" id="integrations-demo">
              <div class="mkt-dash-preview-frame">
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/integrations</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>API CONSOLE</span>
                  </div>
                </div>

                <div class="mkt-dash-body" style="padding:16px;">
                  
                  <!-- Metric Cards -->
                  <div class="mkt-dash-metrics-grid" style="margin-bottom:14px;">
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Online Store</div>
                      <div class="mkt-dash-stat-value">Connected</div>
                      <div class="mkt-dash-stat-trend positive">● 2-Way Sync</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Payment Gateway</div>
                      <div class="mkt-dash-stat-value">Connected</div>
                      <div class="mkt-dash-stat-trend positive">💳 Instant Clear</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Warehouse Depot</div>
                      <div class="mkt-dash-stat-value">Synced</div>
                      <div class="mkt-dash-stat-trend neutral">📦 430 Pallets</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Webhooks</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono);">24 Delivered</div>
                      <div class="mkt-dash-stat-trend positive">⚡ 99.9% Uptime</div>
                    </div>
                  </div>

                  <!-- Live Sync Stream -->
                  <div class="mkt-dash-feed-box">
                    <div class="mkt-dash-feed-header">
                      <span class="mkt-feed-title">Real-Time Data Pipelines</span>
                      <span class="mkt-badge mkt-badge-cyan">Live Socket</span>
                    </div>
                    <div class="mkt-dash-feed-list">
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#10b981;"></span>
                          <span>Web order #WEB-10482 ingested: 2x Dark Roast Coffee deducted</span>
                        </div>
                        <span class="mkt-activity-time">Just now</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#3b82f6;"></span>
                          <span>Webhook event sale.created delivered to Accounting Gateway (200 OK)</span>
                        </div>
                        <span class="mkt-activity-time">8m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#8b5cf6;"></span>
                          <span>Daily catalog export synced to e-commerce storefront</span>
                        </div>
                        <span class="mkt-activity-time">45m ago</span>
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
           SECTION 2: ONE CORE. MANY CONNECTIONS.
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>UNIFIED ARCHITECTURE</span>
            </div>
            <h2 class="mkt-section-title">One Core. Many Connections.</h2>
            <p class="mkt-section-subtitle">
              Universal ERP acts as your single source of business truth — connecting third-party systems without creating duplicate or fragmented records.
            </p>
          </div>

          <!-- Architecture Visual Grid -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px 24px; max-width:850px; margin:32px auto 0 auto; text-align:center;">
            
            <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3); padding:10px 24px; border-radius:var(--mkt-radius-full); font-weight:800; color:#93c5fd; margin-bottom:24px;">
              <span>🌐</span>
              <span>Universal ERP Core Business Engine</span>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:12px; margin-bottom:24px;">
              <div class="mkt-feature-card" style="padding:12px; text-align:center;"><small>Products</small></div>
              <div class="mkt-feature-card" style="padding:12px; text-align:center;"><small>Orders</small></div>
              <div class="mkt-feature-card" style="padding:12px; text-align:center;"><small>Inventory</small></div>
              <div class="mkt-feature-card" style="padding:12px; text-align:center;"><small>Customers</small></div>
              <div class="mkt-feature-card" style="padding:12px; text-align:center;"><small>Payments</small></div>
              <div class="mkt-feature-card" style="padding:12px; text-align:center;"><small>Reports</small></div>
            </div>

            <div style="font-size:12px; color:var(--mkt-text-muted); border-top:1px solid var(--mkt-border); padding-top:16px;">
              Connected External Channels: E-Commerce Storefronts • Accounting Systems • Payment Gateways • Logistics Providers • Custom Apps
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: INTEGRATION MARKETPLACE / CONNECTION CARDS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>INTEGRATION ECOSYSTEM</span>
            </div>
            <h2 class="mkt-section-title">Connect Your Favorite Business Apps.</h2>
            <p class="mkt-section-subtitle">
              Plug in e-commerce storefronts, payment networks, shipping couriers, and developer webhooks in minutes.
            </p>
          </div>

          <!-- Category Filter Tabs -->
          <div class="mkt-tour-tabs" style="margin-bottom:28px;">
            <button class="mkt-tab-btn int-cat-btn active" data-cat="all" onclick="window.switchIntegrationCategory('all')">All Apps</button>
            <button class="mkt-tab-btn int-cat-btn" data-cat="ecommerce" onclick="window.switchIntegrationCategory('ecommerce')">E-Commerce</button>
            <button class="mkt-tab-btn int-cat-btn" data-cat="payments" onclick="window.switchIntegrationCategory('payments')">Payments</button>
            <button class="mkt-tab-btn int-cat-btn" data-cat="logistics" onclick="window.switchIntegrationCategory('logistics')">Logistics</button>
            <button class="mkt-tab-btn int-cat-btn" data-cat="developer" onclick="window.switchIntegrationCategory('developer')">Developer API</button>
          </div>

          <!-- Integration Cards Grid -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px;">
            
            <div class="mkt-feature-card integration-mkt-card" data-cat="ecommerce" style="padding:22px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:24px;">🛍️</span>
                <span class="badge in-stock">Connected</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Online Store Sync</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted); margin:4px 0 12px 0;">Two-way order ingestion and catalog inventory synchronization.</p>
              <button class="mkt-btn mkt-btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="window.triggerIntegrationAction('Settings opened', 'Online Store Sync')">Manage Sync</button>
            </div>

            <div class="mkt-feature-card integration-mkt-card" data-cat="payments" style="padding:22px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:24px;">💳</span>
                <span class="badge in-stock">Connected</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Payment Gateway</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted); margin:4px 0 12px 0;">Instant credit card, debit, and digital wallet checkout reconciliation.</p>
              <button class="mkt-btn mkt-btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="window.triggerIntegrationAction('Gateway verified', 'Payment Gateway')">Configured</button>
            </div>

            <div class="mkt-feature-card integration-mkt-card" data-cat="logistics" style="padding:22px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:24px;">🚚</span>
                <span class="badge in-stock">Connected</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Shipping & Couriers</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted); margin:4px 0 12px 0;">Automated parcel booking, tracking updates, and dispatch slips.</p>
              <button class="mkt-btn mkt-btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="window.triggerIntegrationAction('Tracking linked', 'Shipping & Couriers')">Active</button>
            </div>

            <div class="mkt-feature-card integration-mkt-card" data-cat="developer" style="padding:22px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:24px;">⚡</span>
                <span class="badge in-stock">Ready</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Custom REST API</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted); margin:4px 0 12px 0;">Full programmatic access to products, orders, customers, and reports.</p>
              <button class="mkt-btn mkt-btn-primary" style="padding:4px 10px; font-size:11px;" onclick="window.triggerIntegrationAction('API key generated', 'Custom REST API')">Generate Key</button>
            </div>

          </div>

          <div style="text-align:center; margin-top:28px;">
            <a href="#api-demo" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              View API Documentation & Endpoints ↓
            </a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: E-COMMERCE SYNC
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>OMNICHANNEL SYNC</span>
            </div>
            <h2 class="mkt-section-title">Online Store & In-Store Stock Synchronization.</h2>
            <p class="mkt-section-subtitle">
              When an order is placed on your online website, Universal ERP creates the sales record, deducts warehouse stock, and logs the customer payment.
            </p>
          </div>

          <!-- Omnichannel Ingestion Box -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--mkt-border); padding-bottom:12px; flex-wrap:wrap; gap:12px;">
              <div>
                <b style="font-size:16px;">Live Web Ingestion • Order #WEB-10482</b>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Customer: Summit Tech Cafe • Channel: Online Web Store</div>
              </div>
              <span class="badge in-stock">● SYNCED INSTANTLY</span>
            </div>

            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head"><span>Product Item</span><span>SKU</span><span>Qty</span><span>Stock Effect</span><span>Total</span></div>
              <div class="mkt-tbl-row">
                <span>Dark Roast Arabica Coffee (1kg)</span>
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">SKU-COFFEE-001</span>
                <span>2</span>
                <span class="badge in-stock">100 → 98 Units</span>
                <b style="font-family:var(--mkt-font-mono);">PKR 5,398</b>
              </div>
            </div>

            <div style="margin-top:16px; font-size:12px; color:var(--mkt-text-muted); text-align:center;">
              Unified inventory ensures you never oversell items across online and physical retail channels.
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: INVENTORY SYNCHRONIZATION
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>UNIFIED STOCK</span>
            </div>
            <h2 class="mkt-section-title">Centralized Multi-Channel Inventory.</h2>
            <p class="mkt-section-subtitle">
              Aggregate stock availability across all your store branches, warehouse bays, and online storefronts.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; max-width:900px; margin:32px auto 0 auto;">
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">🛍️</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Online Storefront</h4>
              <div style="font-size:20px; font-weight:800; color:#34d399; margin:4px 0; font-family:var(--mkt-font-mono);">98 Units</div>
              <small style="color:var(--mkt-text-muted);">Allocated to web</small>
            </div>

            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">🏪</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Store 01 (Commercial)</h4>
              <div style="font-size:20px; font-weight:800; color:#60a5fa; margin:4px 0; font-family:var(--mkt-font-mono);">42 Units</div>
              <small style="color:var(--mkt-text-muted);">Retail floor shelf</small>
            </div>

            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">🏪</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Store 02 (Mall)</h4>
              <div style="font-size:20px; font-weight:800; color:#60a5fa; margin:4px 0; font-family:var(--mkt-font-mono);">31 Units</div>
              <small style="color:var(--mkt-text-muted);">Mall branch shelf</small>
            </div>

            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">🏢</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Central Warehouse</h4>
              <div style="font-size:20px; font-weight:800; color:#34d399; margin:4px 0; font-family:var(--mkt-font-mono);">430 Units</div>
              <small style="color:var(--mkt-text-muted);">Reserve bulk pallets</small>
            </div>
          </div>

          <div style="text-align:center; margin-top:24px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              Explore Multi-Location Inventory Ledger →
            </a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: API ACCESS (DEVELOPER CONSOLE MOCKUP)
           ========================================================================= -->
      <section class="mkt-section" id="api-demo" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>DEVELOPER API</span>
            </div>
            <h2 class="mkt-section-title">Developer-Ready REST API.</h2>
            <p class="mkt-section-subtitle">
              Build custom mobile apps, automated warehouse integrations, or custom enterprise reports with clean JSON endpoints.
            </p>
          </div>

          <!-- API Console Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--mkt-border); padding-bottom:12px; flex-wrap:wrap; gap:12px;">
              <div style="display:flex; gap:10px; align-items:center;">
                <span class="badge in-stock">v1 REST API</span>
                <span style="font-family:var(--mkt-font-mono); font-size:12px;">https://api.universalerp.com/api/v1</span>
              </div>
              <span style="font-size:12px; color:#34d399; font-weight:700;">● Status: 100% Operational (184ms avg)</span>
            </div>

            <!-- Endpoint List & Code Preview -->
            <div style="background:#090d16; border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px; font-family:var(--mkt-font-mono); font-size:12px;">
              <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
                <span style="color:#34d399; font-weight:700;">GET /api/products</span>
                <span style="color:#64748b;">•</span>
                <span style="color:#34d399; font-weight:700;">GET /api/inventory</span>
                <span style="color:#64748b;">•</span>
                <span style="color:#60a5fa; font-weight:700;">POST /api/orders</span>
                <span style="color:#64748b;">•</span>
                <span style="color:#60a5fa; font-weight:700;">POST /api/customers</span>
                <span style="color:#64748b;">•</span>
                <span style="color:#34d399; font-weight:700;">GET /api/reports</span>
              </div>

              <div style="color:#64748b;">// Sample Response: GET /api/v1/products?limit=1</div>
              <div style="color:#38bdf8; white-space:pre; margin-top:6px;">{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "prod_1042",
      "sku": "SKU-COFFEE-001",
      "name": "Dark Roast Arabica Coffee (1kg)",
      "price": 2699.00,
      "cost_price": 1850.00,
      "barcode": "8901234567890",
      "stock_on_hand": 601
    }
  ]
}</div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: WEBHOOKS & EVENT AUTOMATION
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>REAL-TIME EVENTS</span>
            </div>
            <h2 class="mkt-section-title">Webhooks & Event-Driven Workflows.</h2>
            <p class="mkt-section-subtitle">
              Subscribe to operational business events and trigger automatic actions in external systems with automated retries.
            </p>
          </div>

          <!-- Webhooks Table Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; gap:6px; margin-bottom:16px; flex-wrap:wrap;">
              <button class="mkt-btn mkt-btn-secondary webhook-filter-btn active" data-status="all" onclick="window.filterWebhookEvents('all')" style="padding:4px 10px; font-size:11px;">All Events</button>
              <button class="mkt-btn mkt-btn-secondary webhook-filter-btn" data-status="delivered" onclick="window.filterWebhookEvents('delivered')" style="padding:4px 10px; font-size:11px;">Delivered (24)</button>
              <button class="mkt-btn mkt-btn-secondary webhook-filter-btn" data-status="pending" onclick="window.filterWebhookEvents('pending')" style="padding:4px 10px; font-size:11px;">Pending (0)</button>
            </div>

            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head"><span>Event Name</span><span>Target URL</span><span>Response</span><span>Status</span></div>
              <div class="mkt-tbl-row webhook-row" data-status="delivered"><span style="font-family:var(--mkt-font-mono);">sale.created</span><span>https://hooks.mystore.com/orders</span><b style="color:#34d399;">200 OK</b><span class="badge in-stock">Delivered</span></div>
              <div class="mkt-tbl-row webhook-row" data-status="delivered"><span style="font-family:var(--mkt-font-mono);">inventory.low_stock</span><span>https://hooks.logistics.pk/alerts</span><b style="color:#34d399;">200 OK</b><span class="badge in-stock">Delivered</span></div>
              <div class="mkt-tbl-row webhook-row" data-status="delivered"><span style="font-family:var(--mkt-font-mono);">payment.received</span><span>https://hooks.finance.cloud/v1</span><b style="color:#34d399;">200 OK</b><span class="badge in-stock">Delivered</span></div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: IMPORT & EXPORT
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>DATA MIGRATION</span>
            </div>
            <h2 class="mkt-section-title">Seamless CSV & Excel Data Migration.</h2>
            <p class="mkt-section-subtitle">
              Import existing product catalogs, customer databases, opening stock, and supplier contacts in seconds.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:850px; margin:32px auto 0 auto;">
            
            <div class="mkt-feature-card" style="padding:24px;">
              <h4 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Bulk CSV Ingestion</h4>
              <div style="font-family:var(--mkt-font-mono); font-size:12px; color:var(--mkt-text-muted); margin-bottom:14px;">
                <div>📄 Products_Catalog.csv (1,420 SKUs)</div>
                <div>👥 Customers_Master.csv (2,840 Records)</div>
              </div>
              <button class="mkt-btn mkt-btn-primary" style="padding:6px 14px; font-size:12px;" onclick="window.runImportDemo()">
                ⚡ Run Import Simulation
              </button>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <h4 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Instant Data Export</h4>
              <div style="font-family:var(--mkt-font-mono); font-size:12px; color:var(--mkt-text-muted); margin-bottom:14px;">
                <div>📊 Sales_Ledger_Aug2026.xlsx</div>
                <div>📦 Stock_Valuation_Report.csv</div>
              </div>
              <button class="mkt-btn mkt-btn-secondary" style="padding:6px 14px; font-size:12px;" onclick="window.triggerIntegrationAction('Data exported', 'Financial Ledger')">
                📥 Export Ledger Data
              </button>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 9: CONNECTED PAYMENTS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>PAYMENT CONNECTIONS</span>
            </div>
            <h2 class="mkt-section-title">Automated Payment Settlement.</h2>
            <p class="mkt-section-subtitle">
              Connect in-store card swipers, bank wire transfer feeds, and online checkout gateways directly to your general ledger.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; max-width:900px; margin:32px auto 0 auto;">
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">💳</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Card Terminals</h4>
              <small style="color:var(--mkt-text-muted);">POS card reader integration</small>
            </div>
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">🏦</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Bank Transfers</h4>
              <small style="color:var(--mkt-text-muted);">Direct IBFT reconciliation</small>
            </div>
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">📱</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Digital Wallets</h4>
              <small style="color:var(--mkt-text-muted);">Mobile QR payments</small>
            </div>
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">🛡️</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Customer Credit</h4>
              <small style="color:var(--mkt-text-muted);">Automated credit ledgers</small>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 10: DEVELOPER / INTEGRATION CONTROL CENTER
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>DEVELOPER WORKSPACE</span>
            </div>
            <h2 class="mkt-section-title">Developer & Integration Control Center.</h2>
            <p class="mkt-section-subtitle">
              Manage API tokens, monitor endpoint response times, inspect webhook payloads, and audit connected app permissions.
            </p>
          </div>

          <!-- Developer Console Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <!-- Sub-Tabs Navigation -->
            <div class="mkt-tour-tabs" style="margin-bottom:16px;">
              <button class="mkt-tab-btn active" id="dev-tab-overview" onclick="window.switchIntegrationConsoleTab('overview')">📊 Overview</button>
              <button class="mkt-tab-btn" id="dev-tab-api" onclick="window.switchIntegrationConsoleTab('api')">⚡ REST API</button>
              <button class="mkt-tab-btn" id="dev-tab-webhooks" onclick="window.switchIntegrationConsoleTab('webhooks')">🪝 Webhooks</button>
              <button class="mkt-tab-btn" id="dev-tab-apps" onclick="window.switchIntegrationConsoleTab('apps')">📱 Connected Apps</button>
              <button class="mkt-tab-btn" id="dev-tab-logs" onclick="window.switchIntegrationConsoleTab('logs')">📜 Event Logs</button>
            </div>

            <!-- Dynamic Tab Content Box -->
            <div id="dev-console-tab-content">
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
                <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                  <div style="font-size:11px; color:var(--mkt-text-muted);">Connected Integrations</div>
                  <div style="font-size:16px; font-weight:800; color:#34d399; margin-top:2px;">6 Active Apps</div>
                </div>
                <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                  <div style="font-size:11px; color:var(--mkt-text-muted);">Monthly API Calls</div>
                  <div style="font-size:16px; font-weight:800; color:var(--mkt-text-main); margin-top:2px; font-family:var(--mkt-font-mono);">12,842 Calls</div>
                </div>
                <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                  <div style="font-size:11px; color:var(--mkt-text-muted);">Webhook Reliability</div>
                  <div style="font-size:16px; font-weight:800; color:#60a5fa; margin-top:2px;">99.9% Delivered</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 11: INTEGRATION SECURITY & CONTROL
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>SECURITY & RBAC</span>
            </div>
            <h2 class="mkt-section-title">Granular Scopes & Security Governance.</h2>
            <p class="mkt-section-subtitle">
              Control exactly which endpoints third-party apps can access with scoped API credentials and immutable audit trails.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px; margin-top:32px;">
            <div class="mkt-feature-card" style="padding:22px;">
              <div style="font-size:24px; margin-bottom:8px;">🔒</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:4px;">Secure Credentials</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted); line-height:1.5;">API keys with custom rate-limiting, IP allowlisting, and instant revocation.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px;">
              <div style="font-size:24px; margin-bottom:8px;">🛡️</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:4px;">Granular Scopes</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted); line-height:1.5;">Limit external integrations to read-only catalog access or order creation scopes.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px;">
              <div style="font-size:24px; margin-bottom:8px;">📜</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:4px;">Audit Trail Logs</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted); line-height:1.5;">Every programmatic modification is tagged with the calling application ID and timestamp.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px;">
              <div style="font-size:24px; margin-bottom:8px;">🏥</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:4px;">Connection Health</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted); line-height:1.5;">Automatic alerts for failing webhook destinations or expired SSL certificates.</p>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 12: FINAL CTA
           ========================================================================= -->
      <section class="mkt-section mkt-cta-section">
        <div class="mkt-container">
          <div class="mkt-cta-card">
            
            <h2 class="mkt-cta-title">Your Business Shouldn't Live<br>In Disconnected Systems.</h2>
            <p class="mkt-cta-desc">
              Connect your tools, centralize your operations and keep every important business record synchronized.
            </p>

            <div class="mkt-cta-actions">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                Start Free →
              </button>
              <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/product')">
                Explore Product
              </button>
            </div>

          </div>
        </div>
      </section>

      <!-- Footer -->
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
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/customers')">Customers & CRM</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/suppliers')">Suppliers & Vendors</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/payments')">Payments & Expenses</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/documents')">Documents & Receipts</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/integrations')">Integrations & API</a></li>
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
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/sales'); window.toggleMarketingMenu()">Sales & Invoicing</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/purchasing'); window.toggleMarketingMenu()">Purchasing & POs</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/customers'); window.toggleMarketingMenu()">Customers & CRM</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/suppliers'); window.toggleMarketingMenu()">Suppliers & Vendors</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/payments'); window.toggleMarketingMenu()">Payments & Expenses</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/documents'); window.toggleMarketingMenu()">Documents & Receipts</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/integrations'); window.toggleMarketingMenu()">Integrations & API</a>
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
