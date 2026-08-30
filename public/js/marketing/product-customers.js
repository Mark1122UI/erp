/**
 * Universal ERP — Customers & CRM Product Page (/product/customers)
 * Phase 23 — Step 8: Dedicated Customer CRM & Receivables Solution Page
 */

// Client-Side Interactive Controllers
if (typeof window !== 'undefined') {
  window.switchCustomerProfileTab = (tabKey) => {
    const tabs = ['overview', 'sales', 'payments', 'credit', 'statements'];
    tabs.forEach((k) => {
      const tabEl = document.getElementById(`crm-tab-${k}`);
      if (tabEl) {
        if (k === tabKey) tabEl.classList.add('active');
        else tabEl.classList.remove('active');
      }
    });

    const contentBox = document.getElementById('crm-profile-tab-content');
    if (!contentBox) return;

    if (tabKey === 'sales') {
      contentBox.innerHTML = `
        <div class="mkt-mockup-table">
          <div class="mkt-tbl-row head"><span>Invoice #</span><span>Date</span><span>Items</span><span>Amount</span><span>Status</span></div>
          <div class="mkt-tbl-row"><span>INV-1042</span><span>Today</span><span>3 Items</span><b>PKR 53,980</b><span class="badge in-stock">PAID</span></div>
          <div class="mkt-tbl-row"><span>INV-1038</span><span>25 Aug</span><span>2 Items</span><b>PKR 31,500</b><span class="badge in-stock">PAID</span></div>
          <div class="mkt-tbl-row"><span>INV-1029</span><span>18 Aug</span><span>5 Items</span><b>PKR 84,000</b><span class="badge low-stock">CREDIT</span></div>
        </div>
      `;
    } else if (tabKey === 'payments') {
      contentBox.innerHTML = `
        <div class="mkt-mockup-table">
          <div class="mkt-tbl-row head"><span>Receipt #</span><span>Date</span><span>Method</span><span>Amount Paid</span><span>Balance Remaining</span></div>
          <div class="mkt-tbl-row"><span>REC-3081</span><span>Today</span><span>Cash Tender</span><b>PKR 53,980</b><span>PKR 53,980</span></div>
          <div class="mkt-tbl-row"><span>REC-3064</span><span>25 Aug</span><span>Bank Transfer</span><b>PKR 31,500</b><span>PKR 107,960</span></div>
        </div>
      `;
    } else if (tabKey === 'credit') {
      contentBox.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="font-size:11px; color:var(--mkt-text-muted);">Approved Credit Limit</div>
            <div style="font-size:16px; font-weight:800; color:#60a5fa; margin-top:2px;">PKR 500,000</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="font-size:11px; color:var(--mkt-text-muted);">Current Outstanding</div>
            <div style="font-size:16px; font-weight:800; color:#fbbf24; margin-top:2px;">PKR 53,980</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="font-size:11px; color:var(--mkt-text-muted);">Available Credit</div>
            <div style="font-size:16px; font-weight:800; color:#34d399; margin-top:2px;">PKR 446,020</div>
          </div>
        </div>
      `;
    } else if (tabKey === 'statements') {
      contentBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:12px; background:rgba(59,130,246,0.05); border:1px solid rgba(59,130,246,0.2); border-radius:var(--mkt-radius-md);">
          <div>
            <div style="font-weight:700; font-size:13px;">Monthly Statement: August 2026</div>
            <div style="font-size:12px; color:var(--mkt-text-muted);">Opening: PKR 0.00 • Invoices: PKR 172,480 • Balance: PKR 53,980</div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="mkt-btn mkt-btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="window.triggerCRMToast('Statement PDF exported for Summit Tech Cafe')">📥 Download PDF</button>
            <button class="mkt-btn mkt-btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="window.triggerCRMToast('Statement print formatted')">🖨️ Print</button>
          </div>
        </div>
      `;
    } else {
      // Default: Overview
      contentBox.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="font-size:11px; color:var(--mkt-text-muted);">Total Lifetime Spend</div>
            <div style="font-size:16px; font-weight:800; color:#34d399; margin-top:2px;">PKR 1,248,500</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="font-size:11px; color:var(--mkt-text-muted);">Completed Orders</div>
            <div style="font-size:16px; font-weight:800; color:var(--mkt-text-main); margin-top:2px;">42 Invoices</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="font-size:11px; color:var(--mkt-text-muted);">Payment Health</div>
            <div style="font-size:16px; font-weight:800; color:#60a5fa; margin-top:2px;">100% On-Time</div>
          </div>
        </div>
      `;
    }
  };

  window.filterCustomerSegmentation = (segment) => {
    const rows = document.querySelectorAll('.customer-seg-row');
    const filterBtns = document.querySelectorAll('.customer-seg-btn');

    filterBtns.forEach((btn) => {
      if (btn.getAttribute('data-segment') === segment) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    rows.forEach((r) => {
      const rowSeg = r.getAttribute('data-segment');
      if (segment === 'all' || rowSeg === segment) {
        r.style.display = 'flex';
      } else {
        r.style.display = 'none';
      }
    });
  };

  window.triggerCRMToast = (msg) => {
    const toast = document.getElementById('crm-action-toast');
    if (toast) {
      toast.innerText = `✓ ${msg}`;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3500);
    }
  };
}

export function renderProductCustomersPage() {
  return `
    <div class="marketing-wrapper" id="marketing-root">
      <div class="mkt-ambient-glow"></div>

      <!-- Action Feedback Toast -->
      <div id="crm-action-toast" style="display:none; position:fixed; bottom:24px; right:24px; z-index:9999; background:#10b981; color:#ffffff; padding:12px 20px; border-radius:var(--mkt-radius-md); font-weight:700; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
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
           SECTION 1: HERO
           ========================================================================= -->
      <section class="mkt-section" style="padding-top:120px; padding-bottom:60px;">
        <div class="mkt-container">
          <div class="mkt-hero-grid">
            
            <div class="mkt-hero-left">
              <div class="mkt-pill-badge">
                <span class="mkt-pill-pulse"></span>
                <span>CUSTOMERS & CRM</span>
              </div>

              <h1 class="mkt-hero-title">
                Know Your Customers.<br>
                <span class="mkt-gradient-text-accent">Build Better Business Relationships.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Keep customer profiles, purchase history, payments, credit balances and statements connected in one place.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Start Managing Customers</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#customers-demo" style="text-decoration:none;">
                  <span>See CRM In Action</span>
                </a>
              </div>

              <!-- Quick Badges -->
              <div style="display:flex; gap:16px; margin-top:28px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-muted);">
                <span>✓ 360° Customer Ledger</span>
                <span>•</span>
                <span>✓ Automated Statements</span>
                <span>•</span>
                <span>✓ Credit Risk Controls</span>
              </div>
            </div>

            <!-- Premium CRM Command Center Mockup -->
            <div class="mkt-hero-right" id="customers-demo">
              <div class="mkt-dash-preview-frame">
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/customers</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>CRM DIRECTORY</span>
                  </div>
                </div>

                <div class="mkt-dash-body" style="padding:16px;">
                  
                  <!-- Metric Cards -->
                  <div class="mkt-dash-metrics-grid" style="margin-bottom:14px;">
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Total Customers</div>
                      <div class="mkt-dash-stat-value">2,840</div>
                      <div class="mkt-dash-stat-trend positive">● Verified Profiles</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Active Transacting</div>
                      <div class="mkt-dash-stat-value">2,416</div>
                      <div class="mkt-dash-stat-trend positive">↑ 85% Active Ratio</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Outstanding Credit</div>
                      <div class="mkt-dash-stat-value">PKR 284,500</div>
                      <div class="mkt-dash-stat-trend neutral">184 Credit Accounts</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Sales This Month</div>
                      <div class="mkt-dash-stat-value">PKR 5.28M</div>
                      <div class="mkt-dash-stat-trend positive">↑ Consolidated</div>
                    </div>
                  </div>

                  <!-- Live Customer Stream -->
                  <div class="mkt-dash-feed-box">
                    <div class="mkt-dash-feed-header">
                      <span class="mkt-feed-title">Recent Customer Activity</span>
                      <span class="mkt-badge mkt-badge-cyan">Live Sync</span>
                    </div>
                    <div class="mkt-dash-feed-list">
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#10b981;"></span>
                          <span>Summit Tech Cafe settled invoice #INV-1042 (PKR 53,980)</span>
                        </div>
                        <span class="mkt-activity-time">5m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#3b82f6;"></span>
                          <span>New B2B customer registered: Metro Retail Mart</span>
                        </div>
                        <span class="mkt-activity-time">22m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#8b5cf6;"></span>
                          <span>Monthly statement generated for Green Basket Supermarket</span>
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
           SECTION 2: CUSTOMER PROFILE
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>CUSTOMER 360° RECORD</span>
            </div>
            <h2 class="mkt-section-title">Complete Customer Profile In One View.</h2>
            <p class="mkt-section-subtitle">
              Access contact numbers, billing addresses, credit limits, invoices, and payment statements in a unified record.
            </p>
          </div>

          <!-- Customer Profile Card Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; border-bottom:1px solid var(--mkt-border); padding-bottom:16px; flex-wrap:wrap; gap:12px;">
              <div style="display:flex; gap:14px; align-items:center;">
                <div style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, #2563eb, #06b6d4); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800; color:#fff;">
                  ST
                </div>
                <div>
                  <h3 style="font-size:18px; font-weight:800; color:var(--mkt-text-main);">Summit Tech Cafe</h3>
                  <div style="font-size:12px; color:var(--mkt-text-muted);">Customer ID: CUS-1042 • B2B Commercial Partner</div>
                </div>
              </div>
              <span class="badge in-stock" style="font-size:12px; padding:4px 10px;">● Healthy (Net 15 Days)</span>
            </div>

            <!-- Profile Info Grid -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; background:rgba(255,255,255,0.02); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
              <div>
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Contact Information</div>
                <div style="font-size:13px; color:var(--mkt-text-main); margin-top:2px;">📞 0300-1122334 • ✉️ orders@summitcafe.pk</div>
                <div style="font-size:12px; color:var(--mkt-text-muted); margin-top:2px;">Plaza 14, Commercial Market, Lahore</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Credit & Ledger Snapshot</div>
                <div style="font-size:13px; color:var(--mkt-text-main); margin-top:2px;">Credit Limit: <b>PKR 500,000</b></div>
                <div style="font-size:12px; color:#fbbf24; margin-top:2px;">Current Outstanding: <b>PKR 53,980</b></div>
              </div>
            </div>

            <!-- Sub-Tabs Navigation -->
            <div class="mkt-tour-tabs" style="margin-bottom:16px;">
              <button class="mkt-tab-btn active" id="crm-tab-overview" onclick="window.switchCustomerProfileTab('overview')">📊 Overview</button>
              <button class="mkt-tab-btn" id="crm-tab-sales" onclick="window.switchCustomerProfileTab('sales')">📑 Sales Invoices</button>
              <button class="mkt-tab-btn" id="crm-tab-payments" onclick="window.switchCustomerProfileTab('payments')">💳 Receipts</button>
              <button class="mkt-tab-btn" id="crm-tab-credit" onclick="window.switchCustomerProfileTab('credit')">🛡️ Credit Limit</button>
              <button class="mkt-tab-btn" id="crm-tab-statements" onclick="window.switchCustomerProfileTab('statements')">📄 Statements</button>
            </div>

            <!-- Dynamic Tab Content Area -->
            <div id="crm-profile-tab-content">
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
                <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                  <div style="font-size:11px; color:var(--mkt-text-muted);">Total Lifetime Spend</div>
                  <div style="font-size:16px; font-weight:800; color:#34d399; margin-top:2px;">PKR 1,248,500</div>
                </div>
                <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                  <div style="font-size:11px; color:var(--mkt-text-muted);">Completed Orders</div>
                  <div style="font-size:16px; font-weight:800; color:var(--mkt-text-main); margin-top:2px;">42 Invoices</div>
                </div>
                <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                  <div style="font-size:11px; color:var(--mkt-text-muted);">Payment Health</div>
                  <div style="font-size:16px; font-weight:800; color:#60a5fa; margin-top:2px;">100% On-Time</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: CUSTOMER 360° VIEW
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>LIFECYCLE TIMELINE</span>
            </div>
            <h2 class="mkt-section-title">One Customer. Every Interaction Connected.</h2>
            <p class="mkt-section-subtitle">
              Track the complete journey from initial registration to invoices, credit allocations, and statement settlements.
            </p>
          </div>

          <!-- Customer 360 Timeline Sequence -->
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-top:36px;">
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">👤</div><b>1. Created</b><small>Profile setup</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">🛍️</div><b>2. 1st Sale</b><small>INV-1017 (Cash)</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active" style="min-width:110px;"><div class="node-icon">📑</div><b>3. Credit Sale</b><small>INV-1029 (84k)</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:110px;"><div class="node-icon">💳</div><b>4. Paid</b><small>Receipt #3064</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">↩️</div><b>5. Return</b><small>RET-0012</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:110px;"><div class="node-icon">⚖️</div><b>6. Balance</b><small>PKR 53,980 Due</small></div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: SALES HISTORY
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>TRANSACTION AUDIT</span>
            </div>
            <h2 class="mkt-section-title">Sales History & Invoicing Records.</h2>
            <p class="mkt-section-subtitle">
              Inspect historical purchases, line items, and payment tender statuses for any individual client.
            </p>
          </div>

          <!-- Transaction Table Mockup -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>Invoice #</span>
                <span>Date</span>
                <span>Items Ordered</span>
                <span>Amount</span>
                <span>Payment</span>
                <span>Status</span>
              </div>
              <div class="mkt-tbl-row">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">INV-1042</span>
                <span>Today</span>
                <span>3 Items (Coffee, Tea)</span>
                <b>PKR 53,980</b>
                <span>Cash Tender</span>
                <span class="badge in-stock">PAID</span>
              </div>
              <div class="mkt-tbl-row">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">INV-1038</span>
                <span>25 Aug 2026</span>
                <span>2 Items (Beans 15kg)</span>
                <b>PKR 31,500</b>
                <span>Bank Transfer</span>
                <span class="badge in-stock">PAID</span>
              </div>
              <div class="mkt-tbl-row">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">INV-1029</span>
                <span>18 Aug 2026</span>
                <span>5 Items (Wholesale)</span>
                <b>PKR 84,000</b>
                <span>Customer Credit</span>
                <span class="badge low-stock">PARTIAL</span>
              </div>
              <div class="mkt-tbl-row">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">INV-1017</span>
                <span>10 Aug 2026</span>
                <span>1 Item (Returned)</span>
                <b>PKR 2,699</b>
                <span>Cash Refund</span>
                <span class="badge" style="background:rgba(239,68,68,0.2); color:#f87171;">REFUNDED</span>
              </div>
            </div>

            <div style="text-align:center; margin-top:20px;">
              <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/sales')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
                Explore Invoicing & Sales Operations →
              </a>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: CUSTOMER CREDIT & LEDGER
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>CREDIT GOVERNANCE</span>
            </div>
            <h2 class="mkt-section-title">Automated Credit Limits & Receivables.</h2>
            <p class="mkt-section-subtitle">
              Prevent cashiers from exceeding client credit terms with real-time balance checks and risk indicators.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge in-stock">● HEALTHY</span>
                <span style="font-size:12px; color:var(--mkt-text-muted);">Net 15 Days</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main);">Summit Tech Cafe</h3>
              <div style="font-size:22px; font-weight:800; color:#fbbf24; margin:6px 0;">PKR 53,980 Due</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Limit: PKR 500,000 (Available: PKR 446,020)</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge low-stock">● ATTENTION</span>
                <span style="font-size:12px; color:var(--mkt-text-muted);">Net 30 Days</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main);">Metro Retail Mart</h3>
              <div style="font-size:22px; font-weight:800; color:#60a5fa; margin:6px 0;">PKR 84,000 Due</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Limit: PKR 250,000 (Due in 3 Days)</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge in-stock">● HEALTHY</span>
                <span style="font-size:12px; color:var(--mkt-text-muted);">Net 7 Days</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main);">Green Basket Supermarket</h3>
              <div style="font-size:22px; font-weight:800; color:#34d399; margin:6px 0;">PKR 18,750 Due</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Limit: PKR 100,000 (Available: PKR 81,250)</p>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: CUSTOMER STATEMENT
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>AUTOMATED STATEMENTS</span>
            </div>
            <h2 class="mkt-section-title">Professional Customer Statements.</h2>
            <p class="mkt-section-subtitle">
              Generate printable monthly ledgers showing opening balances, invoices, payments, and remaining balances.
            </p>
          </div>

          <!-- Printable Statement Mockup Card -->
          <div style="background:#ffffff; color:#111827; border-radius:var(--mkt-radius-md); padding:28px; max-width:550px; margin:32px auto 0 auto; font-family:var(--mkt-font-mono); font-size:12px; box-shadow:0 12px 30px rgba(0,0,0,0.5);">
            
            <div style="display:flex; justify-content:space-between; border-bottom:2px solid #111827; padding-bottom:8px; margin-bottom:12px;">
              <div>
                <b style="font-size:15px;">STATEMENT OF ACCOUNT</b>
                <div style="font-size:11px; color:#4b5563;">Universal ERP Commerce</div>
              </div>
              <div style="text-align:right;">
                <div>Period: 01/08/2026 – 31/08/2026</div>
                <div>Customer: Summit Tech Cafe</div>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between;"><span>Opening Balance</span><span>PKR 0.00</span></div>
              <div style="display:flex; justify-content:space-between;"><span>Total Billed Invoices (+)</span><span>PKR 172,480.00</span></div>
              <div style="display:flex; justify-content:space-between;"><span>Total Payments Received (−)</span><span>PKR 118,500.00</span></div>
              <div style="display:flex; justify-content:space-between;"><span>Credits & Returns (−)</span><span>PKR 0.00</span></div>
            </div>

            <div style="border-top:1px dashed #111827; padding-top:8px; display:flex; justify-content:space-between; font-weight:800; font-size:14px; color:#1e3a8a;">
              <span>CLOSING OUTSTANDING BALANCE</span>
              <span>PKR 53,980.00</span>
            </div>

            <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:8px;">
              <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:11px; color:#111827; border-color:#d1d5db;" onclick="window.triggerCRMToast('Statement PDF generated')">📥 Download PDF</button>
              <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:11px; color:#111827; border-color:#d1d5db;" onclick="window.triggerCRMToast('Statement sent to printer')">🖨️ Print</button>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: PAYMENT & RECEIVABLES
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>RECEIVABLES BALANCING</span>
            </div>
            <h2 class="mkt-section-title">Payments & Receivables Working Together.</h2>
            <p class="mkt-section-subtitle">
              Every customer payment is reconciled directly against unpaid invoices and updates the customer ledger balance in real time.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-top:32px;">
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:12px; color:var(--mkt-text-muted);">Total Receivables</div>
              <div style="font-size:22px; font-weight:800; color:#fbbf24; margin:4px 0;">PKR 284,500</div>
              <small style="color:var(--mkt-text-dim);">Across 184 active accounts</small>
            </div>
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:12px; color:var(--mkt-text-muted);">Due This Week</div>
              <div style="font-size:22px; font-weight:800; color:#60a5fa; margin:4px 0;">PKR 74,000</div>
              <small style="color:var(--mkt-text-dim);">Within normal terms</small>
            </div>
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:12px; color:var(--mkt-text-muted);">Overdue Balance</div>
              <div style="font-size:22px; font-weight:800; color:#f87171; margin:4px 0;">PKR 18,400</div>
              <small style="color:var(--mkt-text-dim);">Payment reminders active</small>
            </div>
          </div>

          <div style="text-align:center; margin-top:24px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/payments')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              Explore Payment Management →
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
              <span>CONNECTED RETURNS</span>
            </div>
            <h2 class="mkt-section-title">Handle Returns & Credits Without Friction.</h2>
            <p class="mkt-section-subtitle">
              When a customer returns an item, the balance is restored to customer credit or refunded in cash while inventory automatically replenishes.
            </p>
          </div>

          <!-- Return Workflow Box -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:20px;">
              <span class="mkt-pill">Original Invoice #INV-1038</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-pill">Items Verified</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-pill">Stock Restored (+1)</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-pill" style="background:rgba(16,185,129,0.2); color:#34d399;">✓ Customer Balance Credited</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:rgba(255,255,255,0.02); border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border); flex-wrap:wrap; gap:10px;">
              <div>
                <b>Credit Note #CRN-2026-0012</b>
                <div style="font-size:12px; color:var(--mkt-text-muted);">1x Dark Roast Coffee (Unopened) • Summit Tech Cafe</div>
              </div>
              <span class="badge in-stock" style="background:rgba(16,185,129,0.2); color:#34d399;">PKR 2,699 Credited</span>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 9: MULTI-LOCATION CUSTOMER ACTIVITY
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>OMNICHANNEL PROFILE</span>
            </div>
            <h2 class="mkt-section-title">One Customer Record Across Every Location.</h2>
            <p class="mkt-section-subtitle">
              Whether a VIP customer visits Store 01, orders from Store 02, or shops online, their purchase record remains consolidated.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:18px; margin-top:36px;">
            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">🏪</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Store 01 (Commercial)</h4>
              <div style="font-size:20px; font-weight:800; color:#60a5fa; margin:4px 0;">PKR 248,500</div>
              <small style="color:var(--mkt-text-muted);">In-person counter sales</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">🏪</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Store 02 (Mall Branch)</h4>
              <div style="font-size:20px; font-weight:800; color:#60a5fa; margin:4px 0;">PKR 182,300</div>
              <small style="color:var(--mkt-text-muted);">Weekend branch purchases</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">🛍️</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Online Store</h4>
              <div style="font-size:20px; font-weight:800; color:#34d399; margin:4px 0;">PKR 96,400</div>
              <small style="color:var(--mkt-text-muted);">Web orders dispatched</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.3);">
              <div style="font-size:26px; margin-bottom:8px;">🌐</div>
              <h4 style="font-size:15px; font-weight:700; color:#93c5fd;">Combined Account Spend</h4>
              <div style="font-size:22px; font-weight:800; color:#ffffff; margin:4px 0;">PKR 527,200</div>
              <small style="color:#60a5fa;">Consolidated CRM Ledger ✓</small>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 10: CUSTOMER SEARCH & SEGMENTATION (INTERACTIVE FILTER)
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>INSTANT SEARCH</span>
            </div>
            <h2 class="mkt-section-title">Search & Segment In Milliseconds.</h2>
            <p class="mkt-section-subtitle">
              Filter customers by status, credit tier, transaction volume, or payment reliability.
            </p>
          </div>

          <!-- Customer Directory Table Mockup -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:900px; margin:32px auto 0 auto;">
            
            <!-- Filter Pills -->
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:20px;">
              <button class="mkt-btn mkt-btn-secondary customer-seg-btn active" data-segment="all" onclick="window.filterCustomerSegmentation('all')" style="padding:6px 12px; font-size:12px;">All (2,840)</button>
              <button class="mkt-btn mkt-btn-secondary customer-seg-btn" data-segment="credit" onclick="window.filterCustomerSegmentation('credit')" style="padding:6px 12px; font-size:12px;">Credit Accounts (184)</button>
              <button class="mkt-btn mkt-btn-secondary customer-seg-btn" data-segment="vip" onclick="window.filterCustomerSegmentation('vip')" style="padding:6px 12px; font-size:12px;">VIP Partners (32)</button>
              <button class="mkt-btn mkt-btn-secondary customer-seg-btn" data-segment="overdue" onclick="window.filterCustomerSegmentation('overdue')" style="padding:6px 12px; font-size:12px;">Attention / Overdue (4)</button>
            </div>

            <!-- Table Rows -->
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>Customer</span>
                <span>Phone / Email</span>
                <span>Type</span>
                <span>Outstanding</span>
                <span>Status</span>
              </div>
              <div class="mkt-tbl-row customer-seg-row" data-segment="vip">
                <b>Summit Tech Cafe</b>
                <span>0300-1122334</span>
                <span>B2B Commercial</span>
                <b style="color:#fbbf24;">PKR 53,980</b>
                <span class="badge in-stock">Healthy</span>
              </div>
              <div class="mkt-tbl-row customer-seg-row" data-segment="credit">
                <b>Metro Retail Mart</b>
                <span>0321-9988776</span>
                <span>Wholesale Buyer</span>
                <b style="color:#60a5fa;">PKR 84,000</b>
                <span class="badge in-stock">Due in 3 Days</span>
              </div>
              <div class="mkt-tbl-row customer-seg-row" data-segment="vip">
                <b>Green Basket Supermarket</b>
                <span>0333-5544332</span>
                <span>Partner Chain</span>
                <b style="color:#34d399;">PKR 18,750</b>
                <span class="badge in-stock">Healthy</span>
              </div>
              <div class="mkt-tbl-row customer-seg-row" data-segment="overdue">
                <b>Al-Madina Coffee Kiosk</b>
                <span>0345-1234567</span>
                <span>Retail Kiosk</span>
                <b style="color:#f87171;">PKR 12,400</b>
                <span class="badge" style="background:rgba(239,68,68,0.2); color:#f87171;">Overdue</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 11: CUSTOMER → BUSINESS INSIGHTS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>CONNECTED ANALYTICS</span>
            </div>
            <h2 class="mkt-section-title">Customer Data Powering Your Business.</h2>
            <p class="mkt-section-subtitle">
              Customer activity directly updates sales trends, inventory forecasting, and financial cash flow ledgers.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-top:32px;">
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:12px; color:var(--mkt-text-muted);">Repeat Customers</div>
              <div style="font-size:22px; font-weight:800; color:#34d399; margin:4px 0;">68%</div>
              <small style="color:var(--mkt-text-dim);">High customer loyalty</small>
            </div>
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:12px; color:var(--mkt-text-muted);">Average Customer Value</div>
              <div style="font-size:22px; font-weight:800; color:#60a5fa; margin:4px 0;">PKR 18,450</div>
              <small style="color:var(--mkt-text-dim);">Monthly spend per account</small>
            </div>
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:12px; color:var(--mkt-text-muted);">Active Credit Lines</div>
              <div style="font-size:22px; font-weight:800; color:var(--mkt-text-main); margin:4px 0;">184 Accounts</div>
              <small style="color:var(--mkt-text-dim);">PKR 284.5k receivables</small>
            </div>
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:12px; color:var(--mkt-text-muted);">Monthly Customer Rev</div>
              <div style="font-size:22px; font-weight:800; color:#34d399; margin:4px 0;">PKR 5.28M</div>
              <small style="color:var(--mkt-text-dim);">Consolidated P&L</small>
            </div>
          </div>

          <div style="text-align:center; margin-top:28px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/reports')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              Explore Financial Reporting →
            </a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 12: FINAL CTA
           ========================================================================= -->
      <section class="mkt-section mkt-cta-section">
        <div class="mkt-container">
          <div class="mkt-cta-card">
            
            <h2 class="mkt-cta-title">Turn Every Customer Interaction<br>Into Business Intelligence.</h2>
            <p class="mkt-cta-desc">
              Keep customer relationships, sales, payments and credit connected from the first transaction to the next.
            </p>

            <div class="mkt-cta-actions">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                Start Free →
              </button>
              <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/product/sales')">
                Explore Sales
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
