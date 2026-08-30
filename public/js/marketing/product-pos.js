/**
 * Universal ERP — Point of Sale (POS) Product Deep Dive Page (/product/pos)
 * Phase 23 — Step 4: Dedicated POS Solution Page
 */

export function renderProductPOSPage() {
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
                <span>POINT OF SALE</span>
              </div>

              <h1 class="mkt-hero-title">
                A Faster, Simpler<br>
                <span class="mkt-gradient-text-accent">Way To Sell.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Turn every customer interaction into a connected sale — with products, inventory, payments and receipts working together.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Start Selling</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#pos-demo" style="text-decoration:none;">
                  <span>See POS In Action</span>
                </a>
              </div>

              <!-- Quick Value Badges -->
              <div style="display:flex; gap:16px; margin-top:28px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-muted);">
                <span>✓ 3-Tap Checkout</span>
                <span>•</span>
                <span>✓ Hardware & Phone Scanner</span>
                <span>•</span>
                <span>✓ 100% Offline Ready</span>
              </div>
            </div>

            <!-- Large High-Fidelity POS Terminal Mockup -->
            <div class="mkt-hero-right" id="pos-demo">
              <div class="mkt-dash-preview-frame">
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/pos</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>REGISTER 01 • ACTIVE</span>
                  </div>
                </div>

                <div class="mkt-dash-body" style="padding:16px;">
                  
                  <!-- POS Search & Categories Bar -->
                  <div style="display:flex; gap:8px; margin-bottom:12px;">
                    <div style="flex:1; background:rgba(255,255,255,0.06); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); padding:8px 12px; font-size:13px; color:var(--mkt-text-muted); display:flex; align-items:center; gap:8px;">
                      <span>🔍</span>
                      <span>Scan barcode or search products (F2)...</span>
                    </div>
                    <span class="mkt-badge mkt-badge-cyan" style="display:flex; align-items:center; gap:4px;">
                      <span>📷</span> Scanner Active
                    </span>
                  </div>

                  <!-- POS Layout: Catalog Left, Cart Right -->
                  <div style="display:grid; grid-template-columns:1fr 1.1fr; gap:12px;">
                    
                    <!-- Product Catalog Items -->
                    <div style="display:flex; flex-direction:column; gap:8px;">
                      <div class="mkt-pos-item" style="padding:10px;">
                        <span>☕</span>
                        <div style="flex:1; min-width:0;">
                          <b style="font-size:13px; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Dark Roast Coffee (1kg)</b>
                          <small style="color:var(--mkt-text-muted);">PKR 2,699 • Stock: 98</small>
                        </div>
                      </div>
                      <div class="mkt-pos-item" style="padding:10px;">
                        <span>🍵</span>
                        <div style="flex:1; min-width:0;">
                          <b style="font-size:13px; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Organic Green Tea (250g)</b>
                          <small style="color:var(--mkt-text-muted);">PKR 1,450 • Stock: 80</small>
                        </div>
                      </div>
                      <div class="mkt-pos-item" style="padding:10px;">
                        <span>🍪</span>
                        <div style="flex:1; min-width:0;">
                          <b style="font-size:13px; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Chocolate Cookies (Pack)</b>
                          <small style="color:var(--mkt-text-muted);">PKR 650 • Stock: 140</small>
                        </div>
                      </div>
                    </div>

                    <!-- Cart & Payment Slip -->
                    <div style="background:rgba(15,23,42,0.85); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
                      <div>
                        <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
                          <span>Current Order (3 Items)</span>
                          <span style="color:#60a5fa; cursor:pointer; font-size:11px;">Clear</span>
                        </div>
                        <div style="font-size:12px; display:flex; flex-direction:column; gap:6px;">
                          <div style="display:flex; justify-content:space-between; color:var(--mkt-text-main);">
                            <span>1x Dark Roast Coffee</span>
                            <b>PKR 2,699</b>
                          </div>
                          <div style="display:flex; justify-content:space-between; color:var(--mkt-text-main);">
                            <span>1x Organic Green Tea</span>
                            <b>PKR 1,450</b>
                          </div>
                          <div style="display:flex; justify-content:space-between; color:var(--mkt-text-main);">
                            <span>1x Chocolate Cookies</span>
                            <b>PKR 650</b>
                          </div>
                        </div>
                      </div>

                      <div style="margin-top:12px; padding-top:8px; border-top:1px dashed var(--mkt-border);">
                        <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:800; color:#34d399; margin-bottom:6px;">
                          <span>Total Payable</span>
                          <span>PKR 4,799</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--mkt-text-muted); margin-bottom:10px;">
                          <span>Cash Received: PKR 5,000</span>
                          <span>Change: PKR 201</span>
                        </div>
                        <button class="mkt-btn mkt-btn-primary" style="width:100%; padding:8px; font-size:12px; font-weight:700;">
                          ✓ Complete Sale (Cash)
                        </button>
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
           SECTION 2: SELL IN SECONDS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>CHECKOUT SPEED</span>
            </div>
            <h2 class="mkt-section-title">From Barcode To Receipt In Seconds.</h2>
            <p class="mkt-section-subtitle">
              Every step is optimized for counter speed, eliminating slow dropdowns and unnecessary confirmations.
            </p>
          </div>

          <!-- 4-Step Sequence -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px; margin-top:36px;">
            
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; font-weight:800; color:#60a5fa; margin-bottom:8px;">01</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">SCAN</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Scan a product using a hardware barcode scanner or compatible phone camera.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; font-weight:800; color:#22d3ee; margin-bottom:8px;">02</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">ADD</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Product price, SKU, and available inventory instantly appear in the active cart.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; font-weight:800; color:#34d399; margin-bottom:8px;">03</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">PAY</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Accept cash, card, bank transfer, or customer credit with auto-calculated change.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; font-weight:800; color:#a78bfa; margin-bottom:8px;">04</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">RECEIPT</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Generate a thermal receipt or PDF invoice and complete the sale in one click.</p>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: SMART CART
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>TOUCH-OPTIMIZED</span>
            </div>
            <h2 class="mkt-section-title">Everything The Cashier Needs. Nothing They Don't.</h2>
            <p class="mkt-section-subtitle">
              The cashier can complete common sales without navigating through complicated menus or confusing nested screens.
            </p>
          </div>

          <!-- Detailed Cart Mockup Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px 24px; max-width:850px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--mkt-border); padding-bottom:14px;">
              <div>
                <span style="font-weight:700; font-size:16px;">Active Cart Lines</span>
                <span style="font-size:12px; color:var(--mkt-text-muted); margin-left:8px;">(Customer: Walk-in Retail)</span>
              </div>
              <button class="mkt-btn mkt-btn-secondary" style="padding:5px 12px; font-size:12px;">Clear Cart</button>
            </div>

            <!-- Cart Line Items with +/- Buttons -->
            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
              
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div>
                  <div style="font-weight:700; font-size:14px;">Dark Roast Coffee (1kg)</div>
                  <div style="font-size:12px; color:var(--mkt-text-dim);">SKU: COF-DR-1KG • Unit: PKR 2,699</div>
                </div>
                <div style="display:flex; align-items:center; gap:14px;">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <button style="width:28px; height:28px; border-radius:4px; background:rgba(255,255,255,0.1); border:none; color:#fff; font-weight:700; cursor:pointer;">−</button>
                    <span style="font-weight:700; min-width:20px; text-align:center;">1</span>
                    <button style="width:28px; height:28px; border-radius:4px; background:rgba(255,255,255,0.1); border:none; color:#fff; font-weight:700; cursor:pointer;">+</button>
                  </div>
                  <span style="font-weight:700; font-size:14px; min-width:85px; text-align:right;">PKR 2,699</span>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border);">
                <div>
                  <div style="font-weight:700; font-size:14px;">Organic Green Tea (250g)</div>
                  <div style="font-size:12px; color:var(--mkt-text-dim);">SKU: TEA-GRN-250G • Unit: PKR 1,450</div>
                </div>
                <div style="display:flex; align-items:center; gap:14px;">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <button style="width:28px; height:28px; border-radius:4px; background:rgba(255,255,255,0.1); border:none; color:#fff; font-weight:700; cursor:pointer;">−</button>
                    <span style="font-weight:700; min-width:20px; text-align:center;">1</span>
                    <button style="width:28px; height:28px; border-radius:4px; background:rgba(255,255,255,0.1); border:none; color:#fff; font-weight:700; cursor:pointer;">+</button>
                  </div>
                  <span style="font-weight:700; font-size:14px; min-width:85px; text-align:right;">PKR 1,450</span>
                </div>
              </div>

            </div>

            <!-- Cart Calculation Summary -->
            <div style="background:rgba(0,0,0,0.25); border-radius:var(--mkt-radius-md); padding:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <div>
                <div style="font-size:13px; color:var(--mkt-text-muted);">Subtotal: PKR 4,799 | Tax (0%): PKR 0 | Discount: PKR 0</div>
                <div style="font-size:20px; font-weight:800; color:#34d399; margin-top:2px;">Total: PKR 4,799</div>
              </div>
              <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/auth/register')">
                Proceed to Payment →
              </button>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: MULTIPLE PAYMENT METHODS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>MULTI-TENDER</span>
            </div>
            <h2 class="mkt-section-title">Take Payment Your Customers Prefer.</h2>
            <p class="mkt-section-subtitle">
              Connect supported payment methods through available integrations and local cash registers.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:18px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:32px; margin-bottom:10px;">💵</div>
              <h4 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Cash Tender</h4>
              <p style="font-size:13px; color:var(--mkt-text-muted);">Auto-computes exact change due and updates cash drawer balances.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:32px; margin-bottom:10px;">💳</div>
              <h4 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Card Payments</h4>
              <p style="font-size:13px; color:var(--mkt-text-muted);">Log POS card machine transaction reference codes seamlessly.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:32px; margin-bottom:10px;">🏦</div>
              <h4 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Bank Transfers</h4>
              <p style="font-size:13px; color:var(--mkt-text-muted);">Record direct IBFT deposits or mobile wallet payments.</p>
            </div>

            <div class="mkt-feature-card" style="padding:22px; text-align:center;">
              <div style="font-size:32px; margin-bottom:10px;">📑</div>
              <h4 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Customer Credit</h4>
              <p style="font-size:13px; color:var(--mkt-text-muted);">Charge verified corporate accounts with built-in credit limit checks.</p>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: INVENTORY CONNECTED TO POS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>INSTANT SYNC</span>
            </div>
            <h2 class="mkt-section-title">Every Sale Updates Your Stock.</h2>
            <p class="mkt-section-subtitle">
              Sales and inventory should never live in separate spreadsheets. Stock is deducted automatically upon completed checkout.
            </p>
          </div>

          <!-- Before / After Card -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:32px; max-width:800px; margin:32px auto 0 auto;">
            <div style="font-weight:700; font-size:16px; margin-bottom:16px; text-align:center;">Product: Dark Roast Coffee (1kg)</div>
            
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
                <small style="color:#6ee7b7;">Reconciled Live ✓</small>
              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: BARCODE SCANNING
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>FLEXIBLE HARDWARE</span>
            </div>
            <h2 class="mkt-section-title">Scan With The Hardware You Already Have. Or Use Your Phone.</h2>
            <p class="mkt-section-subtitle">
              Universal ERP works out of the box with traditional barcode guns as well as standard smartphone cameras.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:28px;">
              <div style="font-size:32px; margin-bottom:12px;">🔫</div>
              <h3 style="font-size:17px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Hardware Barcode Scanners</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Plug in any standard USB or Bluetooth laser scanner. Instant item detection in under 10 milliseconds without configuration.</p>
            </div>

            <div class="mkt-feature-card" style="padding:28px;">
              <div style="font-size:32px; margin-bottom:12px;">📱</div>
              <h3 style="font-size:17px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Mobile Phone Camera</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Scan barcodes directly via Chrome or Safari on iOS and Android with automatic item verification and haptic feedback.</p>
              <div style="margin-top:16px;">
                <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/barcode-scanner')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
                  Explore Barcode Scanner →
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: OFFLINE POS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>ZERO DOWNTIME</span>
            </div>
            <h2 class="mkt-section-title">Keep Selling When Connectivity Drops.</h2>
            <p class="mkt-section-subtitle">
              POS sales remain usable during temporary connectivity interruptions and synchronize automatically when network returns.
            </p>
          </div>

          <!-- 5-Stage Visualization -->
          <div style="display:flex; justify-content:center; align-items:center; gap:10px; flex-wrap:wrap; margin-top:36px; margin-bottom:28px;">
            <div class="mkt-offline-node"><div class="node-icon">🟢</div><b>Online</b><small>Connected</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node alert"><div class="node-icon">🔴</div><b>Connection Lost</b><small>POS Usable</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active"><div class="node-icon">💾</div><b>Sale Saved Locally</b><small>Browser Queue</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node"><div class="node-icon">🟡</div><b>Connection Restored</b><small>Auto Reconnect</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success"><div class="node-icon">✅</div><b>Sync Complete</b><small>0 Duplicates</small></div>
          </div>

          <div style="text-align:center;">
            <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/product/offline-pos')">
              <span>Explore Offline POS Capabilities</span>
              <span>→</span>
            </button>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: RECEIPTS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>THERMAL & PDF</span>
            </div>
            <h2 class="mkt-section-title">A Professional Receipt. Every Time.</h2>
            <p class="mkt-section-subtitle">
              Print clean 58mm / 80mm thermal paper receipts or share electronic PDF invoices instantly.
            </p>
          </div>

          <!-- Realistic Thermal Receipt Card -->
          <div style="background:#ffffff; color:#111827; border-radius:var(--mkt-radius-md); padding:24px; max-width:360px; margin:32px auto 0 auto; font-family:var(--mkt-font-mono); font-size:12px; box-shadow:0 12px 30px rgba(0,0,0,0.5);">
            <div style="text-align:center; font-weight:800; font-size:16px; margin-bottom:4px;">APEX SUPERSTORE</div>
            <div style="text-align:center; font-size:11px; color:#4b5563; margin-bottom:12px;">Shop 14, Commercial Market, Lahore • Phone: 0300-0000001</div>
            
            <div style="border-top:1px dashed #9ca3af; border-bottom:1px dashed #9ca3af; padding:8px 0; margin-bottom:10px;">
              <div>Receipt: #RCP-2026-001095</div>
              <div>Date: 30/08/2026 05:20 PM • Cashier: Zain</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:12px;">
              <div style="display:flex; justify-content:space-between;"><span>1x Dark Roast Coffee (1kg)</span><span>2,699.00</span></div>
              <div style="display:flex; justify-content:space-between;"><span>1x Organic Green Tea (250g)</span><span>1,450.00</span></div>
              <div style="display:flex; justify-content:space-between;"><span>1x Chocolate Cookies (Pack)</span><span>650.00</span></div>
            </div>

            <div style="border-top:1px solid #111827; padding-top:8px; display:flex; flex-direction:column; gap:4px;">
              <div style="display:flex; justify-content:space-between; font-weight:800; font-size:14px;"><span>TOTAL (PKR)</span><span>4,799.00</span></div>
              <div style="display:flex; justify-content:space-between;"><span>Cash Tendered</span><span>5,000.00</span></div>
              <div style="display:flex; justify-content:space-between; font-weight:700;"><span>Change</span><span>201.00</span></div>
            </div>

            <div style="text-align:center; margin-top:16px; font-size:11px; color:#6b7280;">
              Thank you for shopping at Apex Superstore!
            </div>
          </div>

          <div style="text-align:center; margin-top:24px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/documents')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">
              Explore Document Engine →
            </a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 9: MULTI-LOCATION
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>MULTI-BRANCH</span>
            </div>
            <h2 class="mkt-section-title">One POS Experience. Multiple Locations.</h2>
            <p class="mkt-section-subtitle">
              Manage connected retail locations, branch sales counters, and warehouse depots from one central business system.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-top:32px;">
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; margin-bottom:8px;">🏪</div>
              <h4 style="font-size:16px; font-weight:700; margin-bottom:4px;">Store 01 (Commercial Market)</h4>
              <p style="font-size:13px; color:var(--mkt-text-muted);">Today's Sales: PKR 148,000 • In Stock: 850 units</p>
            </div>
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; margin-bottom:8px;">🏪</div>
              <h4 style="font-size:16px; font-weight:700; margin-bottom:4px;">Store 02 (Mall Branch)</h4>
              <p style="font-size:13px; color:var(--mkt-text-muted);">Today's Sales: PKR 100,500 • In Stock: 570 units</p>
            </div>
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; margin-bottom:8px;">🏢</div>
              <h4 style="font-size:16px; font-weight:700; margin-bottom:4px;">Central Warehouse</h4>
              <p style="font-size:13px; color:var(--mkt-text-muted);">Reserve Depot: 4,200 units • 4 POs in transit</p>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 10: CASHIER EXPERIENCE
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>ZERO TRAINING FRICTION</span>
            </div>
            <h2 class="mkt-section-title">Designed For People. Not ERP Experts.</h2>
            <p class="mkt-section-subtitle">
              A new cashier can understand the basic selling workflow with minimal onboarding.
            </p>
          </div>

          <!-- Cashier Flow Steps -->
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-top:32px;">
            <span class="mkt-pill">1. Login</span>
            <span style="color:var(--mkt-text-muted);">→</span>
            <span class="mkt-pill">2. Open POS</span>
            <span style="color:var(--mkt-text-muted);">→</span>
            <span class="mkt-pill">3. Scan / Add</span>
            <span style="color:var(--mkt-text-muted);">→</span>
            <span class="mkt-pill">4. Take Payment</span>
            <span style="color:var(--mkt-text-muted);">→</span>
            <span class="mkt-pill">5. Print Receipt</span>
            <span style="color:var(--mkt-text-muted);">→</span>
            <span class="mkt-pill" style="background:rgba(16,185,129,0.2); color:#34d399;">✓ Done</span>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 11: SECURITY / CONTROL
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>ROLE-BASED ACCESS</span>
            </div>
            <h2 class="mkt-section-title">Give Every Team Member The Right Access.</h2>
            <p class="mkt-section-subtitle">
              Role permissions help keep business financials secure while keeping cashiers focused on counter sales.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-top:32px;">
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; margin-bottom:8px;">👑</div>
              <h3 style="font-size:16px; font-weight:700; margin-bottom:6px;">Owner</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted);">Complete business control, P&L statements, settings, audit logs, and user invitations.</p>
            </div>
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; margin-bottom:8px;">🛡️</div>
              <h3 style="font-size:16px; font-weight:700; margin-bottom:6px;">Manager</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted);">Operational control over inventory transfers, purchase orders, customer ledgers, and discounts.</p>
            </div>
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:24px; margin-bottom:8px;">⚡</div>
              <h3 style="font-size:16px; font-weight:700; margin-bottom:6px;">Cashier</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted);">Focused selling & POS access with zero access to financial audit logs or sensitive profit margins.</p>
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
            
            <h2 class="mkt-cta-title">Ready To Make Checkout Simpler?</h2>
            <p class="mkt-cta-desc">
              Start with a connected POS and grow into a complete business operating system.
            </p>

            <div class="mkt-cta-actions">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                Get Started Free →
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
