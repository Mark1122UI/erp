/**
 * Universal ERP — Camera & Hardware Barcode Scanner Product Deep Dive Page (/product/barcode-scanner)
 * Phase 24 — Restored Dedicated Barcode & Hardware Scanning Hub
 */

// Client-Side Interactive Controllers for Barcode Scanner
if (typeof window !== 'undefined') {
  window.scannerSimState = {
    isCameraActive: false,
    selectedSymbology: 'EAN13',
    scannedItems: [
      { code: '8901030384721', name: 'Organic Colombian Dark Roast (1kg)', category: 'Beverages', price: 2699, stock: 94, time: '10:42:15 AM' },
      { code: '4008400404127', name: 'Artisan Hazelnut Spread (400g)', category: 'Pantry', price: 1250, stock: 48, time: '10:41:50 AM' },
      { code: '5000159461122', name: 'Ceramic Pour-Over Dripper V60', category: 'Hardware', price: 3400, stock: 22, time: '10:40:12 AM' },
    ],
    demoCatalog: {
      '8901030384721': { name: 'Organic Colombian Dark Roast (1kg)', category: 'Beverages', price: 2699, stock: 94 },
      '4008400404127': { name: 'Artisan Hazelnut Spread (400g)', category: 'Pantry', price: 1250, stock: 48 },
      '5000159461122': { name: 'Ceramic Pour-Over Dripper V60', category: 'Hardware', price: 3400, stock: 22 },
      '7622210449283': { name: 'Belgian Dark Chocolate 85% (100g)', category: 'Snacks', price: 750, stock: 130 },
      '9300657001429': { name: 'Barista Oat Milk (1 Liter)', category: 'Dairy Alternatives', price: 890, stock: 65 },
      'QR-BATCH-2026': { name: 'Master Shipping Crate — Batch #902', category: 'Logistics Package', price: 0, stock: 12 },
    },
  };

  window.toggleCameraScannerSim = () => {
    window.scannerSimState.isCameraActive = !window.scannerSimState.isCameraActive;
    const feed = document.getElementById('camera-sim-feed');
    const laser = document.getElementById('camera-laser-line');
    const statusText = document.getElementById('camera-status-text');
    const toggleBtn = document.getElementById('camera-toggle-btn');

    if (feed && laser && statusText && toggleBtn) {
      if (window.scannerSimState.isCameraActive) {
        feed.style.background = 'rgba(15, 23, 42, 0.95)';
        laser.style.display = 'block';
        statusText.innerHTML = '<span style="color:#34d399;">● CAMERA LIVE (60 FPS Stream Active)</span>';
        toggleBtn.innerText = 'Stop Camera Stream';
        toggleBtn.className = 'mkt-btn mkt-btn-secondary';
        window.triggerScannerToast('Camera initialized: BarcodeDetector hardware acceleration enabled.');
      } else {
        feed.style.background = '#090d16';
        laser.style.display = 'none';
        statusText.innerHTML = '<span style="color:var(--mkt-text-dim);">○ CAMERA STANDBY</span>';
        toggleBtn.innerText = 'Start Camera Stream';
        toggleBtn.className = 'mkt-btn mkt-btn-primary';
      }
    }
  };

  window.simulateScanBarcode = (barcode) => {
    const item = window.scannerSimState.demoCatalog[barcode];
    if (!item) {
      window.triggerScannerToast(`Barcode '${barcode}' not found in local catalog cache.`, 'warning');
      return;
    }

    const now = new Date().toLocaleTimeString();
    window.scannerSimState.scannedItems.unshift({
      code: barcode,
      name: item.name,
      category: item.category,
      price: item.price,
      stock: item.stock,
      time: now,
    });

    // Update UI ledger
    const listEl = document.getElementById('scanner-history-list');
    const countEl = document.getElementById('scanner-total-count');
    const lastScanEl = document.getElementById('scanner-last-code');

    if (lastScanEl) lastScanEl.innerText = barcode;
    if (countEl) countEl.innerText = `${window.scannerSimState.scannedItems.length} Scans Logged`;

    if (listEl) {
      listEl.innerHTML = window.scannerSimState.scannedItems
        .slice(0, 5)
        .map(
          (s) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); margin-bottom:8px; font-size:12px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:rgba(59,130,246,0.15); color:#60a5fa; padding:2px 6px; border-radius:4px; font-family:var(--mkt-font-mono); font-size:11px;">${s.code}</span>
            <div>
              <b style="color:var(--mkt-text-main); display:block;">${s.name}</b>
              <small style="color:var(--mkt-text-muted);">${s.category} • Stock: ${s.stock}</small>
            </div>
          </div>
          <div style="text-align:right;">
            <b style="color:#34d399;">PKR ${s.price.toLocaleString()}</b>
            <div style="color:var(--mkt-text-dim); font-size:10px;">${s.time}</div>
          </div>
        </div>
      `
        )
        .join('');
    }

    // Audio / Visual feedback
    const laser = document.getElementById('camera-laser-line');
    if (laser) {
      laser.style.borderColor = '#34d399';
      setTimeout(() => {
        laser.style.borderColor = '#ef4444';
      }, 300);
    }

    window.triggerScannerToast(`Scanned: ${item.name} (PKR ${item.price}) — Fast-path matched in 8ms.`);
  };

  window.clearScannerHistory = () => {
    window.scannerSimState.scannedItems = [];
    const listEl = document.getElementById('scanner-history-list');
    const countEl = document.getElementById('scanner-total-count');
    if (listEl) listEl.innerHTML = '<div style="color:var(--mkt-text-dim); font-size:12px; text-align:center; padding:20px;">No scans recorded yet. Select a sample barcode above.</div>';
    if (countEl) countEl.innerText = '0 Scans Logged';
    window.triggerScannerToast('Scanner audit history cleared.');
  };

  window.triggerScannerToast = (msg, type = 'success') => {
    const toast = document.getElementById('scanner-toast');
    if (toast) {
      toast.innerText = (type === 'success' ? '✓ ' : '⚠ ') + msg;
      toast.style.background = type === 'success' ? '#10b981' : '#f59e0b';
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3500);
    }
  };
}

export function renderProductBarcodeScannerPage() {
  return `
    <div class="marketing-wrapper" id="marketing-root">
      <div class="mkt-ambient-glow"></div>

      <!-- Action Feedback Toast -->
      <div id="scanner-toast" style="display:none; position:fixed; bottom:24px; right:24px; z-index:9999; background:#10b981; color:#ffffff; padding:12px 20px; border-radius:var(--mkt-radius-md); font-weight:700; font-size:13px; box-shadow:0 8px 24px rgba(0,0,0,0.4);">
        ✓ Scanner Ready
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
           SECTION 1: HERO & SCANNER COMMAND SUITE
           ========================================================================= -->
      <section class="mkt-section" style="padding-top:120px; padding-bottom:60px;">
        <div class="mkt-container">
          <div class="mkt-hero-grid">
            
            <div class="mkt-hero-left">
              <div class="mkt-pill-badge">
                <span class="mkt-pill-pulse"></span>
                <span>BARCODE & HARDWARE SUITE</span>
              </div>

              <h1 class="mkt-hero-title">
                Scan Everything.<br>
                <span class="mkt-gradient-text-accent">Zero Cost Hardware.</span>
              </h1>

              <p class="mkt-hero-subtitle">
                Transform any smartphone, tablet camera, or standard USB/Bluetooth handheld barcode scanner into an industrial-grade checkout and stock audit tool with instant projection lookups.
              </p>

              <div class="mkt-hero-actions">
                <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                  <span>Start Scanning Free</span>
                  <span>→</span>
                </button>
                <a class="mkt-btn mkt-btn-secondary mkt-btn-lg" href="#scanner-demo" style="text-decoration:none;">
                  <span>Interactive Scanner Demo</span>
                </a>
              </div>

              <!-- Quick Highlights -->
              <div style="display:flex; gap:16px; margin-top:28px; flex-wrap:wrap; font-size:13px; color:var(--mkt-text-muted);">
                <span>✓ Phone Camera & Gun Scanners</span>
                <span>•</span>
                <span>✓ EAN-13, UPC-A, Code 128, QR</span>
                <span>•</span>
                <span>✓ Under 15ms Fast-Path Lookup</span>
              </div>
            </div>

            <!-- Interactive Live Barcode Studio Preview Frame -->
            <div class="mkt-hero-right" id="scanner-demo">
              <div class="mkt-dash-preview-frame">
                <div class="mkt-dash-chrome">
                  <div class="mkt-dash-dots">
                    <span class="mkt-dot red"></span>
                    <span class="mkt-dot yellow"></span>
                    <span class="mkt-dot green"></span>
                  </div>
                  <div class="mkt-dash-url-pill">
                    <span>🔒</span>
                    <span>app.universalerp.com/pos/scanner</span>
                  </div>
                  <div class="mkt-dash-status-pill" id="camera-status-text">
                    <span style="color:var(--mkt-text-dim);">○ CAMERA STANDBY</span>
                  </div>
                </div>

                <div class="mkt-dash-body" style="padding:16px;">
                  
                  <!-- Camera Viewport / Laser Scan Simulation Box -->
                  <div id="camera-sim-feed" style="position:relative; height:150px; background:#090d16; border:1px dashed rgba(59,130,246,0.4); border-radius:var(--mkt-radius-md); display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden; margin-bottom:14px; transition:var(--mkt-transition);">
                    <div id="camera-laser-line" style="display:none; position:absolute; width:85%; height:2px; background:#ef4444; box-shadow:0 0 12px #ef4444; border-top:1px solid #ef4444; animation:scanLineMove 2s infinite ease-in-out;"></div>
                    <div style="font-size:32px; margin-bottom:6px; opacity:0.8;">📷</div>
                    <div style="font-size:12px; font-weight:600; color:var(--mkt-text-muted);">Built-in Web BarcodeDetector Engine</div>
                    <div style="font-size:11px; color:var(--mkt-text-dim); margin-top:2px;">Align barcode within viewfinder or trigger hardware gun</div>
                  </div>

                  <!-- Controls Bar -->
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; gap:8px;">
                    <button id="camera-toggle-btn" class="mkt-btn mkt-btn-primary" style="padding:6px 14px; font-size:12px;" onclick="window.toggleCameraScannerSim()">Start Camera Stream</button>
                    <button class="mkt-btn mkt-btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="window.clearScannerHistory()">Clear Log</button>
                  </div>

                  <!-- Symbology Quick Barcode Trigger Palette -->
                  <div style="margin-bottom:14px;">
                    <div style="font-size:11px; font-weight:700; color:var(--mkt-text-dim); text-transform:uppercase; margin-bottom:6px;">Simulate Barcode Trigger:</div>
                    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px;">
                      <button class="mkt-btn mkt-btn-ghost" style="padding:6px; font-size:11px; border:1px solid var(--mkt-border); text-align:left;" onclick="window.simulateScanBarcode('8901030384721')">
                        <span style="color:#60a5fa;">EAN-13</span> Coffee 1kg
                      </button>
                      <button class="mkt-btn mkt-btn-ghost" style="padding:6px; font-size:11px; border:1px solid var(--mkt-border); text-align:left;" onclick="window.simulateScanBarcode('4008400404127')">
                        <span style="color:#60a5fa;">UPC-A</span> Hazelnut Spread
                      </button>
                      <button class="mkt-btn mkt-btn-ghost" style="padding:6px; font-size:11px; border:1px solid var(--mkt-border); text-align:left;" onclick="window.simulateScanBarcode('5000159461122')">
                        <span style="color:#60a5fa;">Code 128</span> V60 Dripper
                      </button>
                    </div>
                  </div>

                  <!-- Real-time Scan Ledger -->
                  <div style="background:rgba(0,0,0,0.25); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <span style="font-size:12px; font-weight:700; color:var(--mkt-text-main);">Live Ingestion Queue</span>
                      <span id="scanner-total-count" style="font-size:11px; color:#34d399; font-weight:600;">3 Scans Logged</span>
                    </div>
                    <div id="scanner-history-list">
                      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); margin-bottom:6px; font-size:12px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                          <span style="background:rgba(59,130,246,0.15); color:#60a5fa; padding:2px 6px; border-radius:4px; font-family:var(--mkt-font-mono); font-size:11px;">8901030384721</span>
                          <b style="color:var(--mkt-text-main);">Organic Barista Dark Roast (1kg)</b>
                        </div>
                        <b style="color:#34d399;">PKR 2,699</b>
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
           SECTION 2: INDUSTRIAL SYMBOLOGY & FORMAT SUPPORT
           ========================================================================= -->
      <section class="mkt-section mkt-section-alt" style="padding:80px 0;">
        <div class="mkt-container">
          <div class="mkt-section-header">
            <span class="mkt-pill">Industrial Precision</span>
            <h2 class="mkt-section-title">Universal Symbology Compatibility</h2>
            <p class="mkt-section-subtitle">Read every standard retail, shipping, pharmaceutical, and electronic format without third-party translation middleware.</p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px;">
            <div class="mkt-feature-card">
              <div style="font-size:32px; margin-bottom:16px;">🏷️</div>
              <h3 style="font-size:18px; font-weight:700; color:var(--mkt-text-main); margin-bottom:10px;">EAN-13 & UPC-A</h3>
              <p style="font-size:14px; color:var(--mkt-text-muted); line-height:1.6; margin-bottom:16px;">The global retail standard for packaged goods and consumer items. Automatic checksum validation prevents corrupted scans.</p>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <span class="mkt-badge mkt-badge-blue">Retail Products</span>
                <span class="mkt-badge mkt-badge-blue">Supermarkets</span>
                <span class="mkt-badge mkt-badge-blue">Consumer Goods</span>
              </div>
            </div>

            <div class="mkt-feature-card">
              <div style="font-size:32px; margin-bottom:16px;">📦</div>
              <h3 style="font-size:18px; font-weight:700; color:var(--mkt-text-main); margin-bottom:10px;">Code 128 & Code 39</h3>
              <p style="font-size:14px; color:var(--mkt-text-muted); line-height:1.6; margin-bottom:16px;">High-density alphanumeric barcodes supporting serial numbers, batch lot identifiers, and internal warehouse bin locations.</p>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <span class="mkt-badge mkt-badge-cyan">Serial Numbers</span>
                <span class="mkt-badge mkt-badge-cyan">Warehouse Depots</span>
                <span class="mkt-badge mkt-badge-cyan">Pallet Lots</span>
              </div>
            </div>

            <div class="mkt-feature-card">
              <div style="font-size:32px; margin-bottom:16px;">📱</div>
              <h3 style="font-size:18px; font-weight:700; color:var(--mkt-text-main); margin-bottom:10px;">2D QR & DataMatrix</h3>
              <p style="font-size:14px; color:var(--mkt-text-muted); line-height:1.6; margin-bottom:16px;">Multi-line payload decoding for transfer manifests, batch manufacturing expiry stamps, and digital invoice verification.</p>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <span class="mkt-badge mkt-badge-emerald">Batch Tracking</span>
                <span class="mkt-badge mkt-badge-emerald">Shipment Manifests</span>
                <span class="mkt-badge mkt-badge-emerald">Digital Receipts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 3: CAMERA SCANNING VS DEDICATED HARDWARE
           ========================================================================= -->
      <section class="mkt-section" style="padding:80px 0;">
        <div class="mkt-container">
          <div class="mkt-section-header">
            <span class="mkt-pill">Device Agnostic</span>
            <h2 class="mkt-section-title">Zero Hardware Lock-In</h2>
            <p class="mkt-section-subtitle">Use standard consumer hardware or plug in existing handheld guns — Universal ERP adapts automatically.</p>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:32px;">
            <!-- Mobile Camera Mode -->
            <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-lg); padding:32px;">
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
                <div style="font-size:32px;">📸</div>
                <div>
                  <h3 style="font-size:18px; font-weight:700; color:var(--mkt-text-main);">Mobile / Tablet Camera Scanner</h3>
                  <div style="font-size:13px; color:#60a5fa;">Zero extra cost • Uses native camera feed</div>
                </div>
              </div>
              <ul style="list-style:none; padding:0; margin:0 0 24px 0; display:flex; flex-direction:column; gap:12px; font-size:14px; color:var(--mkt-text-muted);">
                <li style="display:flex; gap:10px; align-items:flex-start;">
                  <span style="color:#34d399; font-weight:bold;">✓</span>
                  <span><strong>Instant Deployment:</strong> Hand any staff member an Android or iOS phone to perform aisle audits.</span>
                </li>
                <li style="display:flex; gap:10px; align-items:flex-start;">
                  <span style="color:#34d399; font-weight:bold;">✓</span>
                  <span><strong>Continuous Loop Scanning:</strong> Scan multiple items consecutively without tapping the screen between items.</span>
                </li>
                <li style="display:flex; gap:10px; align-items:flex-start;">
                  <span style="color:#34d399; font-weight:bold;">✓</span>
                  <span><strong>Flashlight / Torch Toggle:</strong> Built-in low-light illumination support for dark stockrooms and depots.</span>
                </li>
              </ul>
            </div>

            <!-- Hardware Scanner Gun Mode -->
            <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-lg); padding:32px;">
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
                <div style="font-size:32px;">🔫</div>
                <div>
                  <h3 style="font-size:18px; font-weight:700; color:var(--mkt-text-main);">USB / Bluetooth Hardware Guns</h3>
                  <div style="font-size:13px; color:#34d399;">Plug & Play HID keyboard wedge mode</div>
                </div>
              </div>
              <ul style="list-style:none; padding:0; margin:0 0 24px 0; display:flex; flex-direction:column; gap:12px; font-size:14px; color:var(--mkt-text-muted);">
                <li style="display:flex; gap:10px; align-items:flex-start;">
                  <span style="color:#34d399; font-weight:bold;">✓</span>
                  <span><strong>Zero Driver Install:</strong> Compatible with Zebra, Honeywell, Datalogic, Inateck, and generic 2.4G guns.</span>
                </li>
                <li style="display:flex; gap:10px; align-items:flex-start;">
                  <span style="color:#34d399; font-weight:bold;">✓</span>
                  <span><strong>Sub-5ms Rapid Buffering:</strong> Intercepts high-speed keystrokes even while cashiers type customer notes.</span>
                </li>
                <li style="display:flex; gap:10px; align-items:flex-start;">
                  <span style="color:#34d399; font-weight:bold;">✓</span>
                  <span><strong>Hardware Beep / Vibrator:</strong> Instant physical confirmation on every successful product addition.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 4: HIGH-SPEED FAST-PATH PROJECTION ENGINE
           ========================================================================= -->
      <section class="mkt-section mkt-section-alt" style="padding:80px 0;">
        <div class="mkt-container">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center;">
            <div>
              <span class="mkt-pill">Performance Architecture</span>
              <h2 class="mkt-section-title" style="text-align:left; margin-top:12px;">Under 15ms Fast-Path Lookup</h2>
              <p style="color:var(--mkt-text-muted); font-size:15px; line-height:1.6; margin-bottom:20px;">
                Traditional legacy ERPs perform bloated heavy SQL joins upon every scanned barcode, introducing 300ms+ lag per cashier beep. Universal ERP utilizes a lean in-memory index projection engine.
              </p>

              <div style="display:flex; flex-direction:column; gap:14px;">
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <span style="font-size:20px;">⚡</span>
                  <div>
                    <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Lean Projection Payloads</h4>
                    <p style="font-size:13px; color:var(--mkt-text-muted);">Returns only the 5 vital fields required for instantaneous checkout calculation (ID, Name, Price, Tax Rate, Stock Balance).</p>
                  </div>
                </div>
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <span style="font-size:20px;">💾</span>
                  <div>
                    <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Client-Side LRU Memory Cache</h4>
                    <p style="font-size:13px; color:var(--mkt-text-muted);">Frequently scanned items reside directly in browser memory, executing zero network requests on repeated sales.</p>
                  </div>
                </div>
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <span style="font-size:20px;">🛡️</span>
                  <div>
                    <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main);">Compound Barcode Indexing</h4>
                    <p style="font-size:13px; color:var(--mkt-text-muted);">Multi-tenant compound index ensures exact barcode matching in O(1) time complexity even across 500,000 SKUs.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Visual Performance Benchmark Comparison Chart -->
            <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-lg); padding:28px;">
              <h4 style="font-size:15px; font-weight:700; color:var(--mkt-text-main); margin-bottom:20px;">Lookup Latency Comparison (Lower is Faster)</h4>

              <div style="margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
                  <span style="font-weight:700; color:#34d399;">Universal ERP (Fast-Path Cache)</span>
                  <span style="font-weight:700; color:#34d399;">8 ms</span>
                </div>
                <div style="width:100%; height:10px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden;">
                  <div style="width:5%; height:100%; background:#10b981;"></div>
                </div>
              </div>

              <div style="margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
                  <span style="font-weight:600; color:var(--mkt-text-muted);">Cloud API Roundtrip (Indexed)</span>
                  <span style="font-weight:600; color:var(--mkt-text-muted);">45 ms</span>
                </div>
                <div style="width:100%; height:10px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden;">
                  <div style="width:25%; height:100%; background:#3b82f6;"></div>
                </div>
              </div>

              <div style="margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
                  <span style="font-weight:600; color:var(--mkt-text-dim);">Legacy Desktop ERP (Local SQL)</span>
                  <span style="font-weight:600; color:var(--mkt-text-dim);">280 ms</span>
                </div>
                <div style="width:100%; height:10px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden;">
                  <div style="width:65%; height:100%; background:#f59e0b;"></div>
                </div>
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
                  <span style="font-weight:600; color:var(--mkt-text-dim);">Standard Web SaaS (Unindexed)</span>
                  <span style="font-weight:600; color:var(--mkt-text-dim);">650 ms</span>
                </div>
                <div style="width:100%; height:10px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden;">
                  <div style="width:100%; height:100%; background:#ef4444;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 5: MULTI-BARCODE & VARIANT MAPPING
           ========================================================================= -->
      <section class="mkt-section" style="padding:80px 0;">
        <div class="mkt-container">
          <div class="mkt-section-header">
            <span class="mkt-pill">Variant Flexibility</span>
            <h2 class="mkt-section-title">Multi-Barcode Product Mapping</h2>
            <p class="mkt-section-subtitle">Assign multiple manufacturer barcodes, supplier pack codes, and unit conversion labels to a single product.</p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px;">
            <div class="mkt-feature-card">
              <div style="font-size:28px; margin-bottom:12px;">🔄</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Single vs Pack Barcodes</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Scan a single can (e.g. 1 Unit) or scan the outer carton barcode (e.g. 24 Units) with automatic multiplier recognition.</p>
            </div>

            <div class="mkt-feature-card">
              <div style="font-size:28px; margin-bottom:12px;">🎨</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Color & Size Matrix SKUs</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Each apparel variant (Small/Red, Medium/Blue) retains unique barcode identifiers linked to central parent inventory balances.</p>
            </div>

            <div class="mkt-feature-card">
              <div style="font-size:28px; margin-bottom:12px;">🖨️</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Thermal Label Printing</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Generate and print custom adhesive barcode stickers (50x25mm, 40x30mm) directly for unbarcoded or repacked merchandise.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 6: RAPID STOCK AUDIT & RECONCILIATION
           ========================================================================= -->
      <section class="mkt-section mkt-section-alt" style="padding:80px 0;">
        <div class="mkt-container">
          <div class="mkt-section-header">
            <span class="mkt-pill">Stockroom Efficiency</span>
            <h2 class="mkt-section-title">Rapid Batch Stock Audits</h2>
            <p class="mkt-section-subtitle">Perform physical cycle counts in record time without shutting down store operations.</p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px;">
            <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:24px;">
              <div style="font-size:24px; color:#60a5fa; margin-bottom:12px;">01. Walk the Aisle</div>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Staff point their phone cameras at shelf merchandise, continuously registering inventory counts with audio chimes.</p>
            </div>
            <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:24px;">
              <div style="font-size:24px; color:#60a5fa; margin-bottom:12px;">02. Auto-Aggregate</div>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Multiple scans of the same SKU automatically increment the counted quantity without manual keyboard tallying.</p>
            </div>
            <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:24px;">
              <div style="font-size:24px; color:#60a5fa; margin-bottom:12px;">03. Variance Diff</div>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Instant visual discrepancy breakdown comparing physical counted units against expected ERP ledger quantities.</p>
            </div>
            <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:24px;">
              <div style="font-size:24px; color:#60a5fa; margin-bottom:12px;">04. One-Tap Post</div>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Approve adjustments with mandatory audit reason codes (e.g. Broken/Damaged, Found Inventory, Expiry Loss).</p>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 7: WAREHOUSE RECEIVING & GRN VERIFICATION
           ========================================================================= -->
      <section class="mkt-section" style="padding:80px 0;">
        <div class="mkt-container">
          <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:40px; align-items:center;">
            <div>
              <span class="mkt-pill">Supply Chain Ingestion</span>
              <h2 class="mkt-section-title" style="text-align:left; margin-top:12px;">Scan-to-Receive Goods (GRN)</h2>
              <p style="color:var(--mkt-text-muted); font-size:15px; line-height:1.6; margin-bottom:20px;">
                Never accept incorrect supplier deliveries again. Match physical delivery boxes against supplier purchase orders with barcode precision.
              </p>
              <div style="display:flex; flex-direction:column; gap:12px; font-size:14px; color:var(--mkt-text-muted);">
                <div style="display:flex; gap:10px; align-items:center;">
                  <span style="color:#34d399;">✓</span>
                  <span><strong>Shortage Detection:</strong> Highlights under-shipped items before you sign the delivery note.</span>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                  <span style="color:#34d399;">✓</span>
                  <span><strong>Over-Shipment Safeguards:</strong> Alerts warehouse staff if unauthorized products are included in shipments.</span>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                  <span style="color:#34d399;">✓</span>
                  <span><strong>Automated AP Bill:</strong> Finalizing the scan automatically logs the verified accounts payable debt.</span>
                </div>
              </div>
            </div>

            <div style="background:var(--mkt-bg-card); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-lg); padding:24px;">
              <div style="font-size:13px; font-weight:700; color:var(--mkt-text-main); margin-bottom:14px; display:flex; justify-content:space-between;">
                <span>GRN Verification #PO-8812</span>
                <span class="mkt-badge mkt-badge-emerald">3/3 Matched ✓</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:12px;">
                <div style="padding:8px 12px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:var(--mkt-radius-sm); display:flex; justify-content:space-between;">
                  <span>EAN: 8901030384721 • Dark Roast (1kg)</span>
                  <b style="color:#34d399;">24 / 24 Recv</b>
                </div>
                <div style="padding:8px 12px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:var(--mkt-radius-sm); display:flex; justify-content:space-between;">
                  <span>EAN: 4008400404127 • Hazelnut Spread (400g)</span>
                  <b style="color:#34d399;">50 / 50 Recv</b>
                </div>
                <div style="padding:8px 12px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:var(--mkt-radius-sm); display:flex; justify-content:space-between;">
                  <span>EAN: 5000159461122 • Pour-Over Dripper V60</span>
                  <b style="color:#34d399;">12 / 12 Recv</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 8: SECURITY, DUPLICATE DEFENSE & HAPTICS
           ========================================================================= -->
      <section class="mkt-section mkt-section-alt" style="padding:80px 0;">
        <div class="mkt-container">
          <div class="mkt-section-header">
            <span class="mkt-pill">Safe Execution</span>
            <h2 class="mkt-section-title">Smart Error Defense & Audio Feedback</h2>
            <p class="mkt-section-subtitle">Prevent accidental double-scans and instantly flag unrecognized barcodes with distinctive sensory cues.</p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px;">
            <div class="mkt-feature-card">
              <div style="font-size:28px; margin-bottom:12px;">🔊</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Synthesized Audio Chimes</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Clear pleasant chime for valid item addition; low-frequency alert tone for unknown SKUs or low stock warnings.</p>
            </div>

            <div class="mkt-feature-card">
              <div style="font-size:28px; margin-bottom:12px;">📳</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Haptic Vibration Pulse</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Physical tactile feedback on supported mobile devices confirms scans even in noisy retail environments.</p>
            </div>

            <div class="mkt-feature-card">
              <div style="font-size:28px; margin-bottom:12px;">⏱️</div>
              <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">Debounce & Double-Scan Lock</h3>
              <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">Configurable 400ms scan debounce window prevents a single item resting under the camera from ringing up twice.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 9: OFFLINE BARCODE RESOLUTION
           ========================================================================= -->
      <section class="mkt-section" style="padding:80px 0;">
        <div class="mkt-container">
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); padding:40px; text-align:center;">
            <span class="mkt-pill" style="margin-bottom:16px;">100% Offline Capable</span>
            <h2 style="font-size:28px; font-weight:800; color:var(--mkt-text-main); margin-bottom:16px;">Zero Downtime During Internet Outages</h2>
            <p style="color:var(--mkt-text-muted); max-width:700px; margin:0 auto 28px auto; font-size:15px; line-height:1.6;">
              Universal ERP pre-caches your top 1,000 product barcodes in secure browser memory. When internet drops, barcode scanning continues without missing a beat.
            </p>
            <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap;">
              <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/product/offline-pos')">Explore Offline Mode →</button>
              <button class="mkt-btn mkt-btn-secondary" onclick="window.navigateMarketing('/product/pos')">View POS Solution</button>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 10: COMPARISON TABLE (UNIVERSAL ERP VS TRADITIONAL SCANNERS)
           ========================================================================= -->
      <section class="mkt-section mkt-section-alt" style="padding:80px 0;">
        <div class="mkt-container">
          <div class="mkt-section-header">
            <span class="mkt-pill">Feature Comparison</span>
            <h2 class="mkt-section-title">Built for Modern Flexibility</h2>
            <p class="mkt-section-subtitle">How Universal ERP barcode intelligence compares against legacy hardware-bound setups.</p>
          </div>

          <div class="mkt-table-container">
            <table class="mkt-table">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th style="color:#60a5fa;">Universal ERP Barcode Suite</th>
                  <th>Legacy Desktop POS</th>
                  <th>Generic Tablet Apps</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Camera Scanning</b></td>
                  <td><span class="mkt-check">✓ Native 60fps Web BarcodeDetector</span></td>
                  <td><span class="mkt-cross">✕ No Camera Support</span></td>
                  <td><span class="mkt-check">✓ Slow Third-Party Plugin</span></td>
                </tr>
                <tr>
                  <td><b>Hardware Gun Support</b></td>
                  <td><span class="mkt-check">✓ Instant HID Plug & Play</span></td>
                  <td><span class="mkt-check">✓ Requires COM Port Drivers</span></td>
                  <td><span class="mkt-cross">✕ Proprietary Bluetooth Only</span></td>
                </tr>
                <tr>
                  <td><b>Lookup Speed</b></td>
                  <td><span class="mkt-check">✓ Under 15ms (Fast-Path Cache)</span></td>
                  <td><span class="mkt-cross">✕ 250ms+ Local DB Lock</span></td>
                  <td><span class="mkt-cross">✕ 500ms+ Cloud Roundtrip</span></td>
                </tr>
                <tr>
                  <td><b>Multi-Barcode per SKU</b></td>
                  <td><span class="mkt-check">✓ Unlimited (Single, Pack, Lot)</span></td>
                  <td><span class="mkt-cross">✕ 1 Barcode Limit</span></td>
                  <td><span class="mkt-cross">✕ Paid Add-on</span></td>
                </tr>
                <tr>
                  <td><b>Offline Resolution</b></td>
                  <td><span class="mkt-check">✓ 1,000+ Pre-Cached In-Browser</span></td>
                  <td><span class="mkt-check">✓ Local Machine Only</span></td>
                  <td><span class="mkt-cross">✕ Fails when offline</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 11: MERCHANT TESTIMONIAL & PROOF
           ========================================================================= -->
      <section class="mkt-section" style="padding:80px 0;">
        <div class="mkt-container mkt-container-narrow">
          <div style="background:var(--mkt-bg-card); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-lg); padding:36px; text-align:center;">
            <div style="color:#f59e0b; font-size:20px; margin-bottom:16px;">★★★★★</div>
            <blockquote style="font-size:17px; color:var(--mkt-text-main); line-height:1.6; font-style:italic; margin:0 0 20px 0;">
              "We replaced three expensive dedicated barcode scanners with our staff’s own Android phones. Our aisle stock counts used to take two days each month — now we finish our entire supermarket stock reconciliation in under 3 hours."
            </blockquote>
            <div style="font-weight:700; color:var(--mkt-text-main);">Tariq Mehmood</div>
            <div style="font-size:13px; color:var(--mkt-text-muted);">Operations Director • Metro Gourmet Supermarkets (4 Locations)</div>
          </div>
        </div>
      </section>

      <!-- =========================================================================
           SECTION 12: FINAL CALL TO ACTION & FOOTER
           ========================================================================= -->
      <section class="mkt-section mkt-section-alt" style="padding:80px 0;">
        <div class="mkt-container">
          <div style="text-align:center; max-width:800px; margin:0 auto;">
            <h2 style="font-size: clamp(2rem, 4vw, 2.75rem); font-weight:800; color:var(--mkt-text-main); margin-bottom:16px;">
              Ready to Upgrade Your Checkout Speed?
            </h2>
            <p style="color:var(--mkt-text-muted); font-size:16px; margin-bottom:32px;">
              Launch your cashier terminals in minutes with zero upfront hardware investment.
            </p>
            <div style="display:flex; justify-content:center; gap:14px; flex-wrap:wrap;">
              <button class="mkt-btn mkt-btn-primary mkt-btn-lg" onclick="window.navigateMarketing('/auth/register')">
                <span>Start Free 14-Day Trial</span>
                <span>→</span>
              </button>
              <button class="mkt-btn mkt-btn-secondary mkt-btn-lg" onclick="window.navigateMarketing('/product/pos')">
                <span>Explore Full POS</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Shared Modern Footer -->
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
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/barcode-scanner'); window.toggleMarketingMenu()">Barcode Scanner</a>
        <a class="mkt-mobile-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product/offline-pos'); window.toggleMarketingMenu()">Offline Mode</a>
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
