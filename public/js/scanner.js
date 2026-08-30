/**
 * Universal ERP — Scanner Service & Camera Barcode Detection Architecture
 * Pluggable for Camera, USB HID scanners, Bluetooth scanners, and Offline Catalog Cache.
 */

// -------------------------------------------------------------
// 1. PRODUCT & BARCODE LOCAL CACHE (OFFLINE-FIRST ARCHITECTURE)
// -------------------------------------------------------------
export const ProductCache = {
  products: new Map(), // productId -> product
  barcodeMap: new Map(), // barcode -> product

  init(productsList = []) {
    this.products.clear();
    this.barcodeMap.clear();
    this.loadFromStorage();
    if (productsList.length > 0) {
      this.populate(productsList);
    }
  },

  populate(products) {
    for (const p of products) {
      const prodObj = {
        id: p.id || p._id,
        name: p.name,
        sku: p.sku,
        sellingPrice: Number(p.sellingPrice) || 0,
        costPrice: Number(p.costPrice) || 0,
        isTaxable: p.isTaxable !== false,
        taxRatePercent: Number(p.taxRatePercent) || 0,
        unit: p.unit || 'PCS',
        categoryName: p.categoryName || 'General',
        quantityOnHand: p.quantityOnHand || 0,
        barcodes: p.barcodes || [],
      };
      this.products.set(prodObj.id, prodObj);

      // Index SKU
      if (prodObj.sku) {
        this.barcodeMap.set(prodObj.sku.trim().toUpperCase(), prodObj);
      }

      // Index primary barcode
      if (p.barcode) {
        this.barcodeMap.set(p.barcode.trim(), prodObj);
      }

      // Index multi-barcodes
      if (Array.isArray(p.barcodes)) {
        for (const b of p.barcodes) {
          const bCode = typeof b === 'string' ? b : b.barcode;
          if (bCode) this.barcodeMap.set(bCode.trim(), prodObj);
        }
      }
    }
    this.saveToStorage();
  },

  lookup(barcodeOrSku) {
    if (!barcodeOrSku) return null;
    const clean = barcodeOrSku.trim();
    // Direct barcode match
    if (this.barcodeMap.has(clean)) return this.barcodeMap.get(clean);
    // Case-insensitive SKU match
    if (this.barcodeMap.has(clean.toUpperCase())) return this.barcodeMap.get(clean.toUpperCase());

    // Search by SKU in product list
    for (const p of this.products.values()) {
      if (p.sku && p.sku.toLowerCase() === clean.toLowerCase()) return p;
      if (p.barcode && p.barcode === clean) return p;
    }
    return null;
  },

  addOrUpdate(product) {
    this.populate([product]);
  },

  saveToStorage() {
    try {
      // Limit offline persisted cache to top 1000 items to avoid mobile storage quota exhaustion
      const array = Array.from(this.products.values()).slice(0, 1000);
      localStorage.setItem('erp_offline_product_cache', JSON.stringify(array));
    } catch (e) {
      console.warn('Local storage quota reached; continuing with high-speed in-memory cache.');
    }
  },

  loadFromStorage() {
    try {
      const raw = localStorage.getItem('erp_offline_product_cache');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) this.populate(list);
      }
    } catch (e) {}
  },
};

// -------------------------------------------------------------
// 2. AUDIO & HAPTIC FEEDBACK (BEEPER & VIBRATION)
// -------------------------------------------------------------
export const FeedbackService = {
  audioCtx: null,

  beep(type = 'success') {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtxClass();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'success') {
        // High crisp beep
        osc.frequency.setValueAtTime(1800, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.12);
      } else if (type === 'warning') {
        // Double low-high tone for unknown barcode
        osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.25);
      }
    } catch (e) {}
  },

  vibrate(durationMs = 80) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(durationMs);
      } catch (e) {}
    }
  },
};

