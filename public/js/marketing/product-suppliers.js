/**
 * Universal ERP — Suppliers & Vendors Dedicated Product Page (/product/suppliers)
 * Phase 23 — Step 9: Dedicated Supplier Management, Payables & Procurement Hub
 */

// Client-Side Interactive Controllers
if (typeof window !== 'undefined') {
  window.switchSupplierProfileTab = (tabKey) => {
    const tabs = ['overview', 'pos', 'grn', 'bills', 'payments', 'ledger'];
    tabs.forEach((k) => {
      const tabEl = document.getElementById(`sup-tab-${k}`);
      if (tabEl) {
        if (k === tabKey) tabEl.classList.add('active');
        else tabEl.classList.remove('active');
      }
    });

    const contentBox = document.getElementById('sup-profile-tab-content');
    if (!contentBox) return;

    if (tabKey === 'pos') {
      contentBox.innerHTML = `
        <div class="mkt-mockup-table">
          <div class="mkt-tbl-row head"><span>PO #</span><span>Date</span><span>Destination</span><span>Amount</span><span>Status</span></div>
          <div class="mkt-tbl-row"><span>PO-1048</span><span>15 Sep 2026</span><span>Central Warehouse</span><b>PKR 105,500</b><span class="badge low-stock">PARTIAL</span></div>
          <div class="mkt-tbl-row"><span>PO-1035</span><span>02 Aug 2026</span><span>Central Warehouse</span><b>PKR 94,000</b><span class="badge in-stock">RECEIVED</span></div>
          <div class="mkt-tbl-row"><span>PO-1022</span><span>18 Jul 2026</span><span>Store 01</span><b>PKR 78,500</b><span class="badge in-stock">PAID</span></div>
        </div>
      `;
    } else if (tabKey === 'grn') {
      contentBox.innerHTML = `
        <div class="mkt-mockup-table">
          <div class="mkt-tbl-row head"><span>GRN #</span><span>Linked PO</span><span>Date</span><span>Items Received</span><span>Variance</span></div>
          <div class="mkt-tbl-row"><span>GRN-2031</span><span>PO-1048</span><span>Today</span><span>38/40 Coffee Bags</span><span style="color:#f87171;">−2 Damaged</span></div>
          <div class="mkt-tbl-row"><span>GRN-2018</span><span>PO-1035</span><span>03 Aug 2026</span><span>50/50 Green Tea</span><span style="color:#34d399;">0 (Exact)</span></div>
        </div>
      `;
    } else if (tabKey === 'bills') {
      contentBox.innerHTML = `
        <div class="mkt-mockup-table">
          <div class="mkt-tbl-row head"><span>Bill #</span><span>Invoice Date</span><span>Due Date</span><span>Amount</span><span>Status</span></div>
          <div class="mkt-tbl-row"><span>BIL-892</span><span>15 Sep 2026</span><span>20 Sep 2026</span><b>PKR 84,500</b><span class="badge in-stock">UNPAID</span></div>
          <div class="mkt-tbl-row"><span>BIL-874</span><span>02 Aug 2026</span><span>15 Aug 2026</span><b>PKR 94,000</b><span class="badge in-stock">PAID</span></div>
        </div>
      `;
    } else if (tabKey === 'payments') {
      contentBox.innerHTML = `
        <div class="mkt-mockup-table">
          <div class="mkt-tbl-row head"><span>Voucher #</span><span>Payment Date</span><span>Account</span><span>Amount Paid</span><span>Method</span></div>
          <div class="mkt-tbl-row"><span>PMT-4012</span><span>18 Aug 2026</span><span>MBL Operating Acc</span><b>PKR 94,000</b><span>Bank Transfer</span></div>
          <div class="mkt-tbl-row"><span>PMT-3995</span><span>20 Jul 2026</span><span>MBL Operating Acc</span><b>PKR 78,500</b><span>Bank Transfer</span></div>
        </div>
      `;
    } else if (tabKey === 'ledger') {
      contentBox.innerHTML = `
        <div class="mkt-mockup-table">
          <div class="mkt-tbl-row head"><span>Date</span><span>Reference</span><span>Debit</span><span>Credit</span><span>Running Balance</span></div>
          <div class="mkt-tbl-row"><span>01/08/2026</span><span>Opening Balance</span><span>—</span><span>—</span><b>PKR 0.00</b></div>
          <div class="mkt-tbl-row"><span>15/08/2026</span><span>Supplier Bill #BIL-892</span><span>—</span><span>PKR 105,500</span><b>PKR 105,500</b></div>
          <div class="mkt-tbl-row"><span>18/08/2026</span><span>Payment #PMT-4012</span><span>PKR 21,000</span><span>—</span><b style="color:#fbbf24;">PKR 84,500</b></div>
        </div>
      `;
    } else {
      // Default: Overview
      contentBox.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="font-size:11px; color:var(--mkt-text-muted);">Total Lifetime Procurement</div>
            <div style="font-size:16px; font-weight:800; color:#34d399; margin-top:2px;">PKR 1,845,000</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="font-size:11px; color:var(--mkt-text-muted);">Purchase Orders Issued</div>
            <div style="font-size:16px; font-weight:800; color:var(--mkt-text-main); margin-top:2px;">18 POs Total</div>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
            <div style="font-size:11px; color:var(--mkt-text-muted);">Fulfillment Reliability</div>
            <div style="font-size:16px; font-weight:800; color:#60a5fa; margin-top:2px;">98.2% On-Time</div>
          </div>
        </div>
      `;
    }
  };

  window.filterSupplierPurchaseHistory = (status) => {
    const rows = document.querySelectorAll('.sup-po-row');
    const filterBtns = document.querySelectorAll('.sup-po-filter-btn');

    filterBtns.forEach((btn) => {
      if (btn.getAttribute('data-status') === status) btn.classList.add('active');
      else btn.classList.remove('active');
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

  window.filterSupplierDirectory = (segment) => {
    const rows = document.querySelectorAll('.sup-dir-row');
    const filterBtns = document.querySelectorAll('.sup-dir-btn');

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

  window.createSupplierPurchaseDraft = (sku, name, qty, supplier) => {
    const toast = document.getElementById('sup-action-toast');
    if (toast) {
      toast.innerText = `✓ Draft PO created for ${qty}x ${name} (${sku}) with ${supplier}.`;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 4000);
    }
  };

  window.triggerSupplierToast = (msg) => {
    const toast = document.getElementById('sup-action-toast');
    if (toast) {
      toast.innerText = `✓ ${msg}`;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3500);
    }
  };
}

export function renderProductSuppliersPage() {
  return `
    <div class="marketing-wrapper" id="marketing-root">
      <div class="mkt-ambient-glow"></div>

      <!-- Action Feedback Toast -->
      <div id="sup-action-toast" style="display:none; position:fixed; bottom:24px; right:24px; z-index:9999; background:#10b981; color:#ffffff; padding:12px 20px; border-radius:var(--mkt-radius-md); font-weight:700; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
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
                <span>SUPPLIERS & VENDORS</span>
              </div>

              <h1 class="mkt-hero-title">
                Know Who You Buy From.<br>
                <span class="mkt-gradient-text-accent">What You Bought. And What You Owe.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Keep supplier profiles, purchase orders, goods receipts, bills, payment terms and outstanding balances connected in one place.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Manage Suppliers</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#supplier-demo" style="text-decoration:none;">
                  <span>See Supplier Management In Action</span>
                </a>
              </div>

              <!-- Quick Badges -->
              <div style="display:flex; gap:16px; margin-top:28px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-muted);">
                <span>✓ 360° Vendor Ledgers</span>
                <span>•</span>
                <span>✓ Goods Receiving (GRN)</span>
                <span>•</span>
                <span>✓ Automated AP Matching</span>
              </div>
            </div>

            <!-- Supplier Command Center Mockup -->
            <div class="mkt-hero-right" id="supplier-demo">
              <div class="mkt-dash-preview-frame">
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/suppliers</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>VENDOR DIRECTORY</span>
                  </div>
                </div>

                <div class="mkt-dash-body" style="padding:16px;">
                  
                  <!-- Metric Cards -->
                  <div class="mkt-dash-metrics-grid" style="margin-bottom:14px;">
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Total Suppliers</div>
                      <div class="mkt-dash-stat-value">184</div>
                      <div class="mkt-dash-stat-trend positive">● Verified Directory</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Active Suppliers</div>
                      <div class="mkt-dash-stat-value">162</div>
                      <div class="mkt-dash-stat-trend positive">↑ Transacting</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Open Purchase Orders</div>
                      <div class="mkt-dash-stat-value">12 POs</div>
                      <div class="mkt-dash-stat-trend neutral">6 Inbound Docks</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Outstanding Payables</div>
                      <div class="mkt-dash-stat-value">PKR 284,500</div>
                      <div class="mkt-dash-stat-trend neutral">3 Terms Active</div>
                    </div>
                  </div>

                  <!-- Live Supplier Activity Feed -->
                  <div class="mkt-dash-feed-box">
                    <div class="mkt-dash-feed-header">
                      <span class="mkt-feed-title">Recent Supplier Activity</span>
                      <span class="mkt-badge mkt-badge-cyan">Live Feed</span>
                    </div>
                    <div class="mkt-dash-feed-list">
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#3b82f6;"></span>
                          <span>PO-1048 issued to Direct Trade Coffee (PKR 105,500)</span>
                        </div>
                        <span class="mkt-activity-time">10m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#10b981;"></span>
                          <span>GRN-2031 verified: 38/40 bags received into Central Warehouse</span>
                        </div>
                        <span class="mkt-activity-time">35m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#8b5cf6;"></span>
                          <span>Payment voucher PMT-4012 disbursed: PKR 94,000 to Metro Wholesale</span>
                        </div>
                        <span class="mkt-activity-time">2h ago</span>
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
           SECTION 2: SUPPLIER 360° PROFILE
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>SUPPLIER 360° RECORD</span>
            </div>
            <h2 class="mkt-section-title">Every Supplier. One Complete Record.</h2>
            <p class="mkt-section-subtitle">
              Maintain supplier terms, contact persons, tax registration NTNs, bank accounts, and procurement histories in one unified profile.
            </p>
          </div>

          <!-- Supplier Profile Card Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; border-bottom:1px solid var(--mkt-border); padding-bottom:16px; flex-wrap:wrap; gap:12px;">
              <div style="display:flex; gap:14px; align-items:center;">
                <div style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, #059669, #10b981); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800; color:#fff;">
                  DT
                </div>
                <div>
                  <h3 style="font-size:18px; font-weight:800; color:var(--mkt-text-main);">Direct Trade Coffee Roasters LLC</h3>
                  <div style="font-size:12px; color:var(--mkt-text-muted);">Supplier ID: SUP-1048 • Preferred Importer & Roaster</div>
                </div>
              </div>
              <span class="badge in-stock" style="font-size:12px; padding:4px 10px;">● Active (Net 30 Days)</span>
            </div>

            <!-- Profile Info Grid -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; background:rgba(255,255,255,0.02); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
              <div>
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Contact & Location</div>
                <div style="font-size:13px; color:var(--mkt-text-main); margin-top:2px;">👤 Tariq Mehmood • 📞 0300-9988776</div>
                <div style="font-size:12px; color:var(--mkt-text-muted); margin-top:2px;">Plot 42, Industrial Zone, Karachi</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Terms & Payables</div>
                <div style="font-size:13px; color:var(--mkt-text-main); margin-top:2px;">Payment Terms: <b>Net 30 Days</b></div>
                <div style="font-size:12px; color:#fbbf24; margin-top:2px;">Current Payable Balance: <b>PKR 84,500</b></div>
              </div>
            </div>

            <!-- Sub-Tabs Navigation -->
            <div class="mkt-tour-tabs" style="margin-bottom:16px;">
              <button class="mkt-tab-btn active" id="sup-tab-overview" onclick="window.switchSupplierProfileTab('overview')">📊 Overview</button>
              <button class="mkt-tab-btn" id="sup-tab-pos" onclick="window.switchSupplierProfileTab('pos')">📝 Purchase Orders</button>
              <button class="mkt-tab-btn" id="sup-tab-grn" onclick="window.switchSupplierProfileTab('grn')">📥 Goods Receipts</button>
              <button class="mkt-tab-btn" id="sup-tab-bills" onclick="window.switchSupplierProfileTab('bills')">📑 Vendor Bills</button>
              <button class="mkt-tab-btn" id="sup-tab-payments" onclick="window.switchSupplierProfileTab('payments')">💳 Vouchers</button>
              <button class="mkt-tab-btn" id="sup-tab-ledger" onclick="window.switchSupplierProfileTab('ledger')">⚖️ Ledger</button>
            </div>

            <!-- Dynamic Tab Content Area -->
            <div id="sup-profile-tab-content">
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
                <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                  <div style="font-size:11px; color:var(--mkt-text-muted);">Total Lifetime Procurement</div>
                  <div style="font-size:16px; font-weight:800; color:#34d399; margin-top:2px;">PKR 1,845,000</div>
                </div>
                <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                  <div style="font-size:11px; color:var(--mkt-text-muted);">Purchase Orders Issued</div>
                  <div style="font-size:16px; font-weight:800; color:var(--mkt-text-main); margin-top:2px;">18 POs Total</div>
                </div>
                <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                  <div style="font-size:11px; color:var(--mkt-text-muted);">Fulfillment Reliability</div>
                  <div style="font-size:16px; font-weight:800; color:#60a5fa; margin-top:2px;">98.2% On-Time</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: SUPPLIER LIFECYCLE
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>PROCUREMENT PIPELINE</span>
            </div>
            <h2 class="mkt-section-title">From Supplier Onboarding To Final Payment.</h2>
            <p class="mkt-section-subtitle">
              Every stage of procurement is connected: purchase orders verify against received stock before supplier invoices are approved.
            </p>
          </div>

          <!-- Connected Procurement Lifecycle Sequence -->
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-top:36px;">
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">🏭</div><b>1. Created</b><small>Terms Set</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">📝</div><b>2. Purchase Order</b><small>PO-1048</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">🛡️</div><b>3. Approval</b><small>Signed Off</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active" style="min-width:110px;"><div class="node-icon">📥</div><b>4. Received</b><small>GRN-2031</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:110px;"><div class="node-icon">📑</div><b>5. Bill</b><small>3-Way Matched</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:110px;"><div class="node-icon">💳</div><b>6. Payment</b><small>Ledger Updated</small></div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: PURCHASE HISTORY
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>PURCHASE AUDITING</span>
            </div>
            <h2 class="mkt-section-title">See Exactly What You Bought.</h2>
            <p class="mkt-section-subtitle">
              Filter purchase orders by delivery destination, supplier, date, and receiving status.
            </p>
          </div>

          <!-- Purchase History Table Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:900px; margin:32px auto 0 auto;">
            
            <!-- Filters -->
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:20px;">
              <button class="mkt-btn mkt-btn-secondary sup-po-filter-btn active" data-status="all" onclick="window.filterSupplierPurchaseHistory('all')" style="padding:6px 12px; font-size:12px;">All</button>
              <button class="mkt-btn mkt-btn-secondary sup-po-filter-btn" data-status="draft" onclick="window.filterSupplierPurchaseHistory('draft')" style="padding:6px 12px; font-size:12px;">Draft</button>
              <button class="mkt-btn mkt-btn-secondary sup-po-filter-btn" data-status="ordered" onclick="window.filterSupplierPurchaseHistory('ordered')" style="padding:6px 12px; font-size:12px;">Ordered</button>
              <button class="mkt-btn mkt-btn-secondary sup-po-filter-btn" data-status="partial" onclick="window.filterSupplierPurchaseHistory('partial')" style="padding:6px 12px; font-size:12px;">Partially Received</button>
              <button class="mkt-btn mkt-btn-secondary sup-po-filter-btn" data-status="received" onclick="window.filterSupplierPurchaseHistory('received')" style="padding:6px 12px; font-size:12px;">Received</button>
              <button class="mkt-btn mkt-btn-secondary sup-po-filter-btn" data-status="paid" onclick="window.filterSupplierPurchaseHistory('paid')" style="padding:6px 12px; font-size:12px;">Paid</button>
            </div>

            <!-- Table Rows -->
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>PO #</span>
                <span>Supplier</span>
                <span>Date</span>
                <span>Items</span>
                <span>Amount</span>
                <span>Destination</span>
                <span>Status</span>
              </div>
              <div class="mkt-tbl-row sup-po-row" data-status="partial">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PO-1048</span>
                <span>Direct Trade Coffee</span>
                <span>15 Sep 2026</span>
                <span>3 SKUs</span>
                <b>PKR 105,500</b>
                <span>Warehouse</span>
                <span class="badge low-stock">Partially Received</span>
              </div>
              <div class="mkt-tbl-row sup-po-row" data-status="received">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PO-1042</span>
                <span>Metro Wholesale</span>
                <span>13 Sep 2026</span>
                <span>4 SKUs</span>
                <b>PKR 82,400</b>
                <span>Store 01</span>
                <span class="badge in-stock">Received</span>
              </div>
              <div class="mkt-tbl-row sup-po-row" data-status="paid">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PO-1038</span>
                <span>FreshPack Distributors</span>
                <span>11 Sep 2026</span>
                <span>2 SKUs</span>
                <b>PKR 31,500</b>
                <span>Store 02</span>
                <span class="badge in-stock">Paid</span>
              </div>
              <div class="mkt-tbl-row sup-po-row" data-status="draft">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PO-1029</span>
                <span>City Packaging</span>
                <span>10 Sep 2026</span>
                <span>1 SKU</span>
                <b>PKR 18,200</b>
                <span>Warehouse</span>
                <span class="badge" style="background:rgba(255,255,255,0.06); color:var(--mkt-text-muted);">Draft</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: PURCHASE ORDERS CONNECTED TO SUPPLIERS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>ORDER CREATION</span>
            </div>
            <h2 class="mkt-section-title">Create Better Purchase Orders.</h2>
            <p class="mkt-section-subtitle">
              Issue professional purchase orders with exact supplier item numbers, contract rates, delivery locations, and terms.
            </p>
          </div>

          <!-- Interactive PO Builder Document Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; border-bottom:1px solid var(--mkt-border); padding-bottom:16px; flex-wrap:wrap; gap:12px;">
              <div>
                <div style="font-weight:800; font-size:18px; color:var(--mkt-text-main);">PURCHASE ORDER #PO-1048</div>
                <div style="font-size:12px; color:var(--mkt-text-muted); margin-top:2px;">Supplier: Direct Trade Coffee Roasters LLC • Target Delivery: 15 Sep 2026</div>
              </div>
              <span class="badge in-stock" style="font-size:12px; padding:4px 10px;">● APPROVED</span>
            </div>

            <!-- Line Items Table -->
            <div class="mkt-mockup-table" style="margin-bottom:20px;">
              <div class="mkt-tbl-row head">
                <span>Product Item</span>
                <span>SKU</span>
                <span>Qty</span>
                <span>Unit Cost</span>
                <span>Total</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Dark Roast Arabica Coffee (1kg)</span>
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">SKU-COFFEE-001</span>
                <span>40</span>
                <span>PKR 1,850</span>
                <b>PKR 74,000</b>
              </div>
              <div class="mkt-tbl-row">
                <span>Organic Green Tea (250g)</span>
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">SKU-TEA-002</span>
                <span>30</span>
                <span>PKR 850</span>
                <b>PKR 25,500</b>
              </div>
              <div class="mkt-tbl-row">
                <span>Kraft Paper Shopping Bags</span>
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">SKU-BAG-003</span>
                <span>500</span>
                <span>PKR 12</span>
                <b>PKR 6,000</b>
              </div>
            </div>

            <!-- Grand Totals & Action Controls -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:16px; padding-top:16px; border-top:1px solid var(--mkt-border);">
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="window.triggerSupplierToast('Draft saved')">💾 Save Draft</button>
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="window.triggerSupplierToast('PO transmitted to vendor')">✉️ Send to Supplier</button>
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="window.triggerSupplierToast('PO approval logged')">🛡️ Approve</button>
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="window.triggerSupplierToast('PDF generated')">📥 PDF</button>
              </div>
              <div style="text-align:right;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">Terms: Net 30 Days | Destination: Central Warehouse</div>
                <div style="font-size:22px; font-weight:800; color:#34d399; margin-top:2px;">Grand Total: PKR 105,500.00</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: GOODS RECEIPT / GRN
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>PHYSICAL RECEPTION</span>
            </div>
            <h2 class="mkt-section-title">Know What Was Ordered. What Arrived. And What Was Missing.</h2>
            <p class="mkt-section-subtitle">
              Verify vendor deliveries at the loading dock, record damages or short shipments, and let physical stock update automatically.
            </p>
          </div>

          <!-- GRN Mockup Card -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--mkt-border); padding-bottom:12px; flex-wrap:wrap; gap:12px;">
              <div>
                <span style="font-weight:700; font-size:16px;">Goods Receipt Note: GRN-2031</span>
                <span style="font-size:12px; color:var(--mkt-text-muted); margin-left:8px;">(Direct Trade Coffee Roasters • PO-1048)</span>
              </div>
              <span class="badge low-stock">● PARTIALLY RECEIVED</span>
            </div>

            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>Product</span>
                <span>Ordered</span>
                <span>Received</span>
                <span>Variance</span>
                <span>Stock Action</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Dark Roast Coffee (1kg)</span>
                <span>40 units</span>
                <b style="color:#34d399;">38 units</b>
                <span style="color:#f87171;">−2 Damaged</span>
                <span class="badge in-stock">+38 to Stock</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Organic Green Tea (250g)</span>
                <span>30 units</span>
                <b style="color:#34d399;">30 units</b>
                <span>0 (Exact)</span>
                <span class="badge in-stock">+30 to Stock</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Kraft Paper Bags</span>
                <span>500 units</span>
                <b style="color:#34d399;">500 units</b>
                <span>0 (Exact)</span>
                <span class="badge in-stock">+500 to Stock</span>
              </div>
            </div>

            <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <span style="font-size:12px; color:var(--mkt-text-muted);">Stock increases automatically upon GRN confirmation. Zero manual ledger adjustments required.</span>
              <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
                Explore Multi-Location Inventory →
              </a>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: SUPPLIER PAYABLES
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>ACCOUNTS PAYABLE</span>
            </div>
            <h2 class="mkt-section-title">Never Lose Track Of What You Owe.</h2>
            <p class="mkt-section-subtitle">
              Every vendor bill is scheduled according to agreed payment terms to protect cash flow and supplier goodwill.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge in-stock">● HEALTHY</span>
                <span style="font-size:12px; color:var(--mkt-text-muted);">Net 30 Days</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main);">Direct Trade Coffee</h3>
              <div style="font-size:22px; font-weight:800; color:#fbbf24; margin:6px 0;">PKR 84,500 Due</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Bill #BIL-892 • Due: 20 Sep 2026</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge low-stock">● DUE SOON</span>
                <span style="font-size:12px; color:var(--mkt-text-muted);">Net 15 Days</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main);">Metro Wholesale Supplies</h3>
              <div style="font-size:22px; font-weight:800; color:#60a5fa; margin:6px 0;">PKR 42,800 Due</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Bill #BIL-887 • Due: 12 Sep 2026</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge in-stock">● PAID</span>
                <span style="font-size:12px; color:var(--mkt-text-muted);">Cash on Delivery</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main);">FreshPack Distributors</h3>
              <div style="font-size:22px; font-weight:800; color:#34d399; margin:6px 0;">PKR 0.00 (Settled)</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">All invoices fully reconciled</p>
            </div>

          </div>

          <div style="text-align:center; margin-top:28px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/payments')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              Explore Disbursements & Payment Vouchers →
            </a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: SUPPLIER LEDGER
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>DOUBLE-ENTRY LEDGER</span>
            </div>
            <h2 class="mkt-section-title">Every Supplier Transaction, Traceable.</h2>
            <p class="mkt-section-subtitle">
              Maintain an auditable running balance for every supplier showing debits, credits, return adjustments, and payment references.
            </p>
          </div>

          <!-- Supplier Ledger Mockup Card -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--mkt-border); padding-bottom:12px; flex-wrap:wrap; gap:12px;">
              <div>
                <b style="font-size:15px;">VENDOR STATEMENT: Direct Trade Coffee Roasters LLC</b>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Period: 01/08/2026 – 31/08/2026 • Currency: PKR</div>
              </div>
              <button class="mkt-btn mkt-btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="window.triggerSupplierToast('Vendor statement PDF exported')">📥 Export Statement</button>
            </div>

            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>Date</span>
                <span>Reference</span>
                <span>Debit (Paid)</span>
                <span>Credit (Billed)</span>
                <span>Running Balance</span>
              </div>
              <div class="mkt-tbl-row">
                <span>01 Aug 2026</span>
                <span>Opening Balance</span>
                <span>—</span>
                <span>—</span>
                <span style="font-family:var(--mkt-font-mono);">PKR 0.00</span>
              </div>
              <div class="mkt-tbl-row">
                <span>15 Aug 2026</span>
                <span>Supplier Bill #BIL-892</span>
                <span>—</span>
                <span style="color:#fbbf24; font-family:var(--mkt-font-mono);">PKR 105,500</span>
                <span style="font-family:var(--mkt-font-mono);">PKR 105,500</span>
              </div>
              <div class="mkt-tbl-row">
                <span>18 Aug 2026</span>
                <span>Payment Voucher #PMT-4012</span>
                <span style="color:#34d399; font-family:var(--mkt-font-mono);">PKR 21,000</span>
                <span>—</span>
                <b style="color:#fbbf24; font-family:var(--mkt-font-mono);">PKR 84,500</b>
              </div>
            </div>

            <div style="border-top:1px solid var(--mkt-border); padding-top:14px; margin-top:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <span style="font-size:12px; color:var(--mkt-text-muted);">Audited closing liability balance scheduled for payment.</span>
              <b style="font-size:16px; color:#fbbf24; font-family:var(--mkt-font-mono);">Closing Balance: PKR 84,500.00</b>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 9: LOW STOCK → SUPPLIER → PURCHASE ORDER
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>AUTOMATED PROCUREMENT FLOW</span>
            </div>
            <h2 class="mkt-section-title">Turn Low Stock Into The Next Purchase.</h2>
            <p class="mkt-section-subtitle">
              When items dip below safety thresholds, Universal ERP automatically suggests reorder quantities linked to your preferred suppliers.
            </p>
          </div>

          <!-- Reorder Automation Box -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:20px;">
              <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Low Stock Item</div>
                <div style="font-weight:700; font-size:14px; margin-top:2px;">Dark Roast Coffee (1kg)</div>
                <div style="font-size:12px; color:#f87171; margin-top:2px;">On Hand: 8 units (Threshold: 20)</div>
              </div>

              <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Suggested Reorder</div>
                <div style="font-weight:700; font-size:14px; color:#34d399; margin-top:2px;">50 units Suggested</div>
                <div style="font-size:12px; color:var(--mkt-text-muted); margin-top:2px;">Estimated: PKR 92,500</div>
              </div>

              <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Preferred Supplier</div>
                <div style="font-weight:700; font-size:14px; color:#60a5fa; margin-top:2px;">Direct Trade Coffee</div>
                <div style="font-size:12px; color:var(--mkt-text-muted); margin-top:2px;">Terms: Net 30 Days</div>
              </div>
            </div>

            <div style="text-align:center;">
              <button class="mkt-btn mkt-btn-primary" onclick="window.createSupplierPurchaseDraft('SKU-COFFEE-001', 'Dark Roast Coffee', 50, 'Direct Trade Coffee Roasters')">
                + Create Purchase Order Draft
              </button>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 10: MULTI-LOCATION SUPPLIER OPERATIONS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>DISTRIBUTED PROCUREMENT</span>
            </div>
            <h2 class="mkt-section-title">One Supplier Network Across Every Location.</h2>
            <p class="mkt-section-subtitle">
              Consolidate purchasing across central warehouses, regional hubs, and retail outlets while preserving store-level cost centers.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:18px; margin-top:36px;">
            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">🏢</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Central Warehouse</h4>
              <div style="font-size:20px; font-weight:800; color:#34d399; margin:4px 0;">PKR 354,800</div>
              <small style="color:var(--mkt-text-muted);">Bulk pallet intake</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">🏪</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Store 01 (Commercial)</h4>
              <div style="font-size:20px; font-weight:800; color:#60a5fa; margin:4px 0;">PKR 248,500</div>
              <small style="color:var(--mkt-text-muted);">Direct branch deliveries</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">🏪</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Store 02 (Mall Branch)</h4>
              <div style="font-size:20px; font-weight:800; color:#60a5fa; margin:4px 0;">PKR 182,300</div>
              <small style="color:var(--mkt-text-muted);">Local replenishment</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.3);">
              <div style="font-size:26px; margin-bottom:8px;">🌐</div>
              <h4 style="font-size:15px; font-weight:700; color:#93c5fd;">Consolidated Network</h4>
              <div style="font-size:22px; font-weight:800; color:#ffffff; margin:4px 0;">PKR 785,600</div>
              <small style="color:#60a5fa;">Total Procurement Volume ✓</small>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 11: SUPPLIER SEARCH & SEGMENTATION (INTERACTIVE DIRECTORY)
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>VENDOR DIRECTORY</span>
            </div>
            <h2 class="mkt-section-title">Find The Right Supplier Instantly.</h2>
            <p class="mkt-section-subtitle">
              Search by vendor name, category, payment terms, or outstanding liability status.
            </p>
          </div>

          <!-- Supplier Directory Table Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:900px; margin:32px auto 0 auto;">
            
            <!-- Filters -->
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:20px;">
              <button class="mkt-btn mkt-btn-secondary sup-dir-btn active" data-segment="all" onclick="window.filterSupplierDirectory('all')" style="padding:6px 12px; font-size:12px;">All Suppliers (184)</button>
              <button class="mkt-btn mkt-btn-secondary sup-dir-btn" data-segment="preferred" onclick="window.filterSupplierDirectory('preferred')" style="padding:6px 12px; font-size:12px;">Preferred (28)</button>
              <button class="mkt-btn mkt-btn-secondary sup-dir-btn" data-segment="credit" onclick="window.filterSupplierDirectory('credit')" style="padding:6px 12px; font-size:12px;">Credit Terms (44)</button>
              <button class="mkt-btn mkt-btn-secondary sup-dir-btn" data-segment="due" onclick="window.filterSupplierDirectory('due')" style="padding:6px 12px; font-size:12px;">Attention / Due (6)</button>
            </div>

            <!-- Table Rows -->
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>Supplier Name</span>
                <span>Contact / Phone</span>
                <span>Category</span>
                <span>Payable Balance</span>
                <span>Status</span>
              </div>
              <div class="mkt-tbl-row sup-dir-row" data-segment="preferred">
                <b>Direct Trade Coffee Roasters</b>
                <span>0300-9988776</span>
                <span>Coffee Beans & Blends</span>
                <b style="color:#fbbf24; font-family:var(--mkt-font-mono);">PKR 84,500</b>
                <span class="badge in-stock">Active (Net 30)</span>
              </div>
              <div class="mkt-tbl-row sup-dir-row" data-segment="due">
                <b>Metro Wholesale Supplies</b>
                <span>0321-7788990</span>
                <span>Packaging & Dairy</span>
                <b style="color:#60a5fa; font-family:var(--mkt-font-mono);">PKR 42,800</b>
                <span class="badge low-stock">Due in 3 Days</span>
              </div>
              <div class="mkt-tbl-row sup-dir-row" data-segment="preferred">
                <b>FreshPack Distributors</b>
                <span>0333-1122445</span>
                <span>Thermal Rolls & Bags</span>
                <b style="color:#34d399; font-family:var(--mkt-font-mono);">PKR 0.00</b>
                <span class="badge in-stock">Active (COD)</span>
              </div>
              <div class="mkt-tbl-row sup-dir-row" data-segment="credit">
                <b>City Packaging Industries</b>
                <span>0345-6677889</span>
                <span>Custom Printed Boxes</span>
                <b style="color:#fbbf24; font-family:var(--mkt-font-mono);">PKR 18,200</b>
                <span class="badge in-stock">Active (Net 15)</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 12: SUPPLIER → INVENTORY → FINANCE (CONNECTED DATA PIPELINE)
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>UNIFIED ARCHITECTURE</span>
            </div>
            <h2 class="mkt-section-title">One Purchase. Multiple Records Updated Automatically.</h2>
            <p class="mkt-section-subtitle">
              Universal ERP removes duplicate data entry: receiving goods updates inventory counts, creates accounts payable, and flows straight into financial P&L statements.
            </p>
          </div>

          <!-- Connected Data Flow Sequence -->
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-top:36px;">
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">🏭</div><b>1. Supplier</b><small>Terms Set</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">📝</div><b>2. PO</b><small>PO-1048</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active" style="min-width:115px;"><div class="node-icon">📥</div><b>3. GRN</b><small>Dock Verified</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:115px;"><div class="node-icon">📦</div><b>4. Inventory</b><small>Stock +40</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">📑</div><b>5. Bill</b><small>Payable +74k</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:115px;"><div class="node-icon">📊</div><b>6. Reports</b><small>COGS Audited</small></div>
          </div>

          <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap; margin-top:32px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Inventory Sync</a>
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/purchasing')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Purchasing & POs</a>
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/payments')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Payment Vouchers</a>
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/reports')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ P&L Reports</a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           FINAL CTA
           ========================================================================= -->
      <section class="mkt-section mkt-cta-section">
        <div class="mkt-container">
          <div class="mkt-cta-card">
            
            <h2 class="mkt-cta-title">Make Supplier Management Part Of The System —<br>Not Another Spreadsheet.</h2>
            <p class="mkt-cta-desc">
              Keep purchasing, receiving, inventory and supplier payments connected from the first order to the final payment.
            </p>

            <div class="mkt-cta-actions">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                Start Managing Suppliers →
              </button>
              <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/product/purchasing')">
                Explore Purchasing
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
