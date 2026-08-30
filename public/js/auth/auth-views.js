/**
 * Universal ERP — Auth Views (Split Login & 5-Step Progressive Onboarding)
 */

export function renderSplitLoginView() {
  return `
    <div class="mkt-auth-wrapper">
      <div class="mkt-login-split-card">
        
        <!-- Left Column: Brand & Value Visual (Desktop) -->
        <div class="mkt-login-brand-panel">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:24px; cursor:pointer;" onclick="window.navigateMarketing('home')">
              <div class="mkt-brand-logo">🌐</div>
              <div class="mkt-brand-name">Universal ERP</div>
            </div>
            
            <h2 style="font-size:28px; font-weight:800; letter-spacing:-0.03em; color:#ffffff; line-height:1.2; margin-bottom:14px;">
              Run Your Entire Business.<br>
              <span class="mkt-text-gradient">From One Simple System.</span>
            </h2>
            <p style="color:var(--mkt-text-muted); font-size:14px; line-height:1.5;">
              Sales, inventory, customers, payments, and multi-channel operations unified in a high-speed business operating system.
            </p>
          </div>

          <!-- Mini Live Preview Card -->
          <div style="background:rgba(15, 23, 42, 0.7); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-md); padding:16px; margin:24px 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <span style="font-size:11px; font-weight:700; color:var(--mkt-text-dim); text-transform:uppercase;">Live Operations</span>
              <span class="mkt-dash-status-pill">● Online</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div style="background:rgba(255,255,255,0.03); padding:8px 10px; border-radius:6px;">
                <div style="font-size:10px; color:var(--mkt-text-dim);">TODAY'S SALES</div>
                <div style="font-size:14px; font-weight:700; color:#fff;">PKR 248,500</div>
              </div>
              <div style="background:rgba(255,255,255,0.03); padding:8px 10px; border-radius:6px;">
                <div style="font-size:10px; color:var(--mkt-text-dim);">LIVE ORDERS</div>
                <div style="font-size:14px; font-weight:700; color:var(--mkt-emerald);">184 Orders</div>
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--mkt-text-dim);">
            <span>Enterprise Security • Multi-Tenant</span>
            <button type="button" class="mkt-btn mkt-btn-ghost" style="font-size:12px; padding:4px 8px;" onclick="window.navigateMarketing('home')">← Back to Website</button>
          </div>
        </div>

        <!-- Right Column: Login Card -->
        <div class="mkt-login-form-panel">
          <div style="margin-bottom:28px;">
            <h1 style="font-size:24px; font-weight:800; color:#ffffff; letter-spacing:-0.02em; margin-bottom:6px;">Sign In to Workspace</h1>
            <p style="color:var(--mkt-text-muted); font-size:14px;">Enter your business credentials to continue.</p>
          </div>

          <!-- Demo Quick Fill Pill -->
          <div style="background:rgba(59, 130, 246, 0.08); border:1px dashed rgba(59, 130, 246, 0.35); border-radius:var(--mkt-radius-sm); padding:12px 14px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div style="font-size:12px;">
              <div style="font-weight:700; color:var(--mkt-text-main);">⚡ Demo Account</div>
              <div style="color:var(--mkt-text-muted); font-family:var(--mkt-font-mono); font-size:11px;">admin@apex.com • Password123!</div>
            </div>
            <button type="button" class="mkt-btn mkt-btn-primary" style="padding:6px 12px; font-size:12px;" onclick="window.fillDemoCredentials()">Auto-Fill</button>
          </div>

          <form onsubmit="window.handleAuthSubmit(event, 'login')">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label" style="font-size:13px; font-weight:600; color:var(--mkt-text-main); margin-bottom:6px; display:block;">Email Address</label>
              <input id="auth-email-input" class="input" type="email" name="email" value="admin@apex.com" required placeholder="alex@business.com" style="width:100%; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); color:#fff;">
            </div>

            <div class="form-group" style="margin-bottom:18px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <label class="form-label" style="font-size:13px; font-weight:600; color:var(--mkt-text-main);">Password</label>
                <a href="#" onclick="window.showForgotPasswordModal(event)" style="font-size:12px; color:var(--mkt-primary); text-decoration:none;">Forgot password?</a>
              </div>
              <input id="auth-password-input" class="input" type="password" name="password" value="Password123!" required style="width:100%; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); color:#fff;">
            </div>

            <button type="submit" class="mkt-btn mkt-btn-primary-glow" style="width:100%; padding:12px; font-size:15px; font-weight:700; margin-bottom:16px;">
              Sign In to Workspace →
            </button>
          </form>

          <div style="text-align:center; font-size:13px; color:var(--mkt-text-muted); margin-top:8px;">
            Don't have a business account? 
            <a href="#" onclick="window.navigateMarketing('register')" style="color:var(--mkt-primary); font-weight:600; text-decoration:none; margin-left:4px;">
              Create Workspace
            </a>
          </div>

          <div style="text-align:center; margin-top:20px; display:none;" class="mobile-only-back">
            <button type="button" class="mkt-btn mkt-btn-ghost" onclick="window.navigateMarketing('home')" style="font-size:13px;">← Back to Homepage</button>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function render5StepOnboardingView(step = 1, formData = {}) {
  const totalSteps = 5;
  const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;

  return `
    <div class="mkt-auth-wrapper">
      <div class="mkt-onboarding-card">
        
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <div style="display:flex; align-items:center; gap:8px; cursor:pointer;" onclick="window.navigateMarketing('home')">
            <div class="mkt-brand-logo" style="width:30px; height:30px; font-size:15px;">🌐</div>
            <span style="font-weight:700; font-size:16px; color:#fff;">Universal ERP</span>
          </div>
          <span style="font-size:12px; font-weight:700; color:var(--mkt-primary); background:rgba(59, 130, 246, 0.1); padding:4px 10px; border-radius:999px;">
            Step ${step} of ${totalSteps}
          </span>
        </div>

        <!-- Stepper Indicator -->
        <div class="mkt-progress-steps">
          <div class="mkt-steps-connector">
            <div class="mkt-steps-connector-fill" style="width: ${progressPercent}%;"></div>
          </div>
          ${[1, 2, 3, 4, 5].map((s) => `
            <div class="mkt-step-indicator ${s === step ? 'active' : s < step ? 'completed' : ''}">
              ${s < step ? '✓' : s}
            </div>
          `).join('')}
        </div>

        <!-- Dynamic Step Content Form -->
        <form id="onboarding-form" onsubmit="window.handleOnboardingStep(event, ${step})">
          ${renderStepFields(step, formData)}
          
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:32px; gap:12px;">
            ${step > 1 ? `
              <button type="button" class="mkt-btn mkt-btn-outline" onclick="window.onboardingPrevStep(${step - 1})">
                ← Back
              </button>
            ` : `
              <button type="button" class="mkt-btn mkt-btn-ghost" onclick="window.navigateMarketing('login')">
                Already have an account? Sign In
              </button>
            `}

            <button type="submit" class="mkt-btn mkt-btn-primary-glow" style="margin-left:auto;">
              ${step === 5 ? 'Create Workspace 🚀' : 'Continue →'}
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

function renderStepFields(step, data) {
  switch (step) {
    case 1:
      return `
        <div style="margin-bottom:20px;">
          <h2 style="font-size:22px; font-weight:800; color:#ffffff; margin-bottom:6px;">What's your name?</h2>
          <p style="font-size:14px; color:var(--mkt-text-muted);">Let's set up your business owner profile.</p>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label" style="font-size:13px; font-weight:600; color:#fff; margin-bottom:6px; display:block;">First Name</label>
            <input class="input" name="firstName" value="${data.firstName || ''}" required placeholder="Alex" autofocus style="width:100%; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); color:#fff;">
          </div>
          <div class="form-group">
            <label class="form-label" style="font-size:13px; font-weight:600; color:#fff; margin-bottom:6px; display:block;">Last Name</label>
            <input class="input" name="lastName" value="${data.lastName || ''}" required placeholder="Smith" style="width:100%; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); color:#fff;">
          </div>
        </div>
      `;

    case 2:
      return `
        <div style="margin-bottom:20px;">
          <h2 style="font-size:22px; font-weight:800; color:#ffffff; margin-bottom:6px;">What is your business name?</h2>
          <p style="font-size:14px; color:var(--mkt-text-muted);">This will be your workspace name and receipt header.</p>
        </div>
        <div class="form-group">
          <label class="form-label" style="font-size:13px; font-weight:600; color:#fff; margin-bottom:6px; display:block;">Business or Store Name</label>
          <input class="input" name="businessName" value="${data.businessName || ''}" required placeholder="Apex Superstore" autofocus style="width:100%; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); color:#fff;">
        </div>
      `;

    case 3:
      return `
        <div style="margin-bottom:20px;">
          <h2 style="font-size:22px; font-weight:800; color:#ffffff; margin-bottom:6px;">Select your primary industry</h2>
          <p style="font-size:14px; color:var(--mkt-text-muted);">Universal ERP customizes your catalog and POS workflow.</p>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          ${[
            { id: 'Retail', title: 'Retail & Store', icon: '🛍️' },
            { id: 'Ecommerce', title: 'E-commerce & Online', icon: '🌐' },
            { id: 'Supermarket', title: 'Supermarket / Mart', icon: '🛒' },
            { id: 'Wholesale', title: 'Wholesale & Trading', icon: '📦' },
            { id: 'Pharmacy', title: 'Pharmacy & Care', icon: '💊' },
            { id: 'Services', title: 'Services & General', icon: '⚡' },
          ].map((type) => `
            <label style="cursor:pointer; display:flex; align-items:center; gap:10px; padding:12px; border-radius:var(--mkt-radius-sm); background:rgba(255,255,255,0.03); border:1px solid ${data.industry === type.id ? 'var(--mkt-primary)' : 'var(--mkt-border)'};">
              <input type="radio" name="industry" value="${type.id}" ${data.industry === type.id || (!data.industry && type.id === 'Retail') ? 'checked' : ''} style="display:none;" onchange="window.selectOnboardingIndustry('${type.id}')">
              <span style="font-size:18px;">${type.icon}</span>
              <span style="font-size:13px; font-weight:600; color:#fff;">${type.title}</span>
            </label>
          `).join('')}
        </div>
      `;

    case 4:
      return `
        <div style="margin-bottom:20px;">
          <h2 style="font-size:22px; font-weight:800; color:#ffffff; margin-bottom:6px;">Select your base currency</h2>
          <p style="font-size:14px; color:var(--mkt-text-muted);">Used for sales, purchasing, inventory valuation and profit reporting.</p>
        </div>
        <div class="form-group">
          <label class="form-label" style="font-size:13px; font-weight:600; color:#fff; margin-bottom:6px; display:block;">Currency Code</label>
          <select name="currency" class="select" style="width:100%; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); color:#fff;">
            <option value="PKR" ${data.currency === 'PKR' || !data.currency ? 'selected' : ''}>PKR — Pakistani Rupee</option>
            <option value="USD" ${data.currency === 'USD' ? 'selected' : ''}>USD — US Dollar ($)</option>
            <option value="EUR" ${data.currency === 'EUR' ? 'selected' : ''}>EUR — Euro (€)</option>
            <option value="GBP" ${data.currency === 'GBP' ? 'selected' : ''}>GBP — British Pound (£)</option>
            <option value="AED" ${data.currency === 'AED' ? 'selected' : ''}>AED — UAE Dirham</option>
            <option value="SAR" ${data.currency === 'SAR' ? 'selected' : ''}>SAR — Saudi Riyal</option>
            <option value="INR" ${data.currency === 'INR' ? 'selected' : ''}>INR — Indian Rupee (₹)</option>
          </select>
        </div>
      `;

    case 5:
    default:
      return `
        <div style="margin-bottom:20px;">
          <h2 style="font-size:22px; font-weight:800; color:#ffffff; margin-bottom:6px;">Create your account & login</h2>
          <p style="font-size:14px; color:var(--mkt-text-muted);">Set your secure credentials to launch your new workspace.</p>
        </div>
        <div class="form-group" style="margin-bottom:14px;">
          <label class="form-label" style="font-size:13px; font-weight:600; color:#fff; margin-bottom:6px; display:block;">Work Email</label>
          <input class="input" type="email" name="email" value="${data.email || ''}" required placeholder="alex@business.com" autofocus style="width:100%; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); color:#fff;">
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" style="font-size:13px; font-weight:600; color:#fff; margin-bottom:6px; display:block;">Password (Min. 8 characters)</label>
          <input class="input" type="password" name="password" value="${data.password || ''}" minlength="8" required placeholder="••••••••" style="width:100%; padding:10px 14px; background:rgba(255,255,255,0.03); border:1px solid var(--mkt-border); border-radius:var(--mkt-radius-sm); color:#fff;">
        </div>
        <div style="font-size:12px; color:var(--mkt-text-dim); line-height:1.4;">
          By creating your workspace, you agree to Universal ERP terms and secure tenant isolation.
        </div>
      `;
  }
}
