/**
 * Universal ERP — Reports & Analytics Dedicated Product Page (/product/reports)
 * Phase 23 — Step 13: Dedicated Business Intelligence & Financial Analytics Hub
 */

// Client-Side Interactive Controllers
if (typeof window !== 'undefined') {
  // Sales Period Controller
  window.switchReportSalesPeriod = (period) => {
    const periodData = {
      today: { rev: 'PKR 248.5k', orders: '184', aov: 'PKR 5,916', trend: '● Today Live' },
      week: { rev: 'PKR 1.42M', orders: '1,086', aov: 'PKR 6,120', trend: '↑ +8.4% vs last week' },
      month: { rev: 'PKR 5.28M', orders: '4,920', aov: 'PKR 6,102', trend: '↑ +14.8% vs last month' }
    };

    const target = periodData[period] || periodData.today;

    const revEl = document.getElementById('sales-kpi-rev');
    const ordEl = document.getElementById('sales-kpi-orders');
    const aovEl = document.getElementById('sales-kpi-aov');
    const trendEl = document.getElementById('sales-kpi-trend');

    if (revEl) revEl.innerText = target.rev;
    if (ordEl) ordEl.innerText = target.orders;
    if (aovEl) aovEl.innerText = target.aov;
    if (trendEl) trendEl.innerText = target.trend;

    const btns = document.querySelectorAll('.sales-period-btn');
    btns.forEach((btn) => {
      if (btn.getAttribute('data-period') === period) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  };

  // Customer Segmentation Filter
  window.filterReportCustomers = (segment) => {
    const rows = document.querySelectorAll('.cust-report-row');
    const btns = document.querySelectorAll('.cust-seg-btn');

    btns.forEach((btn) => {
      if (btn.getAttribute('data-seg') === segment) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    rows.forEach((r) => {
      const seg = r.getAttribute('data-seg');
      if (segment === 'all' || seg === segment) {
        r.style.display = 'flex';
      } else {
        r.style.display = 'none';
      }
    });
  };

  // Location Selector
  window.switchReportLocation = (loc) => {
    const locData = {
      all: { name: 'All Locations (Consolidated)', rev: 'PKR 527,200', orders: '407', profit: 'PKR 172,400', stock: 'PKR 3.90M' },
      store01: { name: 'Store 01 (Commercial)', rev: 'PKR 248,500', orders: '184', profit: 'PKR 81,150', stock: 'PKR 1.82M' },
      store02: { name: 'Store 02 (Mall)', rev: 'PKR 182,300', orders: '141', profit: 'PKR 58,400', stock: 'PKR 1.24M' },
      online: { name: 'Online Store (E-Commerce)', rev: 'PKR 96,400', orders: '82', profit: 'PKR 32,850', stock: 'PKR 0.84M' }
    };

    const target = locData[loc] || locData.all;

    const nameEl = document.getElementById('loc-active-title');
    const revEl = document.getElementById('loc-kpi-rev');
    const ordEl = document.getElementById('loc-kpi-orders');
    const profitEl = document.getElementById('loc-kpi-profit');
    const stockEl = document.getElementById('loc-kpi-stock');

    if (nameEl) nameEl.innerText = target.name;
    if (revEl) revEl.innerText = target.rev;
    if (ordEl) ordEl.innerText = target.orders;
    if (profitEl) profitEl.innerText = target.profit;
    if (stockEl) stockEl.innerText = target.stock;

    const btns = document.querySelectorAll('.report-loc-btn');
    btns.forEach((btn) => {
      if (btn.getAttribute('data-loc') === loc) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  };

  // Report Library Search & Filter
  window.searchReports = (query) => {
    const cards = document.querySelectorAll('.report-lib-card');
    const q = (query || '').toLowerCase().trim();

    cards.forEach((c) => {
      const text = c.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        c.style.display = 'flex';
      } else {
        c.style.display = 'none';
      }
    });
  };

  window.filterReportLibrary = (cat) => {
    const cards = document.querySelectorAll('.report-lib-card');
    const btns = document.querySelectorAll('.report-lib-filter-btn');

    btns.forEach((b) => {
      if (b.getAttribute('data-cat') === cat) b.classList.add('active');
      else b.classList.remove('active');
    });

    cards.forEach((c) => {
      const cardCat = c.getAttribute('data-cat');
      if (cat === 'all' || cardCat === cat) {
        c.style.display = 'flex';
      } else {
        c.style.display = 'none';
      }
    });
  };

  // Action Feedback Toast
  window.triggerReportAction = (actionName, targetDoc = 'Report') => {
    const toast = document.getElementById('report-action-toast');
    if (toast) {
      toast.innerText = `✓ ${actionName} prepared for ${targetDoc}. Export formatted.`;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3500);
    }
  };
}

export function renderProductReportsPage() {
  return `
    <div class="marketing-wrapper" id="marketing-root">
      <div class="mkt-ambient-glow"></div>

      <!-- Action Feedback Toast -->
      <div id="report-action-toast" style="display:none; position:fixed; bottom:24px; right:24px; z-index:99999; background:#10b981; color:#ffffff; padding:12px 20px; border-radius:var(--mkt-radius-md); font-weight:700; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
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
           SECTION 1: HERO & ANALYTICS COMMAND CENTER
           ========================================================================= -->
      <section class="mkt-section" style="padding-top:120px; padding-bottom:60px;">
        <div class="mkt-container">
          <div class="mkt-hero-grid">
            
            <div class="mkt-hero-left">
              <div class="mkt-pill-badge">
                <span class="mkt-pill-pulse"></span>
                <span>REPORTS & ANALYTICS</span>
              </div>

              <h1 class="mkt-hero-title">
                See What Your Business<br>
                <span class="mkt-gradient-text-accent">Is Really Doing.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Turn sales, inventory, purchasing, payments and customer activity into clear business reports — without rebuilding the numbers in spreadsheets.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Start Analyzing</span>
                  <span>→</span>
                </button>
                <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="document.getElementById('reports-demo').scrollIntoView({ behavior: 'smooth' })">
                  <span>Explore Reports</span>
                </button>
              </div>

              <div class="mkt-hero-metrics">
                <div class="mkt-metric-item">
                  <div class="mkt-metric-val">100%</div>
                  <div class="mkt-metric-lbl">Ledger Linked</div>
                </div>
                <div class="mkt-metric-divider"></div>
                <div class="mkt-metric-item">
                  <div class="mkt-metric-val">&lt; 1s</div>
                  <div class="mkt-metric-lbl">Instant Generation</div>
                </div>
                <div class="mkt-metric-divider"></div>
                <div class="mkt-metric-item">
                  <div class="mkt-metric-val">0</div>
                  <div class="mkt-metric-lbl">Manual Sheets</div>
                </div>
              </div>
            </div>

            <!-- Command Center Hero Mockup -->
            <div class="mkt-hero-right" id="reports-demo">
              <div class="mkt-dash-preview-frame">
                
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/reports/command-center</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>LIVE KPI FEED</span>
                  </div>
                </div>

                <div class="mkt-dash-body">
                  
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:8px;">
                    <div>
                      <div style="font-size:16px; font-weight:800; color:#fff;">Executive Financial Command</div>
                      <div style="font-size:12px; color:var(--mkt-text-muted);">Real-time multi-branch operational rollup</div>
                    </div>
                    <div style="display:flex; gap:6px;">
                      <span class="mkt-badge mkt-badge-cyan" style="font-size:11px;">📅 Today: 31 Aug 2026</span>
                      <span class="mkt-badge mkt-badge-cyan" style="font-size:11px;">🏢 All Locations</span>
                    </div>
                  </div>

                  <!-- 6 Hero KPIs -->
                  <div class="mkt-dash-metrics-grid" style="grid-template-columns:repeat(3, 1fr);">
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Today's Revenue</div>
                      <div class="mkt-dash-stat-value" style="color:#60a5fa;">PKR 248,500</div>
                      <div class="mkt-dash-stat-trend positive">↑ +14.2% vs yesterday</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Gross Profit</div>
                      <div class="mkt-dash-stat-value" style="color:#34d399;">PKR 81,150</div>
                      <div class="mkt-dash-stat-trend positive">↑ Margin: 32.7%</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Receivables</div>
                      <div class="mkt-dash-stat-value" style="color:#fbbf24;">PKR 284,500</div>
                      <div class="mkt-dash-stat-trend neutral">● 14 Open Invoices</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Inventory Value</div>
                      <div class="mkt-dash-stat-value">PKR 4.82M</div>
                      <div class="mkt-dash-stat-trend neutral">● 2,410 Units On Hand</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Operating Expenses</div>
                      <div class="mkt-dash-stat-value" style="color:#f87171;">PKR 18,400</div>
                      <div class="mkt-dash-stat-trend neutral">● Utilities & Logistics</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Net Daily Flow</div>
                      <div class="mkt-dash-stat-value" style="color:#a78bfa;">+PKR 62,750</div>
                      <div class="mkt-dash-stat-trend positive">↑ Profitable Shift</div>
                    </div>
                  </div>

                  <!-- Visual Chart Simulation -->
                  <div class="mkt-dash-feed-box" style="margin-top:12px;">
                    <div class="mkt-dash-feed-header">
                      <span class="mkt-feed-title">Hourly Revenue Velocity</span>
                      <span class="mkt-badge mkt-badge-cyan">Peak: 14:00 - 16:00</span>
                    </div>
                    <div style="display:flex; align-items:flex-end; gap:8px; height:70px; padding:8px 0; border-bottom:1px solid var(--mkt-border);">
                      <div style="flex:1; background:rgba(59,130,246,0.3); height:30%; border-radius:4px 4px 0 0;" title="10:00"></div>
                      <div style="flex:1; background:rgba(59,130,246,0.4); height:45%; border-radius:4px 4px 0 0;" title="11:00"></div>
                      <div style="flex:1; background:rgba(59,130,246,0.5); height:60%; border-radius:4px 4px 0 0;" title="12:00"></div>
                      <div style="flex:1; background:rgba(59,130,246,0.7); height:85%; border-radius:4px 4px 0 0;" title="13:00"></div>
                      <div style="flex:1; background:linear-gradient(180deg, #3b82f6, #06b6d4); height:100%; border-radius:4px 4px 0 0;" title="14:00 (Peak)"></div>
                      <div style="flex:1; background:rgba(59,130,246,0.8); height:90%; border-radius:4px 4px 0 0;" title="15:00"></div>
                      <div style="flex:1; background:rgba(59,130,246,0.6); height:70%; border-radius:4px 4px 0 0;" title="16:00"></div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 2: ONE BUSINESS. ONE SOURCE OF TRUTH.
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>UNIFIED TRANSACTION PIPELINE</span>
            </div>
            <h2 class="mkt-section-title">One Business. One Source Of Truth.</h2>
            <p class="mkt-section-subtitle">
              Never re-enter numbers into spreadsheet tabs. Reports stream directly from real operational transactions across every register, warehouse, and bank account.
            </p>
          </div>

          <!-- 9-Stage Pipeline Visualization -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px 20px; overflow-x:auto;">
            <div style="display:flex; align-items:center; justify-content:space-between; min-width:860px; gap:8px;">
              
              <div style="text-align:center; flex:1;">
                <div style="width:40px; height:40px; border-radius:10px; background:rgba(59,130,246,0.15); color:#60a5fa; display:flex; align-items:center; justify-content:center; margin:0 auto 8px; font-size:18px;">⚡</div>
                <div style="font-size:12px; font-weight:700; color:#fff;">Sales</div>
                <div style="font-size:10px; color:var(--mkt-text-dim);">Counter POS</div>
              </div>
              <div style="color:var(--mkt-text-dim);">→</div>

              <div style="text-align:center; flex:1;">
                <div style="width:40px; height:40px; border-radius:10px; background:rgba(16,185,129,0.15); color:#34d399; display:flex; align-items:center; justify-content:center; margin:0 auto 8px; font-size:18px;">💳</div>
                <div style="font-size:12px; font-weight:700; color:#fff;">Payments</div>
                <div style="font-size:10px; color:var(--mkt-text-dim);">Cash & Card</div>
              </div>
              <div style="color:var(--mkt-text-dim);">→</div>

              <div style="text-align:center; flex:1;">
                <div style="width:40px; height:40px; border-radius:10px; background:rgba(6,182,212,0.15); color:#22d3ee; display:flex; align-items:center; justify-content:center; margin:0 auto 8px; font-size:18px;">📦</div>
                <div style="font-size:12px; font-weight:700; color:#fff;">Inventory</div>
                <div style="font-size:10px; color:var(--mkt-text-dim);">Stock Valued</div>
              </div>
              <div style="color:var(--mkt-text-dim);">→</div>

              <div style="text-align:center; flex:1;">
                <div style="width:40px; height:40px; border-radius:10px; background:rgba(245,158,11,0.15); color:#fbbf24; display:flex; align-items:center; justify-content:center; margin:0 auto 8px; font-size:18px;">🛍️</div>
                <div style="font-size:12px; font-weight:700; color:#fff;">Purchasing</div>
                <div style="font-size:10px; color:var(--mkt-text-dim);">PO & Bills</div>
              </div>
              <div style="color:var(--mkt-text-dim);">→</div>

              <div style="text-align:center; flex:1;">
                <div style="width:40px; height:40px; border-radius:10px; background:rgba(139,92,246,0.15); color:#a78bfa; display:flex; align-items:center; justify-content:center; margin:0 auto 8px; font-size:18px;">👥</div>
                <div style="font-size:12px; font-weight:700; color:#fff;">Customers</div>
                <div style="font-size:10px; color:var(--mkt-text-dim);">Credit & CRM</div>
              </div>
              <div style="color:var(--mkt-text-dim);">→</div>

              <div style="text-align:center; flex:1;">
                <div style="width:40px; height:40px; border-radius:10px; background:rgba(244,63,94,0.15); color:#fb7185; display:flex; align-items:center; justify-content:center; margin:0 auto 8px; font-size:18px;">🚚</div>
                <div style="font-size:12px; font-weight:700; color:#fff;">Suppliers</div>
                <div style="font-size:10px; color:var(--mkt-text-dim);">Payables</div>
              </div>
              <div style="color:var(--mkt-text-dim);">→</div>

              <div style="text-align:center; flex:1;">
                <div style="width:40px; height:40px; border-radius:10px; background:rgba(239,68,68,0.15); color:#f87171; display:flex; align-items:center; justify-content:center; margin:0 auto 8px; font-size:18px;">🧾</div>
                <div style="font-size:12px; font-weight:700; color:#fff;">Expenses</div>
                <div style="font-size:10px; color:var(--mkt-text-dim);">Operating Costs</div>
              </div>
              <div style="color:var(--mkt-text-dim);">→</div>

              <div style="text-align:center; flex:1.2; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.4); border-radius:var(--mkt-radius-md); padding:10px 6px;">
                <div style="font-size:13px; font-weight:800; color:#60a5fa;">📊 Reports</div>
                <div style="font-size:10px; color:#93c5fd;">Automatic P&L</div>
              </div>
              <div style="color:var(--mkt-text-dim);">→</div>

              <div style="text-align:center; flex:1.3; background:linear-gradient(135deg, #10b981, #06b6d4); border-radius:var(--mkt-radius-md); padding:10px 6px; color:#fff; box-shadow:0 4px 14px rgba(16,185,129,0.3);">
                <div style="font-size:13px; font-weight:800;">💡 Decisions</div>
                <div style="font-size:10px; opacity:0.9;">Profitable Growth</div>
              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: PROFIT & LOSS DASHBOARD
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>FINANCIAL STATEMENTS</span>
            </div>
            <h2 class="mkt-section-title">Automated Profit & Loss Statement</h2>
            <p class="mkt-section-subtitle">
              Understand your net profit at any moment. Calculated automatically from cost-of-goods-sold (COGS) and categorized operating expenses.
            </p>
          </div>

          <div class="mkt-feature-card" style="max-width:960px; margin:0 auto; padding:28px;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid var(--mkt-border);">
              <div>
                <div style="font-size:18px; font-weight:800; color:#fff;">P&L Statement: August 2026 (Monthly Rollup)</div>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Accounting Method: Accrual Basis • Currency: PKR</div>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="window.triggerReportAction('Details opened', 'P&L Statement')">🔍 View Details</button>
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="window.triggerReportAction('PDF Exported', 'P&L Statement')">📥 Export PDF</button>
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="window.triggerReportAction('CSV Downloaded', 'P&L Statement')">📊 Download CSV</button>
              </div>
            </div>

            <!-- Visual Waterfall Breakdown -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:14px; margin-bottom:24px;">
              <div style="background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.25); border-radius:var(--mkt-radius-md); padding:16px;">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">1. Total Revenue</div>
                <div style="font-size:20px; font-weight:800; color:#60a5fa; margin-top:4px;">PKR 527,200</div>
                <div style="font-size:11px; color:var(--mkt-text-muted); margin-top:2px;">100% of Sales</div>
              </div>
              <div style="background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.25); border-radius:var(--mkt-radius-md); padding:16px;">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">2. Cost of Goods (COGS)</div>
                <div style="font-size:20px; font-weight:800; color:#fbbf24; margin-top:4px;">-PKR 354,800</div>
                <div style="font-size:11px; color:var(--mkt-text-muted); margin-top:2px;">67.3% Direct Cost</div>
              </div>
              <div style="background:rgba(6,182,212,0.06); border:1px solid rgba(6,182,212,0.25); border-radius:var(--mkt-radius-md); padding:16px;">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">3. Gross Profit</div>
                <div style="font-size:20px; font-weight:800; color:#22d3ee; margin-top:4px;">PKR 172,400</div>
                <div style="font-size:11px; color:#34d399; margin-top:2px; font-weight:700;">32.7% Gross Margin</div>
              </div>
              <div style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.25); border-radius:var(--mkt-radius-md); padding:16px;">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">4. Operating Expenses</div>
                <div style="font-size:20px; font-weight:800; color:#f87171; margin-top:4px;">-PKR 48,000</div>
                <div style="font-size:11px; color:var(--mkt-text-muted); margin-top:2px;">Rent, Utilities, Staff</div>
              </div>
              <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.35); border-radius:var(--mkt-radius-md); padding:16px;">
                <div style="font-size:11px; color:#34d399; text-transform:uppercase; font-weight:700;">5. Net Operating Profit</div>
                <div style="font-size:20px; font-weight:800; color:#34d399; margin-top:4px;">PKR 124,400</div>
                <div style="font-size:11px; color:#34d399; margin-top:2px; font-weight:700;">23.6% Net Margin</div>
              </div>
            </div>

            <!-- Comparison Bar -->
            <div style="background:rgba(0,0,0,0.3); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:8px;">
                <span>Revenue Allocation Distribution</span>
                <span style="font-weight:700; color:#34d399;">PKR 124,400 Net Retained</span>
              </div>
              <div style="height:12px; background:#1e293b; border-radius:6px; overflow:hidden; display:flex;">
                <div style="width:67.3%; background:#fbbf24;" title="COGS: 67.3%"></div>
                <div style="width:9.1%; background:#f87171;" title="OpEx: 9.1%"></div>
                <div style="width:23.6%; background:#34d399;" title="Net Profit: 23.6%"></div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: SALES ANALYTICS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>REVENUE VELOCITY</span>
            </div>
            <h2 class="mkt-section-title">Deep Sales & Order Analytics</h2>
            <p class="mkt-section-subtitle">
              Monitor average order values (AOV), transaction counts, and revenue pacing with real-time period filters.
            </p>
          </div>

          <div class="mkt-feature-card" style="max-width:960px; margin:0 auto; padding:28px;">
            
            <!-- Period Tabs -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:24px;">
              <div style="display:flex; gap:8px;">
                <button class="mkt-tab-btn sales-period-btn active" data-period="today" onclick="window.switchReportSalesPeriod('today')">Today</button>
                <button class="mkt-tab-btn sales-period-btn" data-period="week" onclick="window.switchReportSalesPeriod('week')">This Week</button>
                <button class="mkt-tab-btn sales-period-btn" data-period="month" onclick="window.switchReportSalesPeriod('month')">This Month</button>
              </div>
              <span id="sales-kpi-trend" class="mkt-badge mkt-badge-cyan">● Today Live</span>
            </div>

            <!-- Dynamic KPI Cards -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px;">
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Total Period Sales</div>
                <div id="sales-kpi-rev" class="mkt-dash-stat-value" style="color:#60a5fa;">PKR 248.5k</div>
                <div class="mkt-dash-stat-trend positive">Instant register sync</div>
              </div>
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Completed Orders</div>
                <div id="sales-kpi-orders" class="mkt-dash-stat-value">184</div>
                <div class="mkt-dash-stat-trend positive">Counter + Online</div>
              </div>
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Average Order Value (AOV)</div>
                <div id="sales-kpi-aov" class="mkt-dash-stat-value" style="color:#34d399;">PKR 5,916</div>
                <div class="mkt-dash-stat-trend positive">Basket size optimized</div>
              </div>
            </div>

            <!-- Top Products Sold Table -->
            <div class="mkt-mockup-table" style="margin-top:20px;">
              <div class="mkt-tbl-row head"><span>Top Product</span><span>Category</span><span>Units Sold</span><span>Revenue</span><span>Margin</span></div>
              <div class="mkt-tbl-row"><span>☕ Dark Roast Arabica (1kg)</span><span>Coffee Beans</span><b>64 Units</b><b style="color:#60a5fa;">PKR 166,400</b><span class="badge in-stock">36.5%</span></div>
              <div class="mkt-tbl-row"><span>🥛 Barista Oat Milk (1L)</span><span>Dairy & Milk</span><b>48 Units</b><b style="color:#60a5fa;">PKR 38,400</b><span class="badge in-stock">28.0%</span></div>
              <div class="mkt-tbl-row"><span>🍵 Organic Green Tea (250g)</span><span>Specialty Tea</span><b>22 Units</b><b style="color:#60a5fa;">PKR 20,900</b><span class="badge in-stock">34.2%</span></div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: INVENTORY ANALYTICS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>STOCK VALUATION & TURNOVER</span>
            </div>
            <h2 class="mkt-section-title">Inventory Intelligence & Valuation</h2>
            <p class="mkt-section-subtitle">
              Prevent dead capital and stockouts. Track fast-moving items, low-stock reorder alerts, and true inventory asset worth.
            </p>
          </div>

          <!-- 5 Inventory Metric Pillars -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:14px; max-width:1080px; margin:0 auto 24px;">
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px;">
              <div style="font-size:11px; color:var(--mkt-text-dim);">Total Stock Valuation</div>
              <div style="font-size:18px; font-weight:800; color:#60a5fa; margin-top:2px;">PKR 4.82M</div>
              <div style="font-size:11px; color:var(--mkt-text-muted);">2,410 Units Total</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px;">
              <div style="font-size:11px; color:var(--mkt-text-dim);">Fast Moving Items</div>
              <div style="font-size:18px; font-weight:800; color:#34d399; margin-top:2px;">86 SKUs</div>
              <div style="font-size:11px; color:#34d399;">High Velocity</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px;">
              <div style="font-size:11px; color:var(--mkt-text-dim);">Low Stock Alerts</div>
              <div style="font-size:18px; font-weight:800; color:#fbbf24; margin-top:2px;">18 SKUs</div>
              <div style="font-size:11px; color:#fbbf24;">Below Min Threshold</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px;">
              <div style="font-size:11px; color:var(--mkt-text-dim);">Critical Out of Stock</div>
              <div style="font-size:18px; font-weight:800; color:#f87171; margin-top:2px;">6 SKUs</div>
              <div style="font-size:11px; color:#f87171;">Reorder Immediate</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px;">
              <div style="font-size:11px; color:var(--mkt-text-dim);">Dead Stock Trapped</div>
              <div style="font-size:18px; font-weight:800; color:#a78bfa; margin-top:2px;">PKR 184,500</div>
              <div style="font-size:11px; color:var(--mkt-text-muted);">&gt; 90 Days Inactive</div>
            </div>
          </div>

          <!-- Stock Performance Table Mockup -->
          <div class="mkt-feature-card" style="max-width:1080px; margin:0 auto; padding:24px;">
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head"><span>Product</span><span>SKU</span><span>Units Sold (30d)</span><span>On Hand</span><span>Stock Value</span><span>Status</span></div>
              <div class="mkt-tbl-row"><span>☕ Dark Roast Arabica (1kg)</span><span style="font-family:var(--mkt-font-mono);">COF-DR-1KG</span><span>601 Units</span><b>430 Units</b><b>PKR 1,118,000</b><span class="badge in-stock">OPTIMAL</span></div>
              <div class="mkt-tbl-row"><span>🥛 Barista Oat Milk (1L)</span><span style="font-family:var(--mkt-font-mono);">MLK-OAT-1L</span><span>420 Units</span><b>18 Units</b><b>PKR 14,400</b><span class="badge low-stock">LOW STOCK</span></div>
              <div class="mkt-tbl-row"><span>🍯 Caramel Syrup (750ml)</span><span style="font-family:var(--mkt-font-mono);">SYR-CAR-750</span><span>98 Units</span><b>4 Units</b><b>PKR 7,000</b><span class="badge out-of-stock" style="color:#f87171; background:rgba(239,68,68,0.15);">CRITICAL</span></div>
              <div class="mkt-tbl-row"><span>🍵 Organic Green Tea (250g)</span><span style="font-family:var(--mkt-font-mono);">TEA-GRN-250</span><span>180 Units</span><b>94 Units</b><b>PKR 89,300</b><span class="badge in-stock">HEALTHY</span></div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:12px; border-top:1px solid var(--mkt-border);">
              <span style="font-size:13px; color:var(--mkt-text-muted);">Stock movement ledger synced across Stores & Warehouse.</span>
              <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
                Explore Dedicated Inventory Solution →
              </a>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: PURCHASING & SUPPLIER ANALYTICS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>PROCUREMENT INTELLIGENCE</span>
            </div>
            <h2 class="mkt-section-title">Purchasing & Vendor Payables Analytics</h2>
            <p class="mkt-section-subtitle">
              Track outstanding payables, fulfillment lead times, and supplier performance rankings from draft PO to bill settlement.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; max-width:1080px; margin:0 auto 24px;">
            <div class="mkt-dash-stat-card">
              <div class="mkt-dash-stat-label">Total Purchase Value</div>
              <div class="mkt-dash-stat-value" style="color:#60a5fa;">PKR 785,600</div>
              <div class="mkt-dash-stat-trend positive">This Month</div>
            </div>
            <div class="mkt-dash-stat-card">
              <div class="mkt-dash-stat-label">Open Purchase Orders</div>
              <div class="mkt-dash-stat-value">12 POs</div>
              <div class="mkt-dash-stat-trend neutral">Awaiting Delivery</div>
            </div>
            <div class="mkt-dash-stat-card">
              <div class="mkt-dash-stat-label">Supplier Payables</div>
              <div class="mkt-dash-stat-value" style="color:#fbbf24;">PKR 284,500</div>
              <div class="mkt-dash-stat-trend neutral">Pending Settlement</div>
            </div>
            <div class="mkt-dash-stat-card">
              <div class="mkt-dash-stat-label">Due This Week</div>
              <div class="mkt-dash-stat-value" style="color:#f87171;">PKR 74,000</div>
              <div class="mkt-dash-stat-trend neutral">Cash Allocated</div>
            </div>
            <div class="mkt-dash-stat-card">
              <div class="mkt-dash-stat-label">Avg Supplier Lead Time</div>
              <div class="mkt-dash-stat-value" style="color:#34d399;">4.2 Days</div>
              <div class="mkt-dash-stat-trend positive">↓ 1.1d Improvement</div>
            </div>
          </div>

          <!-- Procurement Lifecycle Strip & Ranking -->
          <div class="mkt-feature-card" style="max-width:1080px; margin:0 auto; padding:24px;">
            <div style="background:rgba(0,0,0,0.3); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border); margin-bottom:20px;">
              <div style="font-size:12px; font-weight:700; color:var(--mkt-text-dim); text-transform:uppercase; margin-bottom:8px;">End-to-End Procurement Flow:</div>
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; font-size:13px; font-weight:700;">
                <span style="color:#93c5fd;">1. Supplier</span><span>→</span>
                <span style="color:#93c5fd;">2. Purchase Orders</span><span>→</span>
                <span style="color:#93c5fd;">3. GRN Inspection</span><span>→</span>
                <span style="color:#93c5fd;">4. Vendor Bill</span><span>→</span>
                <span style="color:#93c5fd;">5. Payment Voucher</span><span>→</span>
                <span style="color:#34d399;">6. Payables Cleared</span>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <span style="font-size:13px; color:var(--mkt-text-muted);">Connected with vendor catalog and purchase ledger.</span>
              <div style="display:flex; gap:12px;">
                <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/purchasing')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Purchasing & POs</a>
                <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/suppliers')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Suppliers Hub</a>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: CUSTOMER & RECEIVABLES ANALYTICS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>CUSTOMER CRM & AR</span>
            </div>
            <h2 class="mkt-section-title">Customer & Receivables Analytics</h2>
            <p class="mkt-section-subtitle">
              Monitor active customer counts, repeat purchase loyalty rates, approved credit limits, and overdue payment aging.
            </p>
          </div>

          <!-- Customer Metric Pillars -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:14px; max-width:1080px; margin:0 auto 24px;">
            <div class="mkt-dash-stat-card">
              <div class="mkt-dash-stat-label">Total Customers</div>
              <div class="mkt-dash-stat-value">2,840</div>
              <div class="mkt-dash-stat-trend positive">+142 this month</div>
            </div>
            <div class="mkt-dash-stat-card">
              <div class="mkt-dash-stat-label">Active Customers</div>
              <div class="mkt-dash-stat-value" style="color:#34d399;">2,416</div>
              <div class="mkt-dash-stat-trend positive">85.1% Retention</div>
            </div>
            <div class="mkt-dash-stat-card">
              <div class="mkt-dash-stat-label">Repeat Rate</div>
              <div class="mkt-dash-stat-value" style="color:#60a5fa;">68%</div>
              <div class="mkt-dash-stat-trend positive">↑ High Loyalty</div>
            </div>
            <div class="mkt-dash-stat-card">
              <div class="mkt-dash-stat-label">Outstanding AR</div>
              <div class="mkt-dash-stat-value" style="color:#fbbf24;">PKR 284,500</div>
              <div class="mkt-dash-stat-trend neutral">Within Terms</div>
            </div>
            <div class="mkt-dash-stat-card">
              <div class="mkt-dash-stat-label">Overdue Balance</div>
              <div class="mkt-dash-stat-value" style="color:#f87171;">PKR 18,400</div>
              <div class="mkt-dash-stat-trend negative">3 Accounts Alert</div>
            </div>
            <div class="mkt-dash-stat-card">
              <div class="mkt-dash-stat-label">Avg Customer Value</div>
              <div class="mkt-dash-stat-value" style="color:#a78bfa;">PKR 18,450</div>
              <div class="mkt-dash-stat-trend positive">Lifetime Spend</div>
            </div>
          </div>

          <!-- Customer Segmentation Table with Filter -->
          <div class="mkt-feature-card" style="max-width:1080px; margin:0 auto; padding:24px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:12px;">
              <div style="display:flex; gap:8px;">
                <button class="mkt-tab-btn cust-seg-btn active" data-seg="all" onclick="window.filterReportCustomers('all')">All Customers</button>
                <button class="mkt-tab-btn cust-seg-btn" data-seg="vip" onclick="window.filterReportCustomers('vip')">VIP Tier</button>
                <button class="mkt-tab-btn cust-seg-btn" data-seg="credit" onclick="window.filterReportCustomers('credit')">Credit Accounts</button>
                <button class="mkt-tab-btn cust-seg-btn" data-seg="overdue" onclick="window.filterReportCustomers('overdue')">Overdue Only</button>
              </div>
              <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/customers')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
                Explore Customer CRM →
              </a>
            </div>

            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head"><span>Customer Name</span><span>Tier</span><span>Orders</span><span>Total Spend</span><span>Outstanding</span><span>Health</span></div>
              <div class="mkt-tbl-row cust-report-row" data-seg="vip"><span>Summit Tech Cafe</span><span class="badge in-stock">VIP</span><span>42 Orders</span><b>PKR 1,248,500</b><span style="color:#34d399;">PKR 0.00</span><span style="color:#34d399;">100% On-Time</span></div>
              <div class="mkt-tbl-row cust-report-row" data-seg="credit"><span>Artisan Bakery Group</span><span class="badge in-stock">WHOLESALE</span><span>18 Orders</span><b>PKR 540,000</b><span style="color:#fbbf24;">PKR 53,980</span><span style="color:#60a5fa;">Current (Net 15)</span></div>
              <div class="mkt-tbl-row cust-report-row" data-seg="overdue"><span>Metro Retail Outlets</span><span class="badge low-stock">CREDIT</span><span>9 Orders</span><b>PKR 284,000</b><span style="color:#f87171; font-weight:800;">PKR 18,400</span><span style="color:#f87171;">7 Days Overdue</span></div>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: CASH FLOW & PAYMENT ANALYTICS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>TREASURY & TENDER SPLIT</span>
            </div>
            <h2 class="mkt-section-title">Cash Flow & Payment Method Analytics</h2>
            <p class="mkt-section-subtitle">
              Verify tender breakdowns and track continuous financial liquidity across cash drawers, bank transfers, and credit accounts.
            </p>
          </div>

          <div class="mkt-feature-card" style="max-width:960px; margin:0 auto; padding:28px;">
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
              <div style="background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px;">
                <div style="font-size:11px; color:var(--mkt-text-dim);">💵 Cash Collections</div>
                <div style="font-size:20px; font-weight:800; color:#34d399; margin-top:4px;">42%</div>
                <div style="font-size:12px; color:var(--mkt-text-muted); margin-top:2px;">PKR 221,424 in Drawers</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px;">
                <div style="font-size:11px; color:var(--mkt-text-dim);">💳 Card Terminal Swipes</div>
                <div style="font-size:20px; font-weight:800; color:#60a5fa; margin-top:4px;">28%</div>
                <div style="font-size:12px; color:var(--mkt-text-muted); margin-top:2px;">PKR 147,616 Batch Settled</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px;">
                <div style="font-size:11px; color:var(--mkt-text-dim);">🏦 Direct Bank Transfer (IBFT)</div>
                <div style="font-size:20px; font-weight:800; color:#22d3ee; margin-top:4px;">20%</div>
                <div style="font-size:12px; color:var(--mkt-text-muted); margin-top:2px;">PKR 105,440 Reconciled</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px;">
                <div style="font-size:11px; color:var(--mkt-text-dim);">🛡️ Customer Credit</div>
                <div style="font-size:20px; font-weight:800; color:#fbbf24; margin-top:4px;">10%</div>
                <div style="font-size:12px; color:var(--mkt-text-muted); margin-top:2px;">PKR 52,720 Ledger AR</div>
              </div>
            </div>

            <!-- Cash Flow Timeline -->
            <div style="background:rgba(0,0,0,0.3); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
              <div style="font-size:12px; font-weight:700; color:var(--mkt-text-dim); text-transform:uppercase; margin-bottom:10px;">Daily Cash Movement Timeline:</div>
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; font-size:13px; font-weight:700;">
                <span style="color:#93c5fd;">Opening: PKR 45,000</span><span>+</span>
                <span style="color:#34d399;">Collections: PKR 527,200</span><span>−</span>
                <span style="color:#f87171;">Expenses: PKR 48,000</span><span>−</span>
                <span style="color:#fb7185;">Refunds: PKR 4,200</span><span>=</span>
                <span style="color:#34d399; font-size:15px; font-weight:800;">Closing: PKR 520,000</span>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; margin-top:16px;">
              <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/payments')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
                Explore Payments & Expenses →
              </a>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 9: MULTI-LOCATION PERFORMANCE
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>BRANCH COMPARISON</span>
            </div>
            <h2 class="mkt-section-title">Multi-Location Branch Performance</h2>
            <p class="mkt-section-subtitle">
              Compare revenue, orders, gross profit, and localized stock values across every retail store and depot.
            </p>
          </div>

          <div class="mkt-feature-card" style="max-width:1080px; margin:0 auto; padding:28px;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
              <div>
                <div id="loc-active-title" style="font-size:16px; font-weight:800; color:#fff;">All Locations (Consolidated)</div>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Real-time multi-branch sync active</div>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="mkt-tab-btn report-loc-btn active" data-loc="all" onclick="window.switchReportLocation('all')">All Locations</button>
                <button class="mkt-tab-btn report-loc-btn" data-loc="store01" onclick="window.switchReportLocation('store01')">Store 01</button>
                <button class="mkt-tab-btn report-loc-btn" data-loc="store02" onclick="window.switchReportLocation('store02')">Store 02</button>
                <button class="mkt-tab-btn report-loc-btn" data-loc="online" onclick="window.switchReportLocation('online')">Online Store</button>
              </div>
            </div>

            <!-- Dynamic Selected Location Snapshot -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:14px; margin-bottom:24px;">
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Branch Revenue</div>
                <div id="loc-kpi-rev" class="mkt-dash-stat-value" style="color:#60a5fa;">PKR 527,200</div>
              </div>
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Branch Orders</div>
                <div id="loc-kpi-orders" class="mkt-dash-stat-value">407 Orders</div>
              </div>
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Gross Profit</div>
                <div id="loc-kpi-profit" class="mkt-dash-stat-value" style="color:#34d399;">PKR 172,400</div>
              </div>
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Local Stock Value</div>
                <div id="loc-kpi-stock" class="mkt-dash-stat-value">PKR 3.90M</div>
              </div>
            </div>

            <!-- Multi-Location Master Table -->
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head"><span>Location</span><span>Revenue</span><span>Orders</span><span>Gross Profit</span><span>Stock Value</span><span>Status</span></div>
              <div class="mkt-tbl-row"><span>🏪 Store 01 (Commercial)</span><b>PKR 248,500</b><span>184 Orders</span><b style="color:#34d399;">PKR 81,150</b><span>PKR 1.82M</span><span class="badge in-stock">ONLINE</span></div>
              <div class="mkt-tbl-row"><span>🏬 Store 02 (Mall)</span><b>PKR 182,300</b><span>141 Orders</span><b style="color:#34d399;">PKR 58,400</b><span>PKR 1.24M</span><span class="badge in-stock">ONLINE</span></div>
              <div class="mkt-tbl-row"><span>🛍️ Online Store (E-Commerce)</span><b>PKR 96,400</b><span>82 Orders</span><b style="color:#34d399;">PKR 32,850</b><span>PKR 0.84M</span><span class="badge in-stock">SYNCED</span></div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 10: REPORT LIBRARY & EXPORT CENTER
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>12 PRE-BUILT REPORTS</span>
            </div>
            <h2 class="mkt-section-title">Report Library & Export Center</h2>
            <p class="mkt-section-subtitle">
              Instant access to 12 specialized accounting and operations reports. Filter, view, and export to PDF or CSV in seconds.
            </p>
          </div>

          <div style="max-width:1080px; margin:0 auto;">
            
            <!-- Search & Filter Controls -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:24px;">
              <input 
                type="text" 
                placeholder="🔍 Search reports by title or category..." 
                oninput="window.searchReports(this.value)"
                style="background:rgba(255,255,255,0.04); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:10px 16px; color:#fff; font-size:14px; min-width:280px;"
              />
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="mkt-tab-btn report-lib-filter-btn active" data-cat="all" onclick="window.filterReportLibrary('all')">All (12)</button>
                <button class="mkt-tab-btn report-lib-filter-btn" data-cat="sales" onclick="window.filterReportLibrary('sales')">Sales</button>
                <button class="mkt-tab-btn report-lib-filter-btn" data-cat="inventory" onclick="window.filterReportLibrary('inventory')">Inventory</button>
                <button class="mkt-tab-btn report-lib-filter-btn" data-cat="purchasing" onclick="window.filterReportLibrary('purchasing')">Purchasing</button>
                <button class="mkt-tab-btn report-lib-filter-btn" data-cat="finance" onclick="window.filterReportLibrary('finance')">Finance</button>
                <button class="mkt-tab-btn report-lib-filter-btn" data-cat="customers" onclick="window.filterReportLibrary('customers')">Customers</button>
              </div>
            </div>

            <!-- 12 Reports Grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;" id="report-library-grid">
              
              <div class="mkt-feature-card report-lib-card" data-cat="finance" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="font-size:15px; color:#fff;">1. Profit & Loss Statement</b>
                    <span class="mkt-badge mkt-badge-cyan">Finance</span>
                  </div>
                  <p style="font-size:12px; color:var(--mkt-text-muted);">Complete waterfall from sales through COGS and operating expenses to net retained profit.</p>
                </div>
                <div style="display:flex; gap:6px; margin-top:14px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('PDF Exported', 'Profit & Loss')">📄 PDF</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('CSV Exported', 'Profit & Loss')">📊 CSV</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('Print Formatted', 'Profit & Loss')">🖨️ Print</button>
                </div>
              </div>

              <div class="mkt-feature-card report-lib-card" data-cat="sales" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="font-size:15px; color:#fff;">2. Daily Sales Summary</b>
                    <span class="mkt-badge mkt-badge-cyan">Sales</span>
                  </div>
                  <p style="font-size:12px; color:var(--mkt-text-muted);">Daily gross sales, order volume, tax collected, and discount impact by register.</p>
                </div>
                <div style="display:flex; gap:6px; margin-top:14px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('PDF Exported', 'Sales Summary')">📄 PDF</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('CSV Exported', 'Sales Summary')">📊 CSV</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('Print Formatted', 'Sales Summary')">🖨️ Print</button>
                </div>
              </div>

              <div class="mkt-feature-card report-lib-card" data-cat="sales" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="font-size:15px; color:#fff;">3. Sales by Product (Itemized)</b>
                    <span class="mkt-badge mkt-badge-cyan">Sales</span>
                  </div>
                  <p style="font-size:12px; color:var(--mkt-text-muted);">Rank product SKUs by units moved, gross revenue contribution, and product margin.</p>
                </div>
                <div style="display:flex; gap:6px; margin-top:14px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('PDF Exported', 'Sales by Product')">📄 PDF</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('CSV Exported', 'Sales by Product')">📊 CSV</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('Print Formatted', 'Sales by Product')">🖨️ Print</button>
                </div>
              </div>

              <div class="mkt-feature-card report-lib-card" data-cat="customers" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="font-size:15px; color:#fff;">4. Sales by Customer</b>
                    <span class="mkt-badge mkt-badge-cyan">Customers</span>
                  </div>
                  <p style="font-size:12px; color:var(--mkt-text-muted);">Identify high-value commercial accounts and analyze customer purchase frequencies.</p>
                </div>
                <div style="display:flex; gap:6px; margin-top:14px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('PDF Exported', 'Sales by Customer')">📄 PDF</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('CSV Exported', 'Sales by Customer')">📊 CSV</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('Print Formatted', 'Sales by Customer')">🖨️ Print</button>
                </div>
              </div>

              <div class="mkt-feature-card report-lib-card" data-cat="inventory" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="font-size:15px; color:#fff;">5. Inventory Asset Valuation</b>
                    <span class="mkt-badge mkt-badge-cyan">Inventory</span>
                  </div>
                  <p style="font-size:12px; color:var(--mkt-text-muted);">FIFO-based asset valuation report across Central Depot and individual storefronts.</p>
                </div>
                <div style="display:flex; gap:6px; margin-top:14px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('PDF Exported', 'Inventory Valuation')">📄 PDF</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('CSV Exported', 'Inventory Valuation')">📊 CSV</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('Print Formatted', 'Inventory Valuation')">🖨️ Print</button>
                </div>
              </div>

              <div class="mkt-feature-card report-lib-card" data-cat="inventory" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="font-size:15px; color:#fff;">6. Stock Movement & Ledger</b>
                    <span class="mkt-badge mkt-badge-cyan">Inventory</span>
                  </div>
                  <p style="font-size:12px; color:var(--mkt-text-muted);">Audit every addition, transfer, disposal, and sale deduction with user timestamps.</p>
                </div>
                <div style="display:flex; gap:6px; margin-top:14px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('PDF Exported', 'Stock Movement')">📄 PDF</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('CSV Exported', 'Stock Movement')">📊 CSV</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('Print Formatted', 'Stock Movement')">🖨️ Print</button>
                </div>
              </div>

              <div class="mkt-feature-card report-lib-card" data-cat="purchasing" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="font-size:15px; color:#fff;">7. Purchase Order Summary</b>
                    <span class="mkt-badge mkt-badge-cyan">Purchasing</span>
                  </div>
                  <p style="font-size:12px; color:var(--mkt-text-muted);">Track PO lifecycle stages, received goods variances, and pending fulfillment rates.</p>
                </div>
                <div style="display:flex; gap:6px; margin-top:14px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('PDF Exported', 'Purchase Summary')">📄 PDF</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('CSV Exported', 'Purchase Summary')">📊 CSV</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('Print Formatted', 'Purchase Summary')">🖨️ Print</button>
                </div>
              </div>

              <div class="mkt-feature-card report-lib-card" data-cat="purchasing" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="font-size:15px; color:#fff;">8. Supplier Payables Aging</b>
                    <span class="mkt-badge mkt-badge-cyan">Purchasing</span>
                  </div>
                  <p style="font-size:12px; color:var(--mkt-text-muted);">Accounts payable aging schedule across 0-30, 31-60, and 61+ day brackets.</p>
                </div>
                <div style="display:flex; gap:6px; margin-top:14px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('PDF Exported', 'Supplier Payables')">📄 PDF</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('CSV Exported', 'Supplier Payables')">📊 CSV</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('Print Formatted', 'Supplier Payables')">🖨️ Print</button>
                </div>
              </div>

              <div class="mkt-feature-card report-lib-card" data-cat="customers" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="font-size:15px; color:#fff;">9. Customer Receivables Aging</b>
                    <span class="mkt-badge mkt-badge-cyan">Customers</span>
                  </div>
                  <p style="font-size:12px; color:var(--mkt-text-muted);">Detailed customer balance aging ledger with credit limit warnings and payment history.</p>
                </div>
                <div style="display:flex; gap:6px; margin-top:14px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('PDF Exported', 'Customer Receivables')">📄 PDF</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('CSV Exported', 'Customer Receivables')">📊 CSV</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('Print Formatted', 'Customer Receivables')">🖨️ Print</button>
                </div>
              </div>

              <div class="mkt-feature-card report-lib-card" data-cat="finance" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="font-size:15px; color:#fff;">10. Expense Classification Summary</b>
                    <span class="mkt-badge mkt-badge-cyan">Finance</span>
                  </div>
                  <p style="font-size:12px; color:var(--mkt-text-muted);">Categorized operating expenses breakdown by utilities, salaries, logistics, and rent.</p>
                </div>
                <div style="display:flex; gap:6px; margin-top:14px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('PDF Exported', 'Expense Summary')">📄 PDF</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('CSV Exported', 'Expense Summary')">📊 CSV</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('Print Formatted', 'Expense Summary')">🖨️ Print</button>
                </div>
              </div>

              <div class="mkt-feature-card report-lib-card" data-cat="finance" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="font-size:15px; color:#fff;">11. Cash Flow & Drawer Statement</b>
                    <span class="mkt-badge mkt-badge-cyan">Finance</span>
                  </div>
                  <p style="font-size:12px; color:var(--mkt-text-muted);">Reconcile physical cash tender collections against card payouts and bank accounts.</p>
                </div>
                <div style="display:flex; gap:6px; margin-top:14px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('PDF Exported', 'Cash Flow Statement')">📄 PDF</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('CSV Exported', 'Cash Flow Statement')">📊 CSV</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('Print Formatted', 'Cash Flow Statement')">🖨️ Print</button>
                </div>
              </div>

              <div class="mkt-feature-card report-lib-card" data-cat="sales" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <b style="font-size:15px; color:#fff;">12. Multi-Location Comparative</b>
                    <span class="mkt-badge mkt-badge-cyan">Sales</span>
                  </div>
                  <p style="font-size:12px; color:var(--mkt-text-muted);">Side-by-side branch comparison of revenue, transaction size, and local profit contribution.</p>
                </div>
                <div style="display:flex; gap:6px; margin-top:14px; pt:8px; border-top:1px solid var(--mkt-border);">
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('PDF Exported', 'Multi-Location Comparative')">📄 PDF</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('CSV Exported', 'Multi-Location Comparative')">📊 CSV</button>
                  <button class="mkt-btn mkt-btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.triggerReportAction('Print Formatted', 'Multi-Location Comparative')">🖨️ Print</button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 11: CONTROLS, AUDITABILITY & DECISION INTELLIGENCE
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>GOVERNANCE & TRUST</span>
            </div>
            <h2 class="mkt-section-title">Controls, Auditability & Decision Intelligence</h2>
            <p class="mkt-section-subtitle">
              Role-based security guarantees only authorized team members view sensitive margins while preserving complete transactional audit trails.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; max-width:1080px; margin:0 auto 32px;">
            
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; margin-bottom:12px;">🛡️</div>
              <h3 style="font-size:16px; font-weight:700; color:#fff; margin-bottom:8px;">Role-Based Access Control</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5; margin-bottom:12px;">
                Granular permissions separate cashier operational shift views from executive P&L margins.
              </p>
              <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:var(--mkt-radius-md); font-size:12px;">
                <div>👑 <b>Owner:</b> Full Financial & Executive Reports</div>
                <div style="margin-top:4px;">👔 <b>Manager:</b> Operational + Financial Reports</div>
                <div style="margin-top:4px;">⚡ <b>Cashier:</b> Sales + Shift Tender Reports</div>
              </div>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; margin-bottom:12px;">🔒</div>
              <h3 style="font-size:16px; font-weight:700; color:#fff; margin-bottom:8px;">Immutable Transaction Sources</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5; margin-bottom:12px;">
                Every report metric is mathematically bound to double-entry ledger postings with zero possibility of manual figure tampering.
              </p>
              <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:var(--mkt-radius-md); font-size:12px; color:#34d399;">
                ✓ Strict Double-Entry Ledger Verification
              </div>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; margin-bottom:12px;">📑</div>
              <h3 style="font-size:16px; font-weight:700; color:#fff; margin-bottom:8px;">Export History & Audit Trail</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5; margin-bottom:12px;">
                Track every report generation, PDF download, and CSV export with timestamps and IP logging.
              </p>
              <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:var(--mkt-radius-md); font-size:12px; color:#60a5fa;">
                ✓ Complete Compliance & Regulatory Readiness
              </div>
            </div>

          </div>

          <!-- Decision Intelligence Chain -->
          <div style="background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.25); border-radius:var(--mkt-radius-lg); padding:20px; max-width:1080px; margin:0 auto; text-align:center;">
            <div style="font-size:14px; font-weight:800; color:#fff; margin-bottom:4px;">
              Operational Data → Verified Calculations → Reports → Decisions
            </div>
            <div style="font-size:12px; color:var(--mkt-text-muted);">
              Universal ERP guarantees that reporting is an automated reflection of real work, giving owners clarity to scale safely.
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 12: FINAL CALL TO ACTION & 5-COLUMN FOOTER
           ========================================================================= -->
      <section class="mkt-section mkt-cta-section">
        <div class="mkt-container">
          <div class="mkt-cta-card">
            
            <h2 class="mkt-cta-title">Stop Guessing. Start Running Your Business From The Numbers.</h2>
            <p class="mkt-cta-desc">
              Connected reporting across Sales, Inventory, Purchasing, Customers, Suppliers, and Payments.
            </p>

            <div class="mkt-cta-actions">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                <span>Start Analyzing</span>
                <span>→</span>
              </button>
              <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/product/inventory')">
                <span>Explore Inventory</span>
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

      <!-- 5-Column Universal ERP Footer -->
      <footer class="mkt-footer">
        <div class="mkt-container">
          <div class="mkt-footer-grid">
            
            <div class="mkt-footer-brand-col">
              <div class="mkt-brand" onclick="window.navigateMarketing('/')">
                <div class="mkt-brand-logo">🌐</div>
                <span class="mkt-brand-name">Universal ERP</span>
              </div>
              <p class="mkt-footer-bio">
                The Universal Business Operating System for high-performing commerce and modern retail. Universal Cloud OS • All Systems Operational.
              </p>
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
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/reports')">Reports & Analytics</a></li>
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

      <!-- Mobile Navigation Drawer -->
      <div class="mkt-mobile-drawer" id="mkt-mobile-menu">
        <div class="mkt-mobile-header">
          <div class="mkt-brand" onclick="window.navigateMarketing('/'); window.toggleMarketingMenu();">
            <div class="mkt-brand-logo">🌐</div>
            <span class="mkt-brand-name">Universal ERP</span>
          </div>
          <button class="mkt-mobile-close" onclick="window.toggleMarketingMenu()">✕</button>
        </div>
        <div class="mkt-mobile-nav">
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/'); window.toggleMarketingMenu()">Home</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product'); window.toggleMarketingMenu()">Product Overview</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/pos'); window.toggleMarketingMenu()">Point of Sale</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory'); window.toggleMarketingMenu()">Inventory</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/sales'); window.toggleMarketingMenu()">Sales & Invoicing</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/purchasing'); window.toggleMarketingMenu()">Purchasing & POs</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/customers'); window.toggleMarketingMenu()">Customers & CRM</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/suppliers'); window.toggleMarketingMenu()">Suppliers & Vendors</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/payments'); window.toggleMarketingMenu()">Payments & Expenses</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/reports'); window.toggleMarketingMenu()">Reports & Analytics</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/documents'); window.toggleMarketingMenu()">Documents & Receipts</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/integrations'); window.toggleMarketingMenu()">Integrations & API</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/pricing'); window.toggleMarketingMenu()">Pricing</a>
          <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/resources'); window.toggleMarketingMenu()">Resources</a>
        </div>
        <div class="mkt-mobile-actions">
          <button class="mkt-btn mkt-btn-ghost" onclick="window.navigateMarketing('/auth/login'); window.toggleMarketingMenu()">Sign In</button>
          <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/auth/register'); window.toggleMarketingMenu()">Get Started Free</button>
        </div>
      </div>

    </div>
  `;
}
