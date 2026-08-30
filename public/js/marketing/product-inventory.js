// Attach interactive location switcher
if (typeof window !== 'undefined') {
  window.switchInventoryLocation = (locKey) => {
    const tabs = ['all', 'store1', 'store2', 'warehouse'];
    tabs.forEach((k) => {
      const tabEl = document.getElementById(`loc-tab-${k}`);
      if (tabEl) {
        if (k === locKey) {
          tabEl.classList.add('active');
        } else {
          tabEl.classList.remove('active');
        }
      }
    });

    const data = {
      all: {
        title: 'All Locations Combined',
        subtitle: 'Real-time aggregated valuation across all active facilities.',
        val: 'PKR 4,820,000',
        coffee: '98 Units',
        tea: '24 Units',
        cookies: '180 Units',
      },
      store1: {
        title: 'Store 01 — Commercial Market',
        subtitle: 'Primary retail storefront with high-speed POS checkouts.',
        val: 'PKR 2,890,000',
        coffee: '68 Units',
        tea: '24 Units',
        cookies: '60 Units',
      },
      store2: {
        title: 'Store 02 — Mall Branch',
        subtitle: 'Secondary shopping mall sales counter & local display.',
        val: 'PKR 1,460,000',
        coffee: '30 Units',
        tea: '0 Units (Transferred)',
        cookies: '40 Units',
      },
      warehouse: {
        title: 'Central Warehouse Depot',
        subtitle: 'Main receiving facility for supplier PO goods receipts.',
        val: 'PKR 470,000',
        coffee: '0 Units (Dispatched)',
        tea: '0 Units',
        cookies: '80 Units',
      },
    };

    const sel = data[locKey] || data.all;
    const titleEl = document.getElementById('loc-detail-title');
    const subEl = document.getElementById('loc-detail-subtitle');
    const valEl = document.getElementById('loc-detail-value');
    const coffeeEl = document.getElementById('loc-coffee-qty');
    const teaEl = document.getElementById('loc-tea-qty');
    const cookiesEl = document.getElementById('loc-cookies-qty');

    if (titleEl) titleEl.innerText = sel.title;
    if (subEl) subEl.innerText = sel.subtitle;
    if (valEl) valEl.innerText = sel.val;
    if (coffeeEl) coffeeEl.innerText = sel.coffee;
    if (teaEl) teaEl.innerText = sel.tea;
    if (cookiesEl) cookiesEl.innerText = sel.cookies;
  };
}

