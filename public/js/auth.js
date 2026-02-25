// Shared authentication module — loaded by all pages
const Auth = {
  user: null,
  initialized: false,
  _listeners: [],
  _modalEl: null,

  async init() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      this.user = data.authenticated ? data.user : null;
    } catch {
      this.user = null;
    }
    this.initialized = true;
    this._listeners.forEach(fn => fn(this.user));
    this.updateUI();
    // Track page view with browser metadata for guest analytics
    this.trackActivity('page_view', {
      page: window.location.pathname,
      referrer: document.referrer || null,
      screen: `${screen.width}x${screen.height}`
    });
  },

  onReady(fn) {
    if (this.initialized) fn(this.user);
    else this._listeners.push(fn);
  },

  isGuest() { return !this.user; },
  isUser() { return !!this.user; },
  isAdmin() { return this.user && this.user.role === 'admin'; },

  // Show/hide elements based on data-auth attribute
  updateUI() {
    document.querySelectorAll('[data-auth]').forEach(el => {
      const roles = el.getAttribute('data-auth').split(',').map(s => s.trim());
      let visible = false;
      if (roles.includes('guest') && this.isGuest()) visible = true;
      if (roles.includes('user') && this.isUser() && !this.isAdmin()) visible = true;
      if (roles.includes('admin') && this.isAdmin()) visible = true;
      if (roles.includes('loggedin') && this.isUser()) visible = true;
      el.style.display = visible ? '' : 'none';
    });

    // Update display name
    const nameEl = document.getElementById('auth-user-name');
    if (nameEl && this.user) {
      nameEl.textContent = this.user.displayName || this.user.email.split('@')[0];
    }
  },

  // Wrap a callback so it only fires if logged in, otherwise show login prompt
  requireLogin(callback, message) {
    const self = this;
    return function(...args) {
      if (self.isGuest()) {
        self.showLoginPrompt(message || 'Please log in to continue');
        return;
      }
      callback.apply(this, args);
    };
  },

  // CSRF-aware fetch wrapper
  async fetch(url, options = {}) {
    const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '';
    options.headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...(options.headers || {})
    };
    options.credentials = 'same-origin';
    const res = await fetch(url, options);

    // If 401, show login prompt
    if (res.status === 401) {
      const data = await res.clone().json().catch(() => ({}));
      if (data.code === 'AUTH_REQUIRED') {
        this.showLoginPrompt('Your session has expired. Please log in again.');
      }
    }
    return res;
  },

  // Track activity events
  trackActivity(action, details) {
    const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '';
    fetch('/api/activity/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      credentials: 'same-origin',
      body: JSON.stringify({ action, details })
    }).catch(() => {});
  },

  async logout() {
    try {
      const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '';
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'same-origin'
      });
    } catch {
      // Still redirect even if the server request fails
    }
    this.user = null;
    window.location.href = '/';
  },

  // Escape HTML for safe rendering
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // ----- Login Prompt Modal -----
  showLoginPrompt(message) {
    if (this._modalEl) this._modalEl.remove();

    const overlay = document.createElement('div');
    overlay.id = 'auth-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);z-index:9998;';

    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;border-radius:16px;box-shadow:0 25px 50px rgba(0,0,0,0.25);z-index:9999;width:90%;max-width:420px;max-height:90vh;overflow-y:auto;font-family:Inter,system-ui,sans-serif;';

    modal.innerHTML = `
      <div style="padding:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;font-size:1.25rem;font-weight:700;color:#0f172a;">Welcome</h3>
          <button id="auth-modal-close" style="background:none;border:none;cursor:pointer;font-size:1.5rem;color:#94a3b8;line-height:1;">&times;</button>
        </div>
        <p style="color:#64748b;font-size:0.875rem;margin-bottom:20px;">${this.escapeHtml(message)}</p>

        <div style="display:flex;border-bottom:2px solid #e2e8f0;margin-bottom:20px;">
          <button id="auth-tab-login" class="auth-tab active" style="flex:1;padding:8px;font-size:0.875rem;font-weight:600;border:none;background:none;cursor:pointer;color:#16a34a;border-bottom:2px solid #16a34a;margin-bottom:-2px;">Log In</button>
          <button id="auth-tab-register" class="auth-tab" style="flex:1;padding:8px;font-size:0.875rem;font-weight:600;border:none;background:none;cursor:pointer;color:#94a3b8;border-bottom:2px solid transparent;margin-bottom:-2px;">Create Account</button>
        </div>

        <div id="auth-form-login">
          <div style="margin-bottom:12px;">
            <label style="display:block;font-size:0.75rem;font-weight:500;color:#475569;margin-bottom:4px;">Email</label>
            <input type="email" id="auth-login-email" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.875rem;outline:none;box-sizing:border-box;" placeholder="you@example.com">
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block;font-size:0.75rem;font-weight:500;color:#475569;margin-bottom:4px;">Password</label>
            <input type="password" id="auth-login-password" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.875rem;outline:none;box-sizing:border-box;" placeholder="Enter your password">
          </div>
          <div id="auth-login-error" style="color:#dc2626;font-size:0.75rem;margin-bottom:8px;display:none;"></div>
          <button id="auth-login-submit" style="width:100%;padding:10px;background:#16a34a;color:white;border:none;border-radius:8px;font-size:0.875rem;font-weight:600;cursor:pointer;">Log In</button>
        </div>

        <div id="auth-form-register" style="display:none;">
          <div style="margin-bottom:12px;">
            <label style="display:block;font-size:0.75rem;font-weight:500;color:#475569;margin-bottom:4px;">Email</label>
            <input type="email" id="auth-reg-email" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.875rem;outline:none;box-sizing:border-box;" placeholder="you@example.com">
          </div>
          <div style="margin-bottom:12px;">
            <label style="display:block;font-size:0.75rem;font-weight:500;color:#475569;margin-bottom:4px;">Display Name (optional)</label>
            <input type="text" id="auth-reg-name" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.875rem;outline:none;box-sizing:border-box;" placeholder="Your name">
          </div>
          <div style="margin-bottom:12px;">
            <label style="display:block;font-size:0.75rem;font-weight:500;color:#475569;margin-bottom:4px;">Password</label>
            <input type="password" id="auth-reg-password" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.875rem;outline:none;box-sizing:border-box;" placeholder="Min 8 chars, letter + number">
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block;font-size:0.75rem;font-weight:500;color:#475569;margin-bottom:4px;">Confirm Password</label>
            <input type="password" id="auth-reg-confirm" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:0.875rem;outline:none;box-sizing:border-box;" placeholder="Confirm your password">
          </div>
          <div id="auth-reg-error" style="color:#dc2626;font-size:0.75rem;margin-bottom:8px;display:none;"></div>
          <button id="auth-reg-submit" style="width:100%;padding:10px;background:#16a34a;color:white;border:none;border-radius:8px;font-size:0.875rem;font-weight:600;cursor:pointer;">Create Account</button>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    this._modalEl = modal;

    // Tab switching
    const tabLogin = modal.querySelector('#auth-tab-login');
    const tabRegister = modal.querySelector('#auth-tab-register');
    const formLogin = modal.querySelector('#auth-form-login');
    const formRegister = modal.querySelector('#auth-form-register');

    tabLogin.addEventListener('click', () => {
      formLogin.style.display = '';
      formRegister.style.display = 'none';
      tabLogin.style.color = '#16a34a';
      tabLogin.style.borderBottomColor = '#16a34a';
      tabRegister.style.color = '#94a3b8';
      tabRegister.style.borderBottomColor = 'transparent';
    });

    tabRegister.addEventListener('click', () => {
      formLogin.style.display = 'none';
      formRegister.style.display = '';
      tabRegister.style.color = '#16a34a';
      tabRegister.style.borderBottomColor = '#16a34a';
      tabLogin.style.color = '#94a3b8';
      tabLogin.style.borderBottomColor = 'transparent';
    });

    // Close handlers
    const closeModal = () => {
      overlay.remove();
      modal.remove();
      this._modalEl = null;
    };
    overlay.addEventListener('click', closeModal);
    modal.querySelector('#auth-modal-close').addEventListener('click', closeModal);
    // Login submit
    modal.querySelector('#auth-login-submit').addEventListener('click', async () => {
      const email = modal.querySelector('#auth-login-email').value.trim();
      const password = modal.querySelector('#auth-login-password').value;
      const errorEl = modal.querySelector('#auth-login-error');
      errorEl.style.display = 'none';

      if (!email || !password) {
        errorEl.textContent = 'Please enter your email and password.';
        errorEl.style.display = '';
        return;
      }

      try {
        const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '';
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
          credentials: 'same-origin',
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          errorEl.textContent = data.error || 'Login failed';
          errorEl.style.display = '';
          return;
        }
        this.user = data.user;
        closeModal();
        window.location.reload();
      } catch (err) {
        errorEl.textContent = 'Connection error. Please try again.';
        errorEl.style.display = '';
      }
    });

    // Register submit
    modal.querySelector('#auth-reg-submit').addEventListener('click', async () => {
      const email = modal.querySelector('#auth-reg-email').value.trim();
      const displayName = modal.querySelector('#auth-reg-name').value.trim();
      const password = modal.querySelector('#auth-reg-password').value;
      const confirm = modal.querySelector('#auth-reg-confirm').value;
      const errorEl = modal.querySelector('#auth-reg-error');
      errorEl.style.display = 'none';

      if (!email || !password) {
        errorEl.textContent = 'Email and password are required.';
        errorEl.style.display = '';
        return;
      }
      if (password.length < 8) {
        errorEl.textContent = 'Password must be at least 8 characters.';
        errorEl.style.display = '';
        return;
      }
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        errorEl.textContent = 'Password must contain a letter and a number.';
        errorEl.style.display = '';
        return;
      }
      if (password !== confirm) {
        errorEl.textContent = 'Passwords do not match.';
        errorEl.style.display = '';
        return;
      }

      try {
        const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '';
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
          credentials: 'same-origin',
          body: JSON.stringify({ email, password, displayName: displayName || undefined })
        });
        const data = await res.json();
        if (!res.ok) {
          errorEl.textContent = data.error || 'Registration failed';
          errorEl.style.display = '';
          return;
        }
        this.user = data.user;
        closeModal();
        window.location.reload();
      } catch (err) {
        errorEl.textContent = 'Connection error. Please try again.';
        errorEl.style.display = '';
      }
    });

    // Enter key on password fields
    modal.querySelector('#auth-login-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') modal.querySelector('#auth-login-submit').click();
    });
    modal.querySelector('#auth-reg-confirm').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') modal.querySelector('#auth-reg-submit').click();
    });

    // Focus first field
    setTimeout(() => modal.querySelector('#auth-login-email').focus(), 100);
  }
};

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => Auth.init());
