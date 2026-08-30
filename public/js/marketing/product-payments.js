/**
 * Universal ERP — Payments & Expenses Dedicated Product Page (/product/payments)
 * Phase 23 — Step 10: Dedicated Payments, Expenses & Cash Drawer Solution Page
 */

// Client-Side Interactive Controllers
if (typeof window !== 'undefined') {
  window.switchPaymentMethod = (method) => {
    const btns = document.querySelectorAll('.tender-tab-btn');
    btns.forEach((b) => {
      if (b.getAttribute('data-tender') === method) b.classList.add('active');
      else b.classList.remove('active');
    });

    const displayBox = document.getElementById('tender-details-display');
    if (!displayBox) return;

    if (method === 'card') {
      displayBox.innerHTML = `
        <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Card Terminal Integration</div>
              <div style="font-weight:700; font-size:15px; margin-top:2px;">💳 POS Card Swiper / Contactless</div>
              <div style="font-size:12px; color:var(--mkt-text-muted);">Batch Authorization #AUTH-9921 • Visa/Mastercard</div>
            </div>
            <span class="badge in-stock">Terminal Connected</span>
          </div>
        </div>
      `;
    } else if (method === 'bank') {
      displayBox.innerHTML = `
        <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Direct Bank Transfer (IBFT)</div>
              <div style="font-weight:700; font-size:15px; margin-top:2px;">🏦 Meezan Bank Operating Account</div>
              <div style="font-size:12px; color:var(--mkt-text-muted);">PK60MEZN0001234567890101 • Ref #TX-88390</div>
            </div>
            <span class="badge in-stock">Instant Reconciliation</span>
          </div>
        </div>
      `;
    } else if (method === 'credit') {
      displayBox.innerHTML = `
        <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Customer Credit Account</div>
              <div style="font-weight:700; font-size:15px; margin-top:2px;">🛡️ Summit Tech Cafe (Net 15 Days)</div>
              <div style="font-size:12px; color:var(--mkt-text-muted);">Available: PKR 446,020 • Limit: PKR 500,000</div>
            </div>
            <span class="badge in-stock">Credit Approved</span>
          </div>
        </div>
      `;
    } else {
      // Default: Cash
      displayBox.innerHTML = `
        <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; text-align:center;">
            <div>
              <div style="font-size:11px; color:var(--mkt-text-dim);">Bill Total</div>
              <div style="font-size:16px; font-weight:800; color:var(--mkt-text-main);">PKR 5,000</div>
            </div>
            <div>
              <div style="font-size:11px; color:var(--mkt-text-dim);">Cash Received</div>
              <div style="font-size:16px; font-weight:800; color:#34d399;">PKR 5,500</div>
            </div>
            <div>
              <div style="font-size:11px; color:var(--mkt-text-dim);">Change Due</div>
              <div style="font-size:16px; font-weight:800; color:#fbbf24;">PKR 500</div>
            </div>
          </div>
        </div>
      `;
    }
  };

  window.filterPaymentHistory = (method) => {
    const rows = document.querySelectorAll('.payment-hist-row');
    const filterBtns = document.querySelectorAll('.payment-filter-btn');

    filterBtns.forEach((btn) => {
      if (btn.getAttribute('data-method') === method) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    rows.forEach((r) => {
      const rowMethod = r.getAttribute('data-method');
      if (method === 'all' || rowMethod === method) {
        r.style.display = 'flex';
      } else {
        r.style.display = 'none';
      }
    });
  };

  window.closeCashRegisterDemo = () => {
    const toast = document.getElementById('pmt-action-toast');
    if (toast) {
      toast.innerText = '✓ Cash drawer session closed with 0 variance. Z-Report printed & synced to Ledger.';
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 4000);
    }
  };

  window.recordExpenseDemo = () => {
    const amountInput = document.getElementById('demo-expense-amount')?.value || '4,500';
    const catInput = document.getElementById('demo-expense-cat')?.value || 'Utilities';
    const toast = document.getElementById('pmt-action-toast');
    if (toast) {
      toast.innerText = `✓ Expense of PKR ${amountInput} recorded under ${catInput}. Cash drawer updated.`;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 4000);
    }
  };

  window.triggerPaymentToast = (msg) => {
    const toast = document.getElementById('pmt-action-toast');
    if (toast) {
      toast.innerText = `✓ ${msg}`;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3500);
    }
  };
}

