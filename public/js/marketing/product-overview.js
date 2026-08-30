/**
 * Universal ERP — Product Overview Page (/product)
 * Phase 23 — Step 3: Platform Overview & 12-Module Gateway
 */

export function renderProductOverviewPage() {
  const modules = [
    {
      id: 'pos',
      name: 'Point of Sale',
      icon: '⚡',
      route: '/product/pos',
      benefit: 'Fast touch counter checkout, instant barcode scan & receipt printing.',
      accent: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1))',
      tag: 'Fast Checkout',
    },
    {
      id: 'inventory',
      name: 'Inventory & Stock',
      icon: '📦',
      route: '/product/inventory',
      benefit: 'Real-time multi-location stock tracking, transfers & cycle count audits.',
      accent: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.1))',
      tag: 'Multi-Location',
    },
    {
      id: 'sales',
      name: 'Sales & Invoicing',
      icon: '📈',
      route: '/product/sales',
      benefit: 'Quotations, wholesale orders, tax invoices & receivable collections.',
      accent: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
      tag: 'Invoicing',
    },
    {
      id: 'purchasing',
      name: 'Purchasing & POs',
      icon: '🛍️',
      route: '/product/purchasing',
      benefit: 'Supplier purchase orders, goods receipt (GRN) & accounts payable.',
      accent: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))',
      tag: 'Procurement',
    },
    {
      id: 'customers',
      name: 'Customers & CRM',
      icon: '👥',
      route: '/product/customers',
      benefit: 'Customer directory, purchase history, credit limits & account statements.',
      accent: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))',
      tag: 'Credit Ledgers',
    },
    {
      id: 'suppliers',
      name: 'Suppliers & Vendors',
      icon: '🏭',
      route: '/product/suppliers',
      benefit: 'Centralized vendor directory, lead time tracking & payment records.',
      accent: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))',
      tag: 'Vendors',
    },
    {
      id: 'payments',
      name: 'Payments & Expenses',
      icon: '💳',
      route: '/product/payments',
      benefit: 'Multi-tender payment balancing, expense tracking & cash drawers.',
      accent: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.1))',
      tag: 'Cash Flow',
    },
    {
      id: 'reports',
      name: 'Reports & Analytics',
      icon: '📊',
      route: '/product/reports',
      benefit: 'Real-time executive summaries, gross profit margins & inventory valuation.',
      accent: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(245,158,11,0.1))',
      tag: 'Real-Time P&L',
    },
    {
      id: 'barcode-scanner',
      name: 'Barcode Scanner',
      icon: '📷',
      route: '/product/barcode-scanner',
      benefit: 'Instant smartphone camera barcode scanning with zero extra hardware.',
      accent: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(16,185,129,0.1))',
      tag: 'Mobile Camera',
    },
    {
      id: 'offline-pos',
      name: 'Offline POS',
      icon: '📡',
      route: '/product/offline-pos',
      benefit: 'Keep checking out during internet drops with automatic background sync.',
      accent: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.1))',
      tag: 'Zero Downtime',
    },
    {
      id: 'documents',
      name: 'Documents & Receipts',
      icon: '📑',
      route: '/product/documents',
      benefit: '58mm/80mm thermal receipts, A4 tax invoices & packing lists.',
      accent: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(16,185,129,0.1))',
      tag: 'PDF Generator',
    },
    {
      id: 'integrations',
      name: 'Integrations & API',
      icon: '🔌',
      route: '/product/integrations',
      benefit: 'Connect online web stores, accounting software & custom webhooks.',
      accent: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1))',
      tag: 'E-Commerce',
    },
  ];

  return `
    <div class="marketing-wrapper" id="marketing-root">
      <div class="mkt-ambient-glow"></div>

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
           SECTION 1: PRODUCT HERO
           ========================================================================= -->
      <section class="mkt-section" style="padding-top:120px; padding-bottom:60px;">
        <div class="mkt-container">
          <div class="mkt-hero-grid">
            
            <div class="mkt-hero-left">
              <div class="mkt-pill-badge">
                <span class="mkt-pill-pulse"></span>
                <span>UNIVERSAL BUSINESS OS</span>
              </div>

              <h1 class="mkt-hero-title">
                Everything Your Business Needs.<br>
                <span class="mkt-gradient-text-accent">Connected In One System.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Universal ERP brings your daily operations together — from selling and inventory to purchasing, customers, payments and reporting.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Get Started Free</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#explore-modules" style="text-decoration:none;">
                  <span>Explore Modules</span>
                </a>
              </div>
            </div>

            <!-- Command Center Preview (Fictional Demo Data) -->
            <div class="mkt-hero-right">
              <div class="mkt-dash-preview-frame">
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/overview</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>COMMAND CENTER</span>
                  </div>
                </div>

                <div class="mkt-dash-body">
                  <div class="mkt-dash-metrics-grid">
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Today's Sales</div>
                      <div class="mkt-dash-stat-value">PKR 248,500</div>
                      <div class="mkt-dash-stat-trend positive">↑ +14.2% daily growth</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Total Stock On Hand</div>
                      <div class="mkt-dash-stat-value">1,420 Units</div>
                      <div class="mkt-dash-stat-trend neutral">● Main Store & Warehouse</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Pending Inbound POs</div>
                      <div class="mkt-dash-stat-value">4 In Transit</div>
                      <div class="mkt-dash-stat-trend positive">● GRN Ready</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Cash & Bank Position</div>
                      <div class="mkt-dash-stat-value">PKR 480,200</div>
                      <div class="mkt-dash-stat-trend positive">↑ Reconciled</div>
                    </div>
                  </div>

                  <div class="mkt-dash-feed-box" style="margin-top:14px;">
                    <div class="mkt-dash-feed-header">
                      <span class="mkt-feed-title">Recent Activity Stream</span>
                      <span class="mkt-badge mkt-badge-green">Live Engine</span>
                    </div>
                    <div class="mkt-dash-feed-list">
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#10b981;"></span>
                          <span>POS Sale #1095 completed (Cash: PKR 2,800)</span>
                        </div>
                        <span class="mkt-activity-time">Just now</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#06b6d4;"></span>
                          <span>GRN received for PO #001: +20 Arabica coffee beans</span>
                        </div>
                        <span class="mkt-activity-time">2m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#3b82f6;"></span>
                          <span>Barcode audit CNT-001 completed for Main Store</span>
                        </div>
                        <span class="mkt-activity-time">5m ago</span>
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
           SECTION 2: HOW THE SYSTEM WORKS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>UNIFIED ARCHITECTURE</span>
            </div>
            <h2 class="mkt-section-title">One Core. Everything Connected.</h2>
            <p class="mkt-section-subtitle">
              Instead of running five disconnected software tools, Universal ERP provides five integrated operational pillars around a single double-entry database.
            </p>
          </div>

          <!-- Central Connected Hub Diagram -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:36px 24px; margin-top:32px;">
            
            <!-- Central Brand Core -->
            <div style="text-align:center; margin-bottom:32px;">
              <div style="display:inline-flex; align-items:center; gap:10px; background:linear-gradient(135deg, #2563eb, #06b6d4); color:#fff; padding:12px 28px; border-radius:var(--mkt-radius-full); font-weight:800; font-size:16px; box-shadow:0 0 30px rgba(59,130,246,0.35);">
                <span>🌐</span>
                <span>UNIVERSAL ERP CORE</span>
              </div>
              <div style="font-size:13px; color:var(--mkt-text-muted); margin-top:8px;">Single Source of Operational Truth</div>
            </div>

            <!-- 5 Pillar Cards -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px;">
              
              <div class="mkt-feature-card" style="padding:20px; border-top:3px solid #3b82f6;">
                <div style="font-size:12px; font-weight:800; color:#60a5fa; text-transform:uppercase; margin-bottom:8px;">SELL</div>
                <div style="font-weight:700; font-size:15px; margin-bottom:10px;">Sales Operations</div>
                <ul style="list-style:none; padding:0; margin:0; font-size:13px; color:var(--mkt-text-muted); display:flex; flex-direction:column; gap:6px;">
                  <li>⚡ Point of Sale (POS)</li>
                  <li>📈 Sales Invoicing</li>
                  <li>👥 Customer CRM</li>
                </ul>
              </div>

              <div class="mkt-feature-card" style="padding:20px; border-top:3px solid #10b981;">
                <div style="font-size:12px; font-weight:800; color:#34d399; text-transform:uppercase; margin-bottom:8px;">STOCK</div>
                <div style="font-weight:700; font-size:15px; margin-bottom:10px;">Inventory Control</div>
                <ul style="list-style:none; padding:0; margin:0; font-size:13px; color:var(--mkt-text-muted); display:flex; flex-direction:column; gap:6px;">
                  <li>📦 Multi-Location Stock</li>
                  <li>🏷️ Products & SKUs</li>
                  <li>📷 Camera Barcodes</li>
                </ul>
              </div>

              <div class="mkt-feature-card" style="padding:20px; border-top:3px solid #f59e0b;">
                <div style="font-size:12px; font-weight:800; color:#fbbf24; text-transform:uppercase; margin-bottom:8px;">BUYING</div>
                <div style="font-weight:700; font-size:15px; margin-bottom:10px;">Procurement</div>
                <ul style="list-style:none; padding:0; margin:0; font-size:13px; color:var(--mkt-text-muted); display:flex; flex-direction:column; gap:6px;">
                  <li>🛍️ Purchase Orders</li>
                  <li>📥 Goods Receipt (GRN)</li>
                  <li>🏭 Supplier Ledgers</li>
                </ul>
              </div>

              <div class="mkt-feature-card" style="padding:20px; border-top:3px solid #06b6d4;">
                <div style="font-size:12px; font-weight:800; color:#22d3ee; text-transform:uppercase; margin-bottom:8px;">MONEY</div>
                <div style="font-weight:700; font-size:15px; margin-bottom:10px;">Financial Flow</div>
                <ul style="list-style:none; padding:0; margin:0; font-size:13px; color:var(--mkt-text-muted); display:flex; flex-direction:column; gap:6px;">
                  <li>💳 Multi-Tender Payments</li>
                  <li>📉 Daily Store Expenses</li>
                  <li>🏦 Cash Registers</li>
                </ul>
              </div>

              <div class="mkt-feature-card" style="padding:20px; border-top:3px solid #8b5cf6;">
                <div style="font-size:12px; font-weight:800; color:#a78bfa; text-transform:uppercase; margin-bottom:8px;">INSIGHTS</div>
                <div style="font-weight:700; font-size:15px; margin-bottom:10px;">Intelligence</div>
                <ul style="list-style:none; padding:0; margin:0; font-size:13px; color:var(--mkt-text-muted); display:flex; flex-direction:column; gap:6px;">
                  <li>📊 Real-Time P&L Reports</li>
                  <li>📑 Receipt & PDF Engine</li>
                  <li>🛡️ Audit Event Logs</li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: EXPLORE THE PLATFORM (12-MODULE GRID)
           ========================================================================= -->
      <section class="mkt-section" id="explore-modules">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>PLATFORM MODULES</span>
            </div>
            <h2 class="mkt-section-title">Explore the Universal ERP Platform</h2>
            <p class="mkt-section-subtitle">
              Every tool is engineered to work seamlessly as a standalone feature or together as a complete operating system.
            </p>
          </div>

          <!-- 12-Module Grid -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-top:36px;">
            ${modules.map((m) => `
              <div class="mkt-feature-card" style="padding:24px; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden;">
                <div style="position:absolute; top:0; left:0; right:0; height:3px; background:${m.accent};"></div>
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                    <div style="font-size:32px;">${m.icon}</div>
                    <span style="font-size:11px; font-weight:700; background:rgba(255,255,255,0.06); color:var(--mkt-text-muted); padding:3px 8px; border-radius:99px;">${m.tag}</span>
                  </div>
                  <h3 style="font-size:17px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">${m.name}</h3>
                  <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">${m.benefit}</p>
                </div>
                <div style="margin-top:20px; padding-top:12px; border-top:1px solid var(--mkt-border);">
                  <a href="javascript:void(0)" onclick="window.navigateMarketing('${m.route}')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                    <span>Explore ${m.name}</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            `).join('')}
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: A SIMPLE FLOW
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>AUTOMATED CONNECTIVITY</span>
            </div>
            <h2 class="mkt-section-title">From Sale To Insight. Automatically Connected.</h2>
            <p class="mkt-section-subtitle">
              A customer transaction should never require entering the same data into multiple apps. The Universal ERP core synchronizes the entire operational sequence.
            </p>
          </div>

          <!-- Visual Flow Chain -->
          <div style="display:flex; justify-content:center; align-items:center; gap:10px; flex-wrap:wrap; margin-top:36px;">
            <div class="mkt-offline-node" style="min-width:130px;"><div class="node-icon">👤</div><b>1. Customer</b><small>Identified</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active" style="min-width:130px;"><div class="node-icon">⚡</div><b>2. POS Sale</b><small>Scanned</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:130px;"><div class="node-icon">💳</div><b>3. Payment</b><small>Tendered</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:130px;"><div class="node-icon">📦</div><b>4. Stock</b><small>Deducted</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:130px;"><div class="node-icon">📑</div><b>5. Ledger</b><small>Recorded</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:130px;"><div class="node-icon">📊</div><b>6. Reports</b><small>Live P&L</small></div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: BUILT FOR REAL-WORLD OPERATIONS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>CORE CAPABILITIES</span>
            </div>
            <h2 class="mkt-section-title">Built For Real-World Operations</h2>
            <p class="mkt-section-subtitle">
              Reliable, responsive software designed to adapt to your physical retail constraints.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:12px;">🏢</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">1. Multi-Location</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Manage retail storefronts and central warehouses from one connected system with inter-branch transfers.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:12px;">📱</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">2. Mobile-Friendly</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Access essential business operations from your desktop, counter tablet, or mobile phone browser.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:12px;">📷</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">3. Barcode Ready</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Use supported USB/Bluetooth hardware scanners or scan directly via compatible smartphone cameras.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:12px;">📡</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">4. Offline Resilience</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">POS sales can continue temporarily during connectivity interruptions and synchronize automatically when connection returns.</p>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: EASY TO START
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>ZERO CONSULTING REQUIRED</span>
            </div>
            <h2 class="mkt-section-title">Start Simple. Grow When You're Ready.</h2>
            <p class="mkt-section-subtitle">
              No complicated ERP setup experience should be required for basic retail operations.
            </p>
          </div>

          <!-- 3-Step Process -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:24px; margin-top:36px; margin-bottom:36px;">
            
            <div class="mkt-feature-card" style="padding:28px; text-align:center;">
              <div style="font-size:24px; font-weight:800; color:#60a5fa; margin-bottom:12px;">01</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Create Your Business</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Register in 30 seconds. Choose your store currency and primary retail location.</p>
            </div>

            <div class="mkt-feature-card" style="padding:28px; text-align:center;">
              <div style="font-size:24px; font-weight:800; color:#34d399; margin-bottom:12px;">02</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Add Products & Team</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Add items with barcodes or load starter sample data. Invite cashiers with restricted access.</p>
            </div>

            <div class="mkt-feature-card" style="padding:28px; text-align:center;">
              <div style="font-size:24px; font-weight:800; color:#a78bfa; margin-bottom:12px;">03</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Start Selling</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Open the POS counter, scan items, accept cash or card, and print receipts immediately.</p>
            </div>

          </div>

          <div style="text-align:center;">
            <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
              <span>Start Your Workspace</span>
              <span>→</span>
            </button>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: RETAIL AVAILABLE NOW
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div style="background:var(--mkt-bg-surface); border:1px solid rgba(59,130,246,0.3); border-radius:var(--mkt-radius-xl); padding:36px; text-align:center;">
            <span class="mkt-badge mkt-badge-green" style="font-size:12px; margin-bottom:12px;">● AVAILABLE NOW</span>
            <h2 style="font-size:26px; font-weight:800; color:var(--mkt-text-main); margin-bottom:12px;">Built For Retail & E-Commerce Today</h2>
            <p style="color:var(--mkt-text-muted); font-size:15px; max-width:700px; margin:0 auto 24px auto;">
              The current MVP focuses on connected retail operations including POS, inventory, purchasing, sales and barcode workflows.
            </p>
            <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/industries/retail-ecommerce')">
              <span>Explore Retail & E-Commerce Solution</span>
              <span>→</span>
            </button>

            <!-- Future Industries Teaser -->
            <div style="margin-top:32px; padding-top:24px; border-top:1px solid var(--mkt-border); display:flex; justify-content:center; gap:20px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-dim);">
              <span>🏥 Healthcare <small>(Coming Soon)</small></span>
              <span>•</span>
              <span>🏗️ Construction <small>(Coming Soon)</small></span>
              <span>•</span>
              <span>🚚 Wholesale <small>(Coming Soon)</small></span>
              <span>•</span>
              <span>💼 Services <small>(Coming Soon)</small></span>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: FINAL CTA
           ========================================================================= -->
      <section class="mkt-section mkt-cta-section">
        <div class="mkt-container">
          <div class="mkt-cta-card">
            
            <h2 class="mkt-cta-title">Your Business Is Connected.<br>Your Software Should Be Too.</h2>
            <p class="mkt-cta-desc">
              Explore the Universal ERP platform and discover the tools designed to simplify daily operations.
            </p>

            <div class="mkt-cta-actions">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                Get Started Free →
              </button>
              <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/pricing')">
                View Pricing
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
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/pricing'); window.toggleMarketingMenu()">Pricing</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/resources'); window.toggleMarketingMenu()">Resources</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/company/about'); window.toggleMarketingMenu()">About Us</a>
        <div style="margin-top:24px; display:flex; flex-direction:column; gap:10px;">
          <button class="mkt-btn mkt-btn-ghost" onclick="window.navigateMarketing('/auth/login'); window.toggleMarketingMenu()">Sign In</button>
          <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/auth/register'); window.toggleMarketingMenu()">Get Started Free</button>
        </div>
      </div>

    </div>
  `;
}