export function renderProductInventoryPage() {
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
                <span>INVENTORY MANAGEMENT</span>
              </div>

              <h1 class="mkt-hero-title">
                Know What You Have.<br>
                <span class="mkt-gradient-text-accent">Where It Is. When You Need It.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Track products across stores and warehouses with one connected inventory system.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Start Managing Inventory</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#inventory-demo" style="text-decoration:none;">
                  <span>Explore Inventory</span>
                </a>
              </div>

              <!-- Quick Badges -->
              <div style="display:flex; gap:16px; margin-top:28px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-muted);">
                <span>✓ Multi-Location</span>
                <span>•</span>
                <span>✓ Camera Barcode Counts</span>
                <span>•</span>
                <span>✓ Real-Time Valuation</span>
              </div>
            </div>

            <!-- High-Fidelity Inventory Dashboard Preview -->
            <div class="mkt-hero-right" id="inventory-demo">
              <div class="mkt-dash-preview-frame">
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/inventory</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>LIVE VALUATION</span>
                  </div>
                </div>

                <div class="mkt-dash-body" style="padding:16px;">
                  
                  <!-- Metric Cards -->
                  <div class="mkt-dash-metrics-grid" style="margin-bottom:14px;">
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Total SKUs</div>
                      <div class="mkt-dash-stat-value">1,420</div>
                      <div class="mkt-dash-stat-trend positive">● Active Catalog</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Low Stock SKUs</div>
                      <div class="mkt-dash-stat-value">18</div>
                      <div class="mkt-dash-stat-trend neutral">⚠️ Reorder Triggered</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Active Locations</div>
                      <div class="mkt-dash-stat-value">3</div>
                      <div class="mkt-dash-stat-trend positive">● 2 Stores, 1 Depot</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Total Stock Value</div>
                      <div class="mkt-dash-stat-value">PKR 4.82M</div>
                      <div class="mkt-dash-stat-trend positive">↑ Weighted Average</div>
                    </div>
                  </div>

                  <!-- Inventory Table Mockup -->
                  <div class="mkt-mockup-table">
                    <div class="mkt-tbl-row head">
                      <span>Product</span>
                      <span>SKU</span>
                      <span>Location</span>
                      <span>On Hand</span>
                      <span>Status</span>
                    </div>
                    <div class="mkt-tbl-row">
                      <span>Dark Roast Coffee (1kg)</span>
                      <span style="font-family:var(--mkt-font-mono); font-size:11px;">SKU-COFFEE-001</span>
                      <span>Store 01</span>
                      <b>98 units</b>
                      <span class="badge in-stock">In Stock</span>
                    </div>
                    <div class="mkt-tbl-row">
                      <span>Organic Green Tea (250g)</span>
                      <span style="font-family:var(--mkt-font-mono); font-size:11px;">SKU-TEA-002</span>
                      <span>Store 01</span>
                      <b>24 units</b>
                      <span class="badge low-stock">Low Stock</span>
                    </div>
                    <div class="mkt-tbl-row">
                      <span>Chocolate Cookies (Pack)</span>
                      <span style="font-family:var(--mkt-font-mono); font-size:11px;">SKU-COOKIE-003</span>
                      <span>Warehouse</span>
                      <b>180 units</b>
                      <span class="badge in-stock">In Stock</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 2: ONE INVENTORY VIEW (INTERACTIVE LOCATION SELECTOR)
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>UNIFIED BALANCES</span>
            </div>
            <h2 class="mkt-section-title">Your Stock. One Clear View.</h2>
            <p class="mkt-section-subtitle">
              Filter stock levels instantly across individual branch registers, retail storefronts, or central reserve depots.
            </p>
          </div>

          <!-- Interactive Location Selector Tabs -->
          <div class="mkt-tour-tabs" style="margin-top:28px;">
            <button class="mkt-tab-btn active" id="loc-tab-all" onclick="window.switchInventoryLocation('all')">🌐 All Locations (1,420 Units)</button>
            <button class="mkt-tab-btn" id="loc-tab-store1" onclick="window.switchInventoryLocation('store1')">🏪 Store 01 (850 Units)</button>
            <button class="mkt-tab-btn" id="loc-tab-store2" onclick="window.switchInventoryLocation('store2')">🏪 Store 02 (430 Units)</button>
            <button class="mkt-tab-btn" id="loc-tab-warehouse" onclick="window.switchInventoryLocation('warehouse')">🏢 Central Warehouse (140 Units)</button>
          </div>

          <!-- Location Details Display Box -->
          <div id="inventory-loc-details" style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; margin-top:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:20px; border-bottom:1px solid var(--mkt-border); padding-bottom:14px;">
              <div>
                <h3 id="loc-detail-title" style="font-size:18px; font-weight:700; color:var(--mkt-text-main);">All Locations Combined</h3>
                <p id="loc-detail-subtitle" style="font-size:13px; color:var(--mkt-text-muted);">Real-time aggregated valuation across all active facilities.</p>
              </div>
              <div style="text-align:right;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">Valuation</div>
                <div id="loc-detail-value" style="font-size:22px; font-weight:800; color:#34d399;">PKR 4,820,000</div>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px;">
              <div class="mkt-feature-card" style="padding:16px;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">Dark Roast Arabica</div>
                <div id="loc-coffee-qty" style="font-size:20px; font-weight:800; color:var(--mkt-text-main); margin:4px 0;">98 Units</div>
                <small style="color:#60a5fa;">PKR 264,502 value</small>
              </div>
              <div class="mkt-feature-card" style="padding:16px;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">Organic Green Tea</div>
                <div id="loc-tea-qty" style="font-size:20px; font-weight:800; color:var(--mkt-text-main); margin:4px 0;">24 Units</div>
                <small style="color:#fbbf24;">PKR 34,800 value</small>
              </div>
              <div class="mkt-feature-card" style="padding:16px;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">Chocolate Cookies</div>
                <div id="loc-cookies-qty" style="font-size:20px; font-weight:800; color:var(--mkt-text-main); margin:4px 0;">180 Units</div>
                <small style="color:#34d399;">PKR 117,000 value</small>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: PRODUCT CATALOG
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>COMPLETE MASTER DATA</span>
            </div>
            <h2 class="mkt-section-title">Every Product Has A Clear Record.</h2>
            <p class="mkt-section-subtitle">
              Manage barcodes, unit costs, selling prices, categories, and safety reorder thresholds in a clean master card.
            </p>
          </div>

          <!-- Product Record Card Mockup -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; border-bottom:1px solid var(--mkt-border); padding-bottom:16px; flex-wrap:wrap; gap:12px;">
              <div>
                <span class="mkt-badge mkt-badge-cyan" style="margin-bottom:6px;">Category: Whole Bean Coffee</span>
                <h3 style="font-size:20px; font-weight:800; color:var(--mkt-text-main);">Dark Roast Arabica Coffee (1kg)</h3>
                <div style="font-family:var(--mkt-font-mono); font-size:12px; color:var(--mkt-text-muted);">SKU: SKU-COFFEE-001 • Primary EAN-13: 8901234567890</div>
              </div>
              <span class="badge in-stock" style="font-size:13px; padding:6px 12px;">● In Stock (98 Units)</span>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:24px;">
              <div style="background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Purchase Cost</div>
                <div style="font-size:16px; font-weight:800; color:var(--mkt-text-main); margin-top:2px;">PKR 1,850</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Selling Price</div>
                <div style="font-size:16px; font-weight:800; color:#34d399; margin-top:2px;">PKR 2,699</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">On Hand Balance</div>
                <div style="font-size:16px; font-weight:800; color:#60a5fa; margin-top:2px;">98 Units</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div style="font-size:11px; color:var(--mkt-text-dim); text-transform:uppercase;">Reorder Level</div>
                <div style="font-size:16px; font-weight:800; color:#fbbf24; margin-top:2px;">20 Units</div>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <span style="font-size:12px; color:var(--mkt-text-muted);">Barcode formats supported: EAN-13, UPC-A, Code-128, QR</span>
              <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/barcode-scanner')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
                Explore Products & Barcodes →
              </a>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: MULTI-LOCATION INVENTORY
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>FACILITY TRACKING</span>
            </div>
            <h2 class="mkt-section-title">See Every Location At A Glance.</h2>
            <p class="mkt-section-subtitle">
              Real-time multi-branch stock reconciliation connecting sales counters with central reserve warehouses.
            </p>
          </div>

          <!-- Location Visual Hub -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:18px; margin-top:36px;">
            
            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:28px; margin-bottom:8px;">🏪</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Store 01 (Commercial)</h4>
              <div style="font-size:24px; font-weight:800; color:#60a5fa; margin:8px 0;">115 Units</div>
              <small style="color:var(--mkt-text-muted);">Active Front Display</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:28px; margin-bottom:8px;">🏪</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Store 02 (Mall Branch)</h4>
              <div style="font-size:24px; font-weight:800; color:#60a5fa; margin:8px 0;">72 Units</div>
              <small style="color:var(--mkt-text-muted);">Active Front Display</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:28px; margin-bottom:8px;">🏢</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Central Warehouse</h4>
              <div style="font-size:24px; font-weight:800; color:#34d399; margin:8px 0;">430 Units</div>
              <small style="color:var(--mkt-text-muted);">Reserve Backstock</small>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.3);">
              <div style="font-size:28px; margin-bottom:8px;">🌐</div>
              <h4 style="font-size:15px; font-weight:700; color:#93c5fd;">Total Network Stock</h4>
              <div style="font-size:24px; font-weight:800; color:#ffffff; margin:8px 0;">617 Units</div>
              <small style="color:#60a5fa;">Synchronized Live ✓</small>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: STOCK MOVEMENT
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>IMMUTABLE LEDGER</span>
            </div>
            <h2 class="mkt-section-title">Know Where Every Unit Went.</h2>
            <p class="mkt-section-subtitle">
              Inventory changes are recorded as clear, timestamped movements instead of mysterious number adjustments.
            </p>
          </div>

          <!-- Movement Sequence Timeline -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; font-weight:700;">
              <span>Movement History: Dark Roast Coffee</span>
              <span style="font-size:12px; color:var(--mkt-text-muted);">SKU-COFFEE-001</span>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,0.02); border-radius:var(--mkt-radius-sm); font-size:13px;">
                <span>📅 Opening Stock Balance</span>
                <b style="color:#60a5fa;">+100 units</b>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,0.02); border-radius:var(--mkt-radius-sm); font-size:13px;">
                <span>🛒 POS Sale (Walk-in Customer)</span>
                <b style="color:#f87171;">−2 units</b>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,0.02); border-radius:var(--mkt-radius-sm); font-size:13px;">
                <span>📥 Supplier Goods Receipt (PO #001)</span>
                <b style="color:#34d399;">+50 units</b>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,0.02); border-radius:var(--mkt-radius-sm); font-size:13px;">
                <span>🚚 Transfer to Store 02</span>
                <b style="color:#f87171;">−30 units</b>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,0.02); border-radius:var(--mkt-radius-sm); font-size:13px;">
                <span>⚠️ Damaged in Transit Adjustment</span>
                <b style="color:#f87171;">−3 units</b>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,0.02); border-radius:var(--mkt-radius-sm); font-size:13px;">
                <span>↩️ Customer Return (Unopened Bag)</span>
                <b style="color:#34d399;">+1 unit</b>
              </div>
            </div>

            <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--mkt-border); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:700; font-size:14px;">Resulting Stock Balance</span>
              <span style="font-size:18px; font-weight:800; color:#34d399;">116 Units</span>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: STOCK TRANSFERS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>INTER-BRANCH WORKFLOW</span>
            </div>
            <h2 class="mkt-section-title">Move Stock Between Locations.</h2>
            <p class="mkt-section-subtitle">
              Dispatch stock from warehouse depots and receive at retail storefronts with two-step manifest verification.
            </p>
          </div>

          <!-- Transfer Workflow Diagram -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px 24px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:center; align-items:center; gap:16px; flex-wrap:wrap; margin-bottom:28px;">
              <div style="background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3); padding:14px 20px; border-radius:var(--mkt-radius-md); text-align:center; min-width:160px;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">SOURCE</div>
                <div style="font-weight:700; font-size:15px; color:#93c5fd;">Store 01</div>
                <div style="font-size:12px; color:var(--mkt-text-muted);">30 units deducted</div>
              </div>

              <div style="font-size:24px; color:#60a5fa;">➔</div>

              <div style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); padding:14px 20px; border-radius:var(--mkt-radius-md); text-align:center; min-width:160px;">
                <div style="font-size:12px; color:#fbbf24;">IN TRANSIT</div>
                <div style="font-weight:700; font-size:15px; color:#fde68a;">Manifest #TRF-001</div>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Dispatched</div>
              </div>

              <div style="font-size:24px; color:#60a5fa;">➔</div>

              <div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); padding:14px 20px; border-radius:var(--mkt-radius-md); text-align:center; min-width:160px;">
                <div style="font-size:12px; color:var(--mkt-text-muted);">DESTINATION</div>
                <div style="font-weight:700; font-size:15px; color:#6ee7b7;">Warehouse</div>
                <div style="font-size:12px; color:var(--mkt-text-muted);">30 units added</div>
              </div>
            </div>

            <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap; font-size:12px;">
              <span class="mkt-badge mkt-badge-cyan">1. Draft Created</span>
              <span class="mkt-badge mkt-badge-cyan">2. Dispatched</span>
              <span class="mkt-badge mkt-badge-green">3. Verified & Received</span>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: STOCK COUNTING
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>PHYSICAL AUDITS</span>
            </div>
            <h2 class="mkt-section-title">Physical Count Made Simple.</h2>
            <p class="mkt-section-subtitle">
              Compare what is physically on the shelf with what the system expects, highlighting discrepancies automatically.
            </p>
          </div>

          <!-- Stock Count Table Mockup -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:800px; margin:32px auto 0 auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <span style="font-weight:700;">Audit Session: Main Store Cycle Count</span>
              <span class="badge in-stock">COUNT COMPLETE</span>
            </div>

            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>Product Name</span>
                <span>System Qty</span>
                <span>Counted Qty</span>
                <span>Difference</span>
              </div>
              <div class="mkt-tbl-row">
                <span>Dark Roast Coffee (1kg)</span>
                <span>100</span>
                <span>97</span>
                <b style="color:#f87171;">−3 units (Variance)</b>
              </div>
              <div class="mkt-tbl-row">
                <span>Organic Green Tea (250g)</span>
                <span>50</span>
                <span>50</span>
                <b style="color:#34d399;">0 (Exact Match)</b>
              </div>
              <div class="mkt-tbl-row">
                <span>Chocolate Cookies (Pack)</span>
                <span>120</span>
                <span>121</span>
                <b style="color:#60a5fa;">+1 unit (Overage)</b>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: STOCK ADJUSTMENTS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>AUDITABLE CORRECTIONS</span>
            </div>
            <h2 class="mkt-section-title">Handle Damaged Or Missing Stock Clearly.</h2>
            <p class="mkt-section-subtitle">
              Every adjustment must include a business reason, user stamp, and audit trail for accounting integrity.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:22px;">
              <div style="font-size:24px; margin-bottom:8px;">💥</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:4px;">Damage / Breakage</h4>
              <div style="font-size:20px; font-weight:800; color:#f87171; margin:6px 0;">−3 Units</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Recorded under shelf shrinkage expense with permanent supervisor note.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px;">
              <div style="font-size:24px; margin-bottom:8px;">🔍</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:4px;">Found Physical Stock</h4>
              <div style="font-size:20px; font-weight:800; color:#34d399; margin:6px 0;">+2 Units</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Restores balance without skewing historical sales or supplier invoices.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px;">
              <div style="font-size:24px; margin-bottom:8px;">✏️</div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:4px;">Data Entry Correction</h4>
              <div style="font-size:20px; font-weight:800; color:#60a5fa; margin:6px 0;">−1 Unit</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Corrects cashier mistypes with complete before/after snapshot logs.</p>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 9: BARCODE & MOBILE SCANNING
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>SCANNER INTEGRATION</span>
            </div>
            <h2 class="mkt-section-title">Find Products Without Typing Everything.</h2>
            <p class="mkt-section-subtitle">
              Verify stock levels in warehouse aisles using USB laser scanners or your smartphone camera.
            </p>
          </div>

          <!-- Barcode Step Flow -->
          <div style="display:flex; justify-content:center; align-items:center; gap:12px; flex-wrap:wrap; margin-top:32px;">
            <span class="mkt-pill">Hardware or Phone Camera</span>
            <span style="color:var(--mkt-text-muted);">→</span>
            <span class="mkt-pill">Barcode Detected</span>
            <span style="color:var(--mkt-text-muted);">→</span>
            <span class="mkt-pill">Product Found</span>
            <span style="color:var(--mkt-text-muted);">→</span>
            <span class="mkt-pill" style="background:rgba(16,185,129,0.2); color:#34d399;">✓ Stock Balance Displayed</span>
          </div>

          <div style="text-align:center; margin-top:28px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/barcode-scanner')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              Explore Barcode Scanner →
            </a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 10: LOW STOCK
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>STOCKOUT PREVENTION</span>
            </div>
            <h2 class="mkt-section-title">See What Needs Attention.</h2>
            <p class="mkt-section-subtitle">
              Visual threshold indicators warn you before fast-selling items run out of stock.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:22px; border-left:4px solid #fbbf24;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Organic Green Tea</h4>
                <span class="badge low-stock">LOW STOCK</span>
              </div>
              <div style="font-size:22px; font-weight:800; color:var(--mkt-text-main); margin:6px 0;">24 Units</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Reorder threshold: 30 units (Store 01)</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px; border-left:4px solid #f87171;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Coffee Filters (Pack 100)</h4>
                <span class="badge" style="background:rgba(239,68,68,0.2); color:#f87171;">CRITICAL</span>
              </div>
              <div style="font-size:22px; font-weight:800; color:#f87171; margin:6px 0;">8 Units</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Safety stock breached (Central Warehouse)</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px; border-left:4px solid #fbbf24;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Paper Shopping Bags</h4>
                <span class="badge low-stock">LOW STOCK</span>
              </div>
              <div style="font-size:22px; font-weight:800; color:var(--mkt-text-main); margin:6px 0;">18 Units</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Reorder threshold: 50 units (Store 02)</p>
            </div>

          </div>

          <div style="text-align:center; margin-top:28px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/purchasing')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              Explore Supplier Purchasing & Restocking →
            </a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 11: INVENTORY + SALES + PURCHASING
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>CONNECTED DATA ENGINE</span>
            </div>
            <h2 class="mkt-section-title">Inventory Doesn't Work Alone.</h2>
            <p class="mkt-section-subtitle">
              Every operation across POS sales, purchasing goods receipts, and inter-branch transfers flows into one live ledger.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">⚡</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">SALE</h4>
              <div style="font-size:13px; color:#f87171; font-weight:700; margin:4px 0;">Stock Decreases</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Instantly upon POS checkout</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">🛍️</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">PURCHASE</h4>
              <div style="font-size:13px; color:#34d399; font-weight:700; margin:4px 0;">Stock Increases</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">When goods receipt (GRN) is posted</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">🚚</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">TRANSFER</h4>
              <div style="font-size:13px; color:#60a5fa; font-weight:700; margin:4px 0;">Location Changes</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Dispatched & received in 2 steps</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:26px; margin-bottom:8px;">↩️</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">RETURN</h4>
              <div style="font-size:13px; color:#a78bfa; font-weight:700; margin:4px 0;">Stock Restored</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Good condition items returned to shelf</p>
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
            
            <h2 class="mkt-cta-title">Stop Guessing About Your Stock.</h2>
            <p class="mkt-cta-desc">
              Build a clearer picture of products, locations and inventory movements.
            </p>

            <div class="mkt-cta-actions">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                Get Started Free →
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
        <div style="margin-top:24px; display:flex; flex-direction:column; gap:10px;">
          <button class="mkt-btn mkt-btn-ghost" onclick="window.navigateMarketing('/auth/login'); window.toggleMarketingMenu()">Sign In</button>
          <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/auth/register'); window.toggleMarketingMenu()">Get Started Free</button>
        </div>
      </div>

    </div>
  `;
}