// -------------------------------------------------------------
// 3. BARCODE DETECTION ADAPTER
// -------------------------------------------------------------
export class BarcodeDetectionAdapter {
  constructor() {
    this.detector = null;
    this.isNativeSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window;
    if (this.isNativeSupported) {
      try {
        this.detector = new window.BarcodeDetector({
          formats: [
            'ean_13',
            'ean_8',
            'upc_a',
            'upc_e',
            'code_128',
            'code_39',
            'qr_code',
            'data_matrix',
            'itf',
            'codabar',
          ],
        });
      } catch (e) {
        this.isNativeSupported = false;
      }
    }
  }

  async detect(imageSource) {
    if (this.isNativeSupported && this.detector) {
      try {
        const barcodes = await this.detector.detect(imageSource);
        if (barcodes && barcodes.length > 0) {
          return barcodes.map((b) => ({
            barcode: b.rawValue || b.rawValue,
            format: b.format || 'UNKNOWN',
            boundingBox: b.boundingBox,
          }));
        }
      } catch (e) {}
    }
    return [];
  }
}

// -------------------------------------------------------------
// 4. CAMERA SCANNER (HARDWARE & STREAM CONTROLLER)
// -------------------------------------------------------------
export class CameraScanner {
  constructor(options = {}) {
    this.videoElement = options.videoElement || null;
    this.onDetect = options.onDetect || (() => {});
    this.onError = options.onError || (() => {});
    this.stream = null;
    this.isScanning = false;
    this.track = null;
    this.isTorchOn = false;
    this.detectionAdapter = new BarcodeDetectionAdapter();
    this.animationFrameId = null;
    this.lastDetectedBarcode = null;
    this.lastDetectTime = 0;
    this.cooldownMs = options.cooldownMs || 1500;
  }

  async start() {
    if (this.isScanning) return;
    this.isScanning = true;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this device/browser.');
      }

