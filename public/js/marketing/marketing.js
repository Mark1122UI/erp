/**
 * Universal ERP — Marketing Website Module
 * Phase 23 — Step 2: Streamlined 11-Section Homepage
 */

export class MarketingWebsite {
  static currentTourTab = 'dashboard';
  static offlineState = 'online';
  static liveFeedInterval = null;
  static metricsInterval = null;

  static render() {
    return `
      <div class="marketing-wrapper" id="marketing-root">
        
        <!-- Ambient Atmospheric Background -->
        <div class="mkt-ambient-glow"></div>

        <!-- 1. STICKY NAVBAR -->
        ${this.renderNavbar()}

        <!-- 2. HERO SECTION WITH LIVE DASHBOARD PREVIEW -->
        ${this.renderHero()}

        <!-- 3. ONE SYSTEM. EVERYTHING CONNECTED. -->
        ${this.renderConnectedSystemSection()}

        <!-- 4. DEVELOPING-MARKET PROBLEM & APPROACH -->
        ${this.renderDevelopingMarketsSection()}

        <!-- 5. RETAIL & E-COMMERCE FLOW -->
        ${this.renderEcommerceFlow()}

        <!-- 6. UNIVERSAL CORE (ONE CORE. MANY INDUSTRIES) -->
        ${this.renderUniversalCoreSection()}

        <!-- 7. INTERACTIVE PRODUCT PREVIEW (TEASER) -->
        ${this.renderProductTour()}

        <!-- 8. MOBILE CAMERA BARCODE SCANNER TEASER -->
        ${this.renderScannerSection()}

        <!-- 9. OFFLINE POS TEASER -->
        ${this.renderOfflineSection()}

        <!-- 10. FINAL CALL TO ACTION -->
        ${this.renderFinalCTA()}

        <!-- 11. FOOTER -->
        ${this.renderFooter()}

        <!-- Mobile Drawer -->
        ${this.renderMobileDrawer()}

      </div>
    `;
  }

  // =========================================================================
  // 1. NAVBAR
  // =========================================================================
  static renderNavbar() {
    return `
      <header class="mkt-navbar" id="mkt-navbar">
        <div class="mkt-container">
          <div class="mkt-nav-inner">
            
            <!-- Brand Logo -->
            <div class="mkt-brand" onclick="window.navigateMarketing('/')">
              <div class="mkt-brand-logo">🌐</div>
              <span class="mkt-brand-name">Universal ERP</span>
              <span class="mkt-brand-badge">Business OS</span>
            </div>

            <!-- Navigation Categories -->
            <nav>
              <ul class="mkt-nav-links">
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product')">Product</a></li>
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/industries/retail-ecommerce')">Industries</a></li>
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/solutions/small-business')">Solutions</a></li>
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/pricing')">Pricing</a></li>
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/resources')">Resources</a></li>
              </ul>
            </nav>

            <!-- Action CTAs -->
            <div class="mkt-nav-actions">
              <button class="mkt-btn mkt-btn-ghost" onclick="window.navigateMarketing('/auth/login')">
                Sign In
              </button>
              <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/auth/register')">
                Get Started Free →
              </button>
              <button class="mkt-nav-toggle" onclick="window.toggleMarketingMenu()" aria-label="Toggle Navigation Menu">
                ☰
              </button>
            </div>

          </div>
        </div>
      </header>
    `;
  }

