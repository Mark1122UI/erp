/**
 * Universal ERP — Reports & Analytics Dedicated Product Page (/product/reports)
 * Phase 23 — Step 13: Dedicated Business Intelligence & Financial Analytics Hub
 */

// Client-Side Interactive Controllers
if (typeof window !== 'undefined') {
  window.switchReportPeriod = (period) => {
    const periodData = {
      today: { rev: 'PKR 248,500', profit: 'PKR 81,260', margin: '32.7%', rec: 'PKR 284,500', inv: 'PKR 4.82M', trend: '● Today Live' },
      week: { rev: 'PKR 1,420,800', profit: 'PKR 468,900', margin: '33.0%', rec: 'PKR 284,500', inv: 'PKR 4.82M', trend: '↑ +8.4% vs last week' },
      month: { rev: 'PKR 5,840,000', profit: 'PKR 1,927,200', margin: '33.0%', rec: 'PKR 284,500', inv: 'PKR 4.82M', trend: '↑ +14.8% vs last month' },
      year: { rev: 'PKR 64,200,000', profit: 'PKR 21,186,000', margin: '33.0%', rec: 'PKR 284,500', inv: 'PKR 4.82M', trend: '↑ +22.1% YoY' }
    };

    const target = periodData[period] || periodData.today;

    const revEl = document.getElementById('report-kpi-rev');
    const profitEl = document.getElementById('report-kpi-profit');
    const marginEl = document.getElementById('report-kpi-margin');
    const trendEl = document.getElementById('report-kpi-trend');

    if (revEl) revEl.innerText = target.rev;
    if (profitEl) profitEl.innerText = target.profit;
    if (marginEl) marginEl.innerText = target.margin;
    if (trendEl) trendEl.innerText = target.trend;

    const btns = document.querySelectorAll('.report-period-btn');
    btns.forEach((btn) => {
      if (btn.getAttribute('data-period') === period) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  };

  window.switchReportLocation = (loc) => {
    const locData = {
      all: { rev: 'PKR 527,200', txCount: '248 Orders', aov: 'PKR 2,125', topItem: 'Dark Roast Coffee (1kg)' },
      store01: { rev: 'PKR 248,500', txCount: '124 Orders', aov: 'PKR 2,004', topItem: 'Dark Roast Coffee (1kg)' },
      store02: { rev: 'PKR 182,300', txCount: '86 Orders', aov: 'PKR 2,119', topItem: 'Organic Green Tea (250g)' },
      online: { rev: 'PKR 96,400', txCount: '38 Orders', aov: 'PKR 2,536', topItem: 'Ceramic Brand Mugs (Set)' }
    };

    const target = locData[loc] || locData.all;

    const locRevEl = document.getElementById('report-loc-rev');
    const locTxEl = document.getElementById('report-loc-tx');
    const locAovEl = document.getElementById('report-loc-aov');
    const locItemEl = document.getElementById('report-loc-item');

    if (locRevEl) locRevEl.innerText = target.rev;
    if (locTxEl) locTxEl.innerText = target.txCount;
    if (locAovEl) locAovEl.innerText = target.aov;
    if (locItemEl) locItemEl.innerText = target.topItem;

    const btns = document.querySelectorAll('.report-loc-btn');
    btns.forEach((btn) => {
      if (btn.getAttribute('data-loc') === loc) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  };

  window.filterCustomerReports = (segment) => {
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

  window.triggerReportAction = (actionName) => {
    const toast = document.getElementById('report-action-toast');
    if (toast) {
      toast.innerText = `✓ Report action: "${actionName}" executed. Layout formatted.`;
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
      <div id="report-action-toast" style="display:none; position:fixed; bottom:24px; right:24px; z-index:9999; background:#10b981; color:#ffffff; padding:12px 20px; border-radius:var(--mkt-radius-md); font-weight:700; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
        ✓ Report action executed
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
                See What Your Business Is Doing.<br>
                <span class="mkt-gradient-text-accent">Know Why. Act Faster.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Turn sales, inventory, purchasing, payments and customer activity into clear real-time business insights.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Start Tracking Performance</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#reports-demo" style="text-decoration:none;">
                  <span>See Reports In Action</span>
                </a>
              </div>

              <!-- Quick Badges -->
              <div style="display:flex; gap:16px; margin-top:28px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-muted);">
                <span>✓ Real-Time Profit & Loss</span>
                <span>•</span>
                <span>✓ Stock Turnover Rates</span>
                <span>•</span>
                <span>✓ Multi-Location Breakdown</span>
              </div>
            </div>

            <!-- Analytics Command Center Mockup -->
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
                    <span>app.universalerp.com/reports</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>EXECUTIVE SUITE</span>
                  </div>
                </div>

                <div class="mkt-dash-body" style="padding:16px;">
                  
                  <!-- Metric Cards -->
                  <div class="mkt-dash-metrics-grid" style="margin-bottom:14px;">
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Today's Revenue</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono);">PKR 248,500</div>
                      <div class="mkt-dash-stat-trend positive">↑ +14.8% vs avg</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Gross Profit</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono); color:#34d399;">PKR 81,260</div>
                      <div class="mkt-dash-stat-trend positive">32.7% Margin</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Receivables</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono); color:#fbbf24;">PKR 284,500</div>
                      <div class="mkt-dash-stat-trend neutral">3 Credit Accounts</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Inventory Valuation</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono); color:#60a5fa;">PKR 4.82M</div>
                      <div class="mkt-dash-stat-trend positive">6.4x Turnover</div>
                    </div>
                  </div>

                  <!-- Live Analytics Activity Feed -->
                  <div class="mkt-dash-feed-box">
                    <div class="mkt-dash-feed-header">
                      <span class="mkt-feed-title">Executive Insight Feed</span>
                      <span class="mkt-badge mkt-badge-cyan">Real-Time</span>
                    </div>
                    <div class="mkt-dash-feed-list">
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#10b981;"></span>
                          <span>Store 01 reached monthly sales target 4 days ahead of schedule</span>
                        </div>
                        <span class="mkt-activity-time">Just now</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#3b82f6;"></span>
                          <span>Dark Roast Coffee generated PKR 48,582 gross profit today</span>
                        </div>
                        <span class="mkt-activity-time">15m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#fbbf24;"></span>
                          <span>PKR 18,400 receivable from Summit Tech Cafe settled in cash</span>
                        </div>
                        <span class="mkt-activity-time">1h ago</span>
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
           SECTION 2: ONE BUSINESS. ONE SOURCE OF TRUTH.
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>UNIFIED DATA ENGINE</span>
            </div>
            <h2 class="mkt-section-title">One Business. One Source Of Truth.</h2>
            <p class="mkt-section-subtitle">
              Never stitch together spreadsheets again. Universal ERP links every cash register, invoice, stock movement and purchase order into one automated reporting core.
            </p>
          </div>

          <!-- Data Pipeline Flow -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px 20px; max-width:900px; margin:32px auto 0 auto; text-align:center;">
            
            <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:20px;">
              <span class="mkt-pill">POS Sales</span>
              <span>+</span>
              <span class="mkt-pill">Invoices</span>
              <span>+</span>
              <span class="mkt-pill">Payments</span>
              <span>+</span>
              <span class="mkt-pill">Inventory</span>
              <span>+</span>
              <span class="mkt-pill">Purchasing</span>
              <span>+</span>
              <span class="mkt-pill">Expenses</span>
            </div>

            <div style="margin:16px 0; font-size:20px;">⬇️</div>

            <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3); padding:10px 24px; border-radius:var(--mkt-radius-full); font-weight:800; color:#93c5fd; margin-bottom:20px;">
              <span>🌐</span>
              <span>UNIVERSAL ERP DATA CORE</span>
            </div>

            <div style="margin:16px 0; font-size:20px;">⬇️</div>

            <div style="display:flex; justify-content:center; align-items:center; gap:12px; flex-wrap:wrap;">
              <div class="mkt-feature-card" style="padding:12px 20px; text-align:center;"><b style="color:#34d399;">📊 Automated Reports</b></div>
              <div class="mkt-feature-card" style="padding:12px 20px; text-align:center;"><b style="color:#60a5fa;">💡 Business Insights</b></div>
              <div class="mkt-feature-card" style="padding:12px 20px; text-align:center;"><b style="color:#fbbf24;">⚡ Confident Decisions</b></div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: EXECUTIVE DASHBOARD
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>EXECUTIVE CONTROL</span>
            </div>
            <h2 class="mkt-section-title">Executive Performance Dashboard.</h2>
            <p class="mkt-section-subtitle">
              Monitor vital commercial metrics across custom time windows with instant client-side updates.
            </p>
          </div>

          <!-- Timeframe Tabs -->
          <div class="mkt-tour-tabs" style="margin-bottom:24px;">
            <button class="mkt-tab-btn report-period-btn active" data-period="today" onclick="window.switchReportPeriod('today')">Today</button>
            <button class="mkt-tab-btn report-period-btn" data-period="week" onclick="window.switchReportPeriod('week')">This Week</button>
            <button class="mkt-tab-btn report-period-btn" data-period="month" onclick="window.switchReportPeriod('month')">This Month</button>
            <button class="mkt-tab-btn report-period-btn" data-period="year" onclick="window.switchReportPeriod('year')">This Year</button>
          </div>

          <!-- Interactive Executive Dashboard Container -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:900px; margin:0 auto;">
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:20px;">
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Total Revenue</div>
                <div class="mkt-dash-stat-value" id="report-kpi-rev" style="font-family:var(--mkt-font-mono);">PKR 248,500</div>
                <div class="mkt-dash-stat-trend positive" id="report-kpi-trend">● Today Live</div>
              </div>
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Gross Profit</div>
                <div class="mkt-dash-stat-value" id="report-kpi-profit" style="font-family:var(--mkt-font-mono); color:#34d399;">PKR 81,260</div>
                <div class="mkt-dash-stat-trend positive" id="report-kpi-margin">32.7% Margin</div>
              </div>
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Operating Expenses</div>
                <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono); color:#f87171;">PKR 18,400</div>
                <div class="mkt-dash-stat-trend neutral">Rent & Utilities</div>
              </div>
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Net Operating Income</div>
                <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono); color:#60a5fa;">PKR 62,860</div>
                <div class="mkt-dash-stat-trend positive">25.3% Net Margin</div>
              </div>
            </div>

            <!-- Visual Performance Bar -->
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px;">
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:8px; color:var(--mkt-text-muted);">
                <span>Gross Revenue Distribution</span>
                <span>COGS: 67.3% | Gross Profit: 32.7%</span>
              </div>
              <div style="height:12px; width:100%; border-radius:var(--mkt-radius-full); background:#1e293b; display:flex; overflow:hidden;">
                <div style="width:67.3%; background:#475569;" title="Cost of Goods Sold"></div>
                <div style="width:32.7%; background:#10b981;" title="Gross Profit"></div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: PROFIT & LOSS REPORT
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>FINANCIAL STATEMENTS</span>
            </div>
            <h2 class="mkt-section-title">Automated Profit & Loss Statement.</h2>
            <p class="mkt-section-subtitle">
              Audited income statements calculated automatically from posted customer sales, vendor procurement, and operating expenses.
            </p>
          </div>

          <!-- P&L Statement Box -->
          <div style="background:#ffffff; color:#0f172a; border-radius:var(--mkt-radius-xl); padding:32px; max-width:780px; margin:32px auto 0 auto; box-shadow:0 16px 36px rgba(0,0,0,0.4); font-family:var(--mkt-font-mono); font-size:13px;">
            
            <div style="display:flex; justify-content:space-between; border-bottom:2px solid #0f172a; padding-bottom:12px; margin-bottom:16px;">
              <div>
                <div style="font-size:18px; font-weight:800; font-family:var(--mkt-font-sans);">APEX SUPERSTORE • P&L STATEMENT</div>
                <div style="font-size:11px; color:#64748b;">Period: 01 Aug 2026 - 31 Aug 2026 • Currency: PKR</div>
              </div>
              <div class="badge in-stock" style="font-family:var(--mkt-font-sans); height:fit-content;">AUDITED</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between;"><span>Gross Sales</span><b>PKR 1,480,000.00</b></div>
              <div style="display:flex; justify-content:space-between; color:#dc2626;"><span>Less: Discounts Allowed (−)</span><span>PKR 24,000.00</span></div>
              <div style="display:flex; justify-content:space-between; color:#dc2626;"><span>Less: Sales Returns (−)</span><span>PKR 16,000.00</span></div>
              <div style="display:flex; justify-content:space-between; border-top:1px solid #cbd5e1; padding-top:6px; font-weight:700;"><span>Net Sales Revenue</span><b>PKR 1,440,000.00</b></div>

              <div style="display:flex; justify-content:space-between; color:#64748b; margin-top:8px;"><span>Cost of Goods Sold (COGS) (−)</span><span>PKR 968,000.00</span></div>
              <div style="display:flex; justify-content:space-between; border-top:1px solid #cbd5e1; padding-top:6px; font-weight:800; color:#059669; font-size:15px;">
                <span>GROSS PROFIT (32.8%)</span>
                <span>PKR 472,000.00</span>
              </div>

              <div style="display:flex; justify-content:space-between; color:#dc2626; margin-top:8px;"><span>Total Operating Expenses (−)</span><span>PKR 148,000.00</span></div>
              <div style="display:flex; justify-content:space-between; border-top:2px solid #0f172a; padding-top:8px; font-weight:900; color:#1e40af; font-size:16px;">
                <span>NET OPERATING PROFIT (22.5%)</span>
                <span>PKR 324,000.00</span>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:24px; font-family:var(--mkt-font-sans);">
              <button class="mkt-btn mkt-btn-secondary" style="color:#0f172a; border-color:#cbd5e1; padding:6px 12px; font-size:12px;" onclick="window.triggerReportAction('P&L Exported to PDF')">📄 Export PDF</button>
              <button class="mkt-btn mkt-btn-secondary" style="color:#0f172a; border-color:#cbd5e1; padding:6px 12px; font-size:12px;" onclick="window.triggerReportAction('P&L Sent to Printer')">🖨️ Print Report</button>
              <button class="mkt-btn mkt-btn-secondary" style="color:#0f172a; border-color:#cbd5e1; padding:6px 12px; font-size:12px;" onclick="window.triggerReportAction('P&L Downloaded as CSV')">📥 CSV</button>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: SALES ANALYTICS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>SALES INTELLIGENCE</span>
            </div>
            <h2 class="mkt-section-title">Sales Analytics & Channel Insights.</h2>
            <p class="mkt-section-subtitle">
              Filter revenues, average order value, and top SKU performance by retail counter or online channel.
            </p>
          </div>

          <!-- Location Selector Tabs -->
          <div class="mkt-tour-tabs" style="margin-bottom:24px;">
            <button class="mkt-tab-btn report-loc-btn active" data-loc="all" onclick="window.switchReportLocation('all')">All Locations</button>
            <button class="mkt-tab-btn report-loc-btn" data-loc="store01" onclick="window.switchReportLocation('store01')">Store 01 (Commercial)</button>
            <button class="mkt-tab-btn report-loc-btn" data-loc="store02" onclick="window.switchReportLocation('store02')">Store 02 (Mall)</button>
            <button class="mkt-tab-btn report-loc-btn" data-loc="online" onclick="window.switchReportLocation('online')">Online Store</button>
          </div>

          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:900px; margin:0 auto;">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px;">
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Channel Revenue</div>
                <div class="mkt-dash-stat-value" id="report-loc-rev" style="font-family:var(--mkt-font-mono);">PKR 527,200</div>
              </div>
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Transaction Volume</div>
                <div class="mkt-dash-stat-value" id="report-loc-tx" style="font-family:var(--mkt-font-mono);">248 Orders</div>
              </div>
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Average Order Value</div>
                <div class="mkt-dash-stat-value" id="report-loc-aov" style="font-family:var(--mkt-font-mono);">PKR 2,125</div>
              </div>
              <div class="mkt-dash-stat-card">
                <div class="mkt-dash-stat-label">Top Selling Item</div>
                <div class="mkt-dash-stat-value" id="report-loc-item" style="font-size:13px; font-weight:700;">Dark Roast Coffee (1kg)</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: INVENTORY ANALYTICS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>STOCK OPTIMIZATION</span>
            </div>
            <h2 class="mkt-section-title">Inventory Valuation & Stock Turnover.</h2>
            <p class="mkt-section-subtitle">
              Eliminate dead capital by monitoring stock velocity, fast-moving items, and stockout reorder triggers.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; max-width:900px; margin:32px auto 0 auto;">
            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">📦</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Inventory Valuation</h4>
              <div style="font-size:18px; font-weight:800; color:#34d399; margin:4px 0; font-family:var(--mkt-font-mono);">PKR 4.82M</div>
              <small style="color:var(--mkt-text-muted);">Weighted average cost</small>
            </div>
            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">🔄</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Stock Turnover Rate</h4>
              <div style="font-size:18px; font-weight:800; color:#60a5fa; margin:4px 0; font-family:var(--mkt-font-mono);">6.4x / Year</div>
              <small style="color:var(--mkt-text-muted);">High liquidity ratio</small>
            </div>
            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">⚠️</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Reorder Triggers</h4>
              <div style="font-size:18px; font-weight:800; color:#fbbf24; margin:4px 0; font-family:var(--mkt-font-mono);">2 SKUs</div>
              <small style="color:var(--mkt-text-muted);">Below minimum threshold</small>
            </div>
            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">⚡</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Fastest Moving</h4>
              <div style="font-size:18px; font-weight:800; color:#34d399; margin:4px 0; font-family:var(--mkt-font-mono);">Coffee Beans</div>
              <small style="color:var(--mkt-text-muted);">184 units / week</small>
            </div>
          </div>

          <div style="text-align:center; margin-top:24px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              Explore Multi-Location Inventory Engine →
            </a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: PURCHASING & SUPPLIER ANALYTICS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>PROCUREMENT ANALYTICS</span>
            </div>
            <h2 class="mkt-section-title">Purchasing Spend & Vendor Performance.</h2>
            <p class="mkt-section-subtitle">
              Monitor procurement disbursements, supplier lead times, and accounts payable commitments.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:850px; margin:32px auto 0 auto;">
            <div class="mkt-feature-card" style="padding:24px;">
              <h4 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Purchasing Metrics</h4>
              <div style="font-family:var(--mkt-font-mono); font-size:13px; display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between;"><span>Monthly Spend:</span><b>PKR 840,000</b></div>
                <div style="display:flex; justify-content:space-between;"><span>Open Purchase Orders:</span><b>3 POs</b></div>
                <div style="display:flex; justify-content:space-between;"><span>Pending Deliveries (GRNs):</span><b style="color:#fbbf24;">1 Pending</b></div>
              </div>
              <div style="margin-top:16px;">
                <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/purchasing')" style="font-size:12px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Purchasing & POs</a>
              </div>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <h4 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Vendor Payables</h4>
              <div style="font-family:var(--mkt-font-mono); font-size:13px; display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between;"><span>Direct Trade Coffee:</span><b>PKR 84,500</b></div>
                <div style="display:flex; justify-content:space-between;"><span>Indus Packaging:</span><b>PKR 18,200</b></div>
                <div style="display:flex; justify-content:space-between;"><span>Total Accounts Payable:</span><b style="color:#f87171;">PKR 102,700</b></div>
              </div>
              <div style="margin-top:16px;">
                <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/suppliers')" style="font-size:12px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Suppliers & Vendors</a>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: CUSTOMER & RECEIVABLES ANALYTICS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>CUSTOMER CRM ANALYTICS</span>
            </div>
            <h2 class="mkt-section-title">Customer Segmentation & Receivables Aging.</h2>
            <p class="mkt-section-subtitle">
              Track customer lifetime value, repeat frequency, and outstanding credit aging without risk of bad debt.
            </p>
          </div>

          <!-- Customer Segmentation Filters -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; gap:6px; margin-bottom:16px; flex-wrap:wrap;">
              <button class="mkt-btn mkt-btn-secondary cust-seg-btn active" data-seg="all" onclick="window.filterCustomerReports('all')" style="padding:4px 10px; font-size:11px;">All Accounts</button>
              <button class="mkt-btn mkt-btn-secondary cust-seg-btn" data-seg="vip" onclick="window.filterCustomerReports('vip')" style="padding:4px 10px; font-size:11px;">VIP Clients</button>
              <button class="mkt-btn mkt-btn-secondary cust-seg-btn" data-seg="credit" onclick="window.filterCustomerReports('credit')" style="padding:4px 10px; font-size:11px;">Credit Ledgers</button>
              <button class="mkt-btn mkt-btn-secondary cust-seg-btn" data-seg="overdue" onclick="window.filterCustomerReports('overdue')" style="padding:4px 10px; font-size:11px;">Overdue (>30d)</button>
            </div>

            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head"><span>Customer Name</span><span>Tier</span><span>Total Orders</span><span>Balance</span><span>Status</span></div>
              <div class="mkt-tbl-row cust-report-row" data-seg="vip">
                <span>Summit Tech Cafe</span>
                <span class="badge in-stock">VIP</span>
                <span>48 Orders</span>
                <b style="font-family:var(--mkt-font-mono);">PKR 53,980</b>
                <span class="badge in-stock">Current</span>
              </div>
              <div class="mkt-tbl-row cust-report-row" data-seg="credit">
                <span>Metro Retail Mart</span>
                <span class="badge in-stock">Commercial</span>
                <span>24 Orders</span>
                <b style="font-family:var(--mkt-font-mono);">PKR 142,000</b>
                <span class="badge in-stock">Net 30</span>
              </div>
              <div class="mkt-tbl-row cust-report-row" data-seg="overdue">
                <span>Green Basket Organic</span>
                <span class="badge low-stock">Retail</span>
                <span>12 Orders</span>
                <b style="color:#f87171; font-family:var(--mkt-font-mono);">PKR 18,400</b>
                <span class="badge low-stock">Overdue 8d</span>
              </div>
            </div>

            <div style="text-align:center; margin-top:20px;">
              <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/customers')" style="font-size:12px; font-weight:700; color:#60a5fa; text-decoration:none;">
                Explore Customers & CRM →
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
              <span>BRANCH BENCHMARKING</span>
            </div>
            <h2 class="mkt-section-title">Multi-Location Branch Performance.</h2>
            <p class="mkt-section-subtitle">
              Compare revenue contribution, profit margins, and operational costs across all physical stores and online channels.
            </p>
          </div>

          <!-- Multi-Location Table -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:900px; margin:32px auto 0 auto;">
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head"><span>Branch Location</span><span>Today Revenue</span><span>Gross Margin</span><span>Orders</span><span>Contribution</span></div>
              <div class="mkt-tbl-row"><span>Store 01 (Commercial Plaza)</span><b style="font-family:var(--mkt-font-mono);">PKR 248,500</b><span style="color:#34d399;">34.2%</span><span>124</span><span class="badge in-stock">47.1%</span></div>
              <div class="mkt-tbl-row"><span>Store 02 (Mall Branch)</span><b style="font-family:var(--mkt-font-mono);">PKR 182,300</b><span style="color:#fbbf24;">30.8%</span><span>86</span><span class="badge in-stock">34.6%</span></div>
              <div class="mkt-tbl-row"><span>Online Web Storefront</span><b style="font-family:var(--mkt-font-mono);">PKR 96,400</b><span style="color:#34d399;">35.4%</span><span>38</span><span class="badge in-stock">18.3%</span></div>
              <div class="mkt-tbl-row" style="border-top:2px solid var(--mkt-border); font-weight:800;">
                <span>Consolidated Enterprise Total</span>
                <b style="color:#60a5fa; font-family:var(--mkt-font-mono);">PKR 527,200</b>
                <span style="color:#34d399;">33.0%</span>
                <span>248</span>
                <span class="badge in-stock">100.0%</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 10: REAL-TIME REPORTS & AUTOMATED INSIGHTS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>AUTOMATED INTELLIGENCE</span>
            </div>
            <h2 class="mkt-section-title">Automated AI-Powered Business Insights.</h2>
            <p class="mkt-section-subtitle">
              Universal ERP surfaces actionable operational opportunities and early warning alerts before they impact margins.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px; max-width:900px; margin:32px auto 0 auto;">
            <div class="mkt-feature-card" style="padding:20px; border-left:4px solid #10b981;">
              <b style="color:#34d399; font-size:13px;">📈 Growth Velocity</b>
              <p style="font-size:12px; color:var(--mkt-text-muted); margin-top:4px;">Revenue is up 14.8% vs last month. Coffee Beans category is the primary driver.</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px; border-left:4px solid #fbbf24;">
              <b style="color:#fbbf24; font-size:13px;">⚠️ Inventory Warning</b>
              <p style="font-size:12px; color:var(--mkt-text-muted); margin-top:4px;">Organic Green Tea is approaching reorder level (12 units remaining in Store 02).</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px; border-left:4px solid #f87171;">
              <b style="color:#f87171; font-size:13px;">💳 Receivables Alert</b>
              <p style="font-size:12px; color:var(--mkt-text-muted); margin-top:4px;">PKR 18,400 in receivables from Green Basket Organic are overdue (>30 days).</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px; border-left:4px solid #60a5fa;">
              <b style="color:#60a5fa; font-size:13px;">📊 Margin Opportunity</b>
              <p style="font-size:12px; color:var(--mkt-text-muted); margin-top:4px;">Coffee category delivers 38% of total gross profit with 34.2% margin.</p>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 11: REPORTS, CONTROLS & AUDITABILITY
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>AUDIT & GOVERNANCE</span>
            </div>
            <h2 class="mkt-section-title">Role-Based Access & Transaction Auditability.</h2>
            <p class="mkt-section-subtitle">
              Every financial figure on every report links directly to underlying transaction vouchers, invoices, and register shift logs.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px; margin-top:32px;">
            <div class="mkt-feature-card" style="padding:22px;">
              <div style="font-size:24px; margin-bottom:8px;">📅</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:4px;">Scheduled Email Reports</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted); line-height:1.5;">Automated daily Z-reports and monthly executive summaries delivered to your inbox.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px;">
              <div style="font-size:24px; margin-bottom:8px;">👑</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:4px;">Strict Financial RBAC</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted); line-height:1.5;">Restrict profit margins and tax declarations to Company Owners and authorized Managers.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px;">
              <div style="font-size:24px; margin-bottom:8px;">📄</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:4px;">Print & PDF Export</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted); line-height:1.5;">One-click generation of audit-ready PDF statements and Excel data workbooks.</p>
              <div style="margin-top:8px;"><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/documents')" style="font-size:11px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Documents Hub</a></div>
            </div>

            <div class="mkt-feature-card" style="padding:22px;">
              <div style="font-size:24px; margin-bottom:8px;">🔒</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:4px;">Traceable Audit Trail</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted); line-height:1.5;">Click any ledger balance to drill down into the original sales invoice or payment slip.</p>
              <div style="margin-top:8px;"><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/integrations')" style="font-size:11px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Developer API</a></div>
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
            
            <h2 class="mkt-cta-title">Stop Guessing. Start Running Your<br>Business From The Numbers.</h2>
            <p class="mkt-cta-desc">
              Connect every operational activity to clear financial and business intelligence with Universal ERP.
            </p>

            <div class="mkt-cta-actions">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                Start Tracking Performance →
              </button>
              <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/product')">
                Explore The Platform
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
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/reports'); window.toggleMarketingMenu()">Reports & Analytics</a>
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
