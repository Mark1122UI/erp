/**
 * Universal ERP / Business Operating System — Client Application Shell
 */

import { ScannerService, ProductCache, FeedbackService } from './scanner.js';
import { LoadingScreenService } from './ui/loading-screen.js';
import { MarketingWebsite } from './marketing/marketing.js';
import { renderSplitLoginView, render5StepOnboardingView } from './auth/auth-views.js';
import { PUBLIC_ROUTES_REGISTRY, renderPublicPageShell } from './marketing/pages.js';
import { renderProductOverviewPage } from './marketing/product-overview.js';
import { renderProductPOSPage } from './marketing/product-pos.js';
import { renderProductInventoryPage } from './marketing/product-inventory.js';
import { renderProductSalesPage } from './marketing/product-sales.js';
import { renderProductPurchasingPage } from './marketing/product-purchasing.js';
import { renderProductCustomersPage } from './marketing/product-customers.js';
import { renderProductSuppliersPage } from './marketing/product-suppliers.js';
import { renderProductPaymentsPage } from './marketing/product-payments.js';
import { renderProductDocumentsPage } from './marketing/product-documents.js';
import { renderProductIntegrationsPage } from './marketing/product-integrations.js';
import { renderProductReportsPage } from './marketing/product-reports.js';

// Global State
const state = {
  user: null,
  tenant: null,
  membership: null,
  availableBusinesses: [],
  currentRoute: 'dashboard',
  theme: localStorage.getItem('erp_theme') || 'dark',
  isLoading: true,
  users: [],
  auditLogs: [],
  customers: [],
  customerFilter: { search: '', hasBalance: false, isArchived: false },
  suppliers: [],
  supplierFilter: { search: '', hasBalance: false, isArchived: false },
  products: [],
  productFilter: { search: '', categoryName: '', isArchived: false },
  selectedParty: null,
  selectedProduct: null,
  locations: [],
  selectedLocationId: '',
  inventoryItems: [],
  inventoryFilter: { search: '', isLowStock: false },
  sales: [],
  salesFilter: { search: '', status: '' },
  selectedSale: null,
  purchaseOrders: [],
  supplierBills: [],
  purchasingTab: 'orders',
  dashboardData: null,
  moneySummary: null,
  expenses: [],
  expenseCategories: [],
  expenseFilter: { category: '', search: '' },

  // POS State
  posCart: [],
  posProducts: [],
  posSearchQuery: '',
  posCategoryFilter: 'ALL',
  posSelectedCustomerId: '',
  posSelectedLocationId: '',

  // Phase 17 Onboarding, Settings & Checklist State
  onboardingStep: 1,
  onboardingData: {
    business: {},
    location: {},
    products: [],
  },
  settingsTab: 'business',
  settingsData: null,
  setupChecklist: null,
  setupChecklistDismissed: localStorage.getItem('erp_checklist_dismissed') === 'true',
};

// UI Component Helpers
const UI = {
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconMap = {
      success: '✓',
      danger: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    toast.innerHTML = `
      <span style="font-weight:bold; font-size:16px;">${iconMap[type] || 'ℹ'}</span>
      <div style="flex:1;">${message}</div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 200);
    }, 4000);
  },

  confirm(title, message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop open';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="card-title">${title}</h3>
          <button class="btn btn-ghost btn-sm" id="close-confirm">✕</button>
        </div>
        <div class="modal-body">
          <p style="color: var(--text-muted); font-size: 14px;">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-confirm">Cancel</button>
          <button class="btn btn-danger" id="action-confirm">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#close-confirm').onclick = close;
    modal.querySelector('#cancel-confirm').onclick = close;
    modal.querySelector('#action-confirm').onclick = () => {
      close();
      onConfirm();
    };
  },

  renderEmptyState(title, desc, actionBtnHtml = '') {
    return `
      <div class="state-container">
        <div class="state-icon">🛒</div>
        <div class="state-title">${title}</div>
        <div class="state-desc">${desc}</div>
        ${actionBtnHtml}
      </div>
    `;
  },

  renderLoadingState() {
    return `
      <div class="state-container">
        <div class="spinner"></div>
        <div class="state-desc" style="margin-top:12px;">Loading records...</div>
      </div>
    `;
  },

  renderErrorState(message, retryFnName) {
    return `
      <div class="state-container">
        <div class="state-icon" style="color: var(--danger)">⚠</div>
        <div class="state-title">Error Loading Data</div>
        <div class="state-desc">${message}</div>
        <button class="btn btn-secondary btn-sm" onclick="${retryFnName}()">Retry</button>
      </div>
    `;
  }
};

// API Client Wrapper
export async function api(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(state.tenant?.id ? { 'X-Tenant-ID': state.tenant.id } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data?.error?.message || 'Request failed');
      err.data = data;
      throw err;
    }
    return data;
  } catch (error) {
    throw error;
  }
}
window.api = api;

// Navigation Definitions
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', permission: null },
  { id: 'pos', label: 'POS Terminal', icon: '🛒', permission: 'pos:access' },
  { id: 'money', label: 'Money & Financials', icon: '💰', permission: 'financials:read' },
  { id: 'sales', label: 'Sales & Invoices', icon: '💳', permission: 'sales:read' },
  { id: 'purchases', label: 'Purchases & POs', icon: '📋', permission: 'purchases:read' },
  { id: 'products', label: 'Products', icon: '🏷️', permission: 'products:read' },
  { id: 'inventory', label: 'Inventory', icon: '🏢', permission: 'inventory:read' },
  { id: 'customers', label: 'Customers', icon: '👥', permission: 'customers:read' },
  { id: 'suppliers', label: 'Suppliers', icon: '🚚', permission: 'suppliers:read' },
  { id: 'reports', label: 'Reports', icon: '📈', permission: 'reports:view' },
  { id: 'tasks', label: 'Tasks', icon: '✓', permission: 'tasks:read' },
  { id: 'users', label: 'Team & RBAC', icon: '👤', permission: 'users:read' },
  { id: 'audit', label: 'Audit Log', icon: '🛡️', permission: 'audit:read' },
  { id: 'integrations', label: 'Integrations', icon: '⚡', permission: 'integrations:manage' },
  { id: 'settings', label: 'Settings', icon: '⚙️', permission: 'tenant:settings' },
];

function canAccess(permission) {
  if (!permission) return true;
  if (state.membership?.role === 'Owner') return true;
  return state.membership?.permissions?.includes(permission);
}

// Application Initialization
async function initApp() {
  document.documentElement.setAttribute('data-theme', state.theme);
  LoadingScreenService.show();

  // Resolve initial public route from browser URL or hash
  const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const currentHash = window.location.hash.toLowerCase().replace(/^#\/?/, '/');
  const targetInitialRoute = currentHash || (currentPath !== '' ? currentPath : '/');

  try {
    const res = await api('/api/v1/auth/me');
    if (res.success) {
      state.user = res.data.user;
      state.tenant = res.data.currentBusiness;
      state.membership = res.data.membership;
      state.availableBusinesses = res.data.availableBusinesses || [];

      // Initialize Universal Scanner Service
      ScannerService.init();

      if (!state.tenant.isSetupComplete && state.membership.role === 'Owner') {
        state.currentRoute = 'setup';
      }
    }
  } catch (err) {
    state.user = null;
    state.tenant = null;
    
    // Set unauthenticated initial public route
    if (targetInitialRoute === '/auth/login' || targetInitialRoute === '/login' || targetInitialRoute === 'login') {
      state.currentRoute = '/auth/login';
      state.authMode = 'login';
    } else if (targetInitialRoute === '/auth/register' || targetInitialRoute === '/register' || targetInitialRoute === 'register' || targetInitialRoute === '/auth/onboarding' || targetInitialRoute === '/onboarding') {
      state.currentRoute = '/auth/register';
      state.authMode = 'register';
    } else if (PUBLIC_ROUTES_REGISTRY[targetInitialRoute]) {
      state.currentRoute = targetInitialRoute;
    } else {
      state.currentRoute = targetInitialRoute === '' ? '/' : targetInitialRoute;
    }
  } finally {
    state.isLoading = false;
    renderApp();
    if (state.user) {
      loadRouteData(state.currentRoute);
    }
    setTimeout(() => {
      LoadingScreenService.hide();
    }, 150);
  }
}

// Global Renderer
function renderApp() {
  const root = document.getElementById('app');

  if (state.isLoading) {
    return;
  }

  if (!state.user) {
    // 1. Auth Views
    if (state.currentRoute === '/auth/login' || state.currentRoute === 'login' || state.currentRoute === '/login') {
      root.innerHTML = renderSplitLoginView();
      return;
    }
    if (
      state.currentRoute === '/auth/register' ||
      state.currentRoute === 'register' ||
      state.currentRoute === '/register' ||
      state.currentRoute === '/auth/onboarding' ||
      state.currentRoute === 'onboarding' ||
      state.currentRoute === '/onboarding'
    ) {
      root.innerHTML = render5StepOnboardingView(state.onboardingStep, state.onboardingData);
      return;
    }

    // 2. Homepage (Phase 23 11-Section Streamlined Experience)
    if (state.currentRoute === '/' || state.currentRoute === 'home' || state.currentRoute === 'marketing' || state.currentRoute === '/home') {
      root.innerHTML = MarketingWebsite.render();
      MarketingWebsite.initInteractiveControllers();
      return;
    }

    // 3. Product Overview Page (/product)
    if (state.currentRoute === '/product' || state.currentRoute === 'product') {
      root.innerHTML = renderProductOverviewPage();
      return;
    }

    // 4. Point of Sale Deep Dive (/product/pos)
    if (state.currentRoute === '/product/pos') {
      root.innerHTML = renderProductPOSPage();
      return;
    }

    // 5. Inventory Management Deep Dive (/product/inventory)
    if (state.currentRoute === '/product/inventory') {
      root.innerHTML = renderProductInventoryPage();
      return;
    }

    // 6. Sales & Invoicing Deep Dive (/product/sales)
    if (state.currentRoute === '/product/sales') {
      root.innerHTML = renderProductSalesPage();
      return;
    }

    // 7. Purchasing & Procurement Deep Dive (/product/purchasing)
    if (state.currentRoute === '/product/purchasing') {
      root.innerHTML = renderProductPurchasingPage();
      return;
    }

    // 8. Customers & CRM Deep Dive (/product/customers)
    if (state.currentRoute === '/product/customers') {
      root.innerHTML = renderProductCustomersPage();
      return;
    }

    // 9. Suppliers & Vendors Deep Dive (/product/suppliers)
    if (state.currentRoute === '/product/suppliers') {
      root.innerHTML = renderProductSuppliersPage();
      return;
    }

    // 10. Payments & Expenses Deep Dive (/product/payments)
    if (state.currentRoute === '/product/payments') {
      root.innerHTML = renderProductPaymentsPage();
      return;
    }

    // 11. Documents & Receipts Deep Dive (/product/documents)
    if (state.currentRoute === '/product/documents') {
      root.innerHTML = renderProductDocumentsPage();
      return;
    }

    // 12. Integrations & API Deep Dive (/product/integrations)
    if (state.currentRoute === '/product/integrations') {
      root.innerHTML = renderProductIntegrationsPage();
      return;
    }

    // 13. Reports & Analytics Deep Dive (/product/reports)
    if (state.currentRoute === '/product/reports') {
      root.innerHTML = renderProductReportsPage();
      return;
    }

    // 14. Multi-Page Public Website Shells (Phase 23)
    if (PUBLIC_ROUTES_REGISTRY[state.currentRoute] || state.currentRoute.startsWith('/product') || state.currentRoute.startsWith('/industries') || state.currentRoute.startsWith('/solutions') || state.currentRoute.startsWith('/pricing') || state.currentRoute.startsWith('/resources') || state.currentRoute.startsWith('/company')) {
      root.innerHTML = renderPublicPageShell(state.currentRoute);
      return;
    }

    // Default Fallback to Homepage
    root.innerHTML = MarketingWebsite.render();
    MarketingWebsite.initInteractiveControllers();
    return;
  }

  root.innerHTML = `
    <!-- Sidebar Navigation -->
    <aside class="app-sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="brand-icon">🌐</div>
        <div>
          <div class="brand-title">Universal ERP</div>
          <div class="brand-subtitle">${state.tenant?.name || 'Business OS'}</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Operations</div>
        ${NAV_ITEMS.map((item) => {
          if (!canAccess(item.permission)) return '';
          const activeClass = state.currentRoute === item.id ? 'active' : '';
          return `
            <button class="nav-item ${activeClass}" onclick="navigate('${item.id}')">
              <span class="nav-icon">${item.icon}</span>
              <span>${item.label}</span>
              ${item.badge ? `<span class="nav-badge beta">${item.badge}</span>` : ''}
            </button>
          `;
        }).join('')}
      </nav>

      <div class="sidebar-footer">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:600; font-size:13px;">
            ${state.user.firstName[0]}${state.user.lastName[0]}
          </div>
          <div>
            <div style="font-size:13px; font-weight:600;">${state.user.fullName}</div>
            <div style="font-size:11px; color:var(--text-dim);">${state.membership.role}</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="logout()" title="Logout">🚪</button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="app-main">
      <header class="app-topbar">
        <div class="topbar-left">
          <button class="btn btn-ghost topbar-menu-btn" style="display:none;" onclick="toggleSidebar()">☰</button>
          <div class="tenant-pill" onclick="navigate('settings')">
            <span class="indicator"></span>
            <span>${state.tenant?.name}</span>
            <span class="badge badge-neutral" style="font-size:10px;">${state.tenant?.currency}</span>
          </div>
        </div>

        <div class="topbar-right">
          <button class="btn btn-ghost btn-sm" onclick="toggleTheme()" title="Toggle Dark/Light Mode">
            ${state.theme === 'dark' ? '☀️' : '🌙'}
          </button>
          ${!state.tenant?.isSetupComplete ? `
            <button class="btn btn-primary btn-sm" onclick="navigate('setup')">
              ⚡ Complete Setup
            </button>
          ` : ''}
        </div>
      </header>

      <div class="content-body" id="main-content">
        ${renderRouteContent()}
      </div>
    </main>
  `;
}

function updateMainContent() {
  const container = document.getElementById('main-content');
  if (container) {
    container.innerHTML = renderRouteContent();
  }
}

window.navigate = async function (route) {
  state.currentRoute = route;
  renderApp();
  await loadRouteData(route);
};

async function loadRouteData(route) {
  try {
    if (route === 'pos') await loadPOS();
    else if (route === 'dashboard') await loadDashboard();
    else if (route === 'sales') await loadSales();
    else if (route === 'products') await loadProducts();
    else if (route === 'inventory') await loadInventory();
    else if (route === 'money') await loadMoney();
    else if (route === 'purchases') await loadPurchases();
    else if (route === 'customers') await loadCustomers();
    else if (route === 'suppliers') await loadSuppliers();
    else if (route === 'reports') await loadReports();
    else if (route === 'settings') await loadSettings();
    else if (route === 'users') await loadUsers();
    else if (route === 'audit') await loadAuditLogs();
    else if (route === 'integrations') await loadIntegrations();
  } catch (e) {
    console.error('Error loading route data:', e);
  }
}

window.toggleTheme = function () {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('erp_theme', state.theme);
  document.documentElement.setAttribute('data-theme', state.theme);
  renderApp();
};

window.toggleSidebar = function () {
  document.getElementById('sidebar')?.classList.toggle('mobile-open');
};

window.logout = async function () {
  try {
    await api('/api/v1/auth/logout', { method: 'POST' });
  } catch (e) {}
  state.user = null;
  state.tenant = null;
  state.currentRoute = 'marketing';
  UI.toast('Logged out successfully', 'info');
  renderApp();
};

function renderRouteContent() {
  switch (state.currentRoute) {
    case 'pos':
      return renderPOSTerminalView();
    case 'money':
      return renderMoneyView();
    case 'purchases':
      return renderPurchasesView();
    case 'sales':
      return renderSalesView();
    case 'products':
      return renderProductsView();
    case 'inventory':
      return renderInventoryView();
    case 'customers':
      return renderCustomersView();
    case 'suppliers':
      return renderSuppliersView();
    case 'reports':
      return renderReportsView();
    case 'tasks':
      return renderTasksView();
    case 'users':
      return renderUsersView();
    case 'audit':
      return renderAuditLogView();
    case 'integrations':
      return renderIntegrationsView();
    case 'setup':
      return renderSetupWizard();
    case 'settings':
      return renderSettingsView();
    case 'dashboard':
    default:
      return renderDashboardView();
  }
}

// -------------------------------------------------------------
// 1. RETAIL POS TERMINAL & CAMERA BARCODE SCANNER
// -------------------------------------------------------------
function renderPOSTerminalView() {
  return `
    <div style="display:flex; flex-direction:column; height:calc(100vh - 100px); gap:16px;">
      
      <!-- POS Top Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface-elevated); padding:12px 18px; border-radius:var(--radius-md); border:1px solid var(--border-subtle); flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:20px; font-weight:700; display:flex; align-items:center; gap:8px;">
            🛒 Retail POS Terminal
          </div>
          <span class="badge badge-success">● Cashier: ${state.user.firstName}</span>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <select class="select" id="pos-location-select" style="min-width:180px;" onchange="onPOSLocationChange(this.value)">
            ${state.locations.map((loc) => `
              <option value="${loc._id}" ${loc._id === state.posSelectedLocationId ? 'selected' : ''}>
                📍 ${loc.name}
              </option>
            `).join('')}
          </select>
          <button class="btn btn-ghost btn-sm" onclick="showPOSKeyboardShortcuts()" title="Keyboard Shortcuts">⌨️ Shortcuts</button>
        </div>
      </div>

      <!-- Main POS Workspace: Product Grid (Left) + Live Cart (Right) -->
      <div style="display:grid; grid-template-columns: 1fr 380px; gap:16px; flex:1; min-height:0;">
        
        <!-- Left Column: Search, Camera Scanner Button & Product Catalog Grid -->
        <div style="display:flex; flex-direction:column; gap:14px; min-height:0;">
          
          <!-- Search, Scanner & Mobile Camera Trigger -->
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <div class="search-wrapper" style="flex:1; min-width:200px;">
              <span class="search-icon">🔍</span>
              <input 
                id="pos-search-input"
                class="input search-input" 
                placeholder="Scan Barcode or Search Name / SKU... (F2 or /)" 
                value="${state.posSearchQuery}"
                autofocus
                oninput="handlePOSSearchInput(this.value)"
                onkeydown="handlePOSSearchKeyDown(event)"
              >
            </div>
            
            <!-- Mobile Camera Barcode Scanner Trigger Button -->
            <button class="btn btn-primary" onclick="openCameraScannerForPOS()" style="display:flex; align-items:center; gap:6px;">
              📷 <span>Scan Barcode</span>
            </button>

            <button class="btn btn-secondary btn-sm" onclick="clearPOSSearch()">✕</button>
          </div>

          <!-- Products Grid -->
          <div id="pos-products-grid" style="flex:1; overflow-y:auto; display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:12px; align-content:start; padding-right:4px;">
            ${UI.renderLoadingState()}
          </div>
        </div>

        <!-- Right Column: Live Interactive Cart -->
        <div class="card" style="display:flex; flex-direction:column; padding:16px; min-height:0; background:var(--bg-surface-elevated); border:1px solid var(--border-strong);">
          
          <!-- Customer Selection -->
          <div style="margin-bottom:12px;">
            <label class="form-label" style="font-size:11px; text-transform:uppercase; color:var(--text-dim);">Customer</label>
            <select class="select" id="pos-customer-select" onchange="state.posSelectedCustomerId = this.value">
              <option value="">👤 Walk-in / Anonymous Customer</option>
              ${state.customers.map((c) => `
                <option value="${c._id}">${c.displayName} (${c.phone || c.email || 'Client'})</option>
              `).join('')}
            </select>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-subtle); padding-bottom:8px; margin-bottom:8px;">
            <div style="font-size:13px; font-weight:700; text-transform:uppercase; color:var(--text-dim);">
              Cart Items (${state.posCart.reduce((sum, it) => sum + it.quantity, 0)})
            </div>
            <button class="btn btn-ghost btn-sm" style="color:var(--danger); padding:2px 6px; font-size:12px;" onclick="clearPOSCart()">
              Clear Cart
            </button>
          </div>

          <!-- Cart Items Scrollable List -->
          <div id="pos-cart-items-list" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding-right:2px;">
            ${renderPOSCartItemsHtml()}
          </div>

          <!-- Cart Financial Totals Breakdown -->
          <div style="border-top:1px solid var(--border-subtle); padding-top:12px; margin-top:8px; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; font-size:13px; color:var(--text-muted);">
              <span>Subtotal:</span>
              <span id="pos-cart-subtotal">${state.tenant.currency} 0.00</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:13px; color:var(--text-muted);">
              <span>Tax:</span>
              <span id="pos-cart-tax">${state.tenant.currency} 0.00</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:800; border-top:1px solid var(--border-subtle); padding-top:8px; margin-top:2px;">
              <span>Total:</span>
              <span style="color:var(--primary);" id="pos-cart-grand-total">${state.tenant.currency} 0.00</span>
            </div>
          </div>

          <!-- Checkout Button -->
          <button 
            id="pos-checkout-btn"
            class="btn btn-primary" 
            style="width:100%; margin-top:12px; padding:14px; font-size:16px; font-weight:700;"
            onclick="openPOSPaymentModal()"
          >
            💳 Pay / Checkout (F4)
          </button>
        </div>

      </div>

    </div>
  `;
}

async function loadPOS() {
  if (state.locations.length === 0) {
    const locRes = await api('/api/v1/inventory/locations');
    state.locations = locRes.data || [];
    if (state.locations.length > 0 && !state.posSelectedLocationId) {
      state.posSelectedLocationId = state.locations[0]._id;
    }
  }

  if (state.customers.length === 0) {
    const custRes = await api('/api/v1/customers?limit=100');
    state.customers = custRes.data || [];
  }

  // Bind active scanner handler to POS cart workflow
  ScannerService.setActiveHandler({
    onProductFound: (product) => {
      addPOSProductToCart(product);
      UI.toast(`✓ Added "${product.name}" to cart`, 'success');
    },
    onProductNotFound: (barcode) => {
      openUnknownBarcodeModal(barcode);
    },
  });

  searchPOSProducts();

  // Bind global POS keyboard shortcuts
  window.onkeydown = function (e) {
    if (state.currentRoute !== 'pos') return;
    if (e.key === 'F2') {
      e.preventDefault();
      document.getElementById('pos-search-input')?.focus();
    } else if (e.key === 'F4') {
      e.preventDefault();
      if (state.posCart.length > 0) openPOSPaymentModal();
    }
  };
}

window.openCameraScannerForPOS = function () {
  ScannerService.openCameraModal({
    onProductFound: (product) => {
      addPOSProductToCart(product);
      UI.toast(`✓ Added "${product.name}" to cart`, 'success');
    },
    onProductNotFound: (barcode) => {
      openUnknownBarcodeModal(barcode);
    },
  });
};

// -------------------------------------------------------------
// 2. UNKNOWN BARCODE WORKFLOW (QUICK ADD PRODUCT & AUTO-CART)
// -------------------------------------------------------------
window.openUnknownBarcodeModal = function (barcode) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:20px;">⚠️</span>
          <div>
            <h3 class="card-title">Product Not Found</h3>
            <div style="font-size:12px; color:var(--text-dim);">Barcode: <strong>${barcode}</strong></div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" id="close-modal">✕</button>
      </div>

      <form onsubmit="handleQuickProductCreate(event, '${barcode}', this.closest('.modal-backdrop'))">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <p style="font-size:13px; color:var(--text-muted);">
            This barcode is not yet registered in your catalog. Enter details below to save it and automatically add it to the cart.
          </p>

          <div class="form-group">
            <label class="form-label">Scanned Barcode</label>
            <input class="input" value="${barcode}" readonly style="background:var(--bg-app); font-family:var(--font-mono); font-weight:700;">
          </div>

          <div class="form-group">
            <label class="form-label">Product Name <span class="required">*</span></label>
            <input class="input" name="name" required placeholder="e.g. Coca Cola 330ml Can" autofocus>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Selling Price (${state.tenant.currency}) <span class="required">*</span></label>
              <input class="input" type="number" step="0.01" min="0" name="sellingPrice" required placeholder="0.00">
            </div>
            <div class="form-group">
              <label class="form-label">Cost Price (${state.tenant.currency})</label>
              <input class="input" type="number" step="0.01" min="0" name="costPrice" placeholder="0.00">
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Category</label>
              <input class="input" name="categoryName" placeholder="e.g. Beverages">
            </div>
            <div class="form-group">
              <label class="form-label">SKU (Auto or Custom)</label>
              <input class="input" name="sku" placeholder="Auto-generated if blank">
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">✓ Save & Add to Cart</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#close-modal').onclick = close;
  modal.querySelector('#cancel-modal').onclick = close;
};

window.handleQuickProductCreate = async function (e, barcode, modal) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const name = formData.get('name');
  const sellingPrice = Number(formData.get('sellingPrice'));
  const costPrice = Number(formData.get('costPrice')) || 0;
  const categoryName = formData.get('categoryName') || 'General';
  const customSku = formData.get('sku')?.toString().trim();
  const sku = customSku || `SKU-${Date.now().toString().slice(-6)}`;

  const payload = {
    name,
    sku,
    sellingPrice,
    costPrice,
    categoryName,
    barcodes: [
      {
        barcode: barcode.trim(),
        symbology: 'CODE128',
        isPrimary: true,
      },
    ],
  };

  try {
    const res = await api('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success) {
      const createdProduct = res.data;
      // Add to local cache
      ProductCache.addOrUpdate(createdProduct);
      state.products.push(createdProduct);

      // Automatically add to POS cart!
      addPOSProductToCart({
        id: createdProduct._id,
        name: createdProduct.name,
        sku: createdProduct.sku,
        sellingPrice: createdProduct.sellingPrice,
        costPrice: createdProduct.costPrice,
        isTaxable: createdProduct.isTaxable,
        taxRatePercent: createdProduct.taxRatePercent,
      });

      UI.toast(`✓ Created and added "${createdProduct.name}" to cart!`, 'success');
      modal.remove();
      searchPOSProducts();
    }
  } catch (error) {
    UI.toast(error.message, 'danger');
  }
};

let posSearchTimeout = null;
window.handlePOSSearchInput = function (val) {
  state.posSearchQuery = val;
  clearTimeout(posSearchTimeout);
  posSearchTimeout = setTimeout(() => {
    searchPOSProducts();
  }, 200);
};

window.handlePOSSearchKeyDown = function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = e.target.value.trim();
    if (val) {
      ScannerService.handleScannedBarcode(val);
      clearPOSSearch();
    }
  }
};

window.clearPOSSearch = function () {
  state.posSearchQuery = '';
  const input = document.getElementById('pos-search-input');
  if (input) input.value = '';
  searchPOSProducts();
  input?.focus();
};

window.onPOSLocationChange = function (locId) {
  state.posSelectedLocationId = locId;
  searchPOSProducts();
};

async function searchPOSProducts() {
  const grid = document.getElementById('pos-products-grid');
  if (!grid) return;

  try {
    const query = new URLSearchParams();
    if (state.posSearchQuery) query.append('query', state.posSearchQuery);
    if (state.posSelectedLocationId) query.append('locationId', state.posSelectedLocationId);

    const res = await api(`/api/v1/pos/search?${query.toString()}`);
    state.posProducts = res.data || [];

    // Sync into offline ProductCache
    ProductCache.populate(state.posProducts);

    if (state.posProducts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:40px; color:var(--text-muted);">
          <div style="font-size:32px; margin-bottom:8px;">🔍</div>
          <div style="font-size:15px; font-weight:600;">No matching products found</div>
          <div style="font-size:12px; margin-top:4px;">Try scanning a barcode or searching by name.</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = state.posProducts.map((p) => `
      <div 
        class="card" 
        style="cursor:pointer; padding:12px; display:flex; flex-direction:column; justify-content:space-between; transition:transform 100ms ease, box-shadow 100ms ease; user-select:none;"
        onclick="addPOSProductToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})"
      >
        <div>
          <div style="font-size:13px; font-weight:700; color:var(--text-main); line-height:1.3; margin-bottom:4px;">
            ${p.name}
          </div>
          <div style="font-size:11px; font-family:var(--font-mono); color:var(--text-dim);">
            ${p.sku} ${p.barcode ? `• ${p.barcode}` : ''}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:12px;">
          <div>
            <div style="font-size:15px; font-weight:800; color:var(--primary);">
              ${state.tenant.currency} ${p.sellingPrice.toFixed(2)}
            </div>
          </div>
          <span class="badge ${p.quantityOnHand > 0 ? 'badge-neutral' : 'badge-danger'}" style="font-size:10px;">
            ${p.quantityOnHand > 0 ? `${p.quantityOnHand} ${p.unit}` : 'Out of Stock'}
          </span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    // If offline, render from local ProductCache!
    const cached = Array.from(ProductCache.products.values());
    if (cached.length > 0) {
      grid.innerHTML = cached.map((p) => `
        <div class="card" style="cursor:pointer; padding:12px;" onclick="addPOSProductToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">
          <div style="font-weight:700;">${p.name} (Offline)</div>
          <div style="color:var(--primary); font-weight:800;">${state.tenant.currency} ${p.sellingPrice.toFixed(2)}</div>
        </div>
      `).join('');
    } else {
      grid.innerHTML = UI.renderErrorState(err.message, 'searchPOSProducts');
    }
  }
}

