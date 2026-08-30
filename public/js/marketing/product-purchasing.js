/**
 * Universal ERP — Purchasing & Purchase Orders Product Page (/product/purchasing)
 * Phase 23 — Step 7: Dedicated Purchasing & POs Solution Page
 */

// Client-Side Interactive Controllers
if (typeof window !== 'undefined') {
  window.filterPurchaseTable = (status) => {
    const rows = document.querySelectorAll('.po-row-item');
    const filterBtns = document.querySelectorAll('.po-filter-btn');

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

  window.createPurchaseDraft = (sku, name, qty) => {
    const toast = document.getElementById('po-action-toast');
    if (toast) {
      toast.innerText = `✓ Draft PO created for ${qty}x ${name} (${sku}) at Central Warehouse.`;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 4000);
    }
  };

  window.triggerPODemoAction = (actionName) => {
    const toast = document.getElementById('po-action-toast');
    if (toast) {
      toast.innerText = `✓ Demo action: "${actionName}" executed for PO-1048.`;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3500);
    }
  };
}

export function renderProductPurchasingPage() {
  return `
    <div class="marketing-wrapper" id="marketing-root">
      <div class="mkt-ambient-glow"></div>

      <!-- Action Feedback Toast -->
      <div id="po-action-toast" style="display:none; position:fixed; bottom:24px; right:24px; z-index:9999; background:#10b981; color:#ffffff; padding:12px 20px; border-radius:var(--mkt-radius-md); font-weight:700; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
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
                <span>PURCHASING & PROCUREMENT</span>
              </div>

              <h1 class="mkt-hero-title">
                Buy Smarter.<br>
                <span class="mkt-gradient-text-accent">Keep Every Purchase Connected.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Create purchase orders, receive stock, manage suppliers and keep your payables connected to inventory and finance.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Start Managing Purchases</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#purchasing-demo" style="text-decoration:none;">
                  <span>See Purchasing In Action</span>
                </a>
              </div>

              <!-- Quick Badges -->
              <div style="display:flex; gap:16px; margin-top:28px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-muted);">
                <span>✓ 3-Way Bill Matching</span>
                <span>•</span>
                <span>✓ Goods Receipt (GRN)</span>
                <span>•</span>
                <span>✓ Supplier Credit Ledgers</span>
              </div>
            </div>

            <!-- Purchasing Command Center Mockup -->
            <div class="mkt-hero-right" id="purchasing-demo">
              <div class="mkt-dash-preview-frame">
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/purchases</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>PROCUREMENT HUB</span>
                  </div>
                </div>

                <div class="mkt-dash-body" style="padding:16px;">
                  
                  <!-- Metric Cards -->
                  <div class="mkt-dash-metrics-grid" style="margin-bottom:14px;">
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Open Purchase Orders</div>
                      <div class="mkt-dash-stat-value">12 Active</div>
                      <div class="mkt-dash-stat-trend positive">● 6 Approved</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">In Transit Freight</div>
                      <div class="mkt-dash-stat-value">4 Shipments</div>
                      <div class="mkt-dash-stat-trend neutral">🚚 Dispatched</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Awaiting GRN Receipt</div>
                      <div class="mkt-dash-stat-value">6 Inbound</div>
                      <div class="mkt-dash-stat-trend positive">📦 Dock Ready</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Supplier Payables</div>
                      <div class="mkt-dash-stat-value">PKR 284,500</div>
                      <div class="mkt-dash-stat-trend neutral">3 Active Terms</div>
                    </div>
                  </div>

                  <!-- Live Purchasing Stream -->
                  <div class="mkt-dash-feed-box">
                    <div class="mkt-dash-feed-header">
                      <span class="mkt-feed-title">Recent Procurement Activity</span>
                      <span class="mkt-badge mkt-badge-cyan">Live Ledger</span>
                    </div>
                    <div class="mkt-dash-feed-list">
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#3b82f6;"></span>
                          <span>PO-1048 created for Direct Trade Coffee (PKR 105,500)</span>
                        </div>
                        <span class="mkt-activity-time">10m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#10b981;"></span>
                          <span>GRN-2031 received: 38/40 units Dark Roast Coffee</span>
                        </div>
                        <span class="mkt-activity-time">35m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#06b6d4;"></span>
                          <span>Supplier Bill matched with PO-1047: +PKR 82,400 payable</span>
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
           SECTION 2: PROCUREMENT WORKFLOW
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>END-TO-END VISIBILITY</span>
            </div>
            <h2 class="mkt-section-title">From Purchase Order To Stock. Automatically Connected.</h2>
            <p class="mkt-section-subtitle">
              Every stage of procurement updates stock balances, matches bills, and prevents unauthorized inventory additions.
            </p>
          </div>

          <!-- Connected Procurement Lifecycle Sequence -->
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-top:36px;">
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">🏭</div><b>1. Supplier</b><small>Selected</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active" style="min-width:115px;"><div class="node-icon">📝</div><b>2. Purchase Order</b><small>Draft / Sent</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">🛡️</div><b>3. Approval</b><small>Manager Signed</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:115px;"><div class="node-icon">📥</div><b>4. Goods Receipt</b><small>GRN Verified</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:115px;"><div class="node-icon">📑</div><b>5. Supplier Bill</b><small>3-Way Matched</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:115px;"><div class="node-icon">📦</div><b>6. Stock + Ledger</b><small>Auto Updated</small></div>
          </div>

          <!-- Status Badges Preview -->
          <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:28px;">
            <span class="mkt-badge" style="background:rgba(255,255,255,0.06); color:var(--mkt-text-muted);">Draft</span>
            <span class="mkt-badge mkt-badge-cyan">Approved</span>
            <span class="mkt-badge mkt-badge-cyan">Ordered</span>
            <span class="mkt-badge low-stock">Partially Received</span>
            <span class="mkt-badge in-stock">Received</span>
            <span class="mkt-badge in-stock">Billed & Paid</span>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: PURCHASE ORDER BUILDER
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>STRUCTURED ORDERING</span>
            </div>
            <h2 class="mkt-section-title">Create Purchase Orders Without The Paperwork.</h2>
            <p class="mkt-section-subtitle">
              Draft orders with product SKUs, supplier pricing agreements, destination warehouse targets, and delivery dates.
            </p>
          </div>

          <!-- Interactive PO Builder Document Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; border-bottom:1px solid var(--mkt-border); padding-bottom:16px; flex-wrap:wrap; gap:12px;">
              <div>
                <div style="font-weight:800; font-size:18px; color:var(--mkt-text-main);">PURCHASE ORDER #PO-1048</div>
                <div style="font-size:12px; color:var(--mkt-text-muted); margin-top:2px;">Issued Date: 30/08/2026 • Target Delivery: 15 Sep 2026</div>
              </div>
              <span class="badge in-stock" style="font-size:12px; padding:4px 10px;">● APPROVED</span>
            </div>

            <!-- Supplier & Destination Grid -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; background:rgba(255,255,255,0.02); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
              <div>
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Supplier / Vendor</div>
                <div style="font-weight:700; font-size:14px; color:var(--mkt-text-main); margin-top:2px;">Direct Trade Coffee Roasters LLC</div>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Terms: Net 30 Days • Phone: 0300-9988776</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Ship To Location</div>
                <div style="font-weight:700; font-size:14px; color:var(--mkt-text-main); margin-top:2px;">Central Warehouse Depot</div>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Bay 4, Logistics Complex, Lahore</div>
              </div>
            </div>

            <!-- Line Items Table -->
            <div class="mkt-mockup-table" style="margin-bottom:20px;">
              <div class="mkt-tbl-row head">
                <span>Product Name</span>
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
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="window.triggerPODemoAction('Save Draft')">💾 Save Draft</button>
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="window.triggerPODemoAction('Send To Supplier')">✉️ Send to Supplier</button>
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="window.triggerPODemoAction('Approve PO')">🛡️ Approve PO</button>
                <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="window.triggerPODemoAction('Download PDF')">📥 PDF</button>
              </div>
              <div style="text-align:right;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">Subtotal: PKR 105,500 | Tax: PKR 0.00</div>
                <div style="font-size:22px; font-weight:800; color:#34d399; margin-top:2px;">Grand Total: PKR 105,500.00</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: SUPPLIER SELECTION
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>VENDOR DIRECTORY</span>
            </div>
            <h2 class="mkt-section-title">Know Who You Buy From.</h2>
            <p class="mkt-section-subtitle">
              Maintain supplier terms, lead time records, contact information, and current balance histories in one centralized hub.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="mkt-badge mkt-badge-green">● Active</span>
                <span style="font-size:12px; color:#60a5fa; font-weight:700;">Net 30 Days</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main);">Direct Trade Coffee Roasters</h3>
              <div style="font-size:20px; font-weight:800; color:#fbbf24; margin:8px 0;">PKR 84,500 Due</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Last Purchase: PKR 74,000 • Reliability: Excellent</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="mkt-badge mkt-badge-green">● Active</span>
                <span style="font-size:12px; color:#60a5fa; font-weight:700;">Net 15 Days</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main);">Metro Wholesale Supplies</h3>
              <div style="font-size:20px; font-weight:800; color:#60a5fa; margin:8px 0;">PKR 42,800 Due</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Last Purchase: PKR 31,500 • Dairy & Packaging</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="mkt-badge mkt-badge-green">● Active</span>
                <span style="font-size:12px; color:#34d399; font-weight:700;">Cash on Delivery</span>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main);">FreshPack Distributors</h3>
              <div style="font-size:20px; font-weight:800; color:#34d399; margin:8px 0;">PKR 0.00 (Settled)</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Last Purchase: PKR 18,200 • Thermal rolls & bags</p>
            </div>

          </div>

          <div style="text-align:center; margin-top:28px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/suppliers')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              Explore Supplier Management →
            </a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: GOODS RECEIPT / GRN
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>PHYSICAL RECEPTION</span>
            </div>
            <h2 class="mkt-section-title">Receive What Actually Arrived.</h2>
            <p class="mkt-section-subtitle">
              Verify freight upon warehouse delivery with line-item receiving, recording discrepancies before inventory is updated.
            </p>
          </div>

          <!-- GRN Mockup Card -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--mkt-border); padding-bottom:12px; flex-wrap:wrap; gap:12px;">
              <div>
                <span style="font-weight:700; font-size:16px;">Goods Receipt Note: GRN-2031</span>
                <span style="font-size:12px; color:var(--mkt-text-muted); margin-left:8px;">(Linked PO: PO-1048)</span>
              </div>
              <span class="badge low-stock">● PARTIALLY RECEIVED</span>
            </div>

            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>Product</span>
                <span>Expected</span>
                <span>Received</span>
                <span>Damaged / Short</span>
                <span>Inventory Effect</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Dark Roast Coffee (1kg)</span>
                <span>40 units</span>
                <b style="color:#34d399;">38 units</b>
                <span style="color:#f87171;">−2 units damaged</span>
                <span class="badge in-stock">+38 to Warehouse</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Organic Green Tea (250g)</span>
                <span>30 units</span>
                <b style="color:#34d399;">30 units</b>
                <span>0 (Exact)</span>
                <span class="badge in-stock">+30 to Warehouse</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Paper Shopping Bags</span>
                <span>500 units</span>
                <b style="color:#34d399;">500 units</b>
                <span>0 (Exact)</span>
                <span class="badge in-stock">+500 to Warehouse</span>
              </div>
            </div>

            <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <span style="font-size:12px; color:var(--mkt-text-muted);">Stock increases automatically upon GRN posting. Zero manual ledger adjustments required.</span>
              <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
                Explore Inventory Sync →
              </a>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: PARTIAL & MULTI-LOCATION RECEIVING
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>LOCATION-AWARE INGESTION</span>
            </div>
            <h2 class="mkt-section-title">Receive Stock Where It Belongs.</h2>
            <p class="mkt-section-subtitle">
              One purchase order can be distributed across multiple business locations while keeping stock movements traceable.
            </p>
          </div>

          <!-- Multi-Location Receiving Visual -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px 24px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="text-align:center; margin-bottom:28px;">
              <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3); padding:10px 24px; border-radius:var(--mkt-radius-full); font-weight:800; color:#93c5fd;">
                <span>📦</span>
                <span>Purchase Order: 40 Coffee Bags</span>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
              
              <div class="mkt-feature-card" style="padding:20px; text-align:center;">
                <div style="font-size:24px; margin-bottom:6px;">🏢</div>
                <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Central Warehouse</h4>
                <div style="font-size:20px; font-weight:800; color:#34d399; margin:4px 0;">30 Units Received</div>
                <small style="color:var(--mkt-text-muted);">Reserve storage depot</small>
              </div>

              <div class="mkt-feature-card" style="padding:20px; text-align:center;">
                <div style="font-size:24px; margin-bottom:6px;">🏪</div>
                <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Store 01 (Commercial)</h4>
                <div style="font-size:20px; font-weight:800; color:#60a5fa; margin:4px 0;">10 Units Received</div>
                <small style="color:var(--mkt-text-muted);">Direct to retail shelf display</small>
              </div>

            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: LOW STOCK → REORDER
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>FAST REORDERING</span>
            </div>
            <h2 class="mkt-section-title">Turn Low Stock Into The Next Purchase.</h2>
            <p class="mkt-section-subtitle">
              Identify items nearing safety stock thresholds and generate replenishment purchase orders in one click.
            </p>
          </div>

          <!-- Reorder Table Mockup with Action Buttons -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>Product Name</span>
                <span>On Hand</span>
                <span>Reorder Level</span>
                <span>Suggested Qty</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Organic Green Tea (250g)</span>
                <b>24 units</b>
                <span>30 units</span>
                <span>50 units</span>
                <span class="badge low-stock">Low Stock</span>
                <button class="mkt-btn mkt-btn-primary" style="padding:4px 10px; font-size:11px;" onclick="window.createPurchaseDraft('SKU-TEA-002', 'Organic Green Tea', 50)">
                  + Create PO
                </button>
              </div>
              <div class="mkt-tbl-row">
                <span>Coffee Filters (Pack 100)</span>
                <b style="color:#f87171;">8 units</b>
                <span>20 units</span>
                <span>40 units</span>
                <span class="badge" style="background:rgba(239,68,68,0.2); color:#f87171;">Critical</span>
                <button class="mkt-btn mkt-btn-primary" style="padding:4px 10px; font-size:11px;" onclick="window.createPurchaseDraft('SKU-FLT-004', 'Coffee Filters', 40)">
                  + Create PO
                </button>
              </div>
              <div class="mkt-tbl-row">
                <span>Paper Shopping Bags</span>
                <b>18 units</b>
                <span>25 units</span>
                <span>100 units</span>
                <span class="badge low-stock">Low Stock</span>
                <button class="mkt-btn mkt-btn-primary" style="padding:4px 10px; font-size:11px;" onclick="window.createPurchaseDraft('SKU-BAG-003', 'Paper Shopping Bags', 100)">
                  + Create PO
                </button>
              </div>
            </div>

            <div style="text-align:center; margin-top:20px;">
              <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
                View Multi-Location Inventory Thresholds →
              </a>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: SUPPLIER PAYABLES
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>ACCOUNTS PAYABLE</span>
            </div>
            <h2 class="mkt-section-title">Purchasing And Payables Stay In Sync.</h2>
            <p class="mkt-section-subtitle">
              Every vendor invoice posted generates an accounts payable record with due dates and payment terms.
            </p>
          </div>

          <!-- Payables Metrics & Balances Grid -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:24px;">
              <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Total Payables</div>
                <div style="font-size:20px; font-weight:800; color:#fbbf24; margin-top:4px;">PKR 284,500</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Due This Week</div>
                <div style="font-size:20px; font-weight:800; color:#60a5fa; margin-top:4px;">PKR 74,000</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Overdue Balance</div>
                <div style="font-size:20px; font-weight:800; color:#f87171; margin-top:4px;">PKR 12,500</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Paid This Month</div>
                <div style="font-size:20px; font-weight:800; color:#34d399; margin-top:4px;">PKR 418,200</div>
              </div>
            </div>

            <!-- Supplier Balance List -->
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:rgba(255,255,255,0.02); border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div>
                  <div style="font-weight:700; font-size:14px;">Direct Trade Coffee Roasters LLC</div>
                  <div style="font-size:12px; color:var(--mkt-text-muted);">Bill #BIL-892 • Due: 20 Sep 2026</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-weight:800; font-size:15px; color:#fbbf24;">PKR 84,500</div>
                  <span class="badge in-stock">Within Terms</span>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:rgba(255,255,255,0.02); border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div>
                  <div style="font-weight:700; font-size:14px;">Metro Wholesale Supplies</div>
                  <div style="font-size:12px; color:var(--mkt-text-muted);">Bill #BIL-887 • Due: 12 Sep 2026</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-weight:800; font-size:15px; color:#60a5fa;">PKR 42,800</div>
                  <span class="badge in-stock">Within Terms</span>
                </div>
              </div>
            </div>

            <div style="text-align:center; margin-top:20px;">
              <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/payments')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
                Explore Payment Processing & Disbursements →
              </a>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 9: PURCHASE HISTORY (INTERACTIVE TABLE FILTER)
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>AUDITABLE LOGS</span>
            </div>
            <h2 class="mkt-section-title">Every Purchase Leaves A Clear Trail.</h2>
            <p class="mkt-section-subtitle">
              Filter purchase records by status, location destination, supplier, and authorization dates.
            </p>
          </div>

          <!-- Purchase History Table Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:900px; margin:32px auto 0 auto;">
            
            <!-- Filters -->
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:20px;">
              <button class="mkt-btn mkt-btn-secondary po-filter-btn active" data-status="all" onclick="window.filterPurchaseTable('all')" style="padding:6px 12px; font-size:12px;">All</button>
              <button class="mkt-btn mkt-btn-secondary po-filter-btn" data-status="draft" onclick="window.filterPurchaseTable('draft')" style="padding:6px 12px; font-size:12px;">Draft</button>
              <button class="mkt-btn mkt-btn-secondary po-filter-btn" data-status="ordered" onclick="window.filterPurchaseTable('ordered')" style="padding:6px 12px; font-size:12px;">Ordered</button>
              <button class="mkt-btn mkt-btn-secondary po-filter-btn" data-status="partial" onclick="window.filterPurchaseTable('partial')" style="padding:6px 12px; font-size:12px;">Partially Received</button>
              <button class="mkt-btn mkt-btn-secondary po-filter-btn" data-status="received" onclick="window.filterPurchaseTable('received')" style="padding:6px 12px; font-size:12px;">Received</button>
              <button class="mkt-btn mkt-btn-secondary po-filter-btn" data-status="paid" onclick="window.filterPurchaseTable('paid')" style="padding:6px 12px; font-size:12px;">Paid</button>
            </div>

            <!-- Table Rows -->
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>PO #</span>
                <span>Supplier</span>
                <span>Destination</span>
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              <div class="mkt-tbl-row po-row-item" data-status="partial">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PO-1048</span>
                <span>Direct Trade Coffee</span>
                <span>Warehouse</span>
                <span>15 Sep 2026</span>
                <b>PKR 105,500</b>
                <span class="badge low-stock">Partially Received</span>
              </div>
              <div class="mkt-tbl-row po-row-item" data-status="received">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PO-1047</span>
                <span>Metro Wholesale</span>
                <span>Store 01</span>
                <span>13 Sep 2026</span>
                <b>PKR 82,400</b>
                <span class="badge in-stock">Received</span>
              </div>
              <div class="mkt-tbl-row po-row-item" data-status="paid">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PO-1046</span>
                <span>FreshPack Distributors</span>
                <span>Store 02</span>
                <span>11 Sep 2026</span>
                <b>PKR 31,500</b>
                <span class="badge in-stock">Paid</span>
              </div>
              <div class="mkt-tbl-row po-row-item" data-status="draft">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PO-1045</span>
                <span>Global Packaging</span>
                <span>Warehouse</span>
                <span>10 Sep 2026</span>
                <b>PKR 18,200</b>
                <span class="badge" style="background:rgba(255,255,255,0.06); color:var(--mkt-text-muted);">Draft</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 10: PURCHASING → INVENTORY → FINANCE
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>UNIFIED PLATFORM ARCHITECTURE</span>
            </div>
            <h2 class="mkt-section-title">One Purchase. Multiple Business Updates.</h2>
            <p class="mkt-section-subtitle">
              Experience the core advantage of Universal ERP: a single goods receipt updates physical stock, books a supplier payable, and updates financial balances.
            </p>
          </div>

          <!-- Data Flow Pipeline Diagram -->
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-top:36px;">
            <div class="mkt-offline-node" style="min-width:130px;"><div class="node-icon">📝</div><b>1. Purchase Order</b><small>PO-1048 approved</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active" style="min-width:130px;"><div class="node-icon">📥</div><b>2. Goods Received</b><small>GRN verified</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:130px;"><div class="node-icon">📦</div><b>3. Inventory +40</b><small>Stock increased</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:130px;"><div class="node-icon">📑</div><b>4. Supplier Bill</b><small>Payable +74k</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:130px;"><div class="node-icon">📊</div><b>5. P&L Updated</b><small>COGS adjusted</small></div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 11: PROCUREMENT CONTROL
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>OPERATIONAL GOVERNANCE</span>
            </div>
            <h2 class="mkt-section-title">More Control. Less Procurement Chaos.</h2>
            <p class="mkt-section-subtitle">
              Eliminate rogue purchasing, missed delivery dates, and duplicate vendor payments.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:10px;">🏭</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Supplier Records</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Keep supplier terms, contact numbers, and historic pricing agreements organized in one catalog.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:10px;">📝</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Purchase Orders</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Create, approve, and track every inbound purchase order with automated line-item cost totals.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:10px;">📥</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Goods Receipt (GRN)</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Record physical quantities upon delivery to verify shortages or damages before stock is updated.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:10px;">💳</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Supplier Payables</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Track outstanding vendor liabilities with due date tracking and cash disbursement reconciliation.</p>
            </div>

          </div>

          <!-- Secondary Capability Badges -->
          <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap; margin-top:28px; font-size:13px; color:var(--mkt-text-dim);">
            <span>✓ Multi-Location Receiving</span>
            <span>•</span>
            <span>✓ Barcode-Ready Ingestion</span>
            <span>•</span>
            <span>✓ Permanent Audit Trail</span>
            <span>•</span>
            <span>✓ Role-Based Authorization</span>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 12: FINAL CTA
           ========================================================================= -->
      <section class="mkt-section mkt-cta-section">
        <div class="mkt-container">
          <div class="mkt-cta-card">
            
            <h2 class="mkt-cta-title">Know What You Bought.<br>What Arrived. And What You Owe.</h2>
            <p class="mkt-cta-desc">
              Bring purchasing, suppliers, inventory and payments into one connected business system.
            </p>

            <div class="mkt-cta-actions">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                Start Free →
              </button>
              <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/product/inventory')">
                Explore Inventory
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
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/purchasing'); window.toggleMarketingMenu()">Purchasing & POs</a>
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
