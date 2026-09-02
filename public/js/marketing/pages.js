/**
 * Universal ERP — Public Multi-Page Website Shell Registry & Router
 * Phase 23 — Step 1: Multi-Page Route Structure
 */

export const PUBLIC_ROUTES_REGISTRY = {
  // -------------------------------------------------------------
  // PRODUCT DEEP DIVES
  // -------------------------------------------------------------
  '/product': {
    path: '/product',
    title: 'Universal Business OS Platform',
    category: 'Product Core',
    icon: '🌐',
    description: 'A unified operating system replacing disconnected spreadsheets, standalone point-of-sale systems, and clunky accounting software.',
    badge: 'Platform Overview',
    highlights: [
      { title: 'Unified Data Model', desc: 'Single source of truth for stock, sales, cash, and customer accounts.', icon: '⚡' },
      { title: 'Multi-Location Ready', desc: 'Seamlessly connects retail storefronts with central warehouses.', icon: '🏢' },
      { title: '100% Offline Resilient', desc: 'Keep transacting without internet; auto-sync when reconnected.', icon: '📡' },
    ],
  },
  '/product/pos': {
    path: '/product/pos',
    title: 'High-Speed Touch POS & Retail Checkout',
    category: 'Product Module',
    icon: '⚡',
    description: 'Blazing-fast point of sale with instant barcode search, multi-payment tenders, receipt printing, and live inventory sync.',
    badge: 'Available Now',
    highlights: [
      { title: '3-Tap Checkout', desc: 'Scan item, choose payment, print receipt in under 5 seconds.', icon: '💳' },
      { title: 'Split & Credit Payments', desc: 'Support cash, card, bank transfer, and ledger credit in one bill.', icon: '📑' },
      { title: 'Hardware Agnostic', desc: 'Runs on standard tablets, touchscreen laptops, and mobile phones.', icon: '📱' },
    ],
  },
  '/product/inventory': {
    path: '/product/inventory',
    title: 'Real-Time Multi-Location Inventory',
    category: 'Product Module',
    icon: '📦',
    description: 'Track stock across stores and warehouses with automated valuation, transfer manifests, and physical stock count audits.',
    badge: 'Available Now',
    highlights: [
      { title: 'Real-Time Balances', desc: 'Stock deducted automatically upon POS checkout and incremented on GRN.', icon: '🔄' },
      { title: 'Inter-Branch Transfers', desc: '2-step dispatch and receipt workflow ensuring full transit visibility.', icon: '🚚' },
      { title: 'Damage & Loss Audits', desc: 'Categorized loss adjustments with permanent ledger entries.', icon: '📋' },
    ],
  },
  '/product/sales': {
    path: '/product/sales',
    title: 'Sales Management, Invoicing & Receivables',
    category: 'Product Module',
    icon: '📈',
    description: 'End-to-end sales lifecycle from quotations and wholesale orders to tax-compliant invoices and partial credit collections.',
    badge: 'Available Now',
    highlights: [
      { title: 'Quotes to Invoices', desc: '1-click conversion from price estimate to finalized tax invoice.', icon: '🧾' },
      { title: 'Aging & Collections', desc: 'Real-time receivable tracking and customer payment receipts.', icon: '💰' },
      { title: 'Sales Returns', desc: 'Validated receipt returns with automatic inventory restocking.', icon: '↩️' },
    ],
  },
  '/product/purchasing': {
    path: '/product/purchasing',
    title: 'Supplier Purchasing, POs & Payables',
    category: 'Product Module',
    icon: '🛍️',
    description: 'Streamline procurement with supplier purchase orders, goods receipt verification (GRN), and automated accounts payable.',
    badge: 'Available Now',
    highlights: [
      { title: 'Purchase Orders', desc: 'Draft, approve, and send supplier orders with custom unit costs.', icon: '📝' },
      { title: 'Goods Receipt (GRN)', desc: 'Verify incoming batches and automatically adjust inventory levels.', icon: '📥' },
      { title: 'Supplier Bills', desc: 'Manage payment terms, partial bank deposits, and credit balance.', icon: '💵' },
    ],
  },
  '/product/customers': {
    path: '/product/customers',
    title: 'Customer CRM & Credit Ledger Management',
    category: 'Product Module',
    icon: '👥',
    description: 'Build long-term customer relationships with detailed purchase history, credit limits, account statements, and VIP pricing.',
    badge: 'Available Now',
    highlights: [
      { title: 'Credit Limit Safeguards', desc: 'Warns and blocks sales exceeding configured credit allowances.', icon: '🛡️' },
      { title: 'Account Statements', desc: 'Complete double-entry statement history with exportable PDFs.', icon: '📊' },
      { title: 'Contact Directory', desc: 'Instant search across phones, addresses, and transaction history.', icon: '🔍' },
    ],
  },
  '/product/suppliers': {
    path: '/product/suppliers',
    title: 'Supplier Directory & Procurement Records',
    category: 'Product Module',
    icon: '🏭',
    description: 'Centralized directory of vendors, distributors, and manufacturers with historical purchase orders and payment tracking.',
    badge: 'Available Now',
    highlights: [
      { title: 'Vendor Directory', desc: 'Maintain contact persons, tax numbers, and payment terms.', icon: '📇' },
      { title: 'Payables Ledger', desc: 'Real-time overview of total outstanding debts across all suppliers.', icon: '💼' },
      { title: 'Purchase History', desc: 'Track past unit prices and lead times to negotiate better rates.', icon: '⏱️' },
    ],
  },
  '/product/payments': {
    path: '/product/payments',
    title: 'Payment Processing & Cash Drawer Ledgers',
    category: 'Product Module',
    icon: '💳',
    description: 'Accept payments across multiple methods with automated ledger reconciliations, expense tracking, and cash registers.',
    badge: 'Available Now',
    highlights: [
      { title: 'Multi-Tender Support', desc: 'Accept Cash, Card, Bank Transfer, and Credit in any combination.', icon: '🏷️' },
      { title: 'Expense Recording', desc: 'Track daily store overheads (Rent, Utilities, Supplies) instantly.', icon: '📉' },
      { title: 'Float Reconciliation', desc: 'End-of-day cash drawer balancing and discrepancy audits.', icon: '🏦' },
    ],
  },
  '/product/reports': {
    path: '/product/reports',
    title: 'Financial Reports, P&L & Analytics',
    category: 'Product Module',
    icon: '📊',
    description: 'Real-time business intelligence with executive sales summaries, gross profit margins, inventory valuation, and tax reports.',
    badge: 'Available Now',
    highlights: [
      { title: 'Executive Summary', desc: 'Real-time gross revenue, order volume, margins, and profit trends.', icon: '🎯' },
      { title: 'Inventory Valuation', desc: 'FIFO/average cost stock valuations across all retail locations.', icon: '📦' },
      { title: 'CSV & PDF Exports', desc: '1-click export of data for accountants and tax auditors.', icon: '📄' },
    ],
  },
  '/product/barcode-scanner': {
    path: '/product/barcode-scanner',
    title: 'Camera & Hardware Barcode Scanning',
    category: 'Product Module',
    icon: '📷',
    description: 'Scan barcodes instantly using your smartphone or laptop camera without requiring expensive external hardware.',
    badge: 'Available Now',
    highlights: [
      { title: 'Built-in Mobile Camera', desc: 'High-speed camera scanning powered by BarcodeDetector API.', icon: '📸' },
      { title: 'EAN / UPC / QR / Code128', desc: 'Comprehensive symbology support with multi-barcode product mapping.', icon: '🏷️' },
      { title: 'Continuous Batch Scan', desc: 'Rapid shelf inventory counting with audio/haptic feedback.', icon: '🔊' },
    ],
  },
  '/product/offline-pos': {
    path: '/product/offline-pos',
    title: 'Offline Resilience & Local-First POS',
    category: 'Product Module',
    icon: '📡',
    description: 'Keep transacting through internet blackouts and power outages with automated local caching and conflict-free cloud sync.',
    badge: 'Available Now',
    highlights: [
      { title: 'Zero Downtime', desc: 'POS checkout runs 100% locally when connectivity drops.', icon: '⚡' },
      { title: 'Idempotent Sync', desc: 'Guaranteed 0 duplicate sales upon network reconnection.', icon: '🔒' },
      { title: 'Pre-Cached Catalog', desc: 'Offline manifest seeds full catalog and pricing into client storage.', icon: '💾' },
    ],
  },
  '/product/documents': {
    path: '/product/documents',
    title: 'Document Generator, Thermal Receipts & PDFs',
    category: 'Product Module',
    icon: '📑',
    description: 'Generate clean thermal POS receipts, wholesale PDF invoices, purchase orders, and packing slips with customizable store branding.',
    badge: 'Available Now',
    highlights: [
      { title: '58mm & 80mm Thermal', desc: 'Direct printing support for standard retail thermal slip printers.', icon: '🖨️' },
      { title: 'A4 & Letter Invoices', desc: 'Clean, printable tax invoices with company headers and terms.', icon: '📋' },
      { title: 'Custom Branding', desc: 'Add store logo, tax registration number, and custom footer notes.', icon: '🎨' },
    ],
  },
  '/product/integrations': {
    path: '/product/integrations',
    title: 'Integrations, E-Commerce Sync & API',
    category: 'Product Module',
    icon: '🔌',
    description: 'Connect your physical stores with online e-commerce channels, accounting tools, payment gateways, and custom webhooks.',
    badge: 'Available Now',
    highlights: [
      { title: 'Shopify & WooCommerce', desc: 'Sync inventory counts and orders between storefronts and web stores.', icon: '🛍️' },
      { title: 'Webhook Dispatcher', desc: 'Send real-time alerts to external systems on sale or stock events.', icon: '🌐' },
      { title: 'RESTful API', desc: 'Secure developer API for custom ERP integrations.', icon: '💻' },
    ],
  },

  // -------------------------------------------------------------
  // INDUSTRIES
  // -------------------------------------------------------------
  '/industries/retail-ecommerce': {
    path: '/industries/retail-ecommerce',
    title: 'Universal ERP for Retail & E-Commerce',
    category: 'Industry Solution',
    icon: '🛒',
    description: 'Tailored for apparel stores, electronics shops, supermarkets, and hybrid retail businesses managing both in-store and online sales.',
    badge: 'Available Now',
    highlights: [
      { title: 'Fast Counter Checkout', desc: 'Optimized for high-volume customer lines and quick transactions.', icon: '⚡' },
      { title: 'Unified Multi-Channel Stock', desc: 'Prevent overselling between physical shelves and online web shops.', icon: '🔄' },
      { title: 'Flexible Returns & Exchanges', desc: 'Seamlessly process returns with or without receipt lookup.', icon: '↩️' },
    ],
  },
  '/industries/healthcare': {
    path: '/industries/healthcare',
    title: 'Universal ERP for Healthcare & Clinics',
    category: 'Industry Solution',
    icon: '🏥',
    description: 'Specialized workflow extensions for medical centers, pharmacies, dental clinics, and health equipment suppliers.',
    badge: 'Coming Soon',
    highlights: [
      { title: 'Pharmacy Batch Tracking', desc: 'Track medicine batch numbers and expiration dates automatically.', icon: '💊' },
      { title: 'Patient Invoicing', desc: 'Itemized consultation fees, diagnostics, and prescription billing.', icon: '📋' },
      { title: 'Secure Health Records', desc: 'Strict HIPAA-aligned data segregation per medical practice.', icon: '🔒' },
    ],
  },
  '/industries/construction': {
    path: '/industries/construction',
    title: 'Universal ERP for Construction & Contracting',
    category: 'Industry Solution',
    icon: '🏗️',
    description: 'Job-costing, equipment tracking, and raw materials procurement built for general contractors and building suppliers.',
    badge: 'Coming Soon',
    highlights: [
      { title: 'Job Costing & Projects', desc: 'Track labor, materials, and subcontractor expenses per project site.', icon: '📐' },
      { title: 'Site Inventory Dispatch', desc: 'Log materials transferred from warehouse directly to job sites.', icon: '🚛' },
      { title: 'Progress Invoicing', desc: 'Milestone-based billing and retention tracking.', icon: '📑' },
    ],
  },
  '/industries/wholesale': {
    path: '/industries/wholesale',
    title: 'Universal ERP for Wholesale & Distribution',
    category: 'Industry Solution',
    icon: '🚚',
    description: 'High-volume order management, tiered customer pricing, bulk shipping manifests, and distributor credit controls.',
    badge: 'Coming Soon',
    highlights: [
      { title: 'Tiered Pricing Schedules', desc: 'Custom volume pricing for distributors, dealers, and retail partners.', icon: '🏷️' },
      { title: 'Bulk Order Entry', desc: 'Fast spreadsheet-like order lines for 100+ SKU wholesale shipments.', icon: '📦' },
      { title: 'Credit Risk Controls', desc: 'Strict credit terms and outstanding receivable limits.', icon: '🛡️' },
    ],
  },
  '/industries/services': {
    path: '/industries/services',
    title: 'Universal ERP for Professional & Field Services',
    category: 'Industry Solution',
    icon: '💼',
    description: 'Time billing, project expense tracking, service quotes, and client management for consultancies and service agencies.',
    badge: 'Coming Soon',
    highlights: [
      { title: 'Time & Milestone Billing', desc: 'Bill clients by hourly retainer or fixed project milestone.', icon: '⏱️' },
      { title: 'Client Portal Statements', desc: 'Share live balance statements and invoice links with clients.', icon: '🌐' },
      { title: 'Expense Pass-Through', desc: 'Recharge reimbursable project expenses directly on client invoices.', icon: '💰' },
    ],
  },

  // -------------------------------------------------------------
  // SOLUTIONS
  // -------------------------------------------------------------
  '/solutions/small-business': {
    path: '/solutions/small-business',
    title: 'All-in-One OS for Small Businesses',
    category: 'Business Solution',
    icon: '🏪',
    description: 'Replace messy spreadsheets and fragmented apps with a single, intuitive system that handles sales, stock, and money effortlessly.',
    badge: 'Popular',
    highlights: [
      { title: '5-Minute Setup', desc: 'Get your store configured and ready to sell without technical consulting.', icon: '🚀' },
      { title: 'Zero Expensive Hardware', desc: 'Works with your existing laptops, tablets, and smartphones.', icon: '💻' },
      { title: 'Affordable & Predictable', desc: 'Simple pricing with unlimited products and zero hidden transaction fees.', icon: '💎' },
    ],
  },
  '/solutions/multi-location': {
    path: '/solutions/multi-location',
    title: 'Multi-Location Store & Warehouse OS',
    category: 'Business Solution',
    icon: '🏢',
    description: 'Centralize multi-branch operations with unified catalog management, real-time stock transfers, and branch-level performance.',
    badge: 'Enterprise Ready',
    highlights: [
      { title: 'Central Catalog Control', desc: 'Update prices and products centrally for all retail branches.', icon: '🎯' },
      { title: 'Inter-Branch Transfers', desc: 'Track shipments between warehouse depots and retail storefronts.', icon: '🚚' },
      { title: 'Consolidated Reporting', desc: 'Compare revenue, margins, and stock turnover across all locations.', icon: '📊' },
    ],
  },
  '/solutions/online-offline-retail': {
    path: '/solutions/online-offline-retail',
    title: 'Unified Online & Offline Commerce',
    category: 'Business Solution',
    icon: '🔄',
    description: 'Bridge the gap between physical retail counters and online storefronts with instant inventory sync and centralized order fulfillment.',
    badge: 'Omnichannel',
    highlights: [
      { title: 'Single Stock Ledger', desc: 'Sales in-store immediately decrement online available quantity.', icon: '📦' },
      { title: 'In-Store Pickup (BOPIS)', desc: 'Fulfill online orders at retail branches with barcode verification.', icon: '🛍️' },
      { title: 'Unified Customer History', desc: 'View customer purchase history whether they bought online or in-store.', icon: '👥' },
    ],
  },

  // -------------------------------------------------------------
  // PRICING
  // -------------------------------------------------------------
  '/pricing': {
    path: '/pricing',
    title: 'Simple, Transparent & Fair Pricing',
    category: 'Plans & Pricing',
    icon: '💎',
    description: 'Everything you need to run your business with zero hidden fees. Start with a 14-day free trial; no credit card required.',
    badge: '14-Day Free Trial',
    highlights: [
      { title: 'Starter Plan', desc: 'Perfect for single stores starting out. Full POS, stock & sales.', icon: '🌱' },
      { title: 'Growth Plan', desc: 'Multi-location inventory, advanced reports, and unlimited team users.', icon: '🚀' },
      { title: 'Enterprise Plan', desc: 'Dedicated cloud isolation, custom SLA, and priority 24/7 support.', icon: '👑' },
    ],
  },

  // -------------------------------------------------------------
  // RESOURCES
  // -------------------------------------------------------------
  '/resources': {
    path: '/resources',
    title: 'Resources & Knowledge Center',
    category: 'Learning & Help',
    icon: '📚',
    description: 'Guides, operational best practices, video tutorials, and technical documentation to help your business scale efficiently.',
    badge: 'Documentation',
    highlights: [
      { title: 'Quick Start Guides', desc: 'Step-by-step onboarding walkthroughs for store owners and cashiers.', icon: '📖' },
      { title: 'API Documentation', desc: 'Complete REST API reference for developers and technical partners.', icon: '💻' },
      { title: 'Best Practices', desc: 'Proven retail management tips on stock auditing and cash flow.', icon: '💡' },
    ],
  },
  '/resources/getting-started': {
    path: '/resources/getting-started',
    title: 'Getting Started with Universal ERP',
    category: 'Documentation',
    icon: '🚀',
    description: 'A 5-minute practical setup guide: configuring your workspace, adding your first products, and making your first sale.',
    badge: 'Quick Start',
    highlights: [
      { title: 'Step 1: Workspace Setup', desc: 'Set store currency, tax numbers, and primary location.', icon: '1️⃣' },
      { title: 'Step 2: Add Products', desc: 'Import or create catalog items with barcodes and costs.', icon: '2️⃣' },
      { title: 'Step 3: Launch POS', desc: 'Open cashier terminal and complete your first customer checkout.', icon: '3️⃣' },
    ],
  },
  '/resources/user-guide': {
    path: '/resources/user-guide',
    title: 'Complete Universal ERP User Guide',
    category: 'Documentation',
    icon: '📖',
    description: 'In-depth documentation covering all 14 core modules, role permissions, inventory transfers, and financial reconciliations.',
    badge: 'Handbook',
    highlights: [
      { title: 'POS Operations', desc: 'Shortcuts, barcode camera scanner, and receipt printer setup.', icon: '⚡' },
      { title: 'Inventory Auditing', desc: 'Cycle counting, stock adjustments, and negative stock controls.', icon: '📦' },
      { title: 'Purchasing & Bills', desc: 'Managing purchase orders, supplier payments, and goods receipts.', icon: '📝' },
    ],
  },
  '/resources/faq': {
    path: '/resources/faq',
    title: 'Frequently Asked Questions (FAQ)',
    category: 'Help & FAQ',
    icon: '❓',
    description: 'Answers to common questions regarding offline synchronization, hardware compatibility, data security, and multi-currency support.',
    badge: 'FAQ',
    highlights: [
      { title: 'Does POS work offline?', desc: 'Yes. All sales queue locally and synchronize automatically on reconnect.', icon: '📡' },
      { title: 'Which printers work?', desc: 'Any standard 58mm or 80mm ESC/POS USB or network thermal printer.', icon: '🖨️' },
      { title: 'Is my data secure?', desc: 'Strict multi-tenant cryptographic isolation with zero data leakage.', icon: '🔒' },
    ],
  },

  // -------------------------------------------------------------
  // COMPANY
  // -------------------------------------------------------------
  '/company/about': {
    path: '/company/about',
    title: 'About Universal ERP',
    category: 'Company',
    icon: '🏢',
    description: 'Our mission is to build the world’s most accessible, resilient, and beautiful business operating system for modern commerce.',
    badge: 'Our Mission',
    highlights: [
      { title: 'Mission-Driven', desc: 'Empowering small and growing merchants with enterprise-grade tools.', icon: '🎯' },
      { title: 'Local-First Philosophy', desc: 'Software built for real-world conditions with unreliable connectivity.', icon: '🌍' },
      { title: 'Zero Bloat', desc: 'Fast, lightweight, and engineered for speed and simplicity.', icon: '⚡' },
    ],
  },
  '/company/contact': {
    path: '/company/contact',
    title: 'Contact Us & Schedule a Demo',
    category: 'Company',
    icon: '📬',
    description: 'Get in touch with our product specialists for personalized product demonstrations, onboarding assistance, or enterprise inquiries.',
    badge: 'Get in Touch',
    highlights: [
      { title: 'Product Demonstration', desc: 'Schedule a 1-on-1 walkthrough tailored to your store setup.', icon: '📅' },
      { title: 'Support & Inquiries', desc: 'Fast email and live chat support for all registered workspaces.', icon: '💬' },
      { title: 'Partner Program', desc: 'Join our certified implementation partner network for consultants.', icon: '🤝' },
    ],
  },
};