  // =========================================================================
  // 2. HERO SECTION
  // =========================================================================
  static renderHero() {
    return `
      <section class="mkt-hero">
        <div class="mkt-container">
          <div class="mkt-hero-grid">
            
            <!-- Left: Headline & CTAs -->
            <div class="mkt-hero-left">
              <div class="mkt-pill-badge">
                <span class="mkt-pill-pulse"></span>
                <span>MODERN BUSINESS OPERATING SYSTEM</span>
              </div>

              <h1 class="mkt-hero-title">
                Run Your Business.<br>
                <span class="mkt-gradient-text-accent">Without The Complexity.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Sales, inventory, customers, purchasing, payments and reports — connected in one simple system.
              </p>

              <!-- Action CTAs -->
              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Get Started Free</span>
                  <span>→</span>
                </button>
                <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/product')">
                  <span>Explore the Platform</span>
                </button>
              </div>

              <!-- Trust Metrics -->
              <div class="mkt-hero-metrics">
                <div class="mkt-metric-item">
                  <div class="mkt-metric-val">100%</div>
                  <div class="mkt-metric-lbl">Offline Resilient</div>
                </div>
                <div class="mkt-metric-divider"></div>
                <div class="mkt-metric-item">
                  <div class="mkt-metric-val">&lt; 5 min</div>
                  <div class="mkt-metric-lbl">Setup Time</div>
                </div>
                <div class="mkt-metric-divider"></div>
                <div class="mkt-metric-item">
                  <div class="mkt-metric-val">PKR / Multi</div>
                  <div class="mkt-metric-lbl">Multi-Currency</div>
                </div>
              </div>
            </div>

            <!-- Right: Floating Live Dashboard Preview -->
            <div class="mkt-hero-right">
              <div class="mkt-dash-preview-frame">
                
                <!-- Window Chrome Bar -->
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/dashboard</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>LIVE DEMO</span>
                  </div>
                </div>

                <!-- Dashboard Content Area (Fictional Demo Data) -->
                <div class="mkt-dash-body">
                  
                  <!-- Top Metrics Row -->
                  <div class="mkt-dash-metrics-grid">
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Today's Sales</div>
                      <div class="mkt-dash-stat-value">PKR 248,500</div>
                      <div class="mkt-dash-stat-trend positive">↑ +14.2% vs yesterday</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Orders Completed</div>
                      <div class="mkt-dash-stat-value">184</div>
                      <div class="mkt-dash-stat-trend positive">↑ 32 in last hour</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Total Stock Value</div>
                      <div class="mkt-dash-stat-value">PKR 4.82M</div>
                      <div class="mkt-dash-stat-trend neutral">● 2 Locations Synced</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Gross Margin</div>
                      <div class="mkt-dash-stat-value">PKR 72,400</div>
                      <div class="mkt-dash-stat-trend positive">↑ 29.1% net margin</div>
                    </div>
                  </div>

                  <!-- Simulated Real-Time Activity Feed -->
                  <div class="mkt-dash-feed-box">
                    <div class="mkt-dash-feed-header">
                      <span class="mkt-feed-title">Live Business Stream</span>
                      <span class="mkt-badge mkt-badge-cyan">Real-Time Sync</span>
                    </div>
                    <div class="mkt-dash-feed-list" id="hero-live-feed">
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
                          <span>Online order #ORD-842 received via Web Store</span>
                        </div>
                        <span class="mkt-activity-time">1m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#3b82f6;"></span>
                          <span>Stock transfer: 15 units dispatched to Main Store</span>
                        </div>
                        <span class="mkt-activity-time">3m ago</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // 3. ONE SYSTEM. EVERYTHING CONNECTED.
  // =========================================================================
  static renderConnectedSystemSection() {
    const modules = [
      { name: 'Point of Sale', icon: '⚡', desc: 'Fast checkout & cash drawer', route: '/product/pos' },
      { name: 'Sales & Invoicing', icon: '📈', desc: 'Quotes, invoices & receipts', route: '/product/sales' },
      { name: 'Inventory & Stock', icon: '📦', desc: 'Multi-location real-time tracking', route: '/product/inventory' },
      { name: 'Purchasing & POs', icon: '🛍️', desc: 'Supplier bills & goods receipts', route: '/product/purchasing' },
      { name: 'Customer CRM', icon: '👥', desc: 'Credit limits & purchase ledgers', route: '/product/customers' },
      { name: 'Payments & Ledgers', icon: '💳', desc: 'Multi-tender payment balancing', route: '/product/payments' },
      { name: 'Financial Reports', icon: '📊', desc: 'Executive margins & P&L', route: '/product/reports' },
    ];

    return `
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>UNIFIED ARCHITECTURE</span>
            </div>
            <h2 class="mkt-section-title">One System. Everything Connected.</h2>
            <p class="mkt-section-subtitle">
              Eliminate data silos. Every sale, purchase order, stock transfer, and customer payment updates your entire business in real time.
            </p>
          </div>

          <!-- Connected Hub Cards Grid -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin-top:32px;">
            ${modules.map((m) => `
              <div class="mkt-feature-card" style="padding:22px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="font-size:28px; margin-bottom:12px;">${m.icon}</div>
                  <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">${m.name}</h3>
                  <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.4;">${m.desc}</p>
                </div>
                <div style="margin-top:16px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <a href="javascript:void(0)" onclick="window.navigateMarketing('${m.route}')" style="font-size:12px; font-weight:600; color:#60a5fa; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                    <span>Explore</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            `).join('')}
          </div>

        </div>
      </section>
    `;
  }

  // =========================================================================
  // 4. DEVELOPING-MARKET PROBLEM & APPROACH
  // =========================================================================
  static renderDevelopingMarketsSection() {
    return `
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>PRACTICAL ENGINEERING</span>
            </div>
            <h2 class="mkt-section-title">Engineered For Real-World Business Conditions</h2>
            <p class="mkt-section-subtitle">
              Most enterprise ERP software was designed for stable Western corporate offices. Universal ERP was engineered from day one for small and growing merchants.
            </p>
          </div>

          <div class="mkt-friction-comparison" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px; margin-top:36px;">
            
            <!-- The Traditional Friction -->
            <div class="mkt-friction-col old-way" style="background:rgba(239, 68, 68, 0.04); border:1px solid rgba(239, 68, 68, 0.2); border-radius:var(--mkt-radius-lg); padding:28px;">
              <div style="font-size:14px; font-weight:700; color:#f87171; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                <span>⚠️</span>
                <span>The Friction of Legacy Tools</span>
              </div>
              <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:14px; font-size:14px; color:var(--mkt-text-muted);">
                <li style="display:flex; gap:10px;">❌ <span><b>Disconnected Spreadsheets</b> — Data gets out of sync, stock goes missing, and calculations break.</span></li>
                <li style="display:flex; gap:10px;">❌ <span><b>Unstable Internet Freezes POS</b> — Cloud-only systems lock cashiers out during connection drops.</span></li>
                <li style="display:flex; gap:10px;">❌ <span><b>Expensive Hardware Demands</b> — Legacy ERPs force costly proprietary terminals and scanner guns.</span></li>
                <li style="display:flex; gap:10px;">❌ <span><b>Complicated Enterprise Bloat</b> — Weeks of consulting required just to perform daily cashier tasks.</span></li>
              </ul>
            </div>

            <!-- The Universal ERP Approach -->
            <div class="mkt-friction-col new-way" style="background:rgba(16, 185, 129, 0.05); border:1px solid rgba(16, 185, 129, 0.25); border-radius:var(--mkt-radius-lg); padding:28px;">
              <div style="font-size:14px; font-weight:700; color:#34d399; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                <span>✓</span>
                <span>The Universal ERP Solution</span>
              </div>
              <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:14px; font-size:14px; color:var(--mkt-text-main);">
                <li style="display:flex; gap:10px;">✨ <span><b>Simple & Connected</b> — Sales, stock, and money update in a unified double-entry ledger.</span></li>
                <li style="display:flex; gap:10px;">✨ <span><b>100% Offline-Ready</b> — Keep checking out customers with local browser caching & automatic sync.</span></li>
                <li style="display:flex; gap:10px;">✨ <span><b>Mobile Camera Scanning</b> — Scan barcodes using standard smartphones without extra gear.</span></li>
                <li style="display:flex; gap:10px;">✨ <span><b>Easy To Learn</b> — Cashiers and staff start selling in under 5 minutes without training.</span></li>
              </ul>
            </div>

          </div>

        </div>
      </section>
    `;
  }

  // =========================================================================
  // 5. RETAIL & E-COMMERCE (CURRENT AVAILABLE INDUSTRY)
  // =========================================================================
  static renderEcommerceFlow() {
    return `
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span style="color:#34d399;">● AVAILABLE NOW</span>
            </div>
            <h2 class="mkt-section-title">Built For Retail & E-Commerce</h2>
            <p class="mkt-section-subtitle">
              Synchronize your physical store counters, central warehouse depots, and online web stores on a single real-time catalog.
            </p>
          </div>

          <!-- Flow Diagram -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px 24px; margin-top:32px;">
            
            <div style="display:flex; justify-content:center; align-items:center; gap:16px; flex-wrap:wrap; margin-bottom:32px;">
              <div style="background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3); border-radius:var(--mkt-radius-md); padding:12px 20px; font-weight:700; color:#93c5fd; display:flex; align-items:center; gap:8px;">
                <span>🛍️</span>
                <span>ONLINE WEB STORE</span>
              </div>
              <div style="font-size:20px; color:var(--mkt-text-muted);">→</div>
              <div style="background:linear-gradient(135deg, #2563eb, #06b6d4); color:#fff; border-radius:var(--mkt-radius-md); padding:12px 24px; font-weight:800; display:flex; align-items:center; gap:8px; box-shadow:0 0 20px rgba(59,130,246,0.3);">
                <span>🌐</span>
                <span>UNIVERSAL ERP CORE</span>
              </div>
              <div style="font-size:20px; color:var(--mkt-text-muted);">→</div>
              <div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); border-radius:var(--mkt-radius-md); padding:12px 20px; font-weight:700; color:#6ee7b7; display:flex; align-items:center; gap:8px;">
                <span>⚡</span>
                <span>PHYSICAL COUNTER POS</span>
              </div>
            </div>

