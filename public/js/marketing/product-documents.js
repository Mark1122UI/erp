/**
 * Universal ERP — Documents & Receipts Dedicated Product Page (/product/documents)
 * Phase 23 — Step 11: Dedicated Document Generation, Invoices & Thermal Receipts Hub
 */

// Client-Side Interactive Controllers
if (typeof window !== 'undefined') {
  window.filterDocumentHistory = (docType) => {
    const rows = document.querySelectorAll('.doc-hist-row');
    const filterBtns = document.querySelectorAll('.doc-filter-btn');

    filterBtns.forEach((btn) => {
      if (btn.getAttribute('data-type') === docType) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    rows.forEach((r) => {
      const rowType = r.getAttribute('data-type');
      if (docType === 'all' || rowType === docType) {
        r.style.display = 'flex';
      } else {
        r.style.display = 'none';
      }
    });
  };

  window.searchDocuments = (query) => {
    const rows = document.querySelectorAll('.doc-hist-row');
    const lowerQuery = query.toLowerCase();

    rows.forEach((r) => {
      const text = r.textContent?.toLowerCase() || '';
      if (!query || text.includes(lowerQuery)) {
        r.style.display = 'flex';
      } else {
        r.style.display = 'none';
      }
    });
  };

  window.triggerDocumentAction = (actionName, docRef) => {
    const toast = document.getElementById('doc-action-toast');
    if (toast) {
      toast.innerText = `✓ ${actionName} prepared for ${docRef}. Output layout formatted.`;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3500);
    }
  };

  window.convertQuotationToInvoice = (quotationRef) => {
    const toast = document.getElementById('doc-action-toast');
    if (toast) {
      toast.innerText = `✓ Quotation ${quotationRef} converted to Sales Invoice #INV-1043. Ready for payment.`;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 4000);
    }
  };

  window.triggerDocumentToast = (msg) => {
    const toast = document.getElementById('doc-action-toast');
    if (toast) {
      toast.innerText = `✓ ${msg}`;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3500);
    }
  };
}

