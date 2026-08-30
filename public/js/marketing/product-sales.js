/**
 * Universal ERP — Sales & Invoicing Product Page (/product/sales)
 * Phase 23 — Step 6: Dedicated Sales & Invoicing Solution Page
 */

// Interactive Filter Controller
if (typeof window !== 'undefined') {
  window.switchSalesPeriod = (period) => {
    const tabs = ['today', 'week', 'month'];
    tabs.forEach((p) => {
      const el = document.getElementById(`sales-tab-${p}`);
      if (el) {
        if (p === period) el.classList.add('active');
        else el.classList.remove('active');
      }
    });

    const data = {
      today: { rev: 'PKR 248,500', paid: 'PKR 194,520 (38 Paid)', count: '42 Invoices', margin: '32.7%', label: "Today's Performance" },
      week: { rev: 'PKR 1,428,000', paid: 'PKR 1,180,500 (214 Paid)', count: '248 Invoices', margin: '33.4%', label: "This Week's Performance" },
      month: { rev: 'PKR 5,280,000', paid: 'PKR 4,640,000 (890 Paid)', count: '984 Invoices', margin: '31.9%', label: "This Month's Performance" },
    };

    const sel = data[period] || data.today;
    const revEl = document.getElementById('sales-metric-rev');
    const paidEl = document.getElementById('sales-metric-paid');
    const countEl = document.getElementById('sales-metric-count');
    const marginEl = document.getElementById('sales-metric-margin');
    const labelEl = document.getElementById('sales-period-label');

    if (revEl) revEl.innerText = sel.rev;
    if (paidEl) paidEl.innerText = sel.paid;
    if (countEl) countEl.innerText = sel.count;
    if (marginEl) marginEl.innerText = sel.margin;
    if (labelEl) labelEl.innerText = sel.label;
  };

  window.filterSalesTable = (status) => {
    const rows = document.querySelectorAll('.sales-row-item');
    const filterBtns = document.querySelectorAll('.sales-filter-btn');

    filterBtns.forEach((btn) => {
      if (btn.getAttribute('data-status') === status) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    rows.forEach((r) => {
      const rowStatus = r.getAttribute('data-status');
      if (status === 'all' || rowStatus === status) {
        r.style.display = 'flex';
      } else {
        r.style.display = 'none';
      }
    });
  };
}

export function renderProductSalesPage() {
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
           SECTION 1: HERO
           ========================================================================= -->
      <section class="mkt-section" style="padding-top:120px; padding-bottom:60px;">
        <div class="mkt-container">
          <div class="mkt-hero-grid">
            
            <div class="mkt-hero-left">
              <div class="mkt-pill-badge">
                <span class="mkt-pill-pulse"></span>
                <span>SALES & INVOICING</span>
              </div>

              <h1 class="mkt-hero-title">
                Turn Every Sale Into a<br>
                <span class="mkt-gradient-text-accent">Connected Business Record.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Create invoices, collect payments, update inventory and keep customer balances connected — automatically.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Start Selling</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#sales-demo" style="text-decoration:none;">
                  <span>See Sales In Action</span>
                </a>
              </div>

              <!-- Quick Badges -->
              <div style="display:flex; gap:16px; margin-top:28px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-muted);">
                <span>✓ Instant Tax Invoices</span>
                <span>•</span>
                <span>✓ Customer Credit Ledgers</span>
                <span>•</span>
                <span>✓ Auto Stock Deductions</span>
              </div>
            </div>

            <!-- Premium Sales Dashboard Mockup -->
            <div class="mkt-hero-right" id="sales-demo">
              <div class="mkt-dash-preview-frame">
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/sales</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>SALES ENGINE • ACTIVE</span>
                  </div>
                </div>

                <div class="mkt-dash-body" style="padding:16px;">
                  
                  <!-- Metric Cards -->
                  <div class="mkt-dash-metrics-grid" style="margin-bottom:14px;">
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Today's Sales</div>
                      <div class="mkt-dash-stat-value">PKR 248,500</div>
                      <div class="mkt-dash-stat-trend positive">↑ +14.2% daily growth</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Paid Invoices</div>
                      <div class="mkt-dash-stat-value">38 Completed</div>
                      <div class="mkt-dash-stat-trend positive">● PKR 194,520 settled</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Outstanding Receivables</div>
                      <div class="mkt-dash-stat-value">PKR 53,980</div>
                      <div class="mkt-dash-stat-trend neutral">4 Credit Accounts</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Average Order Value</div>
                      <div class="mkt-dash-stat-value">PKR 5,916</div>
                      <div class="mkt-dash-stat-trend positive">↑ 42 Total Orders</div>
                    </div>
                  </div>

                  <!-- Recent Invoices Table Mockup -->
                  <div class="mkt-mockup-table">
                    <div class="mkt-tbl-row head">
                      <span>Invoice #</span>
                      <span>Customer</span>
                      <span>Channel</span>
                      <span>Amount</span>
                      <span>Status</span>
                    </div>
                    <div class="mkt-tbl-row">
                      <span style="font-family:var(--mkt-font-mono); font-size:11px;">INV-1042</span>
                      <span>Summit Tech Cafe</span>
                      <span>B2B Direct</span>
                      <b>PKR 53,980</b>
                      <span class="badge in-stock">PAID (Cash)</span>
                    </div>
                    <div class="mkt-tbl-row">
                      <span style="font-family:var(--mkt-font-mono); font-size:11px;">INV-1041</span>
                      <span>Metro Retail Mart</span>
                      <span>Wholesale</span>
                      <b>PKR 31,500</b>
                      <span class="badge in-stock">PAID (Bank)</span>
                    </div>
                    <div class="mkt-tbl-row">
                      <span style="font-family:var(--mkt-font-mono); font-size:11px;">INV-1040</span>
                      <span>Green Basket Mart</span>
                      <span>Partner Store</span>
                      <b>PKR 18,750</b>
                      <span class="badge low-stock">PENDING (Credit)</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 2: FROM CUSTOMER TO PAYMENT (CONNECTED FLOW)
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>UNIFIED TRANSACTION LIFECYCLE</span>
            </div>
            <h2 class="mkt-section-title">From Sale To Payment. Everything Stays Connected.</h2>
            <p class="mkt-section-subtitle">
              A single completed transaction updates the customer ledger, relieves inventory, balances cash registers, and reflects in your profit statement.
            </p>
          </div>

          <!-- Connected Workflow Sequence -->
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-top:36px;">
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">👤</div><b>1. Customer</b><small>Identified</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">📝</div><b>2. Quote / Sale</b><small>Drafted</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active" style="min-width:115px;"><div class="node-icon">📑</div><b>3. Invoice</b><small>Generated</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">💳</div><b>4. Payment</b><small>Settled</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:115px;"><div class="node-icon">📦</div><b>5. Stock</b><small>Deducted</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">📒</div><b>6. Ledger</b><small>Updated</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:115px;"><div class="node-icon">📊</div><b>7. Reports</b><small>Live P&L</small></div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: SALES DASHBOARD (INTERACTIVE PERIOD FILTER)
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>REAL-TIME ANALYTICS</span>
            </div>
            <h2 class="mkt-section-title">See Your Sales Clearly.</h2>
            <p class="mkt-section-subtitle">
              Monitor gross revenue, completed invoices, pending collections, and profit margins in real time.
            </p>
          </div>

          <!-- Period Tabs -->
          <div class="mkt-tour-tabs" style="margin-top:28px;">
            <button class="mkt-tab-btn active" id="sales-tab-today" onclick="window.switchSalesPeriod('today')">📅 Today (PKR 248.5k)</button>
            <button class="mkt-tab-btn" id="sales-tab-week" onclick="window.switchSalesPeriod('week')">📊 This Week (PKR 1.42M)</button>
            <button class="mkt-tab-btn" id="sales-tab-month" onclick="window.switchSalesPeriod('month')">📈 This Month (PKR 5.28M)</button>
          </div>

          <!-- Dashboard Display Card -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; margin-top:20px;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px; border-bottom:1px solid var(--mkt-border); padding-bottom:14px;">
              <div>
                <h3 id="sales-period-label" style="font-size:18px; font-weight:700; color:var(--mkt-text-main);">Today's Performance</h3>
                <p style="font-size:13px; color:var(--mkt-text-muted);">Reconciled across all active retail registers and wholesale invoicing channels.</p>
              </div>
              <span class="mkt-badge mkt-badge-green">● Auto-Reconciled</span>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px;">
              <div class="mkt-feature-card" style="padding:16px;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">Gross Revenue</div>
                <div id="sales-metric-rev" style="font-size:22px; font-weight:800; color:#34d399; margin:4px 0;">PKR 248,500</div>
                <small style="color:var(--mkt-text-dim);">Net settled revenue</small>
              </div>
              <div class="mkt-feature-card" style="padding:16px;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">Paid Invoices</div>
                <div id="sales-metric-paid" style="font-size:18px; font-weight:800; color:var(--mkt-text-main); margin:4px 0;">PKR 194,520 (38 Paid)</div>
                <small style="color:#60a5fa;">Settled in cash/bank</small>
              </div>
              <div class="mkt-feature-card" style="padding:16px;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">Total Volume</div>
                <div id="sales-metric-count" style="font-size:22px; font-weight:800; color:var(--mkt-text-main); margin:4px 0;">42 Invoices</div>
                <small style="color:var(--mkt-text-dim);">Average PKR 5,916/order</small>
              </div>
              <div class="mkt-feature-card" style="padding:16px;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">Gross Margin</div>
                <div id="sales-metric-margin" style="font-size:22px; font-weight:800; color:#60a5fa; margin:4px 0;">32.7%</div>
                <small style="color:#34d399;">Profit: PKR 81,259</small>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: CREATE INVOICE (PROFESSIONAL DOCUMENT MOCKUP)
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>DOCUMENT BUILDER</span>
            </div>
            <h2 class="mkt-section-title">Create Professional Invoices In Seconds.</h2>
            <p class="mkt-section-subtitle">
              Issue branded tax invoices, thermal slips, or exportable PDF receipts with customer details and line-item breakdowns.
            </p>
          </div>

          <!-- Detailed Invoice Document Mockup -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; border-bottom:1px solid var(--mkt-border); padding-bottom:16px; flex-wrap:wrap; gap:12px;">
              <div>
                <div style="font-weight:800; font-size:18px; color:var(--mkt-text-main);">TAX INVOICE #INV-1042</div>
                <div style="font-size:12px; color:var(--mkt-text-muted); margin-top:2px;">Issued: 30/08/2026 • Universal ERP Commerce</div>
              </div>
              <div style="text-align:right;">
                <span class="badge in-stock" style="font-size:12px; padding:4px 10px;">● PAID (Cash Tender)</span>
              </div>
            </div>

            <!-- Customer & Terms Info -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; background:rgba(255,255,255,0.02); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
              <div>
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Billed To</div>
                <div style="font-weight:700; font-size:14px; color:var(--mkt-text-main); margin-top:2px;">Summit Tech Cafe</div>
                <div style="font-size:12px; color:var(--mkt-text-muted);">NTN: 8492019-2 • Phone: 0300-1122334</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Payment Details</div>
                <div style="font-weight:700; font-size:14px; color:var(--mkt-text-main); margin-top:2px;">Cash On Delivery</div>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Due Date: Immediate • Ledger ID: CUST-001</div>
              </div>
            </div>

            <!-- Invoice Line Items Table -->
            <div class="mkt-mockup-table" style="margin-bottom:20px;">
              <div class="mkt-tbl-row head">
                <span>Item Description</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span>Total</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Dark Roast Arabica Coffee (1kg)</span>
                <span>2</span>
                <span>PKR 2,699.00</span>
                <b>PKR 5,398.00</b>
              </div>
              <div class="mkt-tbl-row">
                <span>Organic Green Tea (250g)</span>
                <span>3</span>
                <span>PKR 1,450.00</span>
                <b>PKR 4,350.00</b>
              </div>
              <div class="mkt-tbl-row">
                <span>Commercial Espresso Beans (15kg Bag)</span>
                <span>1</span>
                <span>PKR 44,232.00</span>
                <b>PKR 44,232.00</b>
              </div>
            </div>

            <!-- Invoice Totals & Action Buttons -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:16px; padding-top:16px; border-top:1px solid var(--mkt-border);">
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;">💾 Save Draft</button>
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;">✉️ Send Invoice</button>
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;">🖨️ Print</button>
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;">📥 Download PDF</button>
              </div>
              <div style="text-align:right;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">Subtotal: PKR 53,980 | Tax: PKR 0.00</div>
                <div style="font-size:22px; font-weight:800; color:#34d399; margin-top:2px;">Total: PKR 53,980.00</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: CUSTOMER CREDIT & RECEIVABLES
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>RECEIVABLES MANAGEMENT</span>
            </div>
            <h2 class="mkt-section-title">Know Who Owes You. And How Much.</h2>
            <p class="mkt-section-subtitle">
              Sales made on credit automatically update the customer's balance, track payment terms, and prevent sales when credit limits are exceeded.
            </p>
          </div>

          <!-- Customer Receivables Ledger Table -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>Customer Name</span>
                <span>Credit Limit</span>
                <span>Outstanding</span>
                <span>Terms</span>
                <span>Status</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Summit Tech Cafe</span>
                <span>PKR 500,000</span>
                <b style="color:#60a5fa;">PKR 126,400</b>
                <span>15 Days</span>
                <span class="badge in-stock">Healthy</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Metro Retail Mart</span>
                <span>PKR 250,000</span>
                <b style="color:#fbbf24;">PKR 84,000</b>
                <span>30 Days</span>
                <span class="badge low-stock">Due in 3 Days</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Green Basket Supermarket</span>
                <span>PKR 100,000</span>
                <b style="color:#34d399;">PKR 18,750</b>
                <span>7 Days</span>
                <span class="badge in-stock">Healthy</span>
              </div>
            </div>

            <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <span style="font-size:12px; color:var(--mkt-text-muted);">Real-time receivables balance: PKR 229,150 across 3 accounts</span>
              <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/customers')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
                Explore Customer CRM →
              </a>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: PAYMENT METHODS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>FLEXIBLE SETTLEMENT</span>
            </div>
            <h2 class="mkt-section-title">Accept The Way Your Customers Pay.</h2>
            <p class="mkt-section-subtitle">
              Every payment is tied directly to its corresponding sales invoice and updates cash drawers or bank ledgers instantly.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:18px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:28px; margin-bottom:8px;">💵</div>
              <h4 style="font-size:15px; font-weight:700; margin-bottom:4px;">Cash Tender (42%)</h4>
              <div style="font-size:18px; font-weight:800; color:#34d399; margin:4px 0;">PKR 104,370</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Auto-computes exact change due.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:28px; margin-bottom:8px;">💳</div>
              <h4 style="font-size:15px; font-weight:700; margin-bottom:4px;">Card Terminal (28%)</h4>
              <div style="font-size:18px; font-weight:800; color:#60a5fa; margin:4px 0;">PKR 69,580</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Log POS machine reference IDs.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:28px; margin-bottom:8px;">🏦</div>
              <h4 style="font-size:15px; font-weight:700; margin-bottom:4px;">Bank Transfer (20%)</h4>
              <div style="font-size:18px; font-weight:800; color:#a78bfa; margin:4px 0;">PKR 49,700</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Direct IBFT & wallet deposits.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:28px; margin-bottom:8px;">📑</div>
              <h4 style="font-size:15px; font-weight:700; margin-bottom:4px;">Customer Credit (10%)</h4>
              <div style="font-size:18px; font-weight:800; color:#fbbf24; margin:4px 0;">PKR 24,850</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Charges customer ledger balance.</p>
            </div>

          </div>

          <div style="text-align:center; margin-top:28px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/payments')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              Explore Payments & Cash Drawers →
            </a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: SALES + INVENTORY
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>ZERO DOUBLE-ENTRY</span>
            </div>
            <h2 class="mkt-section-title">Every Sale Updates Stock Automatically.</h2>
            <p class="mkt-section-subtitle">
              You never need to manually adjust stock numbers or reconcile spreadsheets after making a sale.
            </p>
          </div>

          <!-- Before / After Card -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px; max-width:800px; margin:32px auto 0 auto;">
            <div style="font-weight:700; font-size:16px; margin-bottom:16px; text-align:center;">Dark Roast Arabica Coffee (1kg)</div>
            
            <div style="display:flex; justify-content:space-around; align-items:center; gap:16px; flex-wrap:wrap;">
              
              <div style="text-align:center; padding:16px; background:rgba(255,255,255,0.03); border-radius:var(--mkt-radius-md); min-width:160px;">
                <div style="font-size:12px; color:var(--mkt-text-muted); text-transform:uppercase;">Before Sale</div>
                <div style="font-size:28px; font-weight:800; color:#60a5fa; margin:6px 0;">100 Units</div>
                <small style="color:var(--mkt-text-dim);">Main Store Shelf</small>
              </div>

              <div style="font-size:24px; color:#f87171; font-weight:800;">− 2 Sold</div>

              <div style="text-align:center; padding:16px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:var(--mkt-radius-md); min-width:160px;">
                <div style="font-size:12px; color:#34d399; text-transform:uppercase;">After Sale</div>
                <div style="font-size:28px; font-weight:800; color:#34d399; margin:6px 0;">98 Units</div>
                <small style="color:#6ee7b7;">Deducted Live ✓</small>
              </div>

            </div>

            <!-- Connected Pipeline Strip -->
            <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--mkt-border); display:flex; justify-content:center; gap:8px; flex-wrap:wrap; font-size:12px;">
              <span class="mkt-badge mkt-badge-cyan">Sale Created</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-badge mkt-badge-cyan">Payment Recorded</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-badge mkt-badge-green">Inventory Deducted</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-badge mkt-badge-green">Ledger Updated</span>
            </div>
          </div>

          <div style="text-align:center; margin-top:24px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              Explore Multi-Location Inventory →
            </a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: RETURNS & REFUNDS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>TRACEABLE RETURNS</span>
            </div>
            <h2 class="mkt-section-title">Handle Returns Without Losing The Paper Trail.</h2>
            <p class="mkt-section-subtitle">
              Returns remain traceable against the original invoice, restoring items to inventory and balancing customer credit or cash refunds.
            </p>
          </div>

          <!-- Return Workflow Card -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:24px;">
              <span class="mkt-pill">1. Original Sale (INV-1038)</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-pill">2. Return Item Scanned</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-pill">3. Refund Issued</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-pill" style="background:rgba(16,185,129,0.2); color:#34d399;">✓ Stock Restored (+1)</span>
            </div>

            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <div>
                <div style="font-weight:700; font-size:14px;">Return Manifest: RET-2026-0012</div>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Original Invoice: INV-1038 • 1x Dark Roast Coffee (Unopened)</div>
              </div>
              <div style="text-align:right;">
                <span class="badge in-stock" style="background:rgba(239,68,68,0.2); color:#f87171;">REFUNDED (PKR 2,699)</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 9: SALES HISTORY & SEARCH
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>INSTANT SEARCH</span>
            </div>
            <h2 class="mkt-section-title">Find Any Sale When You Need It.</h2>
            <p class="mkt-section-subtitle">
              Filter by invoice number, customer name, date range, or payment status in milliseconds.
            </p>
          </div>

          <!-- Sales Table Filter & Search Mockup -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:900px; margin:32px auto 0 auto;">
            
            <!-- Filter Bar -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
              <div style="display:flex; gap:8px; flex:1; min-width:260px;">
                <div style="flex:1; background:rgba(255,255,255,0.05); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); padding:8px 12px; font-size:13px; color:var(--mkt-text-muted);">
                  🔍 Search invoice #, customer, or SKU...
                </div>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="mkt-btn mkt-btn-secondary sales-filter-btn active" data-status="all" onclick="window.filterSalesTable('all')" style="padding:6px 12px; font-size:12px;">All</button>
                <button class="mkt-btn mkt-btn-secondary sales-filter-btn" data-status="paid" onclick="window.filterSalesTable('paid')" style="padding:6px 12px; font-size:12px;">Paid</button>
                <button class="mkt-btn mkt-btn-secondary sales-filter-btn" data-status="pending" onclick="window.filterSalesTable('pending')" style="padding:6px 12px; font-size:12px;">Pending</button>
              </div>
            </div>

            <!-- Table Rows -->
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>Invoice #</span>
                <span>Customer</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              <div class="mkt-tbl-row sales-row-item" data-status="paid">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">INV-1042</span>
                <span>Summit Tech Cafe</span>
                <span>3 Items</span>
                <b>PKR 53,980</b>
                <span class="badge in-stock">PAID</span>
                <span style="color:#60a5fa; cursor:pointer; font-size:12px;">View / Print</span>
              </div>
              <div class="mkt-tbl-row sales-row-item" data-status="paid">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">INV-1041</span>
                <span>Metro Retail Mart</span>
                <span>12 Items</span>
                <b>PKR 31,500</b>
                <span class="badge in-stock">PAID</span>
                <span style="color:#60a5fa; cursor:pointer; font-size:12px;">View / Print</span>
              </div>
              <div class="mkt-tbl-row sales-row-item" data-status="pending">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">INV-1040</span>
                <span>Green Basket</span>
                <span>5 Items</span>
                <b>PKR 18,750</b>
                <span class="badge low-stock">PENDING</span>
                <span style="color:#60a5fa; cursor:pointer; font-size:12px;">Collect</span>
              </div>
              <div class="mkt-tbl-row sales-row-item" data-status="paid">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">INV-1039</span>
                <span>Walk-in Customer</span>
                <span>1 Item</span>
                <b>PKR 2,699</b>
                <span class="badge in-stock">PAID</span>
                <span style="color:#60a5fa; cursor:pointer; font-size:12px;">Receipt</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 10: MULTI-LOCATION SALES
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>MULTI-CHANNEL CONSOLIDATION</span>
            </div>
            <h2 class="mkt-section-title">Sell From Multiple Locations. Stay On One System.</h2>
            <p class="mkt-section-subtitle">
              Consolidate daily turnover from physical storefronts, pop-up kiosks, and online orders into one master ledger.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:18px; margin-top:36px;">
            
            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:28px; margin-bottom:8px;">🏪</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Store 01 (Commercial)</h4>
              <div style="font-size:22px; font-weight:800; color:#60a5fa; margin:6px 0;">PKR 248,500</div>
              <small style="color:var(--mkt-text-muted);">42 Invoices completed</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:28px; margin-bottom:8px;">🏪</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Store 02 (Mall Branch)</h4>
              <div style="font-size:22px; font-weight:800; color:#60a5fa; margin:6px 0;">PKR 182,300</div>
              <small style="color:var(--mkt-text-muted);">29 Invoices completed</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:28px; margin-bottom:8px;">🛍️</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Online Web Store</h4>
              <div style="font-size:22px; font-weight:800; color:#34d399; margin:6px 0;">PKR 96,400</div>
              <small style="color:var(--mkt-text-muted);">18 Orders dispatched</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.3);">
              <div style="font-size:28px; margin-bottom:8px;">🌐</div>
              <h4 style="font-size:15px; font-weight:700; color:#93c5fd;">Combined Revenue</h4>
              <div style="font-size:24px; font-weight:800; color:#ffffff; margin:6px 0;">PKR 527,200</div>
              <small style="color:#60a5fa;">89 Total Sales Synced ✓</small>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 11: SALES TO REPORTS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>AUTOMATED FINANCIALS</span>
            </div>
            <h2 class="mkt-section-title">Your Sales Become Your Business Intelligence.</h2>
            <p class="mkt-section-subtitle">
              Every invoice automatically calculates cost of goods sold (COGS) and net margin for instantaneous profit reporting.
            </p>
          </div>

          <!-- Mini Analytics Dashboard -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:24px;">
              <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Gross Revenue</div>
                <div style="font-size:20px; font-weight:800; color:var(--mkt-text-main); margin-top:4px;">PKR 527,200</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Cost of Goods (COGS)</div>
                <div style="font-size:20px; font-weight:800; color:#f87171; margin-top:4px;">PKR 354,800</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Gross Profit</div>
                <div style="font-size:20px; font-weight:800; color:#34d399; margin-top:4px;">PKR 172,400</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Gross Margin Ratio</div>
                <div style="font-size:20px; font-weight:800; color:#60a5fa; margin-top:4px;">32.7%</div>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <span style="font-size:12px; color:var(--mkt-text-muted);">Data flow: Invoices → Payments → Revenue → Gross Profit → P&L Reports</span>
              <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/reports')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
                Explore Financial Reports →
              </a>
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
            
            <h2 class="mkt-cta-title">Stop Managing Sales In Spreadsheets.</h2>
            <p class="mkt-cta-desc">
              Create sales, manage invoices, track payments and understand your revenue from one connected system.
            </p>

            <div class="mkt-cta-actions">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                Get Started Free →
              </button>
              <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/product/customers')">
                Explore Customers
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
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/sales'); window.toggleMarketingMenu()">Sales & Invoicing</a>
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