            <!-- Connected Operations Grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px;">
              
              <div class="mkt-feature-card" style="padding:22px;">
                <div style="font-size:26px; margin-bottom:10px;">🏪</div>
                <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Retail Storefront</h4>
                <p style="font-size:13px; color:var(--mkt-text-muted);">High-speed counter POS, camera barcode scanning, cash drawer management, and thermal receipts.</p>
              </div>

              <div class="mkt-feature-card" style="padding:22px;">
                <div style="font-size:26px; margin-bottom:10px;">🏢</div>
                <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Central Warehouse</h4>
                <p style="font-size:13px; color:var(--mkt-text-muted);">Supplier purchase order receiving (GRN), inter-branch stock transfers, and barcode cycle counts.</p>
              </div>

              <div class="mkt-feature-card" style="padding:22px;">
                <div style="font-size:26px; margin-bottom:10px;">🌐</div>
                <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Online & E-Commerce</h4>
                <p style="font-size:13px; color:var(--mkt-text-muted);">Unified stock balance preventing stockouts when items sell simultaneously online and in-store.</p>
              </div>

            </div>

            <div style="text-align:center; margin-top:28px;">
              <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/industries/retail-ecommerce')">
                <span>Explore Retail & E-Commerce Solution</span>
                <span>→</span>
              </button>
            </div>