export function renderProductPaymentsPage() {
  return `
    <div class="marketing-wrapper" id="marketing-root">
      <div class="mkt-ambient-glow"></div>

      <!-- Action Feedback Toast -->
      <div id="pmt-action-toast" style="display:none; position:fixed; bottom:24px; right:24px; z-index:9999; background:#10b981; color:#ffffff; padding:12px 20px; border-radius:var(--mkt-radius-md); font-weight:700; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
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
                <span>PAYMENTS & EXPENSES</span>
              </div>

              <h1 class="mkt-hero-title">
                Every Payment. Every Expense.<br>
                <span class="mkt-gradient-text-accent">One Connected Money System.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Track cash, card, bank transfers, customer credit, expenses and daily store balances without losing the connection between sales and finance.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Start Managing Payments</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#payments-demo" style="text-decoration:none;">
                  <span>See Payments In Action</span>
                </a>
              </div>

              <!-- Quick Badges -->
              <div style="display:flex; gap:16px; margin-top:28px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-muted);">
                <span>✓ Multi-Tender Splitting</span>
                <span>•</span>
                <span>✓ Blind Cash Drawer Closing</span>
                <span>•</span>
                <span>✓ Automated Ledger Ingestion</span>
              </div>
            </div>

            <!-- Financial Command Center Mockup -->
            <div class="mkt-hero-right" id="payments-demo">
              <div class="mkt-dash-preview-frame">
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/finance/cash</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>MONEY HUB</span>
                  </div>
                </div>

                <div class="mkt-dash-body" style="padding:16px;">
                  
                  <!-- Metric Cards -->
                  <div class="mkt-dash-metrics-grid" style="margin-bottom:14px;">
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Today's Collections</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono);">PKR 248,500</div>
                      <div class="mkt-dash-stat-trend positive">↑ 38 Transactions</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Cash In Drawer</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono);">PKR 85,970</div>
                      <div class="mkt-dash-stat-trend positive">● Reconciled</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Card & Bank Transfers</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono);">PKR 119,280</div>
                      <div class="mkt-dash-stat-trend neutral">💳 Direct Settle</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Store Expenses Logged</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono); color:#f87171;">PKR 18,400</div>
                      <div class="mkt-dash-stat-trend neutral">4 Petty Cash Slips</div>
                    </div>
                  </div>

                  <!-- Tender Distribution Breakdown -->
                  <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-bottom:14px; background:rgba(255,255,255,0.02); padding:10px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border); text-align:center;">
                    <div>
                      <div style="font-size:10px; color:var(--mkt-text-dim);">Cash (42%)</div>
                      <b style="font-size:12px; color:#34d399; font-family:var(--mkt-font-mono);">PKR 104,370</b>
                    </div>
                    <div>
                      <div style="font-size:10px; color:var(--mkt-text-dim);">Card (28%)</div>
                      <b style="font-size:12px; color:#60a5fa; font-family:var(--mkt-font-mono);">PKR 69,580</b>
                    </div>
                    <div>
                      <div style="font-size:10px; color:var(--mkt-text-dim);">Bank (20%)</div>
                      <b style="font-size:12px; color:#a78bfa; font-family:var(--mkt-font-mono);">PKR 49,700</b>
                    </div>
                    <div>
                      <div style="font-size:10px; color:var(--mkt-text-dim);">Credit (10%)</div>
                      <b style="font-size:12px; color:#fbbf24; font-family:var(--mkt-font-mono);">PKR 24,850</b>
                    </div>
                  </div>

                  <!-- Live Payment Activity Feed -->
                  <div class="mkt-dash-feed-box">
                    <div class="mkt-dash-feed-header">
                      <span class="mkt-feed-title">Recent Money Movement</span>
                      <span class="mkt-badge mkt-badge-cyan">Live Ledger</span>
                    </div>
                    <div class="mkt-dash-feed-list">
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#10b981;"></span>
                          <span>Cash collection #PMT-4012: PKR 5,000 for INV-1042</span>
                        </div>
                        <span class="mkt-activity-time">2m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#f87171;"></span>
                          <span>Store petty cash expense: PKR 2,400 (Store cleaning supplies)</span>
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
           SECTION 2: ONE SALE, ONE CONNECTED PAYMENT
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>UNIFIED TRANSACTION FLOW</span>
            </div>
            <h2 class="mkt-section-title">One Sale. One Connected Payment.</h2>
            <p class="mkt-section-subtitle">
              Every checkout automatically books the payment tender, prints the receipt, updates the customer balance, and adjusts cash positions.
            </p>
          </div>

          <!-- Connected Transaction Pipeline Diagram -->
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-top:36px;">
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">👤</div><b>1. Customer</b><small>Identified</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">🧾</div><b>2. Invoice</b><small>INV-1042</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active" style="min-width:110px;"><div class="node-icon">💳</div><b>3. Tender</b><small>Multi-Method</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:110px;"><div class="node-icon">📥</div><b>4. Receipt</b><small>Auto Printed</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">⚖️</div><b>5. Ledger</b><small>Balance Sync</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:110px;"><div class="node-icon">📊</div><b>6. P&L</b><small>Live Margin</small></div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: MULTI-TENDER PAYMENTS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>FLEXIBLE CHECKOUT</span>
            </div>
            <h2 class="mkt-section-title">Accept Any Tender. Split Easily.</h2>
            <p class="mkt-section-subtitle">
              Accept cash, credit cards, direct bank wire transfers, or charge customer credit accounts with automatic change calculations.
            </p>
          </div>

          <!-- Multi-Tender Interactive Terminal Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px; max-width:750px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--mkt-border); padding-bottom:14px; flex-wrap:wrap; gap:12px;">
              <div>
                <b style="font-size:16px;">Tender Terminal • Invoice #INV-1042</b>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Customer: Summit Tech Cafe</div>
              </div>
              <div style="font-size:18px; font-weight:800; color:#34d399; font-family:var(--mkt-font-mono);">
                Total: PKR 5,000.00
              </div>
            </div>

            <!-- Tender Selector Pills -->
            <div class="mkt-tour-tabs" style="margin-bottom:20px;">
              <button class="mkt-tab-btn tender-tab-btn active" data-tender="cash" onclick="window.switchPaymentMethod('cash')">💵 Cash Tender</button>
              <button class="mkt-tab-btn tender-tab-btn" data-tender="card" onclick="window.switchPaymentMethod('card')">💳 Card Swipe</button>
              <button class="mkt-tab-btn tender-tab-btn" data-tender="bank" onclick="window.switchPaymentMethod('bank')">🏦 Bank Wire</button>
              <button class="mkt-tab-btn tender-tab-btn" data-tender="credit" onclick="window.switchPaymentMethod('credit')">🛡️ Customer Credit</button>
            </div>

            <!-- Tender Details Display Box -->
            <div id="tender-details-display" style="margin-bottom:20px;">
              <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; text-align:center;">
                  <div>
                    <div style="font-size:11px; color:var(--mkt-text-dim);">Bill Total</div>
                    <div style="font-size:16px; font-weight:800; color:var(--mkt-text-main); font-family:var(--mkt-font-mono);">PKR 5,000</div>
                  </div>
                  <div>
                    <div style="font-size:11px; color:var(--mkt-text-dim);">Cash Received</div>
                    <div style="font-size:16px; font-weight:800; color:#34d399; font-family:var(--mkt-font-mono);">PKR 5,500</div>
                  </div>
                  <div>
                    <div style="font-size:11px; color:var(--mkt-text-dim);">Change Due</div>
                    <div style="font-size:16px; font-weight:800; color:#fbbf24; font-family:var(--mkt-font-mono);">PKR 500</div>
                  </div>
                </div>
              </div>
            </div>

            <div style="text-align:right;">
              <button class="mkt-btn mkt-btn-primary" onclick="window.triggerPaymentToast('Payment settled and receipt generated')">
                Complete Payment & Print Receipt ✓
              </button>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: CASH DRAWER & DAILY CLOSING
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>REGISTER RECONCILIATION</span>
            </div>
            <h2 class="mkt-section-title">Cash Drawer & Daily Shift Closing.</h2>
            <p class="mkt-section-subtitle">
              Perform structured opening floats, track cash inflows and petty cash outlays, and perform blind register counts at shift end.
            </p>
          </div>

          <!-- Cash Drawer Reconciliation Card -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:800px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--mkt-border); padding-bottom:12px; flex-wrap:wrap; gap:12px;">
              <div>
                <b style="font-size:16px;">Daily Register Session #REG-0142</b>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Terminal: Store 01 Main Counter • Cashier: Fatima Noor</div>
              </div>
              <span class="badge in-stock">● ACTIVE SESSION</span>
            </div>

            <!-- Mathematical Breakdown Table -->
            <div class="mkt-mockup-table" style="margin-bottom:16px;">
              <div class="mkt-tbl-row">
                <span>Opening Cash Float</span>
                <span style="font-family:var(--mkt-font-mono);">+ PKR 15,000</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Cash Sales Received</span>
                <span style="color:#34d399; font-family:var(--mkt-font-mono);">+ PKR 89,370</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Customer Debt Collections (Cash)</span>
                <span style="color:#34d399; font-family:var(--mkt-font-mono);">+ PKR 15,000</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Petty Cash Expenses Paid</span>
                <span style="color:#f87171; font-family:var(--mkt-font-mono);">− PKR 10,400</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Cash Customer Refunds Paid</span>
                <span style="color:#f87171; font-family:var(--mkt-font-mono);">− PKR 2,699</span>
              </div>
            </div>

            <!-- Expected vs Counted Summary -->
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; background:rgba(255,255,255,0.02); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border); text-align:center; margin-bottom:20px;">
              <div>
                <div style="font-size:11px; color:var(--mkt-text-dim);">System Expected Cash</div>
                <div style="font-size:17px; font-weight:800; color:var(--mkt-text-main); font-family:var(--mkt-font-mono);">PKR 106,271</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--mkt-text-dim);">Physical Cash Counted</div>
                <div style="font-size:17px; font-weight:800; color:#34d399; font-family:var(--mkt-font-mono);">PKR 106,271</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--mkt-text-dim);">Variance</div>
                <div style="font-size:17px; font-weight:800; color:#60a5fa; font-family:var(--mkt-font-mono);">PKR 0.00 (Exact)</div>
              </div>
            </div>

            <div style="text-align:right;">
              <button class="mkt-btn mkt-btn-primary" onclick="window.closeCashRegisterDemo()">
                🔒 Close Shift & Print Z-Report
              </button>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: PAYMENT HISTORY
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>TRANSACTION AUDIT</span>
            </div>
            <h2 class="mkt-section-title">Trace Every Penny Collected.</h2>
            <p class="mkt-section-subtitle">
              Filter payment vouchers across tender types, sales invoices, and refund reversals.
            </p>
          </div>

          <!-- Payment History Table Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:900px; margin:32px auto 0 auto;">
            
            <!-- Filters -->
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:20px;">
              <button class="mkt-btn mkt-btn-secondary payment-filter-btn active" data-method="all" onclick="window.filterPaymentHistory('all')" style="padding:6px 12px; font-size:12px;">All</button>
              <button class="mkt-btn mkt-btn-secondary payment-filter-btn" data-method="cash" onclick="window.filterPaymentHistory('cash')" style="padding:6px 12px; font-size:12px;">Cash</button>
              <button class="mkt-btn mkt-btn-secondary payment-filter-btn" data-method="card" onclick="window.filterPaymentHistory('card')" style="padding:6px 12px; font-size:12px;">Card</button>
              <button class="mkt-btn mkt-btn-secondary payment-filter-btn" data-method="bank" onclick="window.filterPaymentHistory('bank')" style="padding:6px 12px; font-size:12px;">Bank Transfer</button>
              <button class="mkt-btn mkt-btn-secondary payment-filter-btn" data-method="credit" onclick="window.filterPaymentHistory('credit')" style="padding:6px 12px; font-size:12px;">Credit</button>
              <button class="mkt-btn mkt-btn-secondary payment-filter-btn" data-method="refund" onclick="window.filterPaymentHistory('refund')" style="padding:6px 12px; font-size:12px;">Refunds</button>
            </div>

            <!-- Table Rows -->
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>Payment ID</span>
                <span>Date</span>
                <span>Customer / Memo</span>
                <span>Method</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              <div class="mkt-tbl-row payment-hist-row" data-method="cash">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PMT-4012</span>
                <span>Today</span>
                <span>Summit Tech Cafe (INV-1042)</span>
                <span>💵 Cash</span>
                <b style="color:#34d399; font-family:var(--mkt-font-mono);">PKR 5,000</b>
                <span class="badge in-stock">Cleared</span>
              </div>
              <div class="mkt-tbl-row payment-hist-row" data-method="card">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PMT-4011</span>
                <span>Today</span>
                <span>Walk-in Customer (INV-1041)</span>
                <span>💳 Visa / POS</span>
                <b style="color:#60a5fa; font-family:var(--mkt-font-mono);">PKR 12,400</b>
                <span class="badge in-stock">Settled</span>
              </div>
              <div class="mkt-tbl-row payment-hist-row" data-method="bank">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PMT-4008</span>
                <span>Yesterday</span>
                <span>Metro Retail Mart (INV-1035)</span>
                <span>🏦 IBFT Wire</span>
                <b style="color:#a78bfa; font-family:var(--mkt-font-mono);">PKR 42,800</b>
                <span class="badge in-stock">Reconciled</span>
              </div>
              <div class="mkt-tbl-row payment-hist-row" data-method="refund">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PMT-4004</span>
                <span>25 Aug 2026</span>
                <span>Return Refund (RET-0012)</span>
                <span>↩️ Cash Reversal</span>
                <b style="color:#f87171; font-family:var(--mkt-font-mono);">−PKR 2,699</b>
                <span class="badge" style="background:rgba(239,68,68,0.2); color:#f87171;">Refunded</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: CUSTOMER CREDIT & RECEIVABLES
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>RECEIVABLES GOVERNANCE</span>
            </div>
            <h2 class="mkt-section-title">Customer Credit & Receivables Control.</h2>
            <p class="mkt-section-subtitle">
              Allow trusted B2B clients to purchase on credit terms while enforcing hard credit ceilings and tracking aging receivables.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge in-stock">● HEALTHY</span>
                <span style="font-size:12px; color:var(--mkt-text-muted);">Net 15 Days</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main);">Summit Tech Cafe</h3>
              <div style="font-size:22px; font-weight:800; color:#fbbf24; margin:6px 0; font-family:var(--mkt-font-mono);">PKR 53,980 Due</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Limit: PKR 500,000 (Available: PKR 446,020)</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge low-stock">● DUE SOON</span>
                <span style="font-size:12px; color:var(--mkt-text-muted);">Net 30 Days</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main);">Metro Retail Mart</h3>
              <div style="font-size:22px; font-weight:800; color:#60a5fa; margin:6px 0; font-family:var(--mkt-font-mono);">PKR 84,000 Due</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Limit: PKR 250,000 (Due in 3 Days)</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge in-stock">● HEALTHY</span>
                <span style="font-size:12px; color:var(--mkt-text-muted);">Net 7 Days</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main);">Green Basket Supermarket</h3>
              <div style="font-size:22px; font-weight:800; color:#34d399; margin:6px 0; font-family:var(--mkt-font-mono);">PKR 18,750 Due</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Limit: PKR 100,000 (Available: PKR 81,250)</p>
            </div>

          </div>

          <div style="text-align:center; margin-top:28px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/customers')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              Explore Full CRM & Customer Directory →
            </a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: EXPENSE MANAGEMENT
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>EXPENSE LOGGING</span>
            </div>
            <h2 class="mkt-section-title">Record Store & Operating Expenses.</h2>
            <p class="mkt-section-subtitle">
              Log utilities, store supplies, transportation, and maintenance costs straight from the register or dashboard.
            </p>
          </div>

          <!-- Expense Dashboard & Form Frame -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; max-width:850px; margin:32px auto 0 auto;">
            
            <!-- Expense Metrics & Categories -->
            <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:24px;">
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:16px;">Expense Breakdown</h3>
              <div style="display:flex; flex-direction:column; gap:10px;">
                <div style="display:flex; justify-content:space-between; font-size:13px;"><span>🏢 Store Rent & Facilities</span><b style="font-family:var(--mkt-font-mono);">PKR 120,000</b></div>
                <div style="display:flex; justify-content:space-between; font-size:13px;"><span>⚡ Electricity & Utilities</span><b style="font-family:var(--mkt-font-mono);">PKR 45,200</b></div>
                <div style="display:flex; justify-content:space-between; font-size:13px;"><span>🚚 Freight & Dispatch</span><b style="font-family:var(--mkt-font-mono);">PKR 32,400</b></div>
                <div style="display:flex; justify-content:space-between; font-size:13px;"><span>🧹 Store Cleaning Supplies</span><b style="font-family:var(--mkt-font-mono);">PKR 18,400</b></div>
              </div>
              <div style="border-top:1px solid var(--mkt-border); padding-top:12px; margin-top:16px; display:flex; justify-content:space-between; font-weight:800; color:#f87171;">
                <span>Total Monthly Expenses</span>
                <span style="font-family:var(--mkt-font-mono);">PKR 216,000</span>
              </div>
            </div>

            <!-- Quick Record Expense Interactive Form -->
            <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:24px;">
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:16px;">Quick Record Expense</h3>
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                  <label style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Expense Amount (PKR)</label>
                  <input type="text" id="demo-expense-amount" value="4,500" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--mkt-border); padding:8px 12px; border-radius:var(--mkt-radius-md); color:#fff; font-family:var(--mkt-font-mono); margin-top:4px;" />
                </div>
                <div>
                  <label style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Category</label>
                  <select id="demo-expense-cat" style="width:100%; background:#1e293b; border:1px solid var(--mkt-border); padding:8px 12px; border-radius:var(--mkt-radius-md); color:#fff; margin-top:4px;">
                    <option value="Utilities">Utilities & Electricity</option>
                    <option value="Supplies">Store Packaging & Supplies</option>
                    <option value="Transport">Delivery & Transport</option>
                    <option value="Maintenance">Equipment Maintenance</option>
                  </select>
                </div>
                <button class="mkt-btn mkt-btn-primary" style="margin-top:8px;" onclick="window.recordExpenseDemo()">
                  + Log Expense Voucher
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: REFUNDS & PAYMENT REVERSALS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>REVERSAL TRACEABILITY</span>
            </div>
            <h2 class="mkt-section-title">Connected Refunds & Payment Reversals.</h2>
            <p class="mkt-section-subtitle">
              Refunds link directly to original transaction invoices, reversing payment debits and returning items to inventory.
            </p>
          </div>

          <!-- Refund Workflow Box -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:20px;">
              <span class="mkt-pill">Original Invoice #INV-1038</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-pill">Return Slip #RET-0012</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-pill" style="background:rgba(239,68,68,0.2); color:#f87171;">Cash Reversal: PKR 2,699</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-pill" style="background:rgba(16,185,129,0.2); color:#34d399;">✓ Stock Restored (+1)</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:rgba(255,255,255,0.02); border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border); flex-wrap:wrap; gap:10px;">
              <div>
                <b>Audit Ref: REF-2026-009</b>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Authorized by Store Manager • Drawer balance updated automatically</div>
              </div>
              <span class="badge in-stock">Reversal Reconciled</span>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 9: MULTI-LOCATION MONEY
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>CONSOLIDATED FINANCIALS</span>
            </div>
            <h2 class="mkt-section-title">Multi-Location Financial Control.</h2>
            <p class="mkt-section-subtitle">
              Monitor sales collections, cash drawer sessions, and expenses across retail stores, warehouse hubs, and online sales.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:18px; margin-top:36px;">
            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">🏪</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Store 01 (Commercial)</h4>
              <div style="font-size:20px; font-weight:800; color:#34d399; margin:4px 0; font-family:var(--mkt-font-mono);">PKR 248,500</div>
              <small style="color:var(--mkt-text-muted);">Drawer: PKR 85,970</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">🏪</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Store 02 (Mall Branch)</h4>
              <div style="font-size:20px; font-weight:800; color:#60a5fa; margin:4px 0; font-family:var(--mkt-font-mono);">PKR 182,300</div>
              <small style="color:var(--mkt-text-muted);">Drawer: PKR 62,400</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">🛍️</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Online Store</h4>
              <div style="font-size:20px; font-weight:800; color:#a78bfa; margin:4px 0; font-family:var(--mkt-font-mono);">PKR 96,400</div>
              <small style="color:var(--mkt-text-muted);">Digital Gateway Settle</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.3);">
              <div style="font-size:26px; margin-bottom:8px;">🌐</div>
              <h4 style="font-size:15px; font-weight:700; color:#93c5fd;">Combined Cash Position</h4>
              <div style="font-size:22px; font-weight:800; color:#ffffff; margin:4px 0; font-family:var(--mkt-font-mono);">PKR 527,200</div>
              <small style="color:#60a5fa;">Real-Time Liquidity ✓</small>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 10: PAYMENT → FINANCE PIPELINE
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>FINANCIAL PIPELINE</span>
            </div>
            <h2 class="mkt-section-title">From POS Checkout To Financial Statements.</h2>
            <p class="mkt-section-subtitle">
              Every payment voucher, register closing, and expense voucher feeds straight into double-entry ledgers and P&L statements.
            </p>
          </div>

          <!-- Data Pipeline Sequence -->
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-top:36px;">
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">🛒</div><b>1. Sales</b><small>INV-1042</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active" style="min-width:115px;"><div class="node-icon">💳</div><b>2. Payment</b><small>Multi-Tender</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">⚖️</div><b>3. Ledgers</b><small>Customer/Vendor</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">💵</div><b>4. Cash Flow</b><small>Drawer Balances</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:115px;"><div class="node-icon">📊</div><b>5. P&L Reports</b><small>Gross Margin</small></div>
          </div>

          <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap; margin-top:32px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/sales')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Sales Invoicing</a>
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/customers')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Customer CRM</a>
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Inventory Ledger</a>
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/reports')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ P&L Reports</a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 11: CONTROL, SECURITY & AUDIT
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>FINANCIAL INTEGRITY</span>
            </div>
            <h2 class="mkt-section-title">Control, Security & Complete Auditability.</h2>
            <p class="mkt-section-subtitle">
              Strict role-based access controls prevent cashier discrepancies and provide full audit trails for every cash transaction.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:10px;">👑</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Owner Role</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Full financial visibility, profit and loss analytics, bank reconciliation, and global payout authorizations.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:10px;">🛡️</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Store Manager</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Manage branch cash drawer sessions, authorize customer refunds, and log store petty cash expenses.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:10px;">💳</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Cashier Operator</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Checkout customer baskets, accept split tenders, and calculate change with zero access to company financial ledgers.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:10px;">📋</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Immutable Audit Trail</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Every invoice, payment voucher, drawer shift, and refund maintains a permanent timestamped audit trail.</p>
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
            
            <h2 class="mkt-cta-title">Know Where Your Money Came From.<br>Where It Went. And What You Have.</h2>
            <p class="mkt-cta-desc">
              Connect sales, expenses, cash registers, receivables and accounting into one real-time financial system.
            </p>

            <div class="mkt-cta-actions">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                Start Free →
              </button>
              <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/product/reports')">
                Explore Reports
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