window.addPOSProductToCart = function (product) {
  const prodId = product.id || product._id;
  const existing = state.posCart.find((it) => it.productId === prodId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.posCart.push({
      productId: prodId,
      name: product.name,
      sku: product.sku,
      unitPrice: product.sellingPrice,
      costPrice: product.costPrice || 0,
      taxRatePercent: product.isTaxable ? (product.taxRatePercent || 0) : 0,
      quantity: 1,
      discountAmount: 0,
    });
  }
  updatePOSCartView();
};

function renderPOSCartItemsHtml() {
  if (state.posCart.length === 0) {
    return `
      <div style="text-align:center; padding:30px 10px; color:var(--text-muted); font-size:13px;">
        <div style="font-size:28px; margin-bottom:8px;">🛒</div>
        Cart is empty.<br>Tap any product or scan a barcode to add.
      </div>
    `;
  }

  return state.posCart.map((it, idx) => {
    const itemSub = Math.max(0, it.quantity * it.unitPrice - it.discountAmount);
    const itemTax = (itemSub * (it.taxRatePercent || 0)) / 100;
    const lineTotal = itemSub + itemTax;

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-app); padding:8px 10px; border-radius:var(--radius-sm); font-size:12px;">
        <div style="flex:1; margin-right:8px;">
          <div style="font-weight:600; color:var(--text-main);">${it.name}</div>
          <div style="color:var(--text-dim); font-size:11px;">
            ${state.tenant.currency} ${it.unitPrice.toFixed(2)} / unit
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:6px;">
          <button class="btn btn-ghost btn-sm" style="padding:2px 6px; font-weight:bold;" onclick="changePOSItemQty(${idx}, -1)">-</button>
          <span style="font-weight:700; min-width:18px; text-align:center;">${it.quantity}</span>
          <button class="btn btn-ghost btn-sm" style="padding:2px 6px; font-weight:bold;" onclick="changePOSItemQty(${idx}, 1)">+</button>
          
          <div style="font-weight:700; min-width:60px; text-align:right; color:var(--text-main);">
            ${state.tenant.currency} ${lineTotal.toFixed(2)}
          </div>

          <button class="btn btn-ghost btn-sm" style="color:var(--danger); padding:2px 6px;" onclick="removePOSCartItem(${idx})">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

window.changePOSItemQty = function (index, delta) {
  const item = state.posCart[index];
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    state.posCart.splice(index, 1);
  }
  updatePOSCartView();
};

window.removePOSCartItem = function (index) {
  state.posCart.splice(index, 1);
  updatePOSCartView();
};

window.clearPOSCart = function () {
  state.posCart = [];
  updatePOSCartView();
};

function updatePOSCartView() {
  const container = document.getElementById('pos-cart-items-list');
  if (container) container.innerHTML = renderPOSCartItemsHtml();

  let subtotal = 0;
  let tax = 0;

  for (const it of state.posCart) {
    const itemSub = Math.max(0, it.quantity * it.unitPrice - it.discountAmount);
    const itemTax = (itemSub * (it.taxRatePercent || 0)) / 100;
    subtotal += it.quantity * it.unitPrice;
    tax += itemTax;
  }

  const grandTotal = subtotal + tax;

  const subEl = document.getElementById('pos-cart-subtotal');
  const taxEl = document.getElementById('pos-cart-tax');
  const grandEl = document.getElementById('pos-cart-grand-total');

  if (subEl) subEl.innerText = `${state.tenant.currency} ${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.innerText = `${state.tenant.currency} ${tax.toFixed(2)}`;
  if (grandEl) grandEl.innerText = `${state.tenant.currency} ${grandTotal.toFixed(2)}`;
}

// -------------------------------------------------------------
// 3. SPEED CHECKOUT PAYMENT MODAL
// -------------------------------------------------------------
window.openPOSPaymentModal = function () {
  if (state.posCart.length === 0) {
    UI.toast('Please add at least one item to cart before checkout', 'warning');
    return;
  }

  let subtotal = 0;
  let tax = 0;
  for (const it of state.posCart) {
    const itemSub = Math.max(0, it.quantity * it.unitPrice - it.discountAmount);
    const itemTax = (itemSub * (it.taxRatePercent || 0)) / 100;
    subtotal += it.quantity * it.unitPrice;
    tax += itemTax;
  }
  const grandTotal = Number((subtotal + tax).toFixed(2));

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 520px; padding: 24px;">
      <div class="modal-header" style="border:none; padding:0 0 16px 0;">
        <div>
          <h3 class="card-title" style="font-size:20px;">Speed Checkout</h3>
          <div style="font-size:12px; color:var(--text-dim);">Terminal: ${state.locations.find((l) => l._id === state.posSelectedLocationId)?.name || 'Store'}</div>
        </div>
        <button class="btn btn-ghost btn-sm" id="close-modal">✕</button>
      </div>

      <form onsubmit="handlePOSCheckoutSubmit(event, ${grandTotal}, this.closest('.modal-backdrop'))">
        <div style="display:flex; flex-direction:column; gap:16px;">
          
          <div class="card" style="background:var(--bg-app); text-align:center; padding:18px; border:1px solid var(--primary);">
            <div style="font-size:12px; font-weight:700; color:var(--text-dim); text-transform:uppercase;">Total Amount Due</div>
            <div style="font-size:32px; font-weight:800; color:var(--primary); margin-top:4px;">
              ${state.tenant.currency} ${grandTotal.toFixed(2)}
            </div>
          </div>

          <div>
            <label class="form-label" style="font-size:12px; font-weight:700;">Payment Method</label>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
              <button type="button" class="btn btn-primary pos-pay-method-btn" data-method="CASH" onclick="selectPOSPayMethod('CASH', this)">💵 Cash</button>
              <button type="button" class="btn btn-secondary pos-pay-method-btn" data-method="CARD" onclick="selectPOSPayMethod('CARD', this)">💳 Card</button>
              <button type="button" class="btn btn-secondary pos-pay-method-btn" data-method="BANK_TRANSFER" onclick="selectPOSPayMethod('BANK_TRANSFER', this)">🏦 Transfer</button>
            </div>
            <input type="hidden" name="paymentMethod" id="pos-selected-payment-method" value="CASH">
          </div>

          <div id="pos-cash-section">
            <div style="display:flex; gap:6px; margin-bottom:10px; flex-wrap:wrap;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="setPOSTender(${grandTotal}, ${grandTotal})">Exact ($${grandTotal.toFixed(2)})</button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="setPOSTender(10, ${grandTotal})">$10</button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="setPOSTender(20, ${grandTotal})">$20</button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="setPOSTender(50, ${grandTotal})">$50</button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="setPOSTender(100, ${grandTotal})">$100</button>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Tendered Cash</label>
                <input class="input" type="number" step="0.01" min="${grandTotal}" id="pos-tendered-amount" value="${grandTotal.toFixed(2)}" oninput="calculatePOSChange(${grandTotal})">
              </div>
              <div class="form-group">
                <label class="form-label">Change to Return</label>
                <input class="input" id="pos-change-amount" readonly value="${state.tenant.currency} 0.00" style="font-weight:800; font-size:16px; color:var(--success);">
              </div>
            </div>
          </div>

          <div class="form-group" id="pos-card-ref-section" style="display:none;">
            <label class="form-label">Card Authorization Ref</label>
            <input class="input" name="reference" placeholder="e.g. AUTH-VISA-882">
          </div>

        </div>

        <div class="modal-footer" style="padding:16px 0 0 0; border:none; margin-top:16px;">
          <button type="button" class="btn btn-secondary" id="cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-primary" style="flex:1; font-weight:700;">
            ✓ Complete Sale & Print (Enter)
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#close-modal').onclick = close;
  modal.querySelector('#cancel-modal').onclick = close;
};

window.selectPOSPayMethod = function (method, btn) {
  document.getElementById('pos-selected-payment-method').value = method;
  document.querySelectorAll('.pos-pay-method-btn').forEach((b) => {
    b.className = 'btn btn-secondary pos-pay-method-btn';
  });
  btn.className = 'btn btn-primary pos-pay-method-btn';

  const cashSec = document.getElementById('pos-cash-section');
  const cardSec = document.getElementById('pos-card-ref-section');
  if (cashSec) cashSec.style.display = method === 'CASH' ? 'block' : 'none';
  if (cardSec) cardSec.style.display = method === 'CARD' ? 'block' : 'none';
};

window.setPOSTender = function (amount, grandTotal) {
  const input = document.getElementById('pos-tendered-amount');
  if (input) {
    input.value = amount.toFixed(2);
    calculatePOSChange(grandTotal);
  }
};

window.calculatePOSChange = function (grandTotal) {
  const tendered = Number(document.getElementById('pos-tendered-amount')?.value) || 0;
  const change = Math.max(0, tendered - grandTotal);
  const changeInput = document.getElementById('pos-change-amount');
  if (changeInput) {
    changeInput.value = `${state.tenant.currency} ${change.toFixed(2)}`;
  }
};

window.handlePOSCheckoutSubmit = async function (e, grandTotal, modal) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const paymentMethod = formData.get('paymentMethod');
  const tenderedAmount = Number(document.getElementById('pos-tendered-amount')?.value) || grandTotal;
  const changeAmount = paymentMethod === 'CASH' ? Math.max(0, tenderedAmount - grandTotal) : 0;
  const reference = formData.get('reference') || undefined;

  const payload = {
    locationId: state.posSelectedLocationId || undefined,
    customerId: state.posSelectedCustomerId || undefined,
    customerName: state.posSelectedCustomerId 
      ? state.customers.find((c) => c._id === state.posSelectedCustomerId)?.displayName 
      : 'Walk-in Customer',
    items: state.posCart.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      discountAmount: it.discountAmount,
      taxRatePercent: it.taxRatePercent,
    })),
    payments: [
      {
        amount: grandTotal,
        paymentMethod,
        tenderedAmount: paymentMethod === 'CASH' ? tenderedAmount : undefined,
        changeAmount: paymentMethod === 'CASH' ? changeAmount : undefined,
        reference,
      },
    ],
  };

  try {
    const res = await api('/api/v1/pos/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success) {
      UI.toast(`Sale ${res.data.sale.saleNumber} completed!`, 'success');
      modal.remove();
      state.posCart = [];
      updatePOSCartView();
      printPOSReceiptModal(res.data.receipt);
    }
  } catch (error) {
    UI.toast(error.message, 'danger');
  }
};

function printPOSReceiptModal(r) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 420px; font-family: monospace; padding: 24px;">
      <div style="text-align:center; border-bottom:1px dashed var(--border-strong); padding-bottom:12px; margin-bottom:12px;">
        <div style="font-size:18px; font-weight:bold;">${r.business.name}</div>
        <div style="font-size:11px; color:var(--text-muted);">${r.sale.location}</div>
        <div style="font-size:11px; color:var(--text-muted);">${new Date(r.sale.date).toLocaleString()}</div>
        <div style="font-size:12px; font-weight:bold; margin-top:4px;">${r.sale.saleNumber}</div>
      </div>

      <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px; font-size:12px;">
        ${r.sale.items.map((it) => `
          <div style="display:flex; justify-content:space-between;">
            <span>${it.name} x${it.quantity}</span>
            <span>${r.business.currency} ${it.lineTotal.toFixed(2)}</span>
          </div>
        `).join('')}
      </div>

      <div style="border-top:1px dashed var(--border-strong); padding-top:8px; font-size:12px; display:flex; flex-direction:column; gap:4px;">
        <div style="display:flex; justify-content:space-between;">
          <span>Subtotal:</span><span>${r.business.currency} ${r.sale.subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>Tax:</span><span>${r.business.currency} ${r.sale.taxTotal.toFixed(2)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:14px;">
          <span>TOTAL:</span><span>${r.business.currency} ${r.sale.grandTotal.toFixed(2)}</span>
        </div>
        ${r.sale.payments.map((p) => `
          <div style="display:flex; justify-content:space-between; color:var(--text-dim);">
            <span>${p.paymentMethod}:</span><span>${r.business.currency} ${p.amount.toFixed(2)}</span>
          </div>
          ${p.changeAmount ? `
            <div style="display:flex; justify-content:space-between; color:var(--text-dim);">
              <span>Change:</span><span>${r.business.currency} ${p.changeAmount.toFixed(2)}</span>
            </div>
          ` : ''}
        `).join('')}
      </div>

      <div style="text-align:center; font-size:11px; color:var(--text-muted); margin-top:16px; border-top:1px dashed var(--border-strong); padding-top:10px;">
        ${r.business.receiptHeader}<br>
        ${r.business.receiptFooter}
      </div>

      <div style="display:flex; justify-content:space-between; gap:10px; margin-top:18px;">
        <button class="btn btn-secondary btn-sm" id="close-receipt">Next Customer / New Sale</button>
        <button class="btn btn-primary btn-sm" onclick="window.print()">🖨️ Print Receipt</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#close-receipt').onclick = () => {
    modal.remove();
    document.getElementById('pos-search-input')?.focus();
  };
}

window.showPOSKeyboardShortcuts = function () {
  UI.confirm('POS Keyboard Shortcuts', `
    • <strong>F2</strong> or <strong>/</strong>: Focus Barcode / Search Input<br>
    • <strong>F4</strong>: Open Speed Checkout<br>
    • <strong>Enter</strong>: Scan Barcode / Confirm payment<br>
    • <strong>Escape</strong>: Close open modal / Cancel
  `, () => {});
};

// -------------------------------------------------------------
// 4. OTHER VIEWS (DASHBOARD, MONEY, SALES, PURCHASES)
// -------------------------------------------------------------
// -------------------------------------------------------------
// 4. ONBOARDING WIZARD (5 STREAMLINED STEPS)
// -------------------------------------------------------------
function renderSetupWizard() {
  const step = state.onboardingStep || 1;
  const t = state.tenant || {};
  const b = state.onboardingData.business || {};
  const loc = state.onboardingData.location || {};

  return `
    <div style="max-width: 860px; margin: 0 auto; padding-bottom: 40px;">
      
      <!-- Stepper Header -->
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 6px;">
          🚀 Welcome to Universal ERP
        </h1>
        <p style="color: var(--text-muted); font-size: 14px;">
          Let's get your business operating system ready in 5 simple steps. No complex configuration required!
        </p>
      </div>

      <!-- Visual Step Progress Tracker -->
      <div class="stepper-nav">
        <div class="step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}" onclick="state.onboardingStep = 1; renderApp();">
          <div class="step-number">${step > 1 ? '✓' : '1'}</div>
          <div class="step-label">1. Business Info</div>
        </div>
        <div class="step-connector ${step > 1 ? 'completed' : ''}"></div>

        <div class="step-item ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}" onclick="state.onboardingStep = 2; renderApp();">
          <div class="step-number">${step > 2 ? '✓' : '2'}</div>
          <div class="step-label">2. Currency & Store</div>
        </div>
        <div class="step-connector ${step > 2 ? 'completed' : ''}"></div>

        <div class="step-item ${step === 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}" onclick="state.onboardingStep = 3; renderApp();">
          <div class="step-number">${step > 3 ? '✓' : '3'}</div>
          <div class="step-label">3. Products</div>
        </div>
        <div class="step-connector ${step > 3 ? 'completed' : ''}"></div>

        <div class="step-item ${step === 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}" onclick="state.onboardingStep = 4; renderApp();">
          <div class="step-number">${step > 4 ? '✓' : '4'}</div>
          <div class="step-label">4. Opening Stock</div>
        </div>
        <div class="step-connector ${step > 4 ? 'completed' : ''}"></div>

        <div class="step-item ${step === 5 ? 'active' : ''}" onclick="state.onboardingStep = 5; renderApp();">
          <div class="step-number">5</div>
          <div class="step-label">5. Ready to Sell</div>
        </div>
      </div>

      <!-- Step Content Area -->
      <div class="card" style="padding: 28px; background: var(--bg-surface-elevated); border: 1px solid var(--border-strong);">
        ${renderCurrentOnboardingStep(step, t, b, loc)}
      </div>

    </div>
  `;
}

function renderCurrentOnboardingStep(step, t, b, loc) {
  switch (step) {
    case 1:
      return `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <div>
              <h2 style="font-size:18px; font-weight:700;">Step 1: Business Information</h2>
              <p style="font-size:13px; color:var(--text-muted);">Tell us about your business profile and contact details.</p>
            </div>
            <span class="badge badge-primary">Step 1 of 5</span>
          </div>

          <form onsubmit="handleOnboardingStep1Submit(event)">
            <div class="form-grid" style="margin-bottom:16px;">
              <div class="form-group">
                <label class="form-label">Business / Legal Name <span class="required">*</span></label>
                <input class="input" name="name" value="${b.name || t.name || ''}" required placeholder="e.g. Apex Retail Store">
              </div>
              <div class="form-group">
                <label class="form-label">Business Type</label>
                <select class="select" name="businessType">
                  <option value="RETAIL" ${(b.businessType || t.businessType) === 'RETAIL' ? 'selected' : ''}>Retail & Storefront</option>
                  <option value="ECOMMERCE" ${(b.businessType || t.businessType) === 'ECOMMERCE' ? 'selected' : ''}>E-Commerce / Online Store</option>
                  <option value="HYBRID_RETAIL" ${(b.businessType || t.businessType) === 'HYBRID_RETAIL' ? 'selected' : ''}>Hybrid Retail & Digital</option>
                  <option value="SERVICES" ${(b.businessType || t.businessType) === 'SERVICES' ? 'selected' : ''}>Services & Consulting</option>
                  <option value="MANUFACTURING" ${(b.businessType || t.businessType) === 'MANUFACTURING' ? 'selected' : ''}>Manufacturing & Assembly</option>
                  <option value="HEALTHCARE" ${(b.businessType || t.businessType) === 'HEALTHCARE' ? 'selected' : ''}>Pharmacy & Healthcare</option>
                  <option value="OTHER" ${(b.businessType || t.businessType) === 'OTHER' ? 'selected' : ''}>Other Commercial</option>
                </select>
              </div>
            </div>

            <div class="form-grid" style="margin-bottom:16px;">
              <div class="form-group">
                <label class="form-label">Contact Email</label>
                <input class="input" type="email" name="email" value="${b.email || t.email || state.user?.email || ''}" placeholder="ops@yourcompany.com">
              </div>
              <div class="form-group">
                <label class="form-label">Contact Phone</label>
                <input class="input" name="phone" value="${b.phone || t.phone || ''}" placeholder="+1 (555) 019-2834">
              </div>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">Street Address</label>
              <input class="input" name="street" value="${b.address?.street || t.address?.street || ''}" placeholder="123 Main Street, Suite 400">
            </div>

            <div class="form-grid" style="margin-bottom:24px;">
              <div class="form-group">
                <label class="form-label">City</label>
                <input class="input" name="city" value="${b.address?.city || t.address?.city || ''}" placeholder="San Francisco">
              </div>
              <div class="form-group">
                <label class="form-label">State / Region</label>
                <input class="input" name="state" value="${b.address?.state || t.address?.state || ''}" placeholder="California">
              </div>
              <div class="form-group">
                <label class="form-label">Postal / Zip Code</label>
                <input class="input" name="postalCode" value="${b.address?.postalCode || t.address?.postalCode || ''}" placeholder="94103">
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:12px; border-top:1px solid var(--border-subtle); padding-top:18px;">
              <button type="submit" class="btn btn-primary" style="padding:10px 24px;">
                Save & Continue to Step 2 →
              </button>
            </div>
          </form>
        </div>
      `;

    case 2:
      return `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <div>
              <h2 style="font-size:18px; font-weight:700;">Step 2: Currency & Store Location</h2>
              <p style="font-size:13px; color:var(--text-muted);">Choose your operating currency and name your first physical or virtual location.</p>
            </div>
            <span class="badge badge-primary">Step 2 of 5</span>
          </div>

          <form onsubmit="handleOnboardingStep2Submit(event)">
            <div class="form-grid" style="margin-bottom:16px;">
              <div class="form-group">
                <label class="form-label">Operating Currency <span class="required">*</span></label>
                <select class="select" name="currency">
                  <option value="USD" ${(b.currency || t.currency) === 'USD' ? 'selected' : ''}>USD ($ - US Dollar)</option>
                  <option value="EUR" ${(b.currency || t.currency) === 'EUR' ? 'selected' : ''}>EUR (€ - Euro)</option>
                  <option value="GBP" ${(b.currency || t.currency) === 'GBP' ? 'selected' : ''}>GBP (£ - British Pound)</option>
                  <option value="CAD" ${(b.currency || t.currency) === 'CAD' ? 'selected' : ''}>CAD ($ - Canadian Dollar)</option>
                  <option value="AUD" ${(b.currency || t.currency) === 'AUD' ? 'selected' : ''}>AUD ($ - Australian Dollar)</option>
                  <option value="JPY" ${(b.currency || t.currency) === 'JPY' ? 'selected' : ''}>JPY (¥ - Japanese Yen)</option>
                  <option value="INR" ${(b.currency || t.currency) === 'INR' ? 'selected' : ''}>INR (₹ - Indian Rupee)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Country <span class="required">*</span></label>
                <select class="select" name="country">
                  <option value="US" ${(b.country || t.country) === 'US' ? 'selected' : ''}>United States</option>
                  <option value="GB" ${(b.country || t.country) === 'GB' ? 'selected' : ''}>United Kingdom</option>
                  <option value="CA" ${(b.country || t.country) === 'CA' ? 'selected' : ''}>Canada</option>
                  <option value="AU" ${(b.country || t.country) === 'AU' ? 'selected' : ''}>Australia</option>
                  <option value="DE" ${(b.country || t.country) === 'DE' ? 'selected' : ''}>Germany</option>
                  <option value="FR" ${(b.country || t.country) === 'FR' ? 'selected' : ''}>France</option>
                  <option value="IN" ${(b.country || t.country) === 'IN' ? 'selected' : ''}>India</option>
                </select>
              </div>
            </div>

            <div class="card" style="background:var(--bg-app); padding:16px; margin-bottom:20px; border:1px solid var(--border-subtle);">
              <h3 style="font-size:14px; font-weight:700; margin-bottom:8px;">📍 Primary Store / Warehouse Location</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Store / Branch Name</label>
                  <input class="input" name="locName" value="${loc.name || `${t.name || 'Main'} Flagship Store`}" placeholder="e.g. Main Street Store">
                </div>
                <div class="form-group">
                  <label class="form-label">Location Code</label>
                  <input class="input" name="locCode" value="${loc.code || 'MAIN-01'}" placeholder="MAIN-01">
                </div>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:18px;">
              <button type="button" class="btn btn-secondary" onclick="state.onboardingStep = 1; renderApp();">← Back</button>
              <button type="submit" class="btn btn-primary" style="padding:10px 24px;">Continue to Products →</button>
            </div>
          </form>
        </div>
      `;

    case 3:
      return `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <div>
              <h2 style="font-size:18px; font-weight:700;">Step 3: Add Initial Products</h2>
              <p style="font-size:13px; color:var(--text-muted);">Add products one by one, or instantly populate sample starter catalog.</p>
            </div>
            <span class="badge badge-primary">Step 3 of 5</span>
          </div>

          <!-- 1-Click Sample Catalog Card -->
          <div class="card" style="background:linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(16,185,129,0.1) 100%); border:1px dashed var(--primary); padding:16px 20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <div style="font-weight:700; font-size:14px; color:var(--text-main);">🚀 Need a fast start? Load 4 Sample Retail Products</div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Includes coffee, beverages, and merchandise with SKU, barcodes & stock.</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="loadSampleProductsIntoWizard()">
              ✨ Load Sample Starter Pack
            </button>
          </div>

          <!-- Quick Product Add Form -->
          <form onsubmit="handleOnboardingAddProduct(event)" class="card" style="background:var(--bg-app); padding:16px; margin-bottom:20px;">
            <div style="font-weight:700; font-size:13px; margin-bottom:12px; text-transform:uppercase; color:var(--text-dim);">+ Add A Product</div>
            <div class="form-grid" style="margin-bottom:10px;">
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label">Product Name <span class="required">*</span></label>
                <input class="input" name="name" required placeholder="e.g. Organic Roast Coffee Beans 250g">
              </div>
              <div class="form-group">
                <label class="form-label">Selling Price (${state.tenant?.currency || '$'}) <span class="required">*</span></label>
                <input class="input" type="number" step="0.01" min="0" name="sellingPrice" required placeholder="14.99">
              </div>
              <div class="form-group">
                <label class="form-label">Cost Price (${state.tenant?.currency || '$'})</label>
                <input class="input" type="number" step="0.01" min="0" name="costPrice" placeholder="7.50">
              </div>
            </div>
            <div class="form-grid" style="margin-bottom:12px;">
              <div class="form-group">
                <label class="form-label">Category</label>
                <input class="input" name="categoryName" placeholder="Beverages">
              </div>
              <div class="form-group">
                <label class="form-label">Barcode / UPC</label>
                <input class="input" name="barcode" placeholder="890123456001">
              </div>
              <div class="form-group">
                <label class="form-label">SKU (Auto if blank)</label>
                <input class="input" name="sku" placeholder="Auto-generated">
              </div>
            </div>
            <button type="submit" class="btn btn-secondary btn-sm" style="font-weight:600;">+ Add to Catalog List</button>
          </form>

          <!-- Current Products in List -->
          <div style="margin-bottom:24px;">
            <div style="font-weight:700; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between;">
              <span>Products Ready (${state.onboardingData.products.length})</span>
            </div>

            ${state.onboardingData.products.length === 0 ? `
              <div style="text-align:center; padding:24px; border:1px dashed var(--border-subtle); border-radius:var(--radius-md); color:var(--text-muted); font-size:13px;">
                No products added yet. Click <strong>Load Sample Starter Pack</strong> above or fill the quick form to add items.
              </div>
            ` : `
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU / Barcode</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Cost</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${state.onboardingData.products.map((p, idx) => `
                      <tr>
                        <td style="font-weight:600;">${p.name}</td>
                        <td style="font-family:var(--font-mono); font-size:12px;">${p.sku || '-'} ${p.barcode ? `• ${p.barcode}` : ''}</td>
                        <td><span class="badge badge-neutral">${p.categoryName || 'General'}</span></td>
                        <td style="font-weight:700; color:var(--primary);">${state.tenant?.currency || '$'} ${Number(p.sellingPrice).toFixed(2)}</td>
                        <td style="color:var(--text-muted);">${state.tenant?.currency || '$'} ${Number(p.costPrice || 0).toFixed(2)}</td>
                        <td>
                          <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="removeOnboardingProduct(${idx})">✕</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:18px;">
            <button type="button" class="btn btn-secondary" onclick="state.onboardingStep = 2; renderApp();">← Back</button>
            <div style="display:flex; gap:10px;">
              <button type="button" class="btn btn-ghost" onclick="state.onboardingStep = 4; renderApp();">Skip for Now</button>
              <button type="button" class="btn btn-primary" style="padding:10px 24px;" onclick="state.onboardingStep = 4; renderApp();">
                Continue to Opening Stock (${state.onboardingData.products.length} items) →
              </button>
            </div>
          </div>
        </div>
      `;

    case 4:
      return `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <div>
              <h2 style="font-size:18px; font-weight:700;">Step 4: Add Opening Stock Quantities</h2>
              <p style="font-size:13px; color:var(--text-muted);">Set your shelf inventory count so you can start scanning and selling right away.</p>
            </div>
            <span class="badge badge-primary">Step 4 of 5</span>
          </div>

          ${state.onboardingData.products.length === 0 ? `
            <div style="text-align:center; padding:36px 12px; background:var(--bg-app); border-radius:var(--radius-md); margin-bottom:24px;">
              <div style="font-size:32px; margin-bottom:8px;">📦</div>
              <div style="font-size:15px; font-weight:600;">No Products in Wizard</div>
              <div style="font-size:13px; color:var(--text-muted); margin-top:4px; margin-bottom:16px;">
                You can add stock after onboarding or go back to Step 3 to add products.
              </div>
              <button class="btn btn-secondary btn-sm" onclick="state.onboardingStep = 3; renderApp();">← Go back to Step 3</button>
            </div>
          ` : `
            <form onsubmit="handleOnboardingStep4Submit(event)">
              <div class="table-container" style="margin-bottom:24px;">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Unit Cost (${state.tenant?.currency || '$'})</th>
                      <th style="width:160px;">Initial Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${state.onboardingData.products.map((p, idx) => `
                      <tr>
                        <td style="font-weight:600;">${p.name}</td>
                        <td><span class="badge badge-neutral">${p.categoryName || 'General'}</span></td>
                        <td>
                          <input class="input" type="number" step="0.01" min="0" 
                            name="cost_${idx}" 
                            value="${p.costPrice || 0}" 
                            style="max-width:110px;"
                            onchange="state.onboardingData.products[${idx}].costPrice = Number(this.value)"
                          >
                        </td>
                        <td>
                          <input class="input" type="number" min="0" 
                            name="qty_${idx}" 
                            value="${p.initialStock || 25}" 
                            style="max-width:120px; font-weight:700; color:var(--primary);"
                            onchange="state.onboardingData.products[${idx}].initialStock = Number(this.value)"
                            required
                          >
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:18px;">
                <button type="button" class="btn btn-secondary" onclick="state.onboardingStep = 3; renderApp();">← Back</button>
                <button type="submit" class="btn btn-primary" style="padding:10px 24px; font-weight:700;">
                  ✓ Save & Complete Setup →
                </button>
              </div>
            </form>
          `}

          ${state.onboardingData.products.length === 0 ? `
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:18px;">
              <button type="button" class="btn btn-secondary" onclick="state.onboardingStep = 3; renderApp();">← Back</button>
              <button type="button" class="btn btn-primary" style="padding:10px 24px;" onclick="finishOnboardingDirectly()">Complete Setup & Continue →</button>
            </div>
          ` : ''}
        </div>
      `;

    case 5:
      return `
        <div style="text-align: center; padding: 24px 12px;">
          <div style="font-size: 54px; margin-bottom: 12px;">🎉</div>
          <h2 style="font-size: 24px; font-weight: 800; color: var(--success); margin-bottom: 8px;">
            Ready to Sell!
          </h2>
          <p style="color: var(--text-muted); font-size: 14px; max-width: 500px; margin: 0 auto 24px auto;">
            Your business <strong>${state.tenant?.name || 'Store'}</strong> is now fully configured and ready for live sales, inventory management, and cashier checkout.
          </p>

          <!-- Quick Recap Card -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px; max-width:600px; margin: 0 auto 28px auto; text-align:left;">
            <div class="card" style="background:var(--bg-app); padding:14px;">
              <div style="font-size:11px; text-transform:uppercase; color:var(--text-dim);">Business</div>
              <div style="font-size:14px; font-weight:700; margin-top:2px;">${state.tenant?.name}</div>
            </div>
            <div class="card" style="background:var(--bg-app); padding:14px;">
              <div style="font-size:11px; text-transform:uppercase; color:var(--text-dim);">Currency</div>
              <div style="font-size:14px; font-weight:700; margin-top:2px;">${state.tenant?.currency}</div>
            </div>
            <div class="card" style="background:var(--bg-app); padding:14px;">
              <div style="font-size:11px; text-transform:uppercase; color:var(--text-dim);">Catalog</div>
              <div style="font-size:14px; font-weight:700; color:var(--primary); margin-top:2px;">Ready ✓</div>
            </div>
            <div class="card" style="background:var(--bg-app); padding:14px;">
              <div style="font-size:11px; text-transform:uppercase; color:var(--text-dim);">Inventory</div>
              <div style="font-size:14px; font-weight:700; color:var(--success); margin-top:2px;">Active ✓</div>
            </div>
          </div>

          <!-- Direct Launch Actions -->
          <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
            <button class="btn btn-primary" style="padding:12px 28px; font-size:15px; font-weight:700;" onclick="navigate('pos')">
              🛒 Launch Retail POS Cashier
            </button>
            <button class="btn btn-secondary" style="padding:12px 24px; font-size:14px;" onclick="navigate('dashboard')">
              📊 Go to Dashboard
            </button>
            <button class="btn btn-ghost" style="padding:12px 20px; font-size:14px;" onclick="navigate('settings')">
              ⚙️ Review Settings
            </button>
          </div>
        </div>
      `;
  }
}

window.handleOnboardingStep1Submit = function (e) {
  e.preventDefault();
  const f = new FormData(e.target);
  state.onboardingData.business = {
    name: f.get('name'),
    businessType: f.get('businessType'),
    email: f.get('email'),
    phone: f.get('phone'),
    address: {
      street: f.get('street'),
      city: f.get('city'),
      state: f.get('state'),
      postalCode: f.get('postalCode'),
    },
  };
  state.onboardingStep = 2;
  renderApp();
};

window.handleOnboardingStep2Submit = function (e) {
  e.preventDefault();
  const f = new FormData(e.target);
  state.onboardingData.business = {
    ...state.onboardingData.business,
    currency: f.get('currency'),
    country: f.get('country'),
  };
  state.onboardingData.location = {
    name: f.get('locName'),
    code: f.get('locCode'),
  };
  state.onboardingStep = 3;
  renderApp();
};

window.handleOnboardingAddProduct = function (e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const name = f.get('name')?.toString().trim();
  if (!name) return;

  const sku = f.get('sku')?.toString().trim() || `SKU-${Date.now().toString().slice(-6)}`;
  state.onboardingData.products.push({
    name,
    sku,
    sellingPrice: Number(f.get('sellingPrice')) || 0,
    costPrice: Number(f.get('costPrice')) || 0,
    categoryName: f.get('categoryName')?.toString().trim() || 'General',
    barcode: f.get('barcode')?.toString().trim() || undefined,
    initialStock: 25,
  });

  e.target.reset();
  UI.toast(`Added "${name}" to product list`, 'success');
  renderApp();
};

window.loadSampleProductsIntoWizard = function () {
  state.onboardingData.products = [
    {
      name: 'Organic Colombian Coffee Beans (250g)',
      sku: 'COF-COL-250',
      barcode: '890123456001',
      sellingPrice: 14.5,
      costPrice: 7.2,
      categoryName: 'Beverages',
      initialStock: 45,
    },
    {
      name: 'Ceramic Artisan Coffee Mug',
      sku: 'MUG-ART-01',
      barcode: '890123456002',
      sellingPrice: 18.0,
      costPrice: 6.5,
      categoryName: 'Merchandise',
      initialStock: 30,
    },
    {
      name: 'Fresh French Butter Croissant',
      sku: 'BAK-CROIS-01',
      barcode: '890123456003',
      sellingPrice: 4.25,
      costPrice: 1.5,
      categoryName: 'Bakery',
      initialStock: 25,
    },
    {
      name: 'Organic Matcha Green Tea Tin (50g)',
      sku: 'TEA-MAT-050',
      barcode: '890123456004',
      sellingPrice: 22.0,
      costPrice: 11.0,
      categoryName: 'Beverages',
      initialStock: 20,
    },
  ];
  UI.toast('✓ Loaded 4 starter products into catalog list!', 'success');
  renderApp();
};

window.removeOnboardingProduct = function (idx) {
  state.onboardingData.products.splice(idx, 1);
  renderApp();
};

window.handleOnboardingStep4Submit = async function (e) {
  e.preventDefault();
  await finishOnboardingDirectly();
};

window.finishOnboardingDirectly = async function () {
  const payload = {
    business: state.onboardingData.business,
    location: state.onboardingData.location,
    products: state.onboardingData.products,
    markComplete: true,
  };

  try {
    const res = await api('/api/v1/business/onboarding', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success) {
      state.tenant = res.data.tenant;
      state.setupChecklist = res.data.checklist;
      state.onboardingStep = 5;
      UI.toast('🎉 Business setup successfully completed!', 'success');
      renderApp();
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
};

window.startOnboardingAt = function (stepNumber) {
  state.onboardingStep = stepNumber;
  state.currentRoute = 'setup';
  renderApp();
};

// -------------------------------------------------------------
// 5. DASHBOARD VIEW WITH SETUP CHECKLIST WIDGET
// -------------------------------------------------------------
function renderDashboardView() {
  const ch = state.setupChecklist;
  const isComplete = ch?.isSetupComplete || ch?.percentComplete === 100;
  const showChecklist = !isComplete && !state.setupChecklistDismissed;

  return `
    <div>
      
      <!-- Top Header -->
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
        <div>
          <h1 style="font-size:22px; font-weight:800;">Business Dashboard</h1>
          <p style="font-size:13px; color:var(--text-muted);">${state.tenant?.name || 'Overview'}</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="navigate('pos')">🛒 Open POS Cashier</button>
          <button class="btn btn-secondary" onclick="navigate('settings')">⚙️ Settings</button>
        </div>
      </div>

      <!-- SETUP CHECKLIST (AUTO-HIDES ONCE SETUP IS COMPLETE) -->
      ${showChecklist && ch ? `
        <div class="checklist-card">
          <div class="checklist-header">
            <div class="checklist-title-group">
              <span style="font-size:22px;">🚀</span>
              <div>
                <h3 style="font-size:16px; font-weight:700; color:var(--text-main);">
                  Setup Progress (${ch.percentComplete}% Complete)
                </h3>
                <div style="font-size:12px; color:var(--text-muted);">
                  Complete these steps to finish configuring your business.
                </div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge ${ch.percentComplete === 100 ? 'badge-success' : 'badge-primary'}">
                ${ch.completedSteps} of ${ch.totalSteps} Completed
              </span>
              <button class="btn btn-ghost btn-sm" onclick="dismissChecklist()" title="Dismiss checklist">✕</button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="checklist-progress-bar">
            <div class="checklist-progress-fill" style="width: ${ch.percentComplete}%;"></div>
          </div>

          <!-- 4 Checklist Items -->
          <div class="checklist-grid">
            ${ch.items.map((item) => `
              <div class="checklist-item ${item.completed ? 'completed' : ''}">
                <div class="checklist-item-left">
                  <div class="checklist-check-icon">
                    ${item.completed ? '✓' : '○'}
                  </div>
                  <div>
                    <div style="font-weight:600; font-size:13px; color:var(--text-main);">${item.label}</div>
                    <div style="font-size:11px; color:var(--text-dim);">${item.completed ? 'Configured' : 'Action needed'}</div>
                  </div>
                </div>

                ${!item.completed ? `
                  <button class="btn btn-secondary btn-sm" style="font-size:11px; padding:4px 8px;" onclick="navigate('${item.actionRoute}')">
                    Fix →
                  </button>
                ` : `
                  <span style="color:var(--success); font-size:13px;">✓</span>
                `}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Main Operational Metrics -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
        <div class="card" style="padding:18px;">
          <div style="font-size:12px; text-transform:uppercase; color:var(--text-dim); font-weight:600;">Today's Gross Sales</div>
          <div style="font-size:24px; font-weight:800; color:var(--primary); margin-top:6px;">
            ${state.tenant?.currency || '$'} 0.00
          </div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">0 transactions processed</div>
        </div>

        <div class="card" style="padding:18px;">
          <div style="font-size:12px; text-transform:uppercase; color:var(--text-dim); font-weight:600;">Catalog Size</div>
          <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-top:6px;">
            ${state.products.length} Products
          </div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Active in store</div>
        </div>

        <div class="card" style="padding:18px;">
          <div style="font-size:12px; text-transform:uppercase; color:var(--text-dim); font-weight:600;">Locations</div>
          <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-top:6px;">
            ${state.locations.length || 1} Branches
          </div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Primary warehouse ready</div>
        </div>

        <div class="card" style="padding:18px;">
          <div style="font-size:12px; text-transform:uppercase; color:var(--text-dim); font-weight:600;">System Health</div>
          <div style="font-size:24px; font-weight:800; color:var(--success); margin-top:6px;">
            ● Operational
          </div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Offline scanner enabled</div>
        </div>
      </div>

      <!-- Quick Launchpad -->
      <div class="card" style="padding:20px;">
        <h3 style="font-size:15px; font-weight:700; margin-bottom:14px;">⚡ Fast Launchpad</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
          <button class="btn btn-secondary" style="padding:14px; text-align:left; justify-content:flex-start; gap:10px;" onclick="navigate('pos')">
            <span style="font-size:20px;">🛒</span>
            <div>
              <div style="font-weight:700; font-size:13px;">Retail POS</div>
              <div style="font-size:11px; color:var(--text-dim);">Speed cashier & scanning</div>
            </div>
          </button>

          <button class="btn btn-secondary" style="padding:14px; text-align:left; justify-content:flex-start; gap:10px;" onclick="navigate('products')">
            <span style="font-size:20px;">🏷️</span>
            <div>
              <div style="font-weight:700; font-size:13px;">Products</div>
              <div style="font-size:11px; color:var(--text-dim);">Manage pricing & catalog</div>
            </div>
          </button>

          <button class="btn btn-secondary" style="padding:14px; text-align:left; justify-content:flex-start; gap:10px;" onclick="navigate('inventory')">
            <span style="font-size:20px;">🏢</span>
            <div>
              <div style="font-weight:700; font-size:13px;">Inventory</div>
              <div style="font-size:11px; color:var(--text-dim);">Stock levels & counts</div>
            </div>
          </button>

          <button class="btn btn-secondary" style="padding:14px; text-align:left; justify-content:flex-start; gap:10px;" onclick="navigate('settings')">
            <span style="font-size:20px;">⚙️</span>
            <div>
              <div style="font-weight:700; font-size:13px;">Settings</div>
              <div style="font-size:11px; color:var(--text-dim);">Taxes, receipts, users</div>
            </div>
          </button>
        </div>
      </div>

    </div>
  `;
}

async function loadDashboard() {
  try {
    const checkRes = await api('/api/v1/business/checklist');
    if (checkRes.success) {
      state.setupChecklist = checkRes.data;
      updateMainContent();
    }
  } catch (err) {}
}

window.dismissChecklist = function () {
  state.setupChecklistDismissed = true;
  localStorage.setItem('erp_checklist_dismissed', 'true');
  renderApp();
};

// -------------------------------------------------------------
// 6. SETTINGS HUB (ALL 11 CATEGORIES + SEPARATED ADVANCED)
// -------------------------------------------------------------
function renderSettingsView() {
  const currentTab = state.settingsTab || 'business';
  const data = state.settingsData || {};

  const tabs = [
    { id: 'business', label: 'Business Profile', icon: '🏢' },
    { id: 'users', label: 'Users & Team', icon: '👥' },
    { id: 'roles', label: 'Roles & RBAC', icon: '🛡️' },
    { id: 'locations', label: 'Locations & Stores', icon: '📍' },
    { id: 'taxes', label: 'Taxes & VAT', icon: '🏷️' },
    { id: 'currency', label: 'Currency & Formats', icon: '💱' },
    { id: 'receipt', label: 'Receipt Template', icon: '🧾' },
    { id: 'invoice', label: 'Invoice Settings', icon: '📄' },
    { id: 'notifications', label: 'Notifications & Alerts', icon: '🔔' },
    { id: 'integrations', label: 'Integrations & API', icon: '⚡' },
    { id: 'security', label: 'Security & Sessions', icon: '🔒' },
    { id: 'advanced', label: 'Advanced Settings', icon: '⚠️', isAdvanced: true },
  ];

  return `
    <div>
      <div class="page-header" style="margin-bottom: 20px;">
        <h1 style="font-size:22px; font-weight:800;">System Settings</h1>
        <p style="font-size:13px; color:var(--text-muted);">Manage your organization preferences, taxes, receipts, team, and security.</p>
      </div>

      <div class="settings-container">
        
        <!-- Left Navigation Sidebar -->
        <div class="settings-nav">
          ${tabs.map((t) => {
            if (t.isAdvanced) {
              return `
                <div class="settings-nav-divider"></div>
                <button class="settings-nav-item advanced ${currentTab === t.id ? 'active' : ''}" onclick="setSettingsTab('${t.id}')">
                  <span>${t.icon}</span>
                  <span>${t.label}</span>
                </button>
              `;
            }
            return `
              <button class="settings-nav-item ${currentTab === t.id ? 'active' : ''}" onclick="setSettingsTab('${t.id}')">
                <span>${t.icon}</span>
                <span>${t.label}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Right Content Panel -->
        <div class="card" style="padding: 24px; background: var(--bg-surface-elevated); border: 1px solid var(--border-strong);">
          ${renderActiveSettingsPanel(currentTab, data)}
        </div>

      </div>
    </div>
  `;
}

function renderActiveSettingsPanel(tab, data) {
  switch (tab) {
    case 'business':
      const b = data.business || state.tenant || {};
      return `
        <div>
          <h2 style="font-size:18px; font-weight:700; margin-bottom:4px;">🏢 Business Profile</h2>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">General business information and storefront metadata.</p>

          <form onsubmit="handleSaveSettingsCategory(event, 'business')">
            <div class="form-grid" style="margin-bottom:16px;">
              <div class="form-group">
                <label class="form-label">Business Name <span class="required">*</span></label>
                <input class="input" name="name" value="${b.name || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Business Type</label>
                <select class="select" name="businessType">
                  <option value="RETAIL" ${b.businessType === 'RETAIL' ? 'selected' : ''}>Retail & Storefront</option>
                  <option value="ECOMMERCE" ${b.businessType === 'ECOMMERCE' ? 'selected' : ''}>E-Commerce / Online Store</option>
                  <option value="HYBRID_RETAIL" ${b.businessType === 'HYBRID_RETAIL' ? 'selected' : ''}>Hybrid Retail & Digital</option>
                  <option value="SERVICES" ${b.businessType === 'SERVICES' ? 'selected' : ''}>Services & Consulting</option>
                  <option value="MANUFACTURING" ${b.businessType === 'MANUFACTURING' ? 'selected' : ''}>Manufacturing & Assembly</option>
                  <option value="HEALTHCARE" ${b.businessType === 'HEALTHCARE' ? 'selected' : ''}>Pharmacy & Healthcare</option>
                  <option value="OTHER" ${b.businessType === 'OTHER' ? 'selected' : ''}>Other</option>
                </select>
              </div>
            </div>

            <div class="form-grid" style="margin-bottom:16px;">
              <div class="form-group">
                <label class="form-label">Official Email</label>
                <input class="input" type="email" name="email" value="${b.email || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Contact Phone</label>
                <input class="input" name="phone" value="${b.phone || ''}">
              </div>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">Address</label>
              <input class="input" name="street" value="${b.address?.street || ''}" placeholder="Street">
            </div>

            <div class="form-grid" style="margin-bottom:24px;">
              <div class="form-group">
                <label class="form-label">City</label>
                <input class="input" name="city" value="${b.address?.city || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input class="input" name="state" value="${b.address?.state || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Postal Code</label>
                <input class="input" name="postalCode" value="${b.address?.postalCode || ''}">
              </div>
            </div>

            <button type="submit" class="btn btn-primary">Save Business Changes</button>
          </form>
        </div>
      `;

    case 'users':
      return `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <h2 style="font-size:18px; font-weight:700;">👥 Users & Team Members</h2>
              <p style="font-size:13px; color:var(--text-muted);">Manage member logins, invitations, and role assignments.</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="openInviteUserModal()">+ Invite Member</button>
          </div>

          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight:600;">${state.user?.fullName}</td>
                  <td>${state.user?.email}</td>
                  <td><span class="badge badge-primary">${state.membership?.role || 'Owner'}</span></td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;

    case 'roles':
      const roles = data.roles || [];
      return `
        <div>
          <h2 style="font-size:18px; font-weight:700; margin-bottom:4px;">🛡️ Roles & Permissions Matrix</h2>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">System access roles and authorization capabilities across all ERP modules.</p>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:20px;">
            ${roles.map((r) => `
              <div class="card" style="background:var(--bg-app); padding:12px; border:1px solid var(--border-subtle);">
                <div style="font-weight:700; font-size:13px; color:var(--primary);">${r.role}</div>
                <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">${r.description}</div>
                <div style="font-size:10px; font-weight:700; color:var(--text-muted); margin-top:6px;">${r.permissionCount} permissions</div>
              </div>
            `).join('')}
          </div>

          <div class="table-container">
            <table class="permissions-matrix">
              <thead>
                <tr>
                  <th>Permission Name</th>
                  <th class="center">Owner</th>
                  <th class="center">Manager</th>
                  <th class="center">Cashier</th>
                  <th class="center">Accountant</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>pos:access</td><td class="center">✓</td><td class="center">✓</td><td class="center">✓</td><td class="center">-</td></tr>
                <tr><td>sales:create</td><td class="center">✓</td><td class="center">✓</td><td class="center">✓</td><td class="center">-</td></tr>
                <tr><td>inventory:adjust</td><td class="center">✓</td><td class="center">✓</td><td class="center">-</td><td class="center">-</td></tr>
                <tr><td>financials:post</td><td class="center">✓</td><td class="center">-</td><td class="center">-</td><td class="center">✓</td></tr>
                <tr><td>tenant:settings</td><td class="center">✓</td><td class="center">-</td><td class="center">-</td><td class="center">-</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `;

    case 'locations':
      const locs = data.locations || state.locations || [];
      return `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <h2 style="font-size:18px; font-weight:700;">📍 Locations & Branches</h2>
              <p style="font-size:13px; color:var(--text-muted);">Manage physical stores, regional warehouses, and retail branches.</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="openAddLocationModal()">+ Add Location</button>
          </div>

          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Location Name</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${locs.map((l) => `
                  <tr>
                    <td style="font-weight:600;">${l.name}</td>
                    <td style="font-family:var(--font-mono);">${l.code}</td>
                    <td><span class="badge badge-neutral">${l.type || 'STORE'}</span></td>
                    <td>${l.isDefault ? '<span class="badge badge-success">Default Store</span>' : '-'}</td>
                    <td><span class="badge badge-success">Active</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

    case 'taxes':
      const taxes = data.taxes || {};
      return `
        <div>
          <h2 style="font-size:18px; font-weight:700; margin-bottom:4px;">🏷️ Taxes & VAT Configuration</h2>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Configure sales tax rates, VAT numbers, and tax-inclusive pricing.</p>

          <form onsubmit="handleSaveSettingsCategory(event, 'taxes')">
            <div class="form-grid" style="margin-bottom:16px;">
              <div class="form-group">
                <label class="form-label">Tax / VAT Registration Number</label>
                <input class="input" name="taxNumber" value="${taxes.taxNumber || ''}" placeholder="e.g. VAT-99887766">
              </div>
              <div class="form-group">
                <label class="form-label">Default Tax Rate (%)</label>
                <input class="input" type="number" step="0.01" min="0" max="100" name="defaultTaxRate" value="${taxes.defaultTaxRate ?? 0}">
              </div>
            </div>

            <div class="card" style="background:var(--bg-app); padding:16px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700; font-size:13px;">Prices Include Tax (Tax Inclusive)</div>
                <div style="font-size:12px; color:var(--text-muted);">When enabled, shelf selling prices will already include tax.</div>
              </div>
              <label class="switch">
                <input type="checkbox" name="pricesIncludeTax" ${taxes.pricesIncludeTax ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary">Save Tax Settings</button>
          </form>
        </div>
      `;

    case 'currency':
      const curr = data.currency || {};
      return `
        <div>
          <h2 style="font-size:18px; font-weight:700; margin-bottom:4px;">💱 Currency & Formatting</h2>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Set your standard currency symbols, decimal precision, and formatting rules.</p>

          <form onsubmit="handleSaveSettingsCategory(event, 'currency')">
            <div class="form-grid" style="margin-bottom:16px;">
              <div class="form-group">
                <label class="form-label">Currency Code</label>
                <input class="input" name="currency" value="${curr.currency || state.tenant?.currency || 'USD'}" readonly style="background:var(--bg-app);">
              </div>
              <div class="form-group">
                <label class="form-label">Currency Symbol</label>
                <input class="input" name="symbol" value="${curr.symbol || '$'}" placeholder="$">
              </div>
            </div>

            <div class="form-grid" style="margin-bottom:24px;">
              <div class="form-group">
                <label class="form-label">Symbol Position</label>
                <select class="select" name="position">
                  <option value="before" ${curr.position === 'before' ? 'selected' : ''}>Before amount ($100.00)</option>
                  <option value="after" ${curr.position === 'after' ? 'selected' : ''}>After amount (100.00 $)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Decimal Places</label>
                <input class="input" type="number" min="0" max="4" name="decimalPlaces" value="${curr.decimalPlaces ?? 2}">
              </div>
            </div>

            <button type="submit" class="btn btn-primary">Save Currency Settings</button>
          </form>
        </div>
      `;

    case 'receipt':
      const rcpt = data.receipt || {};
      return `
        <div>
          <h2 style="font-size:18px; font-weight:700; margin-bottom:4px;">🧾 POS Receipt Template</h2>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Customize thermal printer receipts, header text, and return policies.</p>

          <form onsubmit="handleSaveSettingsCategory(event, 'receipt')">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">Receipt Header Message</label>
              <input class="input" name="header" value="${rcpt.header || ''}" placeholder="Welcome to our store!">
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">Receipt Footer Message</label>
              <input class="input" name="footer" value="${rcpt.footer || ''}" placeholder="Thank you for shopping local!">
            </div>

            <div class="form-grid" style="margin-bottom:20px;">
              <div class="form-group">
                <label class="form-label">Paper Width</label>
                <select class="select" name="width">
                  <option value="80mm" ${rcpt.width === '80mm' ? 'selected' : ''}>80mm (Standard POS Printer)</option>
                  <option value="58mm" ${rcpt.width === '58mm' ? 'selected' : ''}>58mm (Compact Mobile Printer)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Barcode on Receipt</label>
                <select class="select" name="showBarcode">
                  <option value="true" ${rcpt.showBarcode ? 'selected' : ''}>Yes, show sale barcode</option>
                  <option value="false" ${!rcpt.showBarcode ? 'selected' : ''}>No barcode</option>
                </select>
              </div>
            </div>

            <button type="submit" class="btn btn-primary">Save Receipt Template</button>
          </form>
        </div>
      `;

    case 'invoice':
      const inv = data.invoice || {};
      return `
        <div>
          <h2 style="font-size:18px; font-weight:700; margin-bottom:4px;">📄 Commercial Invoice Settings</h2>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Customize B2B invoice numbering, payment terms, and bank remittance info.</p>

          <form onsubmit="handleSaveSettingsCategory(event, 'invoice')">
            <div class="form-grid" style="margin-bottom:16px;">
              <div class="form-group">
                <label class="form-label">Invoice Prefix</label>
                <input class="input" name="prefix" value="${inv.prefix || 'INV-'}" placeholder="INV-">
              </div>
              <div class="form-group">
                <label class="form-label">Next Invoice Number</label>
                <input class="input" type="number" min="1" name="nextNumber" value="${inv.nextNumber ?? 1001}">
              </div>
            </div>

            <div class="form-grid" style="margin-bottom:16px;">
              <div class="form-group">
                <label class="form-label">Default Payment Terms</label>
                <select class="select" name="paymentTerms">
                  <option value="DUE_ON_RECEIPT" ${inv.paymentTerms === 'DUE_ON_RECEIPT' ? 'selected' : ''}>Due on Receipt</option>
                  <option value="NET_15" ${inv.paymentTerms === 'NET_15' ? 'selected' : ''}>Net 15 Days</option>
                  <option value="NET_30" ${inv.paymentTerms === 'NET_30' ? 'selected' : ''}>Net 30 Days</option>
                  <option value="NET_60" ${inv.paymentTerms === 'NET_60' ? 'selected' : ''}>Net 60 Days</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Due Period (Days)</label>
                <input class="input" type="number" min="0" name="dueDays" value="${inv.dueDays ?? 14}">
              </div>
            </div>

            <div class="form-group" style="margin-bottom:24px;">
              <label class="form-label">Default Bank / Remittance Details</label>
              <textarea class="textarea" name="bankDetails" rows="3">${inv.bankDetails || ''}</textarea>
            </div>

            <button type="submit" class="btn btn-primary">Save Invoice Settings</button>
          </form>
        </div>
      `;

    case 'notifications':
      const notif = data.notifications || {};
      return `
        <div>
          <h2 style="font-size:18px; font-weight:700; margin-bottom:4px;">🔔 Notifications & Stock Alerts</h2>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Automated inventory warnings and daily summary emails.</p>

          <form onsubmit="handleSaveSettingsCategory(event, 'notifications')">
            <div class="form-grid" style="margin-bottom:16px;">
              <div class="form-group">
                <label class="form-label">Low Stock Alert Threshold (Units)</label>
                <input class="input" type="number" min="1" name="lowStockAlertThreshold" value="${notif.lowStockAlertThreshold ?? 5}">
              </div>
              <div class="form-group">
                <label class="form-label">Alerts Email Recipient</label>
                <input class="input" type="email" name="lowStockEmailRecipient" value="${notif.lowStockEmailRecipient || ''}" placeholder="inventory-alerts@company.com">
              </div>
            </div>

            <div class="card" style="background:var(--bg-app); padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700; font-size:13px;">Daily Sales Summary Email</div>
                <div style="font-size:12px; color:var(--text-muted);">Receive an automated evening summary of all store sales.</div>
              </div>
              <label class="switch">
                <input type="checkbox" name="dailySalesSummaryEmail" ${notif.dailySalesSummaryEmail ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top:12px;">Save Notifications</button>
          </form>
        </div>
      `;

    case 'integrations':
      const intg = data.integrations || {};
      return `
        <div>
          <h2 style="font-size:18px; font-weight:700; margin-bottom:4px;">⚡ Integrations & Connectors</h2>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Connect external eCommerce channels, card processors, and accounting.</p>

          <form onsubmit="handleSaveSettingsCategory(event, 'integrations')">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">Live API Secret Key</label>
              <input class="input" name="apiKey" value="${intg.apiKey || ''}" readonly style="font-family:var(--font-mono); background:var(--bg-app);">
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">Webhook Endpoint URL</label>
              <input class="input" name="webhookUrl" value="${intg.webhookUrl || ''}" placeholder="https://api.yourdomain.com/webhooks/erp">
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:20px;">
              <div class="card" style="background:var(--bg-app); padding:14px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; font-size:13px;">🛍️ Shopify Connector</div>
                  <div style="font-size:11px; color:var(--text-dim);">Sync products & orders</div>
                </div>
                <label class="switch">
                  <input type="checkbox" name="shopifyConnected" ${intg.shopifyConnected ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
              </div>

              <div class="card" style="background:var(--bg-app); padding:14px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; font-size:13px;">💳 Stripe Payments</div>
                  <div style="font-size:11px; color:var(--text-dim);">Online terminal pay</div>
                </div>
                <label class="switch">
                  <input type="checkbox" name="stripeConnected" ${intg.stripeConnected ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <button type="submit" class="btn btn-primary">Save Integration Settings</button>
          </form>
        </div>
      `;

    case 'security':
      const sec = data.security || {};
      return `
        <div>
          <h2 style="font-size:18px; font-weight:700; margin-bottom:4px;">🔒 Security & Session Policies</h2>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Manage password policies, session timeouts, and two-factor authentication.</p>

          <form onsubmit="handleSaveSettingsCategory(event, 'security')">
            <div class="form-grid" style="margin-bottom:16px;">
              <div class="form-group">
                <label class="form-label">Session Idle Timeout (Minutes)</label>
                <input class="input" type="number" min="15" name="sessionTimeoutMinutes" value="${sec.sessionTimeoutMinutes ?? 1440}">
              </div>
              <div class="form-group">
                <label class="form-label">Password Expiry (Days)</label>
                <input class="input" type="number" min="30" name="passwordExpiryDays" value="${sec.passwordExpiryDays ?? 90}">
              </div>
            </div>

            <div class="card" style="background:var(--bg-app); padding:16px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700; font-size:13px;">Require Two-Factor Authentication (2FA)</div>
                <div style="font-size:12px; color:var(--text-muted);">Enforce authenticator app 2FA on all staff logins.</div>
              </div>
              <label class="switch">
                <input type="checkbox" name="twoFactorRequired" ${sec.twoFactorRequired ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary">Save Security Policies</button>
          </form>
        </div>
      `;

    case 'advanced':
      const adv = data.advanced || {};
      return `
        <div>
          <!-- Advanced Warning Banner -->
          <div class="card" style="background:rgba(217, 119, 6, 0.12); border:1px solid var(--warning); padding:16px; margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:20px;">⚠️</span>
              <div>
                <div style="font-weight:700; font-size:14px; color:var(--warning);">Separated Advanced Settings</div>
                <div style="font-size:12px; color:var(--text-muted);">
                  These low-level developer options control raw database constraints, negative stock policies, and developer webhooks. Standard store operations are managed in the tabs above.
                </div>
              </div>
            </div>
          </div>

          <form onsubmit="handleSaveSettingsCategory(event, 'advanced')">
            <div class="card" style="background:var(--bg-app); padding:16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700; font-size:13px;">Allow Negative Stock Balance</div>
                <div style="font-size:12px; color:var(--text-muted);">Allow sales to proceed even when tracked inventory level reaches 0.</div>
              </div>
              <label class="switch">
                <input type="checkbox" name="allowNegativeStock" ${adv.allowNegativeStock ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>

            <div class="card" style="background:var(--bg-app); padding:16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700; font-size:13px;">System Debug Mode</div>
                <div style="font-size:12px; color:var(--text-muted);">Log detailed request traces and offline sync diagnostic headers.</div>
              </div>
              <label class="switch">
                <input type="checkbox" name="debugMode" ${adv.debugMode ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">Developer Webhook Signature Secret</label>
              <input class="input" name="webhookSecret" value="${adv.webhookSecret || ''}" readonly style="font-family:var(--font-mono); background:var(--bg-app);">
            </div>

            <div class="form-group" style="margin-bottom:24px;">
              <label class="form-label">Raw Config Overrides (JSON)</label>
              <textarea class="textarea" name="rawConfigJson" rows="4" style="font-family:var(--font-mono); font-size:12px;">${adv.rawConfigJson || '{\n  "cacheTtlSeconds": 300\n}'}</textarea>
            </div>

            <button type="submit" class="btn btn-warning">Save Advanced Settings</button>
          </form>
        </div>
      `;

    default:
      return `<div style="color:var(--text-muted);">Select a settings category from the left menu.</div>`;
  }
}

async function loadSettings() {
  try {
    const res = await api('/api/v1/business/settings');
    if (res.success) {
      state.settingsData = res.data;
      updateMainContent();
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
}

window.setSettingsTab = function (tabId) {
  state.settingsTab = tabId;
  renderApp();
};

window.handleSaveSettingsCategory = async function (e, category) {
  e.preventDefault();
  const f = new FormData(e.target);
  const payload = {};

  for (const [key, value] of f.entries()) {
    if (e.target[key] && e.target[key].type === 'checkbox') {
      payload[key] = e.target[key].checked;
    } else {
      payload[key] = value;
    }
  }

  // Handle un-checked checkboxes
  e.target.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    if (!f.has(cb.name)) {
      payload[cb.name] = false;
    }
  });

  try {
    const res = await api(`/api/v1/business/settings/${category}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (res.success) {
      state.settingsData = res.data;
      if (res.data.business) {
        state.tenant = { ...state.tenant, ...res.data.business };
      }
      UI.toast(`✓ ${category.charAt(0).toUpperCase() + category.slice(1)} settings saved!`, 'success');
      renderApp();
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
};

window.openInviteUserModal = function () {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 480px;">
      <div class="modal-header">
        <h3 class="card-title">Invite Team Member</h3>
        <button class="btn btn-ghost btn-sm" id="close-modal">✕</button>
      </div>
      <form onsubmit="handleInviteUserSubmit(event, this.closest('.modal-backdrop'))">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">First Name <span class="required">*</span></label>
              <input class="input" name="firstName" required placeholder="John">
            </div>
            <div class="form-group">
              <label class="form-label">Last Name <span class="required">*</span></label>
              <input class="input" name="lastName" required placeholder="Doe">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Email Address <span class="required">*</span></label>
            <input class="input" type="email" name="email" required placeholder="john.doe@company.com">
          </div>
          <div class="form-group">
            <label class="form-label">Role <span class="required">*</span></label>
            <select class="select" name="role">
              <option value="Manager">Manager</option>
              <option value="Cashier">Cashier</option>
              <option value="Sales">Sales Representative</option>
              <option value="Inventory Manager">Inventory Manager</option>
              <option value="Accountant">Accountant</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Send Invitation</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#close-modal').onclick = close;
  modal.querySelector('#cancel-modal').onclick = close;
};

window.handleInviteUserSubmit = async function (e, modal) {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const res = await api('/api/v1/users/invite', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(f.entries())),
    });
    if (res.success) {
      UI.toast(`Invitation sent to ${f.get('email')}!`, 'success');
      modal.remove();
      loadSettings();
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
};

window.openAddLocationModal = function () {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 480px;">
      <div class="modal-header">
        <h3 class="card-title">Add Store or Warehouse</h3>
        <button class="btn btn-ghost btn-sm" id="close-modal">✕</button>
      </div>
      <form onsubmit="handleAddLocationSubmit(event, this.closest('.modal-backdrop'))">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <div class="form-group">
            <label class="form-label">Location Name <span class="required">*</span></label>
            <input class="input" name="name" required placeholder="Downtown Branch">
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Location Code <span class="required">*</span></label>
              <input class="input" name="code" required placeholder="BRANCH-02">
            </div>
            <div class="form-group">
              <label class="form-label">Type</label>
              <select class="select" name="type">
                <option value="STORE">Retail Store</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="BRANCH">Branch</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Location</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#close-modal').onclick = close;
  modal.querySelector('#cancel-modal').onclick = close;
};

window.handleAddLocationSubmit = async function (e, modal) {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const res = await api('/api/v1/inventory/locations', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(f.entries())),
    });
    if (res.success) {
      UI.toast(`Created location "${res.data.name}"!`, 'success');
      modal.remove();
      loadSettings();
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
};

// -------------------------------------------------------------
// 7. MODULE VIEWS & CONTROLLERS
// -------------------------------------------------------------

// ==========================================
// A. SALES & INVOICES VIEW
// ==========================================
function renderSalesView() {
  const sales = state.sales || [];
  const totalSalesVal = sales.reduce((acc, s) => acc + (s.grandTotal || s.totalAmount || 0), 0);
  const paidCount = sales.filter((s) => s.status === 'PAID').length;

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; display:flex; align-items:center; gap:8px;">
            💳 Sales & Invoices
          </h1>
          <p style="font-size:13px; color:var(--text-muted);">View transactions, search receipt records, print customer invoices, and issue refunds.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-secondary" onclick="loadSales()">🔄 Refresh</button>
          <button class="btn btn-primary" onclick="navigate('pos')">🛒 Open POS Register</button>
        </div>
      </div>

      <!-- Quick Metrics Cards -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
        <div class="card" style="padding:16px;">
          <div style="font-size:11px; text-transform:uppercase; color:var(--text-dim); font-weight:700;">Total Sales Revenue</div>
          <div style="font-size:24px; font-weight:800; color:var(--primary); margin-top:4px;">
            ${state.tenant?.currency || '$'} ${totalSalesVal.toFixed(2)}
          </div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Across ${sales.length} completed transactions</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="font-size:11px; text-transform:uppercase; color:var(--text-dim); font-weight:700;">Paid Orders</div>
          <div style="font-size:24px; font-weight:800; color:var(--success); margin-top:4px;">
            ${paidCount} Orders
          </div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">100% settled</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="font-size:11px; text-transform:uppercase; color:var(--text-dim); font-weight:700;">Average Order Value</div>
          <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-top:4px;">
            ${state.tenant?.currency || '$'} ${sales.length > 0 ? (totalSalesVal / sales.length).toFixed(2) : '0.00'}
          </div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Per customer basket</div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="card" style="padding:14px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; gap:10px; align-items:center; flex:1; min-width:240px;">
          <div class="search-wrapper" style="flex:1;">
            <span class="search-icon">🔍</span>
            <input class="input search-input" placeholder="Search sale #, customer, receipt..." 
              value="${state.salesFilter?.search || ''}" 
              oninput="state.salesFilter.search = this.value; renderApp();">
          </div>
          <select class="select" style="max-width:160px;" 
            onchange="state.salesFilter.status = this.value; renderApp();">
            <option value="">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Sales Table -->
      <div class="card" style="padding:0; overflow:hidden;">
        ${sales.length === 0 ? `
          <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
            <div style="font-size:42px; margin-bottom:10px;">🧾</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-main);">No sales transactions recorded yet</div>
            <div style="font-size:13px; margin-top:4px; margin-bottom:16px;">Create your first checkout in the POS register to see transactions here.</div>
            <button class="btn btn-primary btn-sm" onclick="navigate('pos')">🛒 Go to POS Terminal</button>
          </div>
        ` : `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Sale #</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${sales
                  .filter((s) => {
                    const matchSearch = !state.salesFilter?.search || 
                      (s.saleNumber && s.saleNumber.toLowerCase().includes(state.salesFilter.search.toLowerCase())) ||
                      (s.customerName && s.customerName.toLowerCase().includes(state.salesFilter.search.toLowerCase()));
                    const matchStatus = !state.salesFilter?.status || s.status === state.salesFilter.status;
                    return matchSearch && matchStatus;
                  })
                  .map((s) => `
                    <tr>
                      <td style="font-family:var(--font-mono); font-weight:700; color:var(--primary);">${s.saleNumber || s._id?.slice(-6) || 'SALE'}</td>
                      <td style="font-size:12px; color:var(--text-muted);">${new Date(s.createdAt || Date.now()).toLocaleString()}</td>
                      <td style="font-weight:600;">${s.customerName || 'Walk-in Customer'}</td>
                      <td>${s.items?.length || 1} item(s)</td>
                      <td style="font-weight:800; color:var(--text-main);">${state.tenant?.currency || '$'} ${(s.grandTotal || s.totalAmount || 0).toFixed(2)}</td>
                      <td>
                        <span class="badge badge-neutral">${s.payments?.[0]?.paymentMethod || 'CASH'}</span>
                      </td>
                      <td>
                        <span class="badge ${s.status === 'PAID' ? 'badge-success' : s.status === 'REFUNDED' ? 'badge-danger' : 'badge-warning'}">
                          ${s.status || 'PAID'}
                        </span>
                      </td>
                      <td>
                        <div style="display:flex; gap:6px;">
                          <button class="btn btn-ghost btn-sm" onclick="viewSaleDocument('${s._id}', 'receipt')" title="View Receipt">🧾 Receipt</button>
                          <button class="btn btn-ghost btn-sm" onclick="viewSaleDocument('${s._id}', 'invoice')" title="View Invoice">📄 Invoice</button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

async function loadSales() {
  try {
    const res = await api('/api/v1/sales');
    if (res.success) {
      state.sales = res.data.sales || res.data || [];
      updateMainContent();
    }
  } catch (err) {
    console.error('Failed to load sales:', err);
  }
}

window.viewSaleDocument = async function (saleId, docType) {
  try {
    const res = await api(`/api/v1/documents/${docType}/${saleId}`);
    if (res.success) {
      const doc = res.data;
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop open';
      modal.innerHTML = `
        <div class="modal-content" style="max-width:540px; font-family:var(--font-mono); background:#ffffff; color:#0f172a; border-radius:8px; padding:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px dashed #cbd5e1; padding-bottom:12px; margin-bottom:16px;">
            <div>
              <div style="font-size:18px; font-weight:800;">${doc.header?.businessName || state.tenant?.name || 'STORE'}</div>
              <div style="font-size:12px; color:#64748b;">${doc.documentType?.toUpperCase()} • #${doc.documentNumber}</div>
            </div>
            <button class="btn btn-ghost btn-sm" style="color:#0f172a;" id="close-modal">✕</button>
          </div>

          <div style="font-size:12px; margin-bottom:16px; display:flex; justify-content:space-between;">
            <div>Customer: <strong>${doc.header?.customerName || 'Walk-in'}</strong></div>
            <div>Date: ${new Date(doc.header?.date || Date.now()).toLocaleDateString()}</div>
          </div>

          <table style="width:100%; font-size:12px; border-collapse:collapse; margin-bottom:16px;">
            <thead>
              <tr style="border-bottom:1px solid #e2e8f0; text-align:left;">
                <th style="padding:6px 0;">Item</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(doc.items || []).map((it) => `
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:6px 0;">${it.name}</td>
                  <td style="text-align:center;">${it.quantity}</td>
                  <td style="text-align:right;">${(it.unitPrice || 0).toFixed(2)}</td>
                  <td style="text-align:right; font-weight:700;">${(it.lineTotal || (it.quantity * it.unitPrice) || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="border-top:2px dashed #cbd5e1; padding-top:10px; font-size:13px; display:flex; flex-direction:column; gap:4px; text-align:right;">
            <div>Subtotal: <strong>${doc.totals?.currency || '$'} ${(doc.totals?.subtotal || 0).toFixed(2)}</strong></div>
            <div>Tax: <strong>${doc.totals?.currency || '$'} ${(doc.totals?.taxAmount || 0).toFixed(2)}</strong></div>
            <div style="font-size:16px; font-weight:800; color:#0f172a; margin-top:4px;">Grand Total: ${doc.totals?.currency || '$'} ${(doc.totals?.grandTotal || 0).toFixed(2)}</div>
          </div>

          <div style="margin-top:20px; text-align:center; font-size:11px; color:#64748b; border-top:1px solid #e2e8f0; padding-top:12px;">
            ${doc.footer?.message || 'Thank you for your business!'}
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
            <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ Print</button>
            <button class="btn btn-primary btn-sm" id="done-btn">Done</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      const close = () => modal.remove();
      modal.querySelector('#close-modal').onclick = close;
      modal.querySelector('#done-btn').onclick = close;
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
};

// ==========================================
// B. PRODUCT CATALOG VIEW
// ==========================================
function renderProductsView() {
  const prods = state.products || [];

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; display:flex; align-items:center; gap:8px;">
            🏷️ Product Catalog
          </h1>
          <p style="font-size:13px; color:var(--text-muted);">Manage your retail products, SKUs, barcode symbologies, cost margins, and pricing.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-secondary" onclick="loadProducts()">🔄 Refresh</button>
          <button class="btn btn-primary" onclick="openAddProductModal()">+ Add Product</button>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="card" style="padding:14px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; gap:10px; align-items:center; flex:1; min-width:240px;">
          <div class="search-wrapper" style="flex:1;">
            <span class="search-icon">🔍</span>
            <input class="input search-input" placeholder="Search by name, SKU, or barcode..." 
              value="${state.productFilter?.search || ''}" 
              oninput="state.productFilter.search = this.value; renderApp();">
          </div>
        </div>
        <div style="font-size:13px; font-weight:600; color:var(--text-muted);">
          Total: <strong style="color:var(--text-main);">${prods.length}</strong> items
        </div>
      </div>

      <!-- Products Grid / Table -->
      <div class="card" style="padding:0; overflow:hidden;">
        ${prods.length === 0 ? `
          <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
            <div style="font-size:42px; margin-bottom:10px;">📦</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-main);">No products in catalog yet</div>
            <div style="font-size:13px; margin-top:4px; margin-bottom:16px;">Add your inventory items to start selling and tracking stock.</div>
            <button class="btn btn-primary btn-sm" onclick="openAddProductModal()">+ Add First Product</button>
          </div>
        ` : `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Primary Barcode</th>
                  <th>Category</th>
                  <th>Selling Price</th>
                  <th>Cost Price</th>
                  <th>Margin</th>
                  <th>Tax</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${prods
                  .filter((p) => {
                    const q = (state.productFilter?.search || '').toLowerCase();
                    if (!q) return true;
                    return (
                      (p.name && p.name.toLowerCase().includes(q)) ||
                      (p.sku && p.sku.toLowerCase().includes(q)) ||
                      (p.barcodes && p.barcodes.some((b) => b.barcode.includes(q)))
                    );
                  })
                  .map((p) => {
                    const margin = p.sellingPrice > 0 ? (((p.sellingPrice - (p.costPrice || 0)) / p.sellingPrice) * 100).toFixed(0) : 0;
                    return `
                      <tr>
                        <td>
                          <div style="font-weight:700; color:var(--text-main);">${p.name}</div>
                          <div style="font-size:11px; color:var(--text-dim);">Unit: ${p.unit || 'UNIT'}</div>
                        </td>
                        <td style="font-family:var(--font-mono); font-size:12px;">${p.sku || '-'}</td>
                        <td style="font-family:var(--font-mono); font-size:12px;">
                          ${p.barcodes?.[0]?.barcode ? `🏷️ ${p.barcodes[0].barcode}` : '<span style="color:var(--text-dim);">-</span>'}
                        </td>
                        <td><span class="badge badge-neutral">${p.categoryName || 'General'}</span></td>
                        <td style="font-weight:700; color:var(--primary);">${state.tenant?.currency || '$'} ${Number(p.sellingPrice || 0).toFixed(2)}</td>
                        <td style="color:var(--text-muted);">${state.tenant?.currency || '$'} ${Number(p.costPrice || 0).toFixed(2)}</td>
                        <td><span class="badge badge-success">${margin}%</span></td>
                        <td>${p.taxRatePercent ? `${p.taxRatePercent}%` : '0%'}</td>
                        <td>
                          <div style="display:flex; gap:6px;">
                            <button class="btn btn-ghost btn-sm" onclick="openAddBarcodeModal('${p._id || p.id}')" title="Manage Barcodes">🏷️ Barcode</button>
                            <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="deleteProduct('${p._id || p.id}')" title="Delete">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

async function loadProducts() {
  try {
    const res = await api('/api/v1/products');
    if (res.success) {
      state.products = res.data.products || res.data || [];
      updateMainContent();
    }
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

window.openAddProductModal = function () {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 540px;">
      <div class="modal-header">
        <h3 class="card-title">+ Add Product to Catalog</h3>
        <button class="btn btn-ghost btn-sm" id="close-modal">✕</button>
      </div>
      <form onsubmit="handleAddProductSubmit(event, this.closest('.modal-backdrop'))">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <div class="form-group">
            <label class="form-label">Product Name <span class="required">*</span></label>
            <input class="input" name="name" required placeholder="e.g. Colombian Espresso Roast 500g">
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Selling Price (${state.tenant?.currency || '$'}) <span class="required">*</span></label>
              <input class="input" type="number" step="0.01" min="0" name="sellingPrice" required placeholder="18.50">
            </div>
            <div class="form-group">
              <label class="form-label">Cost Price (${state.tenant?.currency || '$'})</label>
              <input class="input" type="number" step="0.01" min="0" name="costPrice" placeholder="9.00">
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">SKU</label>
              <input class="input" name="sku" placeholder="SKU-COF-001">
            </div>
            <div class="form-group">
              <label class="form-label">Barcode (EAN13 / UPC)</label>
              <input class="input" name="barcode" placeholder="7501234567890">
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Category</label>
              <input class="input" name="categoryName" placeholder="Beverages">
            </div>
            <div class="form-group">
              <label class="form-label">Tax Rate (%)</label>
              <input class="input" type="number" step="0.1" min="0" name="taxRatePercent" value="8.0">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Product</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#close-modal').onclick = close;
  modal.querySelector('#cancel-modal').onclick = close;
};

window.handleAddProductSubmit = async function (e, modal) {
  e.preventDefault();
  const f = new FormData(e.target);
  const barcodeVal = f.get('barcode');
  const payload = {
    name: f.get('name'),
    sellingPrice: Number(f.get('sellingPrice')),
    costPrice: Number(f.get('costPrice') || 0),
    sku: f.get('sku') || undefined,
    categoryName: f.get('categoryName') || undefined,
    taxRatePercent: Number(f.get('taxRatePercent') || 0),
    isTaxable: Number(f.get('taxRatePercent') || 0) > 0,
    trackInventory: true,
    barcodes: barcodeVal ? [{ barcode: barcodeVal, symbology: 'EAN13', isPrimary: true }] : [],
  };

  try {
    const res = await api('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success) {
      UI.toast(`Added product "${res.data.name}"!`, 'success');
      modal.remove();
      loadProducts();
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
};

window.deleteProduct = function (prodId) {
  UI.confirm('Delete Product', 'Are you sure you want to delete this product from the catalog?', async () => {
    try {
      await api(`/api/v1/products/${prodId}`, { method: 'DELETE' });
      UI.toast('Product deleted', 'success');
      loadProducts();
    } catch (err) {
      UI.toast(err.message, 'danger');
    }
  });
};

window.openAddBarcodeModal = function (prodId) {
  const prod = state.products.find((p) => (p._id || p.id) === prodId);
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 440px;">
      <div class="modal-header">
        <h3 class="card-title">Add Barcode to "${prod?.name || 'Product'}"</h3>
        <button class="btn btn-ghost btn-sm" id="close-modal">✕</button>
      </div>
      <form onsubmit="handleAddBarcodeSubmit(event, '${prodId}', this.closest('.modal-backdrop'))">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <div class="form-group">
            <label class="form-label">Barcode Value <span class="required">*</span></label>
            <input class="input" name="barcode" required placeholder="e.g. 7501234567890">
          </div>
          <div class="form-group">
            <label class="form-label">Symbology</label>
            <select class="select" name="symbology">
              <option value="EAN13">EAN-13 (Standard Retail)</option>
              <option value="UPC">UPC-A</option>
              <option value="CODE128">Code 128</option>
              <option value="QR">QR Code</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Register Barcode</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#close-modal').onclick = close;
  modal.querySelector('#cancel-modal').onclick = close;
};

window.handleAddBarcodeSubmit = async function (e, prodId, modal) {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const res = await api(`/api/v1/products/${prodId}/barcodes`, {
      method: 'POST',
      body: JSON.stringify({
        barcode: f.get('barcode'),
        symbology: f.get('symbology'),
        isPrimary: true,
      }),
    });
    if (res.success) {
      UI.toast('Barcode attached to product!', 'success');
      modal.remove();
      loadProducts();
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
};

// ==========================================
// C. INVENTORY & STOCK LEDGER VIEW
// ==========================================
function renderInventoryView() {
  const items = state.inventoryItems || [];
  const totalStockQty = items.reduce((acc, it) => acc + (it.quantityOnHand || 0), 0);

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; display:flex; align-items:center; gap:8px;">
            🏢 Inventory & Stock Ledger
          </h1>
          <p style="font-size:13px; color:var(--text-muted);">Real-time stock on hand, physical counts, stock movements, and low stock warnings.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-secondary" onclick="loadInventory()">🔄 Refresh</button>
          <button class="btn btn-primary" onclick="openStockAdjustmentModal()">+ Record Stock Movement</button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
        <div class="card" style="padding:16px;">
          <div style="font-size:11px; text-transform:uppercase; color:var(--text-dim); font-weight:700;">Total Units in Stock</div>
          <div style="font-size:24px; font-weight:800; color:var(--primary); margin-top:4px;">
            ${totalStockQty} Units
          </div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Across all warehouse locations</div>
        </div>
        <div class="card" style="padding:16px;">
          <div style="font-size:11px; text-transform:uppercase; color:var(--text-dim); font-weight:700;">Tracked SKUs</div>
          <div style="font-size:24px; font-weight:800; color:var(--success); margin-top:4px;">
            ${items.length} Lines
          </div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Active inventory tracking</div>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="card" style="padding:0; overflow:hidden;">
        ${items.length === 0 ? `
          <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
            <div style="font-size:42px; margin-bottom:10px;">🏢</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-main);">No inventory tracked yet</div>
            <div style="font-size:13px; margin-top:4px; margin-bottom:16px;">Add opening stock or receive a shipment to populate shelf inventory.</div>
            <button class="btn btn-primary btn-sm" onclick="openStockAdjustmentModal()">+ Add Opening Stock</button>
          </div>
        ` : `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Location</th>
                  <th>Quantity on Hand</th>
                  <th>Available</th>
                  <th>Allocated</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((it) => `
                  <tr>
                    <td style="font-weight:700; color:var(--text-main);">${it.productId?.name || it.productName || 'Product'}</td>
                    <td><span class="badge badge-neutral">📍 ${it.locationId?.name || it.locationName || 'Store'}</span></td>
                    <td style="font-weight:800; font-size:15px; color:var(--primary);">${it.quantityOnHand}</td>
                    <td style="font-weight:600; color:var(--success);">${it.quantityAvailable ?? it.quantityOnHand}</td>
                    <td style="color:var(--text-muted);">${it.quantityAllocated || 0}</td>
                    <td>
                      <span class="badge ${it.quantityOnHand > 10 ? 'badge-success' : 'badge-warning'}">
                        ${it.quantityOnHand > 10 ? 'In Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

async function loadInventory() {
  try {
    const res = await api('/api/v1/inventory/items');
    if (res.success) {
      state.inventoryItems = res.data.items || res.data || [];
      updateMainContent();
    }
  } catch (err) {
    console.error('Failed to load inventory:', err);
  }
}

window.openStockAdjustmentModal = function () {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h3 class="card-title">Record Stock Movement</h3>
        <button class="btn btn-ghost btn-sm" id="close-modal">✕</button>
      </div>
      <form onsubmit="handleStockAdjustmentSubmit(event, this.closest('.modal-backdrop'))">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <div class="form-group">
            <label class="form-label">Product <span class="required">*</span></label>
            <select class="select" name="productId" required>
              ${state.products.map((p) => `<option value="${p._id || p.id}">${p.name} (${p.sku || 'No SKU'})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Location <span class="required">*</span></label>
            <select class="select" name="locationId" required>
              ${state.locations.map((l) => `<option value="${l._id}">${l.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Transaction Type</label>
              <select class="select" name="transactionType">
                <option value="OPENING_BALANCE">Opening Balance (+)</option>
                <option value="ADJUSTMENT">Manual Adjustment</option>
                <option value="PURCHASE_RECEIPT">Goods Receipt (+)</option>
                <option value="RETURN_IN">Customer Return (+)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Quantity (+/-) <span class="required">*</span></label>
              <input class="input" type="number" name="quantityDelta" required value="50">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Notes / Reason</label>
            <input class="input" name="notes" placeholder="Stock reconciliation / delivery">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Post Stock Movement</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#close-modal').onclick = close;
  modal.querySelector('#cancel-modal').onclick = close;
};

window.handleStockAdjustmentSubmit = async function (e, modal) {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const res = await api('/api/v1/inventory/movements', {
      method: 'POST',
      body: JSON.stringify({
        productId: f.get('productId'),
        locationId: f.get('locationId'),
        transactionType: f.get('transactionType'),
        quantityDelta: Number(f.get('quantityDelta')),
        notes: f.get('notes'),
      }),
    });
    if (res.success) {
      UI.toast('Stock movement recorded!', 'success');
      modal.remove();
      loadInventory();
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
};

// ==========================================
// D. MONEY & FINANCIALS VIEW
// ==========================================
function renderMoneyView() {
  const expenses = state.expenses || [];
  const totalExp = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; display:flex; align-items:center; gap:8px;">
            💰 Money & Financials
          </h1>
          <p style="font-size:13px; color:var(--text-muted);">Manage operating expenses, accounts receivable, vendor payables, and cash flow.</p>
        </div>
        <button class="btn btn-primary" onclick="openAddExpenseModal()">+ Record Expense</button>
      </div>

      <!-- Quick Metrics -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
        <div class="card" style="padding:16px;">
          <div style="font-size:11px; text-transform:uppercase; color:var(--text-dim); font-weight:700;">Total Operating Expenses</div>
          <div style="font-size:24px; font-weight:800; color:var(--danger); margin-top:4px;">
            ${state.tenant?.currency || '$'} ${totalExp.toFixed(2)}
          </div>
          <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${expenses.length} logged expense items</div>
        </div>
      </div>

      <!-- Expenses Table -->
      <div class="card" style="padding:0; overflow:hidden;">
        ${expenses.length === 0 ? `
          <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
            <div style="font-size:42px; margin-bottom:10px;">💸</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-main);">No operating expenses logged</div>
            <div style="font-size:13px; margin-top:4px; margin-bottom:16px;">Track rent, utilities, transport, and supplies here.</div>
            <button class="btn btn-primary btn-sm" onclick="openAddExpenseModal()">+ Record First Expense</button>
          </div>
        ` : `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${expenses.map((e) => `
                  <tr>
                    <td style="font-weight:700; color:var(--text-main);">${e.category}</td>
                    <td style="font-weight:800; color:var(--danger);">${state.tenant?.currency || '$'} ${(e.amount || 0).toFixed(2)}</td>
                    <td><span class="badge badge-neutral">${e.paymentMethod || 'CASH'}</span></td>
                    <td style="font-size:12px; color:var(--text-muted);">${new Date(e.date || e.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td style="font-size:13px; color:var(--text-muted);">${e.notes || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

async function loadMoney() {
  try {
    const res = await api('/api/v1/money/expenses');
    if (res.success) {
      state.expenses = res.data.expenses || res.data || [];
      updateMainContent();
    }
  } catch (err) {
    console.error('Failed to load expenses:', err);
  }
}

window.openAddExpenseModal = function () {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 460px;">
      <div class="modal-header">
        <h3 class="card-title">+ Record Store Expense</h3>
        <button class="btn btn-ghost btn-sm" id="close-modal">✕</button>
      </div>
      <form onsubmit="handleAddExpenseSubmit(event, this.closest('.modal-backdrop'))">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <div class="form-group">
            <label class="form-label">Expense Category <span class="required">*</span></label>
            <select class="select" name="category" required>
              <option value="Utilities">Utilities (Electricity, Water, Gas)</option>
              <option value="Rent">Rent & Lease</option>
              <option value="Salaries">Payroll & Wages</option>
              <option value="Supplies">Store & Packaging Supplies</option>
              <option value="Marketing">Marketing & Advertising</option>
              <option value="Maintenance">Repairs & Maintenance</option>
              <option value="Other">Other Expenses</option>
            </select>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Amount (${state.tenant?.currency || '$'}) <span class="required">*</span></label>
              <input class="input" type="number" step="0.01" min="0.01" name="amount" required placeholder="95.00">
            </div>
            <div class="form-group">
              <label class="form-label">Payment Method</label>
              <select class="select" name="paymentMethod">
                <option value="CASH">Cash</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description / Notes</label>
            <input class="input" name="notes" placeholder="e.g. Monthly store heating bill">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Expense</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#close-modal').onclick = close;
  modal.querySelector('#cancel-modal').onclick = close;
};

window.handleAddExpenseSubmit = async function (e, modal) {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const res = await api('/api/v1/money/expenses', {
      method: 'POST',
      body: JSON.stringify({
        category: f.get('category'),
        amount: Number(f.get('amount')),
        paymentMethod: f.get('paymentMethod'),
        notes: f.get('notes'),
      }),
    });
    if (res.success) {
      UI.toast('Expense recorded successfully!', 'success');
      modal.remove();
      loadMoney();
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
};

// ==========================================
// E. PURCHASING & POs VIEW
// ==========================================
function renderPurchasesView() {
  const bills = state.supplierBills || [];

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; display:flex; align-items:center; gap:8px;">
            📋 Purchasing & Supplier Bills
          </h1>
          <p style="font-size:13px; color:var(--text-muted);">Receive stock deliveries (GRN), create purchase orders, and manage vendor bills.</p>
        </div>
        <button class="btn btn-primary" onclick="openReceiveStockModal()">+ Receive Shipment (GRN)</button>
      </div>

      <div class="card" style="padding:0; overflow:hidden;">
        ${bills.length === 0 ? `
          <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
            <div style="font-size:42px; margin-bottom:10px;">🚚</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-main);">No vendor bills or shipments received yet</div>
            <div style="font-size:13px; margin-top:4px; margin-bottom:16px;">Receive an inbound purchase shipment to update inventory and vendor balances.</div>
            <button class="btn btn-primary btn-sm" onclick="openReceiveStockModal()">+ Receive Inbound Stock</button>
          </div>
        ` : `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Supplier</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${bills.map((b) => `
                  <tr>
                    <td style="font-family:var(--font-mono); font-weight:700; color:var(--primary);">${b.billNumber || b._id?.slice(-6)}</td>
                    <td style="font-weight:600;">${b.supplierId?.displayName || 'Supplier'}</td>
                    <td style="font-weight:800;">${state.tenant?.currency || '$'} ${(b.totalAmount || 0).toFixed(2)}</td>
                    <td style="color:var(--success); font-weight:700;">${state.tenant?.currency || '$'} ${(b.paidAmount || 0).toFixed(2)}</td>
                    <td><span class="badge ${b.status === 'PAID' ? 'badge-success' : 'badge-warning'}">${b.status || 'UNPAID'}</span></td>
                    <td style="font-size:12px; color:var(--text-muted);">${new Date(b.createdAt || Date.now()).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

async function loadPurchases() {
  try {
    const res = await api('/api/v1/purchases/bills');
    if (res.success) {
      state.supplierBills = res.data.bills || res.data || [];
      updateMainContent();
    }
  } catch (err) {
    console.error('Failed to load purchases:', err);
  }
}

window.openReceiveStockModal = function () {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h3 class="card-title">Receive Inbound Shipment (GRN)</h3>
        <button class="btn btn-ghost btn-sm" id="close-modal">✕</button>
      </div>
      <form onsubmit="handleReceiveStockSubmit(event, this.closest('.modal-backdrop'))">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <div class="form-group">
            <label class="form-label">Supplier <span class="required">*</span></label>
            <select class="select" name="supplierId" required>
              ${state.suppliers.map((s) => `<option value="${s._id}">${s.displayName}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Receiving Location <span class="required">*</span></label>
            <select class="select" name="locationId" required>
              ${state.locations.map((l) => `<option value="${l._id}">${l.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Product to Restock <span class="required">*</span></label>
            <select class="select" name="productId" required>
              ${state.products.map((p) => `<option value="${p._id || p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Quantity Received <span class="required">*</span></label>
              <input class="input" type="number" min="1" name="quantityReceived" required value="40">
            </div>
            <div class="form-group">
              <label class="form-label">Unit Cost (${state.tenant?.currency || '$'})</label>
              <input class="input" type="number" step="0.01" min="0" name="unitCost" value="9.00">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Process Goods Receipt</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#close-modal').onclick = close;
  modal.querySelector('#cancel-modal').onclick = close;
};

window.handleReceiveStockSubmit = async function (e, modal) {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const res = await api('/api/v1/purchases/receive', {
      method: 'POST',
      body: JSON.stringify({
        supplierId: f.get('supplierId'),
        locationId: f.get('locationId'),
        items: [
          {
            productId: f.get('productId'),
            quantityReceived: Number(f.get('quantityReceived')),
            unitCost: Number(f.get('unitCost')),
          },
        ],
        notes: 'Goods received from supplier',
      }),
    });
    if (res.success) {
      UI.toast('Shipment received and stock updated!', 'success');
      modal.remove();
      loadPurchases();
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
};

// ==========================================
// F. CUSTOMERS VIEW
// ==========================================
function renderCustomersView() {
  const custs = state.customers || [];

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; display:flex; align-items:center; gap:8px;">
            👥 Customer Directory
          </h1>
          <p style="font-size:13px; color:var(--text-muted);">Manage customer contacts, store credit balances, payment terms, and purchase histories.</p>
        </div>
        <button class="btn btn-primary" onclick="openAddCustomerModal()">+ Add Customer</button>
      </div>

      <div class="card" style="padding:0; overflow:hidden;">
        ${custs.length === 0 ? `
          <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
            <div style="font-size:42px; margin-bottom:10px;">👥</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-main);">No customer records yet</div>
            <div style="font-size:13px; margin-top:4px; margin-bottom:16px;">Add customer profiles for account balances and faster POS cashier lookup.</div>
            <button class="btn btn-primary btn-sm" onclick="openAddCustomerModal()">+ Add First Customer</button>
          </div>
        ` : `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Display Name</th>
                  <th>Contact Email</th>
                  <th>Phone</th>
                  <th>Credit Limit</th>
                  <th>Current Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${custs.map((c) => `
                  <tr>
                    <td style="font-weight:700; color:var(--text-main);">${c.displayName}</td>
                    <td>${c.email || '-'}</td>
                    <td>${c.phone || '-'}</td>
                    <td>${state.tenant?.currency || '$'} ${(c.customerDetails?.creditLimit || 0).toFixed(2)}</td>
                    <td style="font-weight:700; color:var(--primary);">${state.tenant?.currency || '$'} ${(c.currentBalance || 0).toFixed(2)}</td>
                    <td><span class="badge badge-success">Active</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

async function loadCustomers() {
  try {
    const res = await api('/api/v1/customers');
    if (res.success) {
      state.customers = res.data.customers || res.data || [];
      updateMainContent();
    }
  } catch (err) {
    console.error('Failed to load customers:', err);
  }
}

window.openAddCustomerModal = function () {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 480px;">
      <div class="modal-header">
        <h3 class="card-title">+ Add Customer Profile</h3>
        <button class="btn btn-ghost btn-sm" id="close-modal">✕</button>
      </div>
      <form onsubmit="handleAddCustomerSubmit(event, this.closest('.modal-backdrop'))">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <div class="form-group">
            <label class="form-label">Display Name / Company <span class="required">*</span></label>
            <input class="input" name="displayName" required placeholder="e.g. Starlight Bistro & Lounge">
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Contact Email</label>
              <input class="input" type="email" name="email" placeholder="contact@bistro.com">
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input class="input" name="phone" placeholder="+1-555-4422">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Credit Limit (${state.tenant?.currency || '$'})</label>
            <input class="input" type="number" step="0.01" name="creditLimit" value="1000.00">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Customer</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#close-modal').onclick = close;
  modal.querySelector('#cancel-modal').onclick = close;
};

window.handleAddCustomerSubmit = async function (e, modal) {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const res = await api('/api/v1/customers', {
      method: 'POST',
      body: JSON.stringify({
        displayName: f.get('displayName'),
        email: f.get('email') || undefined,
        phone: f.get('phone') || undefined,
        roles: ['CUSTOMER'],
        customerDetails: {
          creditLimit: Number(f.get('creditLimit') || 0),
          paymentTermsDays: 30,
        },
      }),
    });
    if (res.success) {
      UI.toast(`Customer "${res.data.displayName}" created!`, 'success');
      modal.remove();
      loadCustomers();
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
};

// ==========================================
// G. SUPPLIERS VIEW
// ==========================================
function renderSuppliersView() {
  const supps = state.suppliers || [];

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; display:flex; align-items:center; gap:8px;">
            🚚 Supplier Directory
          </h1>
          <p style="font-size:13px; color:var(--text-muted);">Manage product vendors, wholesale suppliers, orders, and payment terms.</p>
        </div>
        <button class="btn btn-primary" onclick="openAddSupplierModal()">+ Add Supplier</button>
      </div>

      <div class="card" style="padding:0; overflow:hidden;">
        ${supps.length === 0 ? `
          <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
            <div style="font-size:42px; margin-bottom:10px;">🚚</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-main);">No suppliers registered yet</div>
            <div style="font-size:13px; margin-top:4px; margin-bottom:16px;">Add suppliers to receive stock shipments and purchase orders.</div>
            <button class="btn btn-primary btn-sm" onclick="openAddSupplierModal()">+ Add Supplier</button>
          </div>
        ` : `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Supplier Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Roles</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${supps.map((s) => `
                  <tr>
                    <td style="font-weight:700; color:var(--text-main);">${s.displayName}</td>
                    <td>${s.email || '-'}</td>
                    <td>${s.phone || '-'}</td>
                    <td><span class="badge badge-neutral">${s.roles?.join(', ') || 'SUPPLIER'}</span></td>
                    <td><span class="badge badge-success">Active</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

async function loadSuppliers() {
  try {
    const res = await api('/api/v1/suppliers');
    if (res.success) {
      state.suppliers = res.data.suppliers || res.data || [];
      updateMainContent();
    }
  } catch (err) {
    console.error('Failed to load suppliers:', err);
  }
}

window.openAddSupplierModal = function () {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 480px;">
      <div class="modal-header">
        <h3 class="card-title">+ Add Supplier</h3>
        <button class="btn btn-ghost btn-sm" id="close-modal">✕</button>
      </div>
      <form onsubmit="handleAddSupplierSubmit(event, this.closest('.modal-backdrop'))">
        <div class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <div class="form-group">
            <label class="form-label">Supplier / Vendor Name <span class="required">*</span></label>
            <input class="input" name="displayName" required placeholder="e.g. Bean Import Co LLC">
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Contact Email</label>
              <input class="input" type="email" name="email" placeholder="orders@beanimport.com">
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input class="input" name="phone" placeholder="+1-555-8899">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Supplier</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#close-modal').onclick = close;
  modal.querySelector('#cancel-modal').onclick = close;
};

window.handleAddSupplierSubmit = async function (e, modal) {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const res = await api('/api/v1/suppliers', {
      method: 'POST',
      body: JSON.stringify({
        displayName: f.get('displayName'),
        email: f.get('email') || undefined,
        phone: f.get('phone') || undefined,
        roles: ['SUPPLIER'],
      }),
    });
    if (res.success) {
      UI.toast(`Supplier "${res.data.displayName}" created!`, 'success');
      modal.remove();
      loadSuppliers();
    }
  } catch (err) {
    UI.toast(err.message, 'danger');
  }
};

// ==========================================
// H. REPORTS & ANALYTICS VIEW
// ==========================================
function renderReportsView() {
  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; display:flex; align-items:center; gap:8px;">
            📈 Business Analytics & Reports
          </h1>
          <p style="font-size:13px; color:var(--text-muted);">Real-time financial summaries, inventory valuations, and CSV exports.</p>
        </div>
        <button class="btn btn-primary" onclick="exportInventoryCSV()">📥 Export Inventory CSV</button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        <div class="card" style="padding:20px;">
          <h3 style="font-size:16px; font-weight:700; margin-bottom:10px;">📊 Sales Performance</h3>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">View daily, weekly, and monthly revenue and average basket values.</p>
          <div style="font-size:24px; font-weight:800; color:var(--primary);">
            ${state.tenant?.currency || '$'} ${(state.sales?.reduce((a, s) => a + (s.grandTotal || 0), 0) || 0).toFixed(2)}
          </div>
          <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">Gross revenue to date</div>
        </div>

        <div class="card" style="padding:20px;">
          <h3 style="font-size:16px; font-weight:700; margin-bottom:10px;">🏢 Stock Valuation</h3>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">Track real-time capital tied up in active warehouse stock.</p>
          <div style="font-size:24px; font-weight:800; color:var(--success);">
            ${state.inventoryItems?.reduce((a, it) => a + (it.quantityOnHand || 0), 0) || 0} Units
          </div>
          <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">On shelf inventory</div>
        </div>

        <div class="card" style="padding:20px;">
          <h3 style="font-size:16px; font-weight:700; margin-bottom:10px;">💵 Net Profit & Loss</h3>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">Calculated revenue minus cost of goods sold and operating expenses.</p>
          <div style="font-size:24px; font-weight:800; color:var(--primary);">
            ${state.tenant?.currency || '$'} ${(
              (state.sales?.reduce((a, s) => a + (s.grandTotal || 0), 0) || 0) -
              (state.expenses?.reduce((a, e) => a + (e.amount || 0), 0) || 0)
            ).toFixed(2)}
          </div>
          <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">Operating net margin</div>
        </div>
      </div>
    </div>
  `;
}

async function loadReports() {
  try {
    await Promise.all([loadSales(), loadInventory(), loadMoney()]);
  } catch (err) {}
}

window.exportInventoryCSV = async function () {
  try {
    const res = await fetch('/api/v1/reports/inventory/current?format=csv', {
      headers: {
        ...(state.tenant?.id ? { 'X-Tenant-ID': state.tenant.id } : {}),
      },
      credentials: 'include',
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_valuation_${Date.now()}.csv`;
    a.click();
    UI.toast('Inventory CSV download started!', 'success');
  } catch (err) {
    UI.toast('Failed to download CSV', 'danger');
  }
};

// ==========================================
// I. TASKS & ALERTS VIEW
// ==========================================
function renderTasksView() {
  const tasks = state.tasks || [
    { id: '1', title: 'Complete Initial Physical Stock Count', category: 'INVENTORY', status: 'PENDING', priority: 'HIGH' },
    { id: '2', title: 'Verify Scanner Barcode Symbology Alignment', category: 'POS', status: 'COMPLETED', priority: 'MEDIUM' },
    { id: '3', title: 'Configure Receipt Header & Return Policy', category: 'SETTINGS', status: 'PENDING', priority: 'LOW' },
  ];

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; display:flex; align-items:center; gap:8px;">
            ✓ Operational Tasks
          </h1>
          <p style="font-size:13px; color:var(--text-muted);">Manage store operations, physical stock count audits, and daily checklist items.</p>
        </div>
      </div>

      <div class="card" style="padding:0; overflow:hidden;">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map((t) => `
                <tr>
                  <td style="font-weight:700; color:var(--text-main);">${t.title}</td>
                  <td><span class="badge badge-neutral">${t.category}</span></td>
                  <td><span class="badge ${t.priority === 'HIGH' ? 'badge-danger' : 'badge-warning'}">${t.priority}</span></td>
                  <td><span class="badge ${t.status === 'COMPLETED' ? 'badge-success' : 'badge-neutral'}">${t.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function loadTasks() {
  // Tasks loader
}

// ==========================================
// J. TEAM & RBAC VIEW
// ==========================================
function renderUsersView() {
  return renderActiveSettingsPanel('users', state.settingsData || {});
}

async function loadUsers() {
  await loadSettings();
}

// ==========================================
// K. AUDIT LOG VIEW
// ==========================================
function renderAuditLogView() {
  const logs = state.auditLogs || [];

  return `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:24px; font-weight:800; display:flex; align-items:center; gap:8px;">
            🛡️ Security & Operational Audit Log
          </h1>
          <p style="font-size:13px; color:var(--text-muted);">Immutable audit trail recording every checkout, stock adjustment, and configuration change.</p>
        </div>
        <button class="btn btn-secondary" onclick="loadAuditLogs()">🔄 Refresh</button>
      </div>

      <div class="card" style="padding:0; overflow:hidden;">
        ${logs.length === 0 ? `
          <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
            <div style="font-size:42px; margin-bottom:10px;">🛡️</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-main);">No audit logs recorded yet</div>
            <div style="font-size:13px; margin-top:4px;">System operations will appear here in real time.</div>
          </div>
        ` : `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map((l) => `
                  <tr>
                    <td style="font-size:12px; color:var(--text-muted);">${new Date(l.timestamp || l.createdAt || Date.now()).toLocaleString()}</td>
                    <td><span class="badge badge-primary">${l.action}</span></td>
                    <td style="font-weight:600;">${l.entityType || l.entity || 'SYSTEM'}</td>
                    <td style="font-family:var(--font-mono); font-size:12px;">${l.ipAddress || '127.0.0.1'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

async function loadAuditLogs() {
  try {
    const res = await api('/api/v1/audit');
    if (res.success) {
      state.auditLogs = res.data.logs || res.data || [];
      updateMainContent();
    }
  } catch (err) {
    console.error('Failed to load audit logs:', err);
  }
}

// ==========================================
// L. INTEGRATIONS VIEW
// ==========================================
function renderIntegrationsView() {
  return renderActiveSettingsPanel('integrations', state.settingsData || {});
}

async function loadIntegrations() {
  await loadSettings();
}

// ==========================================
// 8. MARKETING & AUTH GLOBAL HANDLERS
// ==========================================

window.navigateMarketing = function (view) {
  let normalizedRoute = view;
  if (view === 'login' || view === '/auth/login' || view === '/login') {
    normalizedRoute = '/auth/login';
    state.authMode = 'login';
  } else if (
    view === 'register' ||
    view === '/auth/register' ||
    view === '/register' ||
    view === '/auth/onboarding' ||
    view === '/onboarding' ||
    view === 'onboarding'
  ) {
    normalizedRoute = '/auth/register';
    state.authMode = 'register';
    state.onboardingStep = 1;
  } else if (view === 'home' || view === 'marketing' || view === '/' || view === '') {
    normalizedRoute = '/';
  } else if (!view.startsWith('/')) {
    normalizedRoute = '/' + view;
  }

  state.currentRoute = normalizedRoute;

  try {
    if (window.history && window.history.pushState) {
      window.history.pushState({ route: normalizedRoute }, '', normalizedRoute === '/' ? '/' : normalizedRoute);
    }
  } catch (e) {
    // Ignore restricted environment origin errors
  }

  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Handle Browser Back / Forward buttons for public and marketing pages
window.addEventListener('popstate', (event) => {
  if (!state.user) {
    const popPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const popHash = window.location.hash.toLowerCase().replace(/^#\/?/, '/');
    const targetRoute = popHash || (popPath !== '' ? popPath : '/');

    if (targetRoute === '/auth/login' || targetRoute === '/login' || targetRoute === 'login') {
      state.currentRoute = '/auth/login';
      state.authMode = 'login';
    } else if (
      targetRoute === '/auth/register' ||
      targetRoute === '/register' ||
      targetRoute === '/auth/onboarding' ||
      targetRoute === '/onboarding'
    ) {
      state.currentRoute = '/auth/register';
      state.authMode = 'register';
    } else if (PUBLIC_ROUTES_REGISTRY[targetRoute]) {
      state.currentRoute = targetRoute;
    } else {
      state.currentRoute = targetRoute;
    }
    renderApp();
  }
});

window.switchTourTab = function (tab) {
  MarketingWebsite.currentTourTab = tab;
  const container = document.getElementById('tour-showcase-content');
  const urlEl = document.getElementById('tour-browser-url');
  if (container) {
    container.innerHTML = MarketingWebsite.renderTourContent(tab);
  }
  if (urlEl) {
    urlEl.textContent = `app.universalerp.com/${tab}`;
  }
  document.querySelectorAll('.mkt-tab-btn').forEach((btn) => {
    const isActive = btn.textContent.toLowerCase().includes(tab);
    btn.classList.toggle('active', isActive);
  });
};

window.toggleMarketingMenu = function () {
  const menu = document.getElementById('mkt-mobile-menu');
  if (menu) {
    const isVisible = window.getComputedStyle(menu).display !== 'none';
    menu.style.display = isVisible ? 'none' : 'flex';
  }
};

window.simulateOfflineCycle = function () {
  const el = document.getElementById('offline-status-indicator');
  if (!el) return;
  
  el.className = 'mkt-dash-status-pill';
  el.style.background = 'rgba(239, 68, 68, 0.15)';
  el.style.color = '#f87171';
  el.style.borderColor = 'rgba(239, 68, 68, 0.3)';
  el.innerHTML = '● CONNECTION LOST (Local Queue Active)';
  UI.toast('Simulated: Internet dropped! POS working in offline mode.', 'warning');

  setTimeout(() => {
    el.style.background = 'rgba(245, 158, 11, 0.15)';
    el.style.color = '#fbbf24';
    el.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    el.innerHTML = '● RECONNECTING... (Auto-Syncing 3 Sales)';
    UI.toast('Simulated: Internet restored! Syncing queued records...', 'info');

    setTimeout(() => {
      el.style.background = 'rgba(16, 185, 129, 0.12)';
      el.style.color = '#34d399';
      el.style.borderColor = 'rgba(16, 185, 129, 0.25)';
      el.innerHTML = '● ONLINE (All Sales Synced ✓)';
      UI.toast('All local sales synchronized successfully with central cloud database!', 'success');
    }, 1600);
  }, 2000);
};

window.onboardingPrevStep = function (step) {
  state.onboardingStep = Math.max(1, step);
  renderApp();
};

window.selectOnboardingIndustry = function (industry) {
  state.onboardingData.industry = industry;
};

window.handleOnboardingStep = async function (e, step) {
  e.preventDefault();
  const formData = new FormData(e.target);
  for (const [key, value] of formData.entries()) {
    state.onboardingData[key] = value;
  }

  if (step < 5) {
    state.onboardingStep = step + 1;
    renderApp();
    return;
  }

  // Step 5: Final Submission to /api/v1/auth/register
  try {
    LoadingScreenService.show();
    const payload = {
      firstName: state.onboardingData.firstName || 'Alex',
      lastName: state.onboardingData.lastName || 'Smith',
      businessName: state.onboardingData.businessName || 'My Business',
      currency: state.onboardingData.currency || 'PKR',
      email: state.onboardingData.email,
      password: state.onboardingData.password,
    };

    const res = await api('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success) {
      UI.toast('Workspace created successfully! Welcome to Universal ERP.', 'success');
      state.onboardingStep = 1;
      state.onboardingData = { business: {}, location: {}, products: [] };
      await initApp();
    }
  } catch (err) {
    LoadingScreenService.hide();
    UI.toast(err.message || 'Registration failed', 'danger');
  }
};

window.showForgotPasswordModal = function (e) {
  if (e) e.preventDefault();
  UI.confirm('Reset Password', 'Enter your account email to receive a password reset link. In dev mode, a reset token will be logged.', async () => {
    const email = document.getElementById('auth-email-input')?.value || 'admin@apex.com';
    try {
      const res = await api('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      UI.toast(res.data?.message || 'Password reset requested', 'info');
    } catch (err) {
      UI.toast(err.message, 'danger');
    }
  });
};

window.fillDemoCredentials = function () {
  const emailInput = document.getElementById('auth-email-input');
  const passInput = document.getElementById('auth-password-input');
  if (emailInput) emailInput.value = 'admin@apex.com';
  if (passInput) passInput.value = 'Password123!';
  UI.toast('Demo credentials auto-filled!', 'info');
};

window.handleAuthSubmit = async function (e, mode) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());
  try {
    LoadingScreenService.show();
    const endpoint = mode === 'register' ? '/api/v1/auth/register' : '/api/v1/auth/login';
    const res = await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
    if (res.success) {
      UI.toast(`Successfully authenticated!`, 'success');
      await initApp();
    }
  } catch (error) {
    LoadingScreenService.hide();
    UI.toast(error.message, 'danger');
  }
};

initApp();