          </div>

        </div>
      </section>
    `;
  }

  // =========================================================================
  // 6. UNIVERSAL CORE (ONE CORE. MANY INDUSTRIES)
  // =========================================================================
  static renderUniversalCoreSection() {
    return `
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>LONG-TERM PHILOSOPHY</span>
            </div>
            <h2 class="mkt-section-title">One Core. Many Industries.</h2>
            <p class="mkt-section-subtitle">
              Universal ERP is built around a shared business OS core that can scale into specialized vertical industries without fragmenting your data.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:18px; margin-top:32px;">
            
            <!-- Retail & E-commerce -->
            <div class="mkt-industry-card available" onclick="window.navigateMarketing('/industries/retail-ecommerce')" style="cursor:pointer;">
              <div class="mkt-ind-badge-now">● Available Now</div>
              <div class="mkt-ind-icon">🛒</div>
              <h3 class="mkt-ind-title">Retail & E-Commerce</h3>
              <p class="mkt-ind-desc">Counter POS, camera barcode scanning, multi-location stock, and instant cash sales.</p>
              <div class="mkt-ind-link">Explore Industry →</div>
            </div>

            <!-- Healthcare -->
            <div class="mkt-industry-card" onclick="window.navigateMarketing('/industries/healthcare')" style="cursor:pointer;">
              <div class="mkt-ind-badge-soon">Coming Soon</div>
              <div class="mkt-ind-icon">🏥</div>
              <h3 class="mkt-ind-title">Healthcare & Clinics</h3>
              <p class="mkt-ind-desc">Pharmacy batch expiry tracking, patient accounts, and clinic billing workflows.</p>
              <div class="mkt-ind-link">Learn More →</div>
            </div>

            <!-- Construction -->
            <div class="mkt-industry-card" onclick="window.navigateMarketing('/industries/construction')" style="cursor:pointer;">
              <div class="mkt-ind-badge-soon">Coming Soon</div>
              <div class="mkt-ind-icon">🏗️</div>
              <h3 class="mkt-ind-title">Construction & Contracting</h3>
              <p class="mkt-ind-desc">Job costing, project procurement, site materials dispatch, and milestone billing.</p>
              <div class="mkt-ind-link">Learn More →</div>
            </div>

            <!-- Wholesale -->
            <div class="mkt-industry-card" onclick="window.navigateMarketing('/industries/wholesale')" style="cursor:pointer;">
              <div class="mkt-ind-badge-soon">Coming Soon</div>
              <div class="mkt-ind-icon">🚚</div>
              <h3 class="mkt-ind-title">Wholesale & Trade</h3>
              <p class="mkt-ind-desc">Bulk order lines, tiered customer pricing schedules, and credit risk limits.</p>
              <div class="mkt-ind-link">Learn More →</div>
            </div>

            <!-- Services -->
            <div class="mkt-industry-card" onclick="window.navigateMarketing('/industries/services')" style="cursor:pointer;">
              <div class="mkt-ind-badge-soon">Coming Soon</div>
              <div class="mkt-ind-icon">💼</div>
              <h3 class="mkt-ind-title">Professional Services</h3>
              <p class="mkt-ind-desc">Time tracking, client retainers, reimbursable expenses, and statement portal.</p>
              <div class="mkt-ind-link">Learn More →</div>
            </div>

          </div>

        </div>
      </section>
    `;
  }

  // =========================================================================
  // 7. PRODUCT PREVIEW (TEASER TABS)
  // =========================================================================
  static renderProductTour() {
    return `
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>PRODUCT TEASER</span>
            </div>
            <h2 class="mkt-section-title">Interactive Product Preview</h2>
            <p class="mkt-section-subtitle">
              A quick look at the Universal ERP workspace in action across core operations.
            </p>
          </div>

          <!-- Product Tabs -->
          <div class="mkt-tour-tabs" style="margin-top:28px;">
            <button class="mkt-tab-btn active" onclick="window.switchTourTab('dashboard')">📊 Dashboard</button>
            <button class="mkt-tab-btn" onclick="window.switchTourTab('pos')">⚡ Point of Sale</button>
            <button class="mkt-tab-btn" onclick="window.switchTourTab('inventory')">📦 Inventory</button>
            <button class="mkt-tab-btn" onclick="window.switchTourTab('sales')">📈 Sales & Invoices</button>
            <button class="mkt-tab-btn" onclick="window.switchTourTab('purchases')">🛍️ Purchasing & POs</button>
            <button class="mkt-tab-btn" onclick="window.switchTourTab('reports')">📑 Reports & P&L</button>
          </div>

          <!-- Showcase Frame -->
          <div class="mkt-tour-showcase" style="margin-top:20px;">
            <div class="mkt-tour-window">
              