export function renderProductDocumentsPage() {
  return `
    <div class="marketing-wrapper" id="marketing-root">
      <div class="mkt-ambient-glow"></div>

      <!-- Action Feedback Toast -->
      <div id="doc-action-toast" style="display:none; position:fixed; bottom:24px; right:24px; z-index:9999; background:#10b981; color:#ffffff; padding:12px 20px; border-radius:var(--mkt-radius-md); font-weight:700; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
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
           SECTION 1: HERO & DOCUMENT COMMAND CENTER
           ========================================================================= -->
      <section class="mkt-section" style="padding-top:120px; padding-bottom:60px;">
        <div class="mkt-container">
          <div class="mkt-hero-grid">
            
            <div class="mkt-hero-left">
              <div class="mkt-pill-badge">
                <span class="mkt-pill-pulse"></span>
                <span>DOCUMENTS & RECEIPTS</span>
              </div>

              <h1 class="mkt-hero-title">
                Every Transaction. Every Document.<br>
                <span class="mkt-gradient-text-accent">Ready When You Need It.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Generate professional invoices, thermal receipts, credit notes, purchase documents and printable business records directly from your connected ERP.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Start Creating Documents</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#documents-demo" style="text-decoration:none;">
                  <span>See Documents In Action</span>
                </a>
              </div>

              <!-- Quick Badges -->
              <div style="display:flex; gap:16px; margin-top:28px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-muted);">
                <span>✓ 80mm Thermal Receipts</span>
                <span>•</span>
                <span>✓ A4 Tax Invoices</span>
                <span>•</span>
                <span>✓ Instant PDF Export</span>
              </div>
            </div>

            <!-- Document Command Center Mockup -->
            <div class="mkt-hero-right" id="documents-demo">
              <div class="mkt-dash-preview-frame">
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/documents</span>
                  </div>
                  <div class="mkt-dash-status-pill">
                    <span class="mkt-status-dot"></span>
                    <span>DOCUMENTS HUB</span>
                  </div>
                </div>

                <div class="mkt-dash-body" style="padding:16px;">
                  
                  <!-- Metric Cards -->
                  <div class="mkt-dash-metrics-grid" style="margin-bottom:14px;">
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Documents Today</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono);">184 Docs</div>
                      <div class="mkt-dash-stat-trend positive">● Real-Time Log</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Tax Invoices</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono);">126 Billed</div>
                      <div class="mkt-dash-stat-trend positive">↑ Formatted</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">Thermal Receipts</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono);">148 Printed</div>
                      <div class="mkt-dash-stat-trend neutral">🖨️ POS Ready</div>
                    </div>
                    <div class="mkt-dash-stat-card">
                      <div class="mkt-dash-stat-label">PDFs Generated</div>
                      <div class="mkt-dash-stat-value" style="font-family:var(--mkt-font-mono);">172 Files</div>
                      <div class="mkt-dash-stat-trend positive">⚡ 0 Latency</div>
                    </div>
                  </div>

                  <!-- Live Document Stream -->
                  <div class="mkt-dash-feed-box">
                    <div class="mkt-dash-feed-header">
                      <span class="mkt-feed-title">Recent Document Activity</span>
                      <span class="mkt-badge mkt-badge-cyan">Live Ledger</span>
                    </div>
                    <div class="mkt-dash-feed-list">
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#10b981;"></span>
                          <span>Tax Invoice #INV-1042 generated for Summit Tech Cafe</span>
                        </div>
                        <span class="mkt-activity-time">3m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#3b82f6;"></span>
                          <span>Thermal receipt #RCP-1095 printed at Store 01 POS Counter</span>
                        </div>
                        <span class="mkt-activity-time">12m ago</span>
                      </div>
                      <div class="mkt-activity-item">
                        <div class="mkt-activity-left">
                          <span class="mkt-activity-dot" style="background:#8b5cf6;"></span>
                          <span>Credit Note #CRN-2026-0012 issued for returned coffee blend</span>
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
           SECTION 2: ONE TRANSACTION, COMPLETE DOCUMENT TRAIL
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>CONNECTED AUDIT TRAILS</span>
            </div>
            <h2 class="mkt-section-title">One Transaction. Complete Document Trail.</h2>
            <p class="mkt-section-subtitle">
              Every document in Universal ERP is born from a real transaction — guaranteeing that inventory, ledger, and tax records match seamlessly.
            </p>
          </div>

          <!-- Sales Flow Sequence -->
          <div style="text-align:center; margin-bottom:12px; font-weight:700; font-size:13px; color:#60a5fa;">
            SALES & RETAIL PIPELINE
          </div>
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:28px;">
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">🛒</div><b>1. POS Sale</b><small>Scanned</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active" style="min-width:110px;"><div class="node-icon">🧾</div><b>2. Invoice</b><small>INV-1042</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">💳</div><b>3. Payment</b><small>Tendered</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:110px;"><div class="node-icon">🖨️</div><b>4. Receipt</b><small>RCP-1095</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">📦</div><b>5. Stock Sync</b><small>Auto Deduct</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:110px;"><div class="node-icon">📊</div><b>6. Ledger</b><small>P&L Updated</small></div>
          </div>

          <!-- Purchasing Flow Sequence -->
          <div style="text-align:center; margin-bottom:12px; font-weight:700; font-size:13px; color:#34d399;">
            PURCHASING & PROCUREMENT PIPELINE
          </div>
          <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap;">
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">📝</div><b>1. Purchase Order</b><small>PO-1048</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node active" style="min-width:110px;"><div class="node-icon">📥</div><b>2. GRN Slip</b><small>GRN-2031</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node" style="min-width:110px;"><div class="node-icon">📑</div><b>3. Supplier Bill</b><small>BIL-892</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:110px;"><div class="node-icon">💳</div><b>4. Voucher</b><small>PMT-4012</small></div>
            <div class="node-arrow">→</div>
            <div class="mkt-offline-node success" style="min-width:110px;"><div class="node-icon">⚖️</div><b>5. AP Ledger</b><small>Traceable</small></div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: PROFESSIONAL INVOICE BUILDER
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>TAX INVOICING</span>
            </div>
            <h2 class="mkt-section-title">Professional Invoices Ready In Seconds.</h2>
            <p class="mkt-section-subtitle">
              Issue branded tax invoices with automatic itemization, customer NTN details, line discounts, and payment records.
            </p>
          </div>

          <!-- Professional Tax Invoice Frame -->
          <div style="background:#ffffff; color:#111827; border-radius:var(--mkt-radius-xl); padding:32px; max-width:800px; margin:32px auto 0 auto; box-shadow:0 16px 36px rgba(0,0,0,0.4);">
            
            <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #1e293b; padding-bottom:16px; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
              <div>
                <div style="font-size:22px; font-weight:800; color:#0f172a;">APEX SUPERSTORE</div>
                <div style="font-size:12px; color:#475569;">Commercial Plaza, Sector G, Lahore • NTN: 8492019-3</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:16px; font-weight:800; color:#2563eb;">TAX INVOICE</div>
                <div style="font-family:var(--mkt-font-mono); font-size:13px; font-weight:700;">#INV-1042</div>
                <div style="font-size:12px; color:#64748b;">Date: 30/08/2026 • Due: 15/09/2026</div>
              </div>
            </div>

            <!-- Billed To Section -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--mkt-radius-md); padding:12px 16px; margin-bottom:20px;">
              <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase;">Billed To Customer</div>
              <div style="font-weight:800; font-size:15px; color:#0f172a; margin-top:2px;">Summit Tech Cafe</div>
              <div style="font-size:12px; color:#475569;">Plaza 14, Commercial Market • NTN: 9944112-8 • Net 15 Days</div>
            </div>

            <!-- Itemized Table -->
            <div style="margin-bottom:20px; font-size:13px;">
              <div style="display:grid; grid-template-columns:3fr 1fr 1fr 1fr 1fr; font-weight:700; color:#475569; border-bottom:1px solid #cbd5e1; padding-bottom:8px;">
                <span>Item Description</span>
                <span style="text-align:center;">Qty</span>
                <span style="text-align:right;">Unit Price</span>
                <span style="text-align:right;">Tax</span>
                <span style="text-align:right;">Total</span>
              </div>
              <div style="display:grid; grid-template-columns:3fr 1fr 1fr 1fr 1fr; padding:10px 0; border-bottom:1px solid #f1f5f9;">
                <span>Dark Roast Arabica Coffee (1kg)</span>
                <span style="text-align:center;">2</span>
                <span style="text-align:right; font-family:var(--mkt-font-mono);">PKR 2,699</span>
                <span style="text-align:right; font-family:var(--mkt-font-mono);">0.00</span>
                <b style="text-align:right; font-family:var(--mkt-font-mono);">PKR 5,398</b>
              </div>
              <div style="display:grid; grid-template-columns:3fr 1fr 1fr 1fr 1fr; padding:10px 0; border-bottom:1px solid #f1f5f9;">
                <span>Organic Green Tea (250g)</span>
                <span style="text-align:center;">4</span>
                <span style="text-align:right; font-family:var(--mkt-font-mono);">PKR 1,250</span>
                <span style="text-align:right; font-family:var(--mkt-font-mono);">0.00</span>
                <b style="text-align:right; font-family:var(--mkt-font-mono);">PKR 5,000</b>
              </div>
              <div style="display:grid; grid-template-columns:3fr 1fr 1fr 1fr 1fr; padding:10px 0; border-bottom:1px solid #f1f5f9;">
                <span>Ceramic Brand Mugs (Set)</span>
                <span style="text-align:center;">10</span>
                <span style="text-align:right; font-family:var(--mkt-font-mono);">PKR 450</span>
                <span style="text-align:right; font-family:var(--mkt-font-mono);">0.00</span>
                <b style="text-align:right; font-family:var(--mkt-font-mono);">PKR 4,500</b>
              </div>
            </div>

            <!-- Grand Totals & Action Controls -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:2px solid #1e293b; padding-top:16px; flex-wrap:wrap; gap:16px;">
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="mkt-btn mkt-btn-secondary" style="color:#0f172a; border-color:#cbd5e1; padding:6px 12px; font-size:12px;" onclick="window.triggerDocumentAction('Draft saved', 'INV-1042')">💾 Save Draft</button>
                <button class="mkt-btn mkt-btn-secondary" style="color:#0f172a; border-color:#cbd5e1; padding:6px 12px; font-size:12px;" onclick="window.triggerDocumentAction('Invoice emailed', 'INV-1042')">✉️ Send Invoice</button>
                <button class="mkt-btn mkt-btn-secondary" style="color:#0f172a; border-color:#cbd5e1; padding:6px 12px; font-size:12px;" onclick="window.triggerDocumentAction('Print preview loaded', 'INV-1042')">🖨️ Print</button>
                <button class="mkt-btn mkt-btn-secondary" style="color:#0f172a; border-color:#cbd5e1; padding:6px 12px; font-size:12px;" onclick="window.triggerDocumentAction('PDF generated', 'INV-1042')">📥 PDF</button>
              </div>
              <div style="text-align:right;">
                <div style="font-size:12px; color:#64748b;">Subtotal: PKR 14,898.00 | Tax: PKR 0.00</div>
                <div style="font-size:22px; font-weight:800; color:#059669; font-family:var(--mkt-font-mono);">Grand Total: PKR 14,898.00</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: THERMAL RECEIPTS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>POINT OF SALE RECEIPTS</span>
            </div>
            <h2 class="mkt-section-title">Ultra-Fast 80mm Thermal Receipts.</h2>
            <p class="mkt-section-subtitle">
              Instant driver-free printing to USB, ESC/POS, Bluetooth, and Network receipt printers.
            </p>
          </div>

          <!-- Realistic 80mm Thermal Receipt Card -->
          <div style="background:#ffffff; color:#000000; border-radius:var(--mkt-radius-md); padding:24px; max-width:380px; margin:32px auto 0 auto; font-family:var(--mkt-font-mono); font-size:12px; box-shadow:0 12px 30px rgba(0,0,0,0.5);">
            
            <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:10px; margin-bottom:10px;">
              <b style="font-size:16px;">APEX SUPERSTORE</b>
              <div style="font-size:11px;">Store 01 • Main Commercial Blvd</div>
              <div style="font-size:11px;">Tel: 042-35889900 • NTN: 8492019-3</div>
              <div style="margin-top:6px; font-weight:700;">RECEIPT #RCP-1095</div>
              <div style="font-size:10px; color:#555;">30/08/2026 14:32:08 • Cashier: Fatima</div>
            </div>

            <div style="display:flex; flex-direction:column; gap:6px; border-bottom:1px dashed #000; padding-bottom:10px; margin-bottom:10px;">
              <div style="display:flex; justify-content:space-between;">
                <span>2x Dark Roast Coffee (1kg)</span>
                <b>PKR 5,398</b>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>1x Organic Green Tea (250g)</span>
                <b>PKR 1,250</b>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:10px;">
              <div style="display:flex; justify-content:space-between;"><span>Subtotal</span><span>PKR 6,648</span></div>
              <div style="display:flex; justify-content:space-between;"><span>Tax (0%)</span><span>PKR 0.00</span></div>
              <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:800; border-top:1px solid #000; padding-top:4px;">
                <span>TOTAL</span>
                <span>PKR 6,648</span>
              </div>
              <div style="display:flex; justify-content:space-between;"><span>Cash Tendered</span><span>PKR 7,000</span></div>
              <div style="display:flex; justify-content:space-between;"><span>Change Due</span><span>PKR 352</span></div>
            </div>

            <div style="text-align:center; border-top:1px dashed #000; padding-top:10px; font-size:11px;">
              <div>Thank You For Shopping With Us!</div>
              <div style="font-size:10px; color:#666; margin-top:2px;">Scan QR on invoice to view digital warranty</div>
              <div style="margin:8px auto; width:120px; height:20px; background:repeating-linear-gradient(90deg, #000 0, #000 2px, #fff 2px, #fff 4px);"></div>
            </div>

            <div style="display:flex; gap:8px; margin-top:16px;">
              <button class="mkt-btn mkt-btn-secondary" style="width:100%; color:#000; border-color:#999; padding:6px 10px; font-size:11px;" onclick="window.triggerDocumentAction('Thermal receipt sent to printer', 'RCP-1095')">🖨️ Print Receipt</button>
              <button class="mkt-btn mkt-btn-secondary" style="width:100%; color:#000; border-color:#999; padding:6px 10px; font-size:11px;" onclick="window.triggerDocumentAction('Receipt slip downloaded', 'RCP-1095')">📥 Download</button>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: MULTIPLE DOCUMENT TYPES
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>DOCUMENT LIBRARY</span>
            </div>
            <h2 class="mkt-section-title">10 Standard Business Document Types.</h2>
            <p class="mkt-section-subtitle">
              Every document you need to run commercial operations, trade, supply chains, and customer relations.
            </p>
          </div>

          <!-- Document Grid (10 Core Types) -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:22px;">🧾</span>
                <span class="badge in-stock">Sales</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Sales Invoice</h4>
              <div style="font-size:11px; color:#60a5fa; font-family:var(--mkt-font-mono); margin:2px 0;">#INV-1042</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Itemized B2B and retail tax sales record.</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:22px;">📋</span>
                <span class="badge in-stock">Sales</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Quotation / Estimate</h4>
              <div style="font-size:11px; color:#60a5fa; font-family:var(--mkt-font-mono); margin:2px 0;">#QT-2026-0041</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Commercial price quotes convertible to invoice.</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:22px;">🖨️</span>
                <span class="badge in-stock">POS</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Thermal Receipt</h4>
              <div style="font-size:11px; color:#60a5fa; font-family:var(--mkt-font-mono); margin:2px 0;">#RCP-1095</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">80mm checkout receipt with barcode.</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:22px;">↩️</span>
                <span class="badge low-stock">Returns</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Credit Note</h4>
              <div style="font-size:11px; color:#f87171; font-family:var(--mkt-font-mono); margin:2px 0;">#CRN-2026-0012</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Formal credit note reversing invoice balances.</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:22px;">📝</span>
                <span class="badge in-stock">Purchasing</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Purchase Order</h4>
              <div style="font-size:11px; color:#60a5fa; font-family:var(--mkt-font-mono); margin:2px 0;">#PO-1048</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Vendor procurement orders with agreed terms.</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:22px;">📥</span>
                <span class="badge in-stock">Warehouse</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Goods Receipt (GRN)</h4>
              <div style="font-size:11px; color:#34d399; font-family:var(--mkt-font-mono); margin:2px 0;">#GRN-2031</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Inbound stock receiving and variance note.</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:22px;">📑</span>
                <span class="badge in-stock">Payables</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Supplier Bill</h4>
              <div style="font-size:11px; color:#fbbf24; font-family:var(--mkt-font-mono); margin:2px 0;">#BIL-892</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Accounts payable invoice matched to GRN.</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:22px;">📊</span>
                <span class="badge in-stock">CRM</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Customer Statement</h4>
              <div style="font-size:11px; color:#60a5fa; font-family:var(--mkt-font-mono); margin:2px 0;">#STM-CUS-1042</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Monthly customer ledger summary.</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:22px;">🏭</span>
                <span class="badge in-stock">Vendors</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Supplier Statement</h4>
              <div style="font-size:11px; color:#fbbf24; font-family:var(--mkt-font-mono); margin:2px 0;">#STM-SUP-1048</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Vendor liabilities and disbursement summary.</p>
            </div>

            <div class="mkt-feature-card" style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:22px;">💳</span>
                <span class="badge in-stock">Finance</span>
              </div>
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Payment Voucher</h4>
              <div style="font-size:11px; color:#34d399; font-family:var(--mkt-font-mono); margin:2px 0;">#VCH-4012</div>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Audited cash & bank disbursement receipt.</p>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: QUOTATIONS → INVOICES
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>SALES CONVERSION</span>
            </div>
            <h2 class="mkt-section-title">Turn Quotations Into Invoices In One Click.</h2>
            <p class="mkt-section-subtitle">
              Issue estimates with validity dates and convert them into confirmed invoices without re-entering line items.
            </p>
          </div>

          <!-- Quotation Preview Box with Action -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:800px; margin:32px auto 0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--mkt-border); padding-bottom:12px; flex-wrap:wrap; gap:12px;">
              <div>
                <b style="font-size:16px;">Commercial Price Estimate #QT-2026-0041</b>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Customer: Summit Tech Cafe • Valid Until: 15 Sep 2026</div>
              </div>
              <span class="badge in-stock">● CLIENT APPROVED</span>
            </div>

            <div class="mkt-mockup-table" style="margin-bottom:16px;">
              <div class="mkt-tbl-row head"><span>Item</span><span>Qty</span><span>Unit Rate</span><span>Total</span></div>
              <div class="mkt-tbl-row"><span>Commercial Espresso Grinder</span><span>1</span><span>PKR 85,000</span><b style="font-family:var(--mkt-font-mono);">PKR 85,000</b></div>
              <div class="mkt-tbl-row"><span>Dark Roast Arabica Coffee (20kg Bulk)</span><span>1</span><span>PKR 48,000</span><b style="font-family:var(--mkt-font-mono);">PKR 48,000</b></div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; border-top:1px solid var(--mkt-border); padding-top:16px;">
              <div>
                <div style="font-size:12px; color:var(--mkt-text-muted);">Subtotal: PKR 133,000.00</div>
                <div style="font-size:18px; font-weight:800; color:#34d399; font-family:var(--mkt-font-mono);">Estimate Total: PKR 133,000.00</div>
              </div>
              <button class="mkt-btn mkt-btn-primary" onclick="window.convertQuotationToInvoice('QT-2026-0041')">
                ⚡ Convert To Tax Invoice
              </button>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: CREDIT NOTES, RETURNS & REFUNDS
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>RETURN TRACEABILITY</span>
            </div>
            <h2 class="mkt-section-title">Automated Credit Notes & Return Slips.</h2>
            <p class="mkt-section-subtitle">
              Every customer return produces an official Credit Note linked to the original tax invoice, reversing payment debits and returning items to inventory.
            </p>
          </div>

          <!-- Connected Return Flow -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:850px; margin:32px auto 0 auto;">
            <div style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:20px;">
              <span class="mkt-pill">Original #INV-1038</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-pill">Return #RET-0012</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-pill" style="background:rgba(239,68,68,0.2); color:#f87171;">Credit Note #CRN-0012</span>
              <span style="color:var(--mkt-text-muted);">→</span>
              <span class="mkt-pill" style="background:rgba(16,185,129,0.2); color:#34d399;">✓ Stock Restored (+1)</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 18px; background:rgba(255,255,255,0.02); border-radius:var(--mkt-radius-md); border:1px solid var(--mkt-border); flex-wrap:wrap; gap:10px;">
              <div>
                <b>Credit Note #CRN-2026-0012</b>
                <div style="font-size:12px; color:var(--mkt-text-muted);">1x Dark Roast Coffee • Refund PKR 2,699 credited to Customer Ledger</div>
              </div>
              <span class="badge in-stock">Credit Note Cleared</span>
            </div>
          </div>

          <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap; margin-top:24px;">
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/sales')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Sales Invoicing</a>
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/customers')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Customer CRM</a>
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/inventory')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Inventory Updates</a>
            <a href="javascript:void(0)" onclick="window.navigateMarketing('/product/payments')" style="font-size:13px; font-weight:700; color:#60a5fa; text-decoration:none;">→ Payment Reversals</a>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: CUSTOMER & SUPPLIER STATEMENTS
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>STATEMENT REPORTS</span>
            </div>
            <h2 class="mkt-section-title">Customer & Supplier Statements.</h2>
            <p class="mkt-section-subtitle">
              Generate periodic ledger statements for commercial clients and suppliers with running balances.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; max-width:900px; margin:32px auto 0 auto;">
            
            <!-- Customer Statement Card -->
            <div style="background:#ffffff; color:#0f172a; border-radius:var(--mkt-radius-md); padding:20px; font-family:var(--mkt-font-mono); font-size:12px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
              <div style="border-bottom:2px solid #0f172a; padding-bottom:6px; margin-bottom:10px; display:flex; justify-content:space-between;">
                <b>CUSTOMER STATEMENT</b>
                <span style="font-size:11px;">Summit Tech Cafe</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between;"><span>Opening Balance</span><span>PKR 0.00</span></div>
                <div style="display:flex; justify-content:space-between;"><span>Invoices Billed (+)</span><span>PKR 172,480.00</span></div>
                <div style="display:flex; justify-content:space-between;"><span>Payments Received (−)</span><span>PKR 118,500.00</span></div>
              </div>
              <div style="border-top:1px solid #0f172a; padding-top:6px; display:flex; justify-content:space-between; font-weight:800; color:#1e40af;">
                <span>CLOSING RECEIVABLE</span>
                <span>PKR 53,980.00</span>
              </div>
              <div style="display:flex; gap:6px; margin-top:14px;">
                <button class="mkt-btn mkt-btn-secondary" style="width:100%; color:#000; border-color:#999; padding:4px 8px; font-size:10px;" onclick="window.triggerDocumentAction('Customer Statement PDF prepared', 'Summit Tech Cafe')">📥 PDF</button>
                <button class="mkt-btn mkt-btn-secondary" style="width:100%; color:#000; border-color:#999; padding:4px 8px; font-size:10px;" onclick="window.triggerDocumentAction('Customer Statement printed', 'Summit Tech Cafe')">🖨️ Print</button>
              </div>
            </div>

            <!-- Supplier Statement Card -->
            <div style="background:#ffffff; color:#0f172a; border-radius:var(--mkt-radius-md); padding:20px; font-family:var(--mkt-font-mono); font-size:12px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
              <div style="border-bottom:2px solid #0f172a; padding-bottom:6px; margin-bottom:10px; display:flex; justify-content:space-between;">
                <b>SUPPLIER STATEMENT</b>
                <span style="font-size:11px;">Direct Trade Coffee</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between;"><span>Opening Balance</span><span>PKR 0.00</span></div>
                <div style="display:flex; justify-content:space-between;"><span>Vendor Bills (+)</span><span>PKR 105,500.00</span></div>
                <div style="display:flex; justify-content:space-between;"><span>Disbursements (−)</span><span>PKR 21,000.00</span></div>
              </div>
              <div style="border-top:1px solid #0f172a; padding-top:6px; display:flex; justify-content:space-between; font-weight:800; color:#b45309;">
                <span>CLOSING PAYABLE</span>
                <span>PKR 84,500.00</span>
              </div>
              <div style="display:flex; gap:6px; margin-top:14px;">
                <button class="mkt-btn mkt-btn-secondary" style="width:100%; color:#000; border-color:#999; padding:4px 8px; font-size:10px;" onclick="window.triggerDocumentAction('Vendor Statement PDF prepared', 'Direct Trade Coffee')">📥 PDF</button>
                <button class="mkt-btn mkt-btn-secondary" style="width:100%; color:#000; border-color:#999; padding:4px 8px; font-size:10px;" onclick="window.triggerDocumentAction('Vendor Statement printed', 'Direct Trade Coffee')">🖨️ Print</button>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 9: DOCUMENT SEARCH & HISTORY
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>DOCUMENT REPOSITORY</span>
            </div>
            <h2 class="mkt-section-title">Instant Search & Document Archives.</h2>
            <p class="mkt-section-subtitle">
              Locate any historic invoice, receipt, purchase order, or voucher by reference number or party name.
            </p>
          </div>

          <!-- Document Table Frame -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:28px; max-width:950px; margin:32px auto 0 auto;">
            
            <!-- Search & Filters -->
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
              <input type="text" placeholder="🔍 Search document # or party..." oninput="window.searchDocuments(this.value)" style="background:rgba(255,255,255,0.05); border:1px solid var(--mkt-border); padding:8px 14px; border-radius:var(--mkt-radius-md); color:#fff; min-width:240px;" />
              
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="mkt-btn mkt-btn-secondary doc-filter-btn active" data-type="all" onclick="window.filterDocumentHistory('all')" style="padding:6px 10px; font-size:11px;">All</button>
                <button class="mkt-btn mkt-btn-secondary doc-filter-btn" data-type="invoice" onclick="window.filterDocumentHistory('invoice')" style="padding:6px 10px; font-size:11px;">Invoices</button>
                <button class="mkt-btn mkt-btn-secondary doc-filter-btn" data-type="receipt" onclick="window.filterDocumentHistory('receipt')" style="padding:6px 10px; font-size:11px;">Receipts</button>
                <button class="mkt-btn mkt-btn-secondary doc-filter-btn" data-type="credit" onclick="window.filterDocumentHistory('credit')" style="padding:6px 10px; font-size:11px;">Credit Notes</button>
                <button class="mkt-btn mkt-btn-secondary doc-filter-btn" data-type="po" onclick="window.filterDocumentHistory('po')" style="padding:6px 10px; font-size:11px;">POs</button>
                <button class="mkt-btn mkt-btn-secondary doc-filter-btn" data-type="voucher" onclick="window.filterDocumentHistory('voucher')" style="padding:6px 10px; font-size:11px;">Vouchers</button>
              </div>
            </div>

            <!-- Table Rows -->
            <div class="mkt-mockup-table">
              <div class="mkt-tbl-row head">
                <span>Document #</span>
                <span>Type</span>
                <span>Party / Counter</span>
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              <div class="mkt-tbl-row doc-hist-row" data-type="invoice">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">INV-1042</span>
                <span class="badge in-stock">Tax Invoice</span>
                <span>Summit Tech Cafe</span>
                <span>Today</span>
                <b style="font-family:var(--mkt-font-mono);">PKR 14,898</b>
                <span class="badge in-stock">Issued</span>
                <button class="mkt-btn mkt-btn-secondary" style="padding:2px 8px; font-size:10px;" onclick="window.triggerDocumentAction('PDF opened', 'INV-1042')">PDF</button>
              </div>
              <div class="mkt-tbl-row doc-hist-row" data-type="receipt">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">RCP-1095</span>
                <span class="badge in-stock">POS Receipt</span>
                <span>Walk-in Customer</span>
                <span>Today</span>
                <b style="font-family:var(--mkt-font-mono);">PKR 6,648</b>
                <span class="badge in-stock">Printed</span>
                <button class="mkt-btn mkt-btn-secondary" style="padding:2px 8px; font-size:10px;" onclick="window.triggerDocumentAction('Receipt reprinted', 'RCP-1095')">Print</button>
              </div>
              <div class="mkt-tbl-row doc-hist-row" data-type="credit">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">CRN-2026-0012</span>
                <span class="badge low-stock">Credit Note</span>
                <span>Summit Tech Cafe</span>
                <span>Yesterday</span>
                <b style="color:#f87171; font-family:var(--mkt-font-mono);">PKR 2,699</b>
                <span class="badge in-stock">Reconciled</span>
                <button class="mkt-btn mkt-btn-secondary" style="padding:2px 8px; font-size:10px;" onclick="window.triggerDocumentAction('Credit note PDF exported', 'CRN-2026-0012')">PDF</button>
              </div>
              <div class="mkt-tbl-row doc-hist-row" data-type="po">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">PO-1048</span>
                <span class="badge in-stock">Purchase Order</span>
                <span>Direct Trade Coffee</span>
                <span>15 Sep 2026</span>
                <b style="font-family:var(--mkt-font-mono);">PKR 105,500</b>
                <span class="badge low-stock">Partial</span>
                <button class="mkt-btn mkt-btn-secondary" style="padding:2px 8px; font-size:10px;" onclick="window.triggerDocumentAction('PO order slip exported', 'PO-1048')">PDF</button>
              </div>
              <div class="mkt-tbl-row doc-hist-row" data-type="voucher">
                <span style="font-family:var(--mkt-font-mono); font-size:11px;">VCH-4012</span>
                <span class="badge in-stock">Payment Voucher</span>
                <span>Meezan Bank IBFT</span>
                <span>18 Aug 2026</span>
                <b style="font-family:var(--mkt-font-mono);">PKR 94,000</b>
                <span class="badge in-stock">Disbursed</span>
                <button class="mkt-btn mkt-btn-secondary" style="padding:2px 8px; font-size:10px;" onclick="window.triggerDocumentAction('Voucher PDF opened', 'VCH-4012')">PDF</button>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 10: PDF / PRINT / EXPORT EXPERIENCE
           ========================================================================= -->
      <section class="mkt-section" style="background:var(--mkt-bg-secondary); border-top:1px solid var(--mkt-border); border-bottom:1px solid var(--mkt-border);">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>OUTPUT CONTROLS</span>
            </div>
            <h2 class="mkt-section-title">Print, Export, Email, and Share.</h2>
            <p class="mkt-section-subtitle">
              Export standard PDF documents, stream ESC/POS thermal formats, or send directly to client email addresses.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; max-width:850px; margin:32px auto 0 auto;">
            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">🖨️</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Instant Print</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Direct to thermal receipt or office laser printers.</p>
              <button class="mkt-btn mkt-btn-secondary" style="margin-top:8px; padding:4px 10px; font-size:11px;" onclick="window.triggerDocumentToast('Laser print preview formatted')">Test Print</button>
            </div>

            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">📥</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Vector PDF</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Crystal-clear vector PDF export with company logo.</p>
              <button class="mkt-btn mkt-btn-secondary" style="margin-top:8px; padding:4px 10px; font-size:11px;" onclick="window.triggerDocumentToast('Vector PDF generated')">Export PDF</button>
            </div>

            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">✉️</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Email Transmission</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Send PDF invoice directly to customer inboxes.</p>
              <button class="mkt-btn mkt-btn-secondary" style="margin-top:8px; padding:4px 10px; font-size:11px;" onclick="window.triggerDocumentToast('Invoice queued for email dispatch')">Email Test</button>
            </div>

            <div class="mkt-feature-card" style="padding:20px; text-align:center;">
              <div style="font-size:24px; margin-bottom:6px;">📋</div>
              <h4 style="font-size:14px; font-weight:700; color:var(--mkt-text-main);">Duplicate & Reissue</h4>
              <p style="font-size:12px; color:var(--mkt-text-muted);">Clone prior orders or re-print lost receipts.</p>
              <button class="mkt-btn mkt-btn-secondary" style="margin-top:8px; padding:4px 10px; font-size:11px;" onclick="window.triggerDocumentToast('Document duplicated to draft')">Clone Doc</button>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           SECTION 11: DOCUMENT CONTROL & AUDIT TRAIL
           ========================================================================= -->
      <section class="mkt-section">
        <div class="mkt-container">
          
          <div class="mkt-section-header">
            <div class="mkt-pill-badge">
              <span>DOCUMENT GOVERNANCE</span>
            </div>
            <h2 class="mkt-section-title">Immutable References & Sequential Audit Trails.</h2>
            <p class="mkt-section-subtitle">
              Every document is assigned a unique sequential identifier and maintains a strict lifecycle from Draft to Issued, Paid, and Archived.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-top:32px;">
            
            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:10px;">🔢</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Sequential Numbering</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Configurable prefixes (INV-, RCP-, PO-, CRN-) with gapless sequential numbering compliant with tax regulations.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:10px;">👑</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Role-Based Document RBAC</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Cashiers issue POS receipts, store managers approve tax invoices, and company owners control financial statements.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:10px;">🔒</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Immutable Transaction Link</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Posted invoices cannot be altered arbitrarily; adjustments require explicit Credit Notes to preserve auditability.</p>
            </div>

            <div class="mkt-feature-card" style="padding:24px;">
              <div style="font-size:28px; margin-bottom:10px;">📜</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:6px;">Permanent Document History</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Retrieve original receipt copies, customer payment vouchers, and supplier delivery notes years after issuance.</p>
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
            
            <h2 class="mkt-cta-title">Turn Every Business Transaction<br>Into A Professional Record.</h2>
            <p class="mkt-cta-desc">
              Generate branded invoices, thermal receipts, supplier purchase orders and audit statements from one connected ERP system.
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
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/suppliers')">Suppliers & Vendors</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/payments')">Payments & Expenses</a></li>
                <li><a href="javascript:void(0)" onclick="window.navigateMarketing('/product/documents')">Documents & Receipts</a></li>
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
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/documents'); window.toggleMarketingMenu()">Documents & Receipts</a>
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