      // Default to rear-facing environment camera
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.track = this.stream.getVideoTracks()[0] || null;

      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        this.videoElement.setAttribute('playsinline', 'true');
        await this.videoElement.play();
      }

      this.startDetectionLoop();
    } catch (err) {
      this.isScanning = false;
      this.onError(err);
      throw err;
    }
  }

  startDetectionLoop() {
    const loop = async () => {
      if (!this.isScanning) return;

      if (this.videoElement && this.videoElement.readyState >= 2) {
        const now = Date.now();
        try {
          const results = await this.detectionAdapter.detect(this.videoElement);
          if (results && results.length > 0) {
            const detected = results[0].barcode.trim();
            // Prevent duplicate detection within cooldown window
            if (detected !== this.lastDetectedBarcode || now - this.lastDetectTime > this.cooldownMs) {
              this.lastDetectedBarcode = detected;
              this.lastDetectTime = now;
              this.onDetect({
                barcode: detected,
                format: results[0].format,
                timestamp: now,
              });
            }
          }
        } catch (e) {}
      }

      if (this.isScanning) {
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    this.isScanning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.track) {
      if (this.isTorchOn) this.toggleTorch(false).catch(() => {});
      this.track.stop();
      this.track = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  hasTorchCapability() {
    if (!this.track) return false;
    const capabilities = this.track.getCapabilities ? this.track.getCapabilities() : {};
    return Boolean(capabilities.torch);
  }

  async toggleTorch(forceState) {
    if (!this.hasTorchCapability()) return false;
    try {
      const target = forceState !== undefined ? forceState : !this.isTorchOn;
      await this.track.applyConstraints({
        advanced: [{ torch: target }],
      });
      this.isTorchOn = target;
      return this.isTorchOn;
    } catch (e) {
      return false;
    }
  }
}

// -------------------------------------------------------------
// 5. UNIFIED SCANNER SERVICE (ORCHESTRATES HARDWARE & WORKFLOW)
// -------------------------------------------------------------
export const ScannerService = {
  cameraScanner: null,
  activeHandler: null,
  isListeningKeyboard: false,
  barcodeBuffer: '',
  lastKeyTime: 0,

  init(options = {}) {
    ProductCache.init(options.products || []);
    this.setupHardwareWedgeListener();
  },

  // Setup USB / Bluetooth HID barcode wedge scanner listener
  setupHardwareWedgeListener() {
    if (this.isListeningKeyboard || typeof window === 'undefined') return;
    this.isListeningKeyboard = true;

    window.addEventListener('keydown', (e) => {
      // Ignore inputs inside form fields unless Enter is pressed
      const targetTag = e.target?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        if (e.key === 'Enter' && e.target.id === 'pos-search-input') {
          // Process search box as scanned barcode
          const val = e.target.value.trim();
          if (val) {
            this.handleScannedBarcode(val);
          }
        }
        return;
      }

      const now = Date.now();
      if (now - this.lastKeyTime > 80) {
        this.barcodeBuffer = '';
      }
      this.lastKeyTime = now;

      if (e.key === 'Enter') {
        if (this.barcodeBuffer.length >= 3) {
          const barcode = this.barcodeBuffer.trim();
          this.barcodeBuffer = '';
          this.handleScannedBarcode(barcode);
        }
      } else if (e.key.length === 1) {
        this.barcodeBuffer += e.key;
      }
    });
  },

  async handleScannedBarcode(barcodeString) {
    const cleanBarcode = barcodeString.trim();
    if (!cleanBarcode) return;

    FeedbackService.beep('success');
    FeedbackService.vibrate(80);

    // 1. Check local offline cache first (Instant zero-latency lookup)
    let product = ProductCache.lookup(cleanBarcode);

    // 2. If not in local cache, fallback to remote server search
    if (!product && typeof window.api === 'function') {
      try {
        const res = await window.api(`/api/v1/pos/search?query=${encodeURIComponent(cleanBarcode)}`);
        if (res.success && res.data && res.data.length > 0) {
          product = res.data[0];
          ProductCache.addOrUpdate(product);
        }
      } catch (e) {
        // Offline mode or network error: will trigger unknown barcode flow
      }
    }

    if (product) {
      if (this.activeHandler) {
        this.activeHandler.onProductFound(product);
      }
    } else {
      FeedbackService.beep('warning');
      if (this.activeHandler) {
        this.activeHandler.onProductNotFound(cleanBarcode);
      }
    }
  },

  setActiveHandler(handler) {
    this.activeHandler = handler;
  },

  openCameraModal(handler) {
    this.setActiveHandler(handler);
    return renderCameraScannerModal(this);
  },
};

// -------------------------------------------------------------
// 6. CAMERA SCANNER MODAL UI COMPONENT
// -------------------------------------------------------------
export function renderCameraScannerModal(scannerService) {
  const existing = document.getElementById('camera-scanner-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'camera-scanner-modal';
  modal.className = 'modal-backdrop open';
  modal.style.zIndex = '99999';

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 480px; width: 95%; padding: 0; overflow: hidden; background: #000; color: #fff; border-radius: 16px; border: 1px solid var(--border-strong);">
      
      <!-- Scanner Viewport Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding: 14px 18px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);">
        <div style="font-weight: 700; font-size: 15px; display: flex; align-items: center; gap: 8px;">
          📷 Barcode Scanner
        </div>
        <div style="display:flex; gap: 8px;">
          <button id="scanner-torch-btn" class="btn btn-ghost btn-sm" style="display:none; color:#fff;" title="Toggle Flashlight">🔦 Flash</button>
          <button id="scanner-close-btn" class="btn btn-ghost btn-sm" style="color:#fff;">✕</button>
        </div>
      </div>

      <!-- Camera Preview Video & Reticle -->
      <div style="position: relative; width: 100%; height: 340px; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center;">
        <video id="scanner-video" style="width: 100%; height: 100%; object-fit: cover;"></video>
        
        <!-- Animated Scan Overlay / Aiming Reticle -->
        <div style="position: absolute; width: 240px; height: 180px; border: 2px solid rgba(59, 130, 246, 0.8); border-radius: 12px; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5); pointer-events: none; display: flex; align-items: center; justify-content: center;">
          <div style="width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #38bdf8, transparent); animation: scanLaser 2s infinite ease-in-out;"></div>
        </div>

        <!-- Feedback Confirmation Banner -->
        <div id="scanner-feedback-banner" style="position: absolute; top: 12px; background: rgba(16, 185, 129, 0.95); color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; display: none; transform: translateY(-10px); transition: all 200ms ease;">
          ✓ Barcode Detected!
        </div>
      </div>

      <!-- Footer & Fallback Manual Input -->
      <div style="padding: 16px; background: var(--bg-surface-elevated); color: var(--text-main); display: flex; flex-direction: column; gap: 12px;">
        <div style="font-size: 12px; color: var(--text-muted); text-align: center;">
          Align barcode or QR code inside the frame. Camera scans automatically.
        </div>

        <!-- Manual Barcode Input Fallback (for devices without camera or manual entry) -->
        <div style="display: flex; gap: 8px;">
          <input 
            id="scanner-manual-input" 
            class="input" 
            placeholder="Or type barcode manually..." 
            style="font-size: 13px;"
            onkeydown="if(event.key==='Enter'){ document.getElementById('scanner-manual-btn').click(); }"
          >
          <button id="scanner-manual-btn" class="btn btn-secondary btn-sm" style="white-space: nowrap;">Submit</button>
        </div>
      </div>

    </div>
  `;

  // Inject Scan Laser animation if not present
  if (!document.getElementById('scan-laser-style')) {
    const style = document.createElement('style');
    style.id = 'scan-laser-style';
    style.innerHTML = `
      @keyframes scanLaser {
        0% { transform: translateY(-80px); opacity: 0.2; }
        50% { transform: translateY(0px); opacity: 1; }
        100% { transform: translateY(80px); opacity: 0.2; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(modal);

  const videoElem = modal.querySelector('#scanner-video');
  const torchBtn = modal.querySelector('#scanner-torch-btn');
  const closeBtn = modal.querySelector('#scanner-close-btn');
  const banner = modal.querySelector('#scanner-feedback-banner');
  const manualInput = modal.querySelector('#scanner-manual-input');
  const manualBtn = modal.querySelector('#scanner-manual-btn');

  let cameraScanner = null;

  const closeModal = () => {
    if (cameraScanner) cameraScanner.stop();
    modal.remove();
  };

  closeBtn.onclick = closeModal;

  manualBtn.onclick = () => {
    const val = manualInput.value.trim();
    if (val) {
      closeModal();
      scannerService.handleScannedBarcode(val);
    }
  };

  cameraScanner = new CameraScanner({
    videoElement: videoElem,
    onDetect: (result) => {
      if (banner) {
        banner.style.display = 'block';
        banner.innerText = `✓ Scanned: ${result.barcode}`;
      }
      setTimeout(() => {
        closeModal();
        scannerService.handleScannedBarcode(result.barcode);
      }, 350);
    },
    onError: (err) => {
      console.warn('Camera scan error / permission denied:', err.message);
      if (videoElem) {
        videoElem.parentElement.innerHTML = `
          <div style="padding: 30px; text-align: center; color: #fff;">
            <div style="font-size: 32px; margin-bottom: 8px;">📷</div>
            <div style="font-size: 14px; font-weight: 600;">Camera Unavailable or Permission Denied</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
              You can type or scan using a USB/Bluetooth scanner below.
            </div>
          </div>
        `;
      }
    },
  });

  cameraScanner.start().then(() => {
    if (cameraScanner.hasTorchCapability()) {
      torchBtn.style.display = 'inline-block';
      torchBtn.onclick = async () => {
        const state = await cameraScanner.toggleTorch();
        torchBtn.innerText = state ? '🔦 Off' : '🔦 Flash';
      };
    }
  }).catch(() => {});

  return modal;
}