              <div class="mkt-tour-topbar">
                <div class="mkt-dash-dots">
                  <span class="mkt-dot red"></span>
                  <span class="mkt-dot yellow"></span>
                  <span class="mkt-dot green"></span>
                </div>
                <div class="mkt-tour-address-bar" id="tour-browser-url">app.universalerp.com/dashboard</div>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Encrypted 256-bit</div>
              </div>

              <!-- Interactive Tab Content Area -->
              <div class="mkt-tour-content" id="tour-showcase-content">
                ${this.renderTourContent('dashboard')}
              </div>

            </div>
          </div>

        </div>
      </section>
    `;
  }

  // Showcase Content Generator for Teaser Tabs
  static renderTourContent(tab = 'dashboard') {
    if (tab === 'pos') {
      return `
        <div class="mkt-mockup-pos">
          <div class="mkt-pos-header">
            <div>
              <div style="font-weight:700; font-size:16px;">Apex Retail Store — Register 01</div>
              <div style="font-size:12px; color:var(--mkt-text-muted);">Cashier: Zain Abbas • Mode: High-Speed Touch POS</div>
            </div>
            <div class="mkt-badge mkt-badge-green">● Scanner Connected</div>
          </div>
          <div class="mkt-pos-body">
            <div class="mkt-pos-products">
              <div class="mkt-pos-grid">
                <div class="mkt-pos-item"><span>☕</span><b>Dark Roast Arabica (1kg)</b><small>PKR 2,600 • Stock: 48</small></div>
                <div class="mkt-pos-item"><span>🥛</span><b>Barista Oat Milk (1L)</b><small>PKR 800 • Stock: 117</small></div>
                <div class="mkt-pos-item"><span>🍵</span><b>Organic Green Tea (250g)</b><small>PKR 950 • Stock: 80</small></div>
                <div class="mkt-pos-item"><span>🍯</span><b>Vanilla Syrup (750ml)</b><small>PKR 1,750 • Stock: 30</small></div>
              </div>
            </div>
            <div class="mkt-pos-cart">
              <div class="mkt-cart-title">Current Order (2 Items)</div>
              <div class="mkt-cart-line"><span>2x Dark Roast Arabica</span><b>PKR 5,200</b></div>
              <div class="mkt-cart-line"><span>3x Barista Oat Milk</span><b>PKR 2,400</b></div>
              <div class="mkt-cart-line discount"><span>Item Discount</span><b>-PKR 200</b></div>
              <div class="mkt-cart-total"><span>Total Payable</span><b>PKR 7,400</b></div>
              <button class="mkt-btn mkt-btn-primary" style="width:100%; margin-top:12px;" onclick="window.navigateMarketing('/product/pos')">
                Explore POS Module →
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (tab === 'inventory') {
      return `
        <div class="mkt-mockup-inv">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <div style="font-weight:700; font-size:16px;">Multi-Location Inventory Master</div>
              <div style="font-size:12px; color:var(--mkt-text-muted);">Main Store & Central Warehouse Real-Time Reconciliation</div>
            </div>
            <button class="mkt-btn mkt-btn-secondary" style="padding:6px 14px; font-size:12px;" onclick="window.navigateMarketing('/product/inventory')">
              Explore Inventory →
            </button>
          </div>
          <div class="mkt-mockup-table">
            <div class="mkt-tbl-row head"><span>Product Name / SKU</span><span>Main Store</span><span>Warehouse</span><span>Valuation</span><span>Status</span></div>
            <div class="mkt-tbl-row"><span>Dark Roast Arabica (COF-DR-1KG)</span><span>48 Units</span><span>20 Units</span><span>PKR 122,400</span><span class="badge in-stock">Optimal</span></div>
            <div class="mkt-tbl-row"><span>Barista Oat Milk (MLK-OAT-1L)</span><span>117 Units</span><span>80 Units</span><span>PKR 108,350</span><span class="badge in-stock">Optimal</span></div>
            <div class="mkt-tbl-row"><span>Ceramic Artisan Mug (ACC-MUG-350)</span><span>30 Units</span><span>15 Units</span><span>PKR 18,000</span><span class="badge low-stock">Transferred</span></div>
          </div>
        </div>
      `;
    }

    if (tab === 'sales') {
      return `
        <div class="mkt-mockup-inv">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <div style="font-weight:700; font-size:16px;">Sales Invoices & Customer Receivables</div>
              <div style="font-size:12px; color:var(--mkt-text-muted);">Quotations, Wholesale Orders & Customer Credit Tracking</div>
            </div>
            <button class="mkt-btn mkt-btn-primary" style="padding:6px 14px; font-size:12px;" onclick="window.navigateMarketing('/product/sales')">
              Explore Sales →
            </button>
          </div>
          <div class="mkt-mockup-table">
            <div class="mkt-tbl-row head"><span>Invoice #</span><span>Customer</span><span>Payment Method</span><span>Amount</span><span>Status</span></div>
            <div class="mkt-tbl-row"><span>INV-2026-001095</span><span>Walk-in Customer</span><span>Cash</span><span>PKR 7,400</span><span class="badge in-stock">PAID</span></div>
            <div class="mkt-tbl-row"><span>INV-2026-001096</span><span>Cafe Gloria (Partner)</span><span>Credit (30 Days)</span><span>PKR 16,500</span><span class="badge low-stock">PARTIAL</span></div>
            <div class="mkt-tbl-row"><span>INV-2026-001097</span><span>Usman Ali (VIP Member)</span><span>Bank Transfer</span><span>PKR 4,850</span><span class="badge in-stock">PAID</span></div>
          </div>
        </div>
      `;
    }