/**
 * Render a high-fidelity, responsive Page Shell for public multi-page routes
 */
export function renderPublicPageShell(routePath) {
  const meta = PUBLIC_ROUTES_REGISTRY[routePath] || {
    path: routePath,
    title: 'Universal ERP',
    category: 'Page Overview',
    icon: '🌐',
    description: 'Modern Business Operating System.',
    highlights: [
      { title: 'Fast & Reliable', desc: 'Engineered for seamless retail execution.', icon: '⚡' },
      { title: 'Offline Capable', desc: 'Keeps running during network drops.', icon: '📡' },
      { title: 'Real-Time Insights', desc: 'Instant financial and inventory updates.', icon: '📊' },
    ],
  };

  // Generate breadcrumb path
  const pathParts = routePath.split('/').filter(Boolean);
  const breadcrumbItems = [
    `<a href="javascript:void(0)" onclick="window.navigateMarketing('/')" style="color:var(--mkt-text-muted); text-decoration:none;">Home</a>`,
  ];
  let currentAccum = '';
  pathParts.forEach((part, idx) => {
    currentAccum += '/' + part;
    const isLast = idx === pathParts.length - 1;
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    if (isLast) {
      breadcrumbItems.push(`<span style="color:var(--mkt-text-main); font-weight:600;">${label}</span>`);
    } else {
      breadcrumbItems.push(`<a href="javascript:void(0)" onclick="window.navigateMarketing('${currentAccum}')" style="color:var(--mkt-text-muted); text-decoration:none;">${label}</a>`);
    }
  });

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
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/product')">Product</a></li>
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/industries/retail-ecommerce')">Industries</a></li>
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/solutions/small-business')">Solutions</a></li>
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/pricing')">Pricing</a></li>
                <li><a class="mkt-nav-link" href="javascript:void(0)" onclick="window.navigateMarketing('/resources')">Resources</a></li>
              </ul>
            </nav>

            <div class="mkt-nav-actions">
              <button class="mkt-btn mkt-btn-ghost" onclick="window.navigateMarketing('/auth/login')">Sign In</button>
              <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/auth/register')">Get Started Free</button>
              <button class="mkt-nav-toggle" onclick="window.toggleMarketingMenu()" aria-label="Toggle Menu">☰</button>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Hero & Header Container -->
      <section class="mkt-section" style="padding-top:120px; padding-bottom:40px;">
        <div class="mkt-container mkt-container-narrow">
          
          <!-- Breadcrumb Navigation -->
          <div style="display:flex; align-items:center; gap:8px; font-size:13px; margin-bottom:24px; color:var(--mkt-text-muted);">
            ${breadcrumbItems.join('<span style="color:var(--mkt-border-light);">/</span>')}
          </div>

          <!-- Category Pill & Title -->
          <div style="margin-bottom:16px;">
            <span class="mkt-pill" style="margin-bottom:12px; display:inline-flex; align-items:center; gap:6px;">
              <span>${meta.icon}</span>
              <span>${meta.category}</span>
              ${meta.badge ? `<span style="font-size:10px; background:rgba(59,130,246,0.3); color:#93c5fd; padding:1px 6px; border-radius:99px; margin-left:4px;">${meta.badge}</span>` : ''}
            </span>
            <h1 class="mkt-hero-title" style="font-size: clamp(2rem, 4vw, 3rem); text-align:left; margin-bottom:16px;">
              ${meta.title}
            </h1>
            <p class="mkt-hero-subtitle" style="text-align:left; max-width:800px; font-size:17px; margin-bottom:28px;">
              ${meta.description}
            </p>
          </div>

          <!-- Phase 23 Step Notice Banner -->
          <div style="background:rgba(59, 130, 246, 0.08); border:1px solid rgba(59, 130, 246, 0.25); border-radius:var(--mkt-radius-md); padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:40px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:22px;">🚀</span>
              <div>
                <div style="font-size:14px; font-weight:700; color:#93c5fd;">Phase 23 Page Shell Active</div>
                <div style="font-size:13px; color:var(--mkt-text-muted);">This public route is wired into the multi-page router — content coming next.</div>
              </div>
            </div>
            <div style="display:flex; gap:10px;">
              <button class="mkt-btn mkt-btn-secondary" style="padding:7px 14px; font-size:12px;" onclick="window.navigateMarketing('/')">← Back to Home</button>
              <button class="mkt-btn mkt-btn-primary" style="padding:7px 14px; font-size:12px;" onclick="window.navigateMarketing('/auth/register')">Start Free Trial →</button>
            </div>
          </div>

          <!-- Capability Highlights Grid -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-bottom:48px;">
            ${meta.highlights.map((h) => `
              <div class="mkt-feature-card" style="padding:24px;">
                <div style="font-size:28px; margin-bottom:14px;">${h.icon}</div>
                <h3 style="font-size:16px; font-weight:700; color:var(--mkt-text-main); margin-bottom:8px;">${h.title}</h3>
                <p style="font-size:13px; color:var(--mkt-text-muted); line-height:1.5;">${h.desc}</p>
              </div>
            `).join('')}
          </div>

          <!-- Quick Navigation Bar for Related Routes -->
          <div style="background:var(--mkt-bg-surface); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-lg); padding:28px; margin-bottom:48px;">
            <div style="font-size:14px; font-weight:700; color:var(--mkt-text-main); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
              <span>🧭</span>
              <span>Explore Public Modules & Solutions:</span>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${Object.keys(PUBLIC_ROUTES_REGISTRY).map((p) => {
                const item = PUBLIC_ROUTES_REGISTRY[p];
                const isCurrent = p === routePath;
                return `
                  <button 
                    class="mkt-btn ${isCurrent ? 'mkt-btn-primary' : 'mkt-btn-secondary'}" 
                    style="padding:6px 12px; font-size:12px; border-radius:99px;" 
                    onclick="window.navigateMarketing('${item.path}')"
                  >
                    <span>${item.icon}</span>
                    <span>${item.title.split(' ')[0]} ${item.title.split(' ')[1] || ''}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Action CTA Banner -->
          <div style="text-align:center; padding:48px 24px; background:var(--mkt-bg-card-solid); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-xl); box-shadow:var(--mkt-shadow-md);">
            <h2 style="font-size:24px; font-weight:800; color:var(--mkt-text-main); margin-bottom:12px;">Ready to run your business on Universal ERP?</h2>
            <p style="color:var(--mkt-text-muted); font-size:14px; margin-bottom:24px;">Setup takes less than 5 minutes. No credit card required.</p>
            <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
              <button class="mkt-btn mkt-btn-primary" onclick="window.navigateMarketing('/auth/register')">Start 14-Day Free Trial →</button>
              <button class="mkt-btn mkt-btn-secondary" onclick="window.navigateMarketing('/pricing')">View Pricing Plans</button>
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