    if (tab === 'purchases') {
      return `
        <div class="mkt-mockup-inv">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <div style="font-weight:700; font-size:16px;">Supplier Purchase Orders & Goods Receipts</div>
              <div style="font-size:12px; color:var(--mkt-text-muted);">Track POs, Supplier Payables, and GRN Stock Ingestion</div>
            </div>
            <button class="mkt-btn mkt-btn-primary" style="padding:6px 14px; font-size:12px;" onclick="window.navigateMarketing('/product/purchasing')">
              Explore Purchasing →
            </button>
          </div>
          <div class="mkt-mockup-table">
            <div class="mkt-tbl-row head"><span>PO Number</span><span>Supplier</span><span>Total Amount</span><span>GRN Status</span><span>Bill Balance</span></div>
            <div class="mkt-tbl-row"><span>PO-2026-00001</span><span>Highland Coffee Roasters</span><span>PKR 36,000</span><span class="badge in-stock">RECEIVED</span><span>PKR 16,000 Due</span></div>
            <div class="mkt-tbl-row"><span>PO-2026-00002</span><span>Fresh Dairy & Oat Supplies</span><span>PKR 45,000</span><span class="badge in-stock">RECEIVED</span><span>PAID</span></div>
            <div class="mkt-tbl-row"><span>PO-2026-00003</span><span>Universal Food Packaging</span><span>PKR 18,500</span><span class="badge low-stock">IN TRANSIT</span><span>Draft</span></div>
          </div>
        </div>
      `;
    }

    if (tab === 'reports') {
      return `
        <div class="mkt-mockup-reports">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <div style="font-weight:700; font-size:16px;">Executive Financial Statement (P&L)</div>
              <div style="font-size:12px; color:var(--mkt-text-muted);">Gross Revenue, COGS, Store Expenses & Net Operating Profit</div>
            </div>
            <button class="mkt-btn mkt-btn-primary" style="padding:6px 14px; font-size:12px;" onclick="window.navigateMarketing('/product/reports')">
              Explore Reports →
            </button>
          </div>
          <div class="mkt-report-summary-cards">
            <div class="mkt-rep-card"><span>Gross Revenue</span><b>PKR 248,500</b><small>+14.2% MoM</small></div>
            <div class="mkt-rep-card"><span>Cost of Goods (COGS)</span><b>PKR 167,600</b><small>67.4% ratio</small></div>
            <div class="mkt-rep-card"><span>Operating Expenses</span><b>PKR 8,500</b><small>Utilities & Rent</small></div>
            <div class="mkt-rep-card highlight"><span>Net Operating Profit</span><b>PKR 72,400</b><small>29.1% net</small></div>
          </div>
        </div>
      `;
    }

    // Default: Dashboard Preview
    return `
      <div class="mkt-mockup-dash">
        <div class="mkt-dash-metrics-grid" style="margin-bottom:16px;">
          <div class="mkt-dash-stat-card"><div class="mkt-dash-stat-label">Sales Today</div><div class="mkt-dash-stat-value">PKR 248,500</div><div class="mkt-dash-stat-trend positive">↑ +14.2%</div></div>
          <div class="mkt-dash-stat-card"><div class="mkt-dash-stat-label">Transactions</div><div class="mkt-dash-stat-value">184</div><div class="mkt-dash-stat-trend positive">↑ 32/hr</div></div>
          <div class="mkt-dash-stat-card"><div class="mkt-dash-stat-label">Stock Value</div><div class="mkt-dash-stat-value">PKR 4.82M</div><div class="mkt-dash-stat-trend neutral">2 Locations</div></div>
          <div class="mkt-dash-stat-card"><div class="mkt-dash-stat-label">Net Margin</div><div class="mkt-dash-stat-value">PKR 72,400</div><div class="mkt-dash-stat-trend positive">29.1%</div></div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.2); border-radius:var(--mkt-radius-md);">
          <span style="font-size:13px; color:var(--mkt-text-muted);">Real-time snapshot across all storefronts and backroom warehouses.</span>
          <button class="mkt-btn mkt-btn-primary" style="padding:6px 14px; font-size:12px;" onclick="window.navigateMarketing('/product')">
            Explore Full Platform →
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 8. MOBILE CAMERA BARCODE SCANNER TEASER
  // =========================================================================
  static renderScannerSection() {
    return `
      <section class="mkt-section" id="mobile-scanner">
        <div class="mkt-container">
          <div class="mkt-scanner-layout">
            
            <!-- Left: Value Copy -->
            <div class="mkt-scanner-copy">
              <div class="mkt-pill-badge">
                <span>HARDWARE-FREE SCANNING</span>
              </div>
              <h2 class="mkt-section-title" style="text-align:left;">Your Phone Can Be Your Barcode Scanner.</h2>
              <p class="mkt-section-subtitle" style="text-align:left; margin-bottom:24px;">
                No specialized barcode guns required. Scan manufacturer barcodes and shelf tags with any standard smartphone camera.
              </p>

              <!-- Step Sequence -->
              <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:28px;">
                <div style="display:flex; align-items:center; gap:12px; font-size:14px; color:var(--mkt-text-main);">
                  <span style="background:rgba(59,130,246,0.2); color:#60a5fa; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700;">1</span>
                  <span>Point camera at any standard barcode (EAN-13, UPC, QR)</span>
                </div>
                <div style="display:flex; align-items:center; gap:12px; font-size:14px; color:var(--mkt-text-main);">
                  <span style="background:rgba(6,182,212,0.2); color:#22d3ee; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700;">2</span>
                  <span>Instant hardware-accelerated detection in &lt; 50ms</span>
                </div>
                <div style="display:flex; align-items:center; gap:12px; font-size:14px; color:var(--mkt-text-main);">
                  <span style="background:rgba(16,185,129,0.2); color:#34d399; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700;">3</span>
                  <span>Product identified, stock verified, and added to cart</span>
                </div>
              </div>

              <div>
                <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/product/barcode-scanner')">
                  <span>Explore Barcode Scanner</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <!-- Right: Smartphone Scanner Mockup -->
            <div class="mkt-scanner-visual">
              <div class="mkt-phone-frame">
                <div class="mkt-phone-notch"></div>
                <div class="mkt-camera-viewfinder">
                  <div class="mkt-laser-line"></div>
                  <div class="mkt-scan-corners">
                    <span class="corner tl"></span><span class="corner tr"></span>
                    <span class="corner bl"></span><span class="corner br"></span>
                  </div>
                  <div class="mkt-scan-detected-card">
                    <div class="mkt-detected-sku">SKU: COF-DR-1KG • 89010001</div>
                    <div class="mkt-detected-name">Dark Roast Arabica (1kg)</div>
                    <div class="mkt-detected-price">PKR 2,600 • In Stock: 48</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // 9. OFFLINE POS TEASER
  // =========================================================================
  static renderOfflineSection() {
    return `
      <section class="mkt-section" id="offline-pos" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>LOCAL-FIRST RESILIENCE</span>
            </div>
            <h2 class="mkt-section-title">Keep Selling When The Internet Doesn't.</h2>
            <p class="mkt-section-subtitle">
              Internet outages won't stop your checkout line. Sales are securely stored in your browser and automatically synchronized when connection restores.
            </p>
          </div>

          <!-- 5-Stage Visualization Chain -->
          <div class="mkt-offline-chain" style="display:flex; justify-content:center; align-items:center; gap:12px; flex-wrap:wrap; margin-top:32px; margin-bottom:32px;">
            <div class="mkt-offline-node"><div class="node-icon">🟢</div><b>1. Online</b><small>Cloud Synced</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node alert"><div class="node-icon">🔴</div><b>2. Link Drops</b><small>Internet Lost</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active"><div class="node-icon">💾</div><b>3. Sale Saved</b><small>IndexedDB Queue</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node"><div class="node-icon">🟡</div><b>4. Reconnecting</b><small>Link Restored</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success"><div class="node-icon">✅</div><b>5. Auto Sync</b><small>0 Duplicates</small></div>
          </div>

          <!-- Interactive Simulator Banner -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-lg); padding:24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div>
              <div id="offline-status-indicator" class="mkt-dash-status-pill" style="display:inline-flex; margin-bottom:8px;">
                ● STATUS: Central Cloud Connected
              </div>
              <div style="font-size:13px; color:var(--mkt-text-muted);">Test the local-first offline transaction cycle in real time.</div>
            </div>
            <div style="display:flex; gap:10px;">
              <button class="mkt-btn mkt-btn-secondary" onclick="window.simulateOfflineCycle()">
                ⚡ Test Offline Simulation
              </button>
              <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/product/offline-pos')">
                Explore Offline POS →
              </button>
            </div>
          </div>

        </div>
      </section>
    `;
  }

  // =========================================================================
  // 10. FINAL CALL TO ACTION
  // =========================================================================
  static renderFinalCTA() {
    return `
      <section class="mkt-section mkt-cta-section">
        <div class="mkt-container">
          <div class="mkt-cta-card">
            
            <h2 class="mkt-cta-title">Ready To Simplify Your Business?</h2>
            <p class="mkt-cta-desc">
              Start with the tools you need today and grow into a connected business platform.
            </p>

            <div class="mkt-cta-actions">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                Get Started Free →
              </button>
              <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/product')">
                Explore Universal ERP
              </button>
            </div>

            <div class="mkt-cta-subtext">
              <span>✓ 14-day free trial</span>
              <span>•</span>
              <span>✓ No credit card required</span>
              <span>•</span>
              <span>✓ Ready in under 5 minutes</span>
            </div>

          </div>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // 11. FOOTER
  // =========================================================================
  static renderFooter() {
    return `
      <footer class="mkt-footer">
        <div class="mkt-container">
          <div class="mkt-footer-grid">
            
            <!-- Brand Column -->
            <div class="mkt-footer-brand">
              <div class="mkt-brand" onclick="window.navigateMarketing('/')">
                <div class="mkt-brand-logo">🌐</div>
                <span class="mkt-brand-name">Universal ERP</span>
              </div>
              <p class="mkt-footer-tagline">
                The Universal Business Operating System for high-performing commerce and modern retail.
              </p>
              <div class="mkt-footer-status">
                <span class="mkt-status-dot"></span>
                <span>Universal Cloud OS • All Systems Operational</span>
              </div>
            </div>

            <!-- Product Column -->
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

            <!-- Industries Column -->
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

            <!-- Solutions Column -->
            <div class="mkt-footer-col">
              <h4>Solutions</h4>
              <ul>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/solutions/small-business')">Small Business OS</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/solutions/multi-location')">Multi-Location Retail</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/solutions/online-offline-retail')">Online + In-Store Sync</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/pricing')">Pricing & Plans</a></li>
              </ul>
            </div>

            <!-- Resources & Company Column -->
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
    `;
  }

  // Mobile Drawer
  static renderMobileDrawer() {
    return `
      <div id="mkt-mobile-menu" style="display:none; position:fixed; inset:0; background:rgba(11,15,25,0.98); z-index:9999; padding:24px; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
            <div class="mkt-brand" onclick="window.toggleMarketingMenu(); window.navigateMarketing('/');">
              <div class="mkt-brand-logo">🌐</div>
              <span class="mkt-brand-name">Universal ERP</span>
            </div>
            <button class="mkt-btn mkt-btn-ghost" onclick="window.toggleMarketingMenu()" style="font-size:20px;">✕</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:18px; font-size:17px; font-weight:600;">
            <a href="javascript:void(0)" onclick="window.toggleMarketingMenu(); window.navigateMarketing('/product');" style="color:#fff; text-decoration:none;">Product</a>
            <a href="javascript:void(0)" onclick="window.toggleMarketingMenu(); window.navigateMarketing('/industries/retail-ecommerce');" style="color:#fff; text-decoration:none;">Industries</a>
            <a href="javascript:void(0)" onclick="window.toggleMarketingMenu(); window.navigateMarketing('/solutions/small-business');" style="color:#fff; text-decoration:none;">Solutions</a>
            <a href="javascript:void(0)" onclick="window.toggleMarketingMenu(); window.navigateMarketing('/pricing');" style="color:#fff; text-decoration:none;">Pricing</a>
            <a href="javascript:void(0)" onclick="window.toggleMarketingMenu(); window.navigateMarketing('/resources');" style="color:#fff; text-decoration:none;">Resources</a>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <button class="mkt-btn mkt-btn-ghost" onclick="window.toggleMarketingMenu(); window.navigateMarketing('/auth/login');">Sign In</button>
          <button class="mkt-btn mkt-btn-primary" onclick="window.toggleMarketingMenu(); window.navigateMarketing('/auth/register');">Get Started Free</button>
        </div>
      </div>
    `;
  }

  // Interactive Controllers
  static initInteractiveControllers() {
    // 1. Scroll-triggered navbar styling
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('mkt-navbar');
      if (navbar) {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    });

    // 2. Simulated Live Hero Ticker
    if (this.liveFeedInterval) clearInterval(this.liveFeedInterval);
    const simulatedEvents = [
      { text: 'POS Sale #1095 completed (Cash: PKR 2,800)', color: '#10b981' },
      { text: 'Online order #ORD-842 received via Web Store', color: '#06b6d4' },
      { text: 'Inventory synced: Dark Roast Coffee (-1)', color: '#3b82f6' },
      { text: 'Customer credit payment received: PKR 15,000', color: '#10b981' },
      { text: 'New product barcode generated: 8901234567895', color: '#8b5cf6' },
    ];

    let eventIdx = 0;
    this.liveFeedInterval = setInterval(() => {
      const feed = document.getElementById('hero-live-feed');
      if (!feed) return;

      const event = simulatedEvents[eventIdx % simulatedEvents.length];
      eventIdx++;

      const item = document.createElement('div');
      item.className = 'mkt-activity-item';
      item.innerHTML = `
        <div class="mkt-activity-left">
          <span class="mkt-activity-dot" style="background:${event.color};"></span>
          <span>${event.text}</span>
        </div>
        <span class="mkt-activity-time">Just now</span>
      `;

      feed.insertBefore(item, feed.firstChild);
      if (feed.children.length > 4) {
        feed.removeChild(feed.lastChild);
      }
    }, 4500);
  }
}
