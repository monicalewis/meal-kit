require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const crypto = require('crypto');
const Groq = require('groq-sdk');
const bcrypt = require('bcrypt');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { loadUser, requireAuth, requireAdmin } = require('./middleware/auth');
const UnitConversion = require('./public/js/unit-conversion');
const { fetchWithBrowser } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Security headers ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  }
}));

// --- Rate limiting ---
app.use(rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many attempts, please try again later' }
});

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
const activityLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
const shareLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });

app.use(express.json({ limit: '5mb' }));

// --- Database setup ---
let pool = null;
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// --- Session setup ---
if (pool) {
  const PgSession = require('connect-pg-simple')(session);
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: false
    }),
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax'
    },
    name: 'recipe.sid'
  }));
} else {
  // Fallback: memory-based sessions for local dev without DB
  app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' },
    name: 'recipe.sid'
  }));
}

// --- CSRF protection (double-submit cookie) ---
app.use((req, res, next) => {
  if (req.session && !req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  if (req.session && req.session.csrfToken) {
    res.cookie('csrf_token', req.session.csrfToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }
  next();
});

function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  // Exempt logout from CSRF — logging someone out isn't a harmful action
  if (req.path === '/api/auth/logout') return next();
  const token = req.headers['x-csrf-token'];
  if (!token || !req.session || token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
}

app.use(csrfProtection);

// --- Auth middleware ---
app.use(loadUser);

// --- Shared meal plan page (with dynamic OG tags) ---
const planHtmlTemplate = fs.readFileSync(path.join(__dirname, 'public', 'plan.html'), 'utf-8');

app.get('/plan/:shareId', async (req, res) => {
  const { shareId } = req.params;

  // For invalid IDs or when DB is unavailable, serve the template as-is (client-side will show error)
  if (!pool || !/^[A-Za-z0-9_-]{12}$/.test(shareId)) {
    return res.send(planHtmlTemplate);
  }

  try {
    const result = await pool.query(
      `SELECT recipe_snapshot, created_at
       FROM shared_meal_plans
       WHERE share_id = $1 AND expires_at > NOW()`,
      [shareId]
    );

    if (result.rows.length === 0) {
      return res.send(planHtmlTemplate);
    }

    const snapshot = result.rows[0].recipe_snapshot;
    const recipes = snapshot.recipes || [];
    const createdBy = snapshot.createdBy || '';

    // Build dynamic OG tags
    const ogTitle = createdBy ? `${createdBy}'s Meal Plan` : "This Week's Meals";
    const recipeNames = recipes.slice(0, 4).map(r => r.name).join(', ');
    const ogDescription = recipeNames
      ? `${recipes.length} recipes: ${recipeNames}${recipes.length > 4 ? '...' : ''}`
      : "Check out this week's meal plan!";
    const ogImage = (recipes.find(r => r.image) || {}).image || '';

    // Replace placeholder meta tags in the template
    let html = planHtmlTemplate;
    html = html.replace(
      '<meta property="og:title" content="This Week\'s Meals">',
      `<meta property="og:title" content="${escapeAttr(ogTitle)}">`
    );
    html = html.replace(
      '<meta property="og:description" content="Check out this week\'s meal plan!">',
      `<meta property="og:description" content="${escapeAttr(ogDescription)}">`
    );
    if (ogImage) {
      html = html.replace(
        '<meta property="og:type" content="website">',
        `<meta property="og:image" content="${escapeAttr(ogImage)}">\n    <meta property="og:type" content="website">`
      );
    }

    // Twitter Card tags
    html = html.replace(
      '<meta name="twitter:title" content="This Week\'s Meals">',
      `<meta name="twitter:title" content="${escapeAttr(ogTitle)}">`
    );
    html = html.replace(
      '<meta name="twitter:description" content="Check out this week\'s meal plan!">',
      `<meta name="twitter:description" content="${escapeAttr(ogDescription)}">`
    );
    if (ogImage) {
      html = html.replace(
        '<meta name="twitter:card" content="summary_large_image">',
        `<meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:image" content="${escapeAttr(ogImage)}">`
      );
    }

    // Also update the <title> tag
    html = html.replace(
      '<title>This Week\'s Meals</title>',
      `<title>${escapeAttr(ogTitle)}</title>`
    );

    res.send(html);
  } catch (err) {
    console.error('Plan page OG error:', err.message);
    res.send(planHtmlTemplate);
  }
});

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- Static files ---
app.use(express.static(path.join(__dirname, 'public')));

// --- Groq AI setup ---
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// --- Activity logging helper ---
async function logActivity(userId, action, details, ipAddress) {
  if (!pool) return;
  try {
    await pool.query(
      'INSERT INTO activity_log (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
      [userId, action, details ? JSON.stringify(details) : null, ipAddress]
    );
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}

// ====================
// Data access helpers
// ====================

async function getRecipeData() {
  if (pool) {
    const result = await pool.query("SELECT value FROM app_data WHERE key = 'recipeData'");
    if (result.rows.length > 0) return result.rows[0].value;
    return { ingredientDefs: {}, recipes: [] };
  }
  const recipesPath = path.join(__dirname, 'recipes.js');
  const content = fs.readFileSync(recipesPath, 'utf-8')
    .replace(/^const recipeData/m, 'var recipeData');
  const sandbox = {};
  vm.runInNewContext(content, sandbox);
  return sandbox.recipeData || { ingredientDefs: {}, recipes: [] };
}

async function saveRecipeData(recipeData) {
  if (pool) {
    await pool.query(
      `INSERT INTO app_data (key, value) VALUES ('recipeData', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [JSON.stringify(recipeData)]
    );
    return;
  }
  const recipesPath = path.join(__dirname, 'recipes.js');
  const newContent = '// Recipe data - edit this file to add/modify recipes\nconst recipeData = ' +
    JSON.stringify(recipeData, null, 2) + ';\n';
  fs.writeFileSync(recipesPath, newContent, 'utf-8');
}

async function getUserFavorites(userId) {
  if (!pool || !userId) return {};
  const result = await pool.query(
    'SELECT recipe_id, last_selected FROM user_favorites WHERE user_id = $1',
    [userId]
  );
  const favorites = {};
  for (const row of result.rows) {
    favorites[row.recipe_id] = { lastSelected: row.last_selected.toISOString(), removed: false };
  }
  return favorites;
}

async function getUserRecipes(userId) {
  if (!pool) return [];
  const result = await pool.query(
    'SELECT recipe_id, recipe_data, ingredient_defs FROM user_recipes WHERE user_id = $1',
    [userId]
  );
  return result.rows;
}

async function getUserRecipeCount(userId) {
  if (!pool) return 0;
  const result = await pool.query('SELECT COUNT(*) FROM user_recipes WHERE user_id = $1', [userId]);
  return parseInt(result.rows[0].count);
}

async function getUserRecipePrefs(userId) {
  if (!pool) return {};
  const result = await pool.query(
    'SELECT recipe_id, hidden FROM user_recipe_prefs WHERE user_id = $1',
    [userId]
  );
  const prefs = {};
  for (const row of result.rows) {
    prefs[row.recipe_id] = { hidden: row.hidden };
  }
  return prefs;
}

// =============================
// AUTH ROUTES
// =============================

app.post('/api/auth/register', authLimiter, [
  body('email').isEmail().normalizeEmail().isLength({ max: 255 }),
  body('password').isLength({ min: 8, max: 128 }).matches(/[a-zA-Z]/).matches(/[0-9]/),
  body('displayName').optional().trim().escape().isLength({ max: 100 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid input. Password must be at least 8 characters with a letter and a number.' });
  }
  if (!pool) return res.status(500).json({ error: 'Database not configured' });

  const { email, password, displayName } = req.body;
  try {
    // Check if email exists (generic error to prevent enumeration)
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Registration failed. Please try a different email.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name, role)
       VALUES ($1, $2, $3, 'user') RETURNING id, email, display_name, role`,
      [email, hash, displayName || null]
    );
    const user = result.rows[0];

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Session error' });
      req.session.userId = user.id;
      req.session.role = user.role;
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
      res.cookie('csrf_token', req.session.csrfToken, {
        httpOnly: false, sameSite: 'lax', secure: process.env.NODE_ENV === 'production'
      });
      logActivity(user.id, 'signup', { email: user.email }, req.ip);
      res.json({ success: true, user: { id: user.id, email: user.email, displayName: user.display_name, role: user.role } });
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1, max: 128 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }
  if (!pool) return res.status(500).json({ error: 'Database not configured' });

  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT id, email, password_hash, display_name, role FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Constant-time: still hash to prevent timing attacks
      await bcrypt.hash(password, 12);
      logActivity(null, 'login_failed', { email, reason: 'invalid_credentials' }, req.ip);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      logActivity(null, 'login_failed', { email, reason: 'invalid_credentials' }, req.ip);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Session error' });
      req.session.userId = user.id;
      req.session.role = user.role;
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
      res.cookie('csrf_token', req.session.csrfToken, {
        httpOnly: false, sameSite: 'lax', secure: process.env.NODE_ENV === 'production'
      });
      logActivity(user.id, 'login', { email: user.email }, req.ip);
      res.json({ success: true, user: { id: user.id, email: user.email, displayName: user.display_name, role: user.role } });
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const userId = req.session ? req.session.userId : null;
  req.session.destroy((err) => {
    res.clearCookie('recipe.sid');
    res.clearCookie('csrf_token');
    if (userId) logActivity(userId, 'logout', null, req.ip);
    res.json({ success: true });
  });
});

app.get('/api/auth/me', async (req, res) => {
  if (!req.user || !pool) {
    return res.json({ authenticated: false });
  }
  try {
    const result = await pool.query('SELECT id, email, display_name, role FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.json({ authenticated: false });
    }
    const user = result.rows[0];
    res.json({
      authenticated: true,
      user: { id: user.id, email: user.email, displayName: user.display_name, role: user.role }
    });
  } catch (err) {
    res.json({ authenticated: false });
  }
});

// =============================
// ACCOUNT MANAGEMENT
// =============================

app.post('/api/auth/change-password', requireAuth, [
  body('currentPassword').isLength({ min: 1, max: 128 }),
  body('newPassword').isLength({ min: 8, max: 128 }).matches(/[a-zA-Z]/).matches(/[0-9]/)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'New password must be at least 8 characters with a letter and a number.' });
  }
  if (!pool) return res.status(500).json({ error: 'Database not configured' });

  const { currentPassword, newPassword } = req.body;
  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

app.post('/api/auth/change-email', requireAuth, [
  body('newEmail').isEmail().normalizeEmail().isLength({ max: 255 }),
  body('password').isLength({ min: 1, max: 128 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!pool) return res.status(500).json({ error: 'Database not configured' });

  const { newEmail, password } = req.body;
  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Password is incorrect' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [newEmail, req.user.id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'That email is already in use.' });
    }

    await pool.query('UPDATE users SET email = $1 WHERE id = $2', [newEmail, req.user.id]);
    res.json({ success: true, email: newEmail });
  } catch (err) {
    console.error('Change email error:', err.message);
    res.status(500).json({ error: 'Failed to change email' });
  }
});

app.post('/api/auth/delete-account', requireAuth, [
  body('password').isLength({ min: 1, max: 128 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Password is required.' });
  }
  if (!pool) return res.status(500).json({ error: 'Database not configured' });

  const { password } = req.body;
  try {
    const result = await pool.query('SELECT password_hash, email FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Password is incorrect' });

    logActivity(req.user.id, 'delete_account', { email: result.rows[0].email }, req.ip);
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);

    req.session.destroy(() => {
      res.clearCookie('recipe.sid');
      res.clearCookie('csrf_token');
      res.json({ success: true });
    });
  } catch (err) {
    console.error('Delete account error:', err.message);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// =============================
// ACTIVITY TRACKING (client-side events)
// =============================

app.post('/api/activity/log', activityLimiter, (req, res) => {
  const { action, details } = req.body;
  if (!action) return res.status(400).json({ error: 'action required' });
  const userId = req.user ? req.user.id : null;

  // Enrich page_view events with server-side request metadata
  let enrichedDetails = details || {};
  if (action === 'page_view') {
    enrichedDetails = {
      ...enrichedDetails,
      user_agent: req.headers['user-agent'] || null
    };
  }

  logActivity(userId, action, enrichedDetails, req.ip);
  res.json({ success: true });
});

// =============================
// RECIPE ROUTES
// =============================

// GET /api/recipes — merge preloaded + user recipes + favorites
app.get('/api/recipes', async (req, res) => {
  try {
    const globalData = await getRecipeData();
    const preloadedRecipes = globalData.recipes.map(r => ({ ...r, owner: 'preloaded' }));

    if (!req.user) {
      // Guest: preloaded only, no favorites
      return res.json({ ingredientDefs: globalData.ingredientDefs, recipes: preloadedRecipes, favorites: {} });
    }

    // Logged-in user: merge preloaded + own custom recipes + per-user favorites
    const [userRows, userPrefs, favorites] = await Promise.all([
      getUserRecipes(req.user.id),
      req.user.role === 'admin' ? {} : getUserRecipePrefs(req.user.id),
      getUserFavorites(req.user.id)
    ]);

    // Apply per-user archive overrides to preloaded recipes (non-admin only)
    if (req.user.role !== 'admin') {
      for (const r of preloadedRecipes) {
        if (userPrefs[r.id] !== undefined) {
          r.hidden = userPrefs[r.id].hidden;
        }
      }
    }

    const mergedDefs = { ...globalData.ingredientDefs };
    const userRecipes = [];

    for (const row of userRows) {
      if (row.ingredient_defs) Object.assign(mergedDefs, row.ingredient_defs);
      userRecipes.push({ ...row.recipe_data, owner: String(req.user.id) });
    }

    res.json({
      ingredientDefs: mergedDefs,
      recipes: [...preloadedRecipes, ...userRecipes],
      favorites
    });
  } catch (err) {
    console.error('Error loading recipes:', err.message);
    res.status(500).json({ error: 'Failed to load recipe data' });
  }
});

// POST /api/favorites/record — record selected recipes as favorites (requires login)
app.post('/api/favorites/record', requireAuth, async (req, res) => {
  const { recipeIds } = req.body;
  if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
    return res.status(400).json({ error: 'recipeIds array required' });
  }
  try {
    if (pool) {
      const values = recipeIds.map((id, i) => `($1, $${i + 2}, NOW())`).join(', ');
      await pool.query(
        `INSERT INTO user_favorites (user_id, recipe_id, last_selected) VALUES ${values}
         ON CONFLICT (user_id, recipe_id) DO UPDATE SET last_selected = NOW()`,
        [req.user.id, ...recipeIds]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error recording favorites:', err.message);
    res.status(500).json({ error: 'Failed to record favorites' });
  }
});

// POST /api/favorites/remove — un-star a recipe (requires login)
app.post('/api/favorites/remove', requireAuth, async (req, res) => {
  const { recipeId } = req.body;
  if (!recipeId) return res.status(400).json({ error: 'recipeId required' });
  try {
    if (pool) {
      await pool.query(
        'DELETE FROM user_favorites WHERE user_id = $1 AND recipe_id = $2',
        [req.user.id, recipeId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing favorite:', err.message);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// POST /api/fetch-url — requires auth
app.post('/api/fetch-url', requireAuth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  // Crawl-style UAs get pre-rendered HTML with og:image and full content from
  // JS-rendered sites (Shopify, Next.js, etc.), so try them first.
  const uaStrategies = [
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  ];

  let html = null;
  let ogImage = null;

  for (const ua of uaStrategies) {
    try {
      console.log('[fetch-url] Trying UA:', ua.substring(0, 50));
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(url, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timeout);
      if (!response.ok) continue;

      const candidate = await response.text();

      // Extract og:image server-side (both http and secure_url variants)
      const ogMatch = candidate.match(
        /meta\s[^>]*property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i
      ) || candidate.match(
        /meta\s[^>]*content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i
      );

      if (ogMatch) ogImage = ogMatch[1];

      // Use this HTML if it has og:image or visible <img> tags
      const hasContent = ogImage
        || /<img\s[^>]*src=["'](?:https?:)?\/\//i.test(candidate);

      if (!html) html = candidate; // always keep first successful fetch
      if (hasContent) { console.log('[fetch-url] Found content with UA:', ua.substring(0, 50), 'ogImage:', ogImage ? 'YES' : 'NO', 'htmlSize:', candidate.length); html = candidate; break; }
      console.log('[fetch-url] No content with this UA, htmlSize:', candidate.length);
    } catch (e) { console.log('[fetch-url] UA error:', e.message); continue; }
  }

  if (!html) {
    return res.status(502).json({ error: 'Could not fetch the recipe page' });
  }

  // Normalize og:image to https
  if (ogImage) {
    if (ogImage.startsWith('//')) ogImage = 'https:' + ogImage;
    else if (ogImage.startsWith('http://')) ogImage = ogImage.replace('http://', 'https://');
  }
  console.log('[fetch-url] Final ogImage:', ogImage, 'htmlSize:', html.length);

  // Fallback: if no og:image and no real <img> tags, try headless browser
  let browserImages = [];
  const hasImages = ogImage || /<img\s[^>]*src=["'](?:https?:)?\/\//i.test(html);
  if (!hasImages) {
    console.log('[fetch-url] No images found, trying headless browser...');
    try {
      const result = await fetchWithBrowser(url);
      if (result) {
        html = result.html;
        if (result.ogImage) ogImage = result.ogImage;
        browserImages = result.images || [];
      }
    } catch (_) { /* keep original HTML fetch result */ }
  }

  console.log('[fetch-url] Sending response: ogImage:', ogImage, 'browserImages:', browserImages.length, 'htmlSize:', html.length);
  logActivity(req.user.id, 'import_recipe', { url }, req.ip);
  res.json({ html, ogImage, browserImages });
});

// POST /api/parse-recipe — requires auth
app.post('/api/parse-recipe', requireAuth, aiLimiter, async (req, res) => {
  const { recipeName, ingredients, existingDefs } = req.body;
  if (!recipeName || !ingredients) {
    return res.status(400).json({ error: 'recipeName and ingredients are required' });
  }

  const prompt = `You are a recipe ingredient parser for a meal planning app.

Here are the existing ingredient definitions in the app (JSON object keyed by slug ID):
${JSON.stringify(existingDefs)}

A user wants to import a recipe called "${recipeName}" with these raw ingredient strings:
${ingredients.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Your job:
1. For each ingredient string, determine the core ingredient, the quantity, and ignore preparation instructions (e.g., "finely chopped", "divided").
2. Match each ingredient to an existing ingredientDef by slug ID if a reasonable match exists. Use fuzzy matching — e.g., "yellow onion" matches "yellow-onion", "fresh basil leaves" matches "fresh-basil".
3. For ingredients that do NOT match any existing def, create a new ingredientDef entry with:
   - slug: lowercase, hyphenated (e.g., "coconut-milk")
   - name: Readable name (e.g., "Coconut milk")
   - units: the most appropriate unit from the recipe (e.g., "cup", "oz", "count", "tbsp", "tsp", "lbs", "bunch", "can", "cloves", "g", "ml", "kg")
   - section: one of "Produce", "Bread", "Cooking", "Cheese section", "Dairy", "Nuts", "Frozen", "Snacks", "Other"
4. Skip ingredients that are just salt, pepper, water, or basic cooking oil (olive oil, vegetable oil) UNLESS they appear in the existing defs.
5. Convert fractional quantities to decimals (e.g., 1/2 = 0.5, 1/3 = 0.33, 2/3 = 0.67).
6. For "to taste" ingredients, use qty of 1.
7. For quantity RANGES like "120-150 g" or "2-3 cups", use the lower value of the range (e.g., 120 g, 2 cups).
8. IMPORTANT unit handling:
   - Return the quantity and unit EXACTLY as they appear in the recipe text. In addition to "id" and "qty", ALSO return "unit" — the unit from the recipe (e.g., "g", "cup", "tbsp", "ml", "oz", "lbs", "tsp", "kg", "count", "cloves", "bunch", "can"). Normalize to lowercase.
   - Do NOT convert units or do any math. Return the raw values from the recipe. Unit conversion is handled separately in code.
   - When creating a NEW ingredientDef, use the recipe's original units. If the recipe uses metric (g, ml, kg), keep those units.

Return ONLY valid JSON in this exact format, no other text:
{
  "ingredients": [
    { "id": "existing-slug-or-new-slug", "qty": 250, "unit": "g" }
  ],
  "newIngredientDefs": {
    "new-slug": { "name": "New Ingredient", "units": "cup", "section": "Produce" }
  }
}`;

  try {
    if (!groq) return res.status(500).json({ error: 'AI service not configured (GROQ_API_KEY missing)' });
    const result = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
    });
    const text = result.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse AI response as JSON' });
    }
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.ingredients) {
      parsed.ingredients = UnitConversion.convertParsedIngredients(
        parsed.ingredients,
        existingDefs || {},
        parsed.newIngredientDefs || {}
      );
    }
    logActivity(req.user.id, 'ai_parse_recipe', { recipe_name: recipeName }, req.ip);
    res.json(parsed);
  } catch (err) {
    console.error('Groq API error:', err.message);
    res.status(500).json({ error: `AI API error: ${err.message}` });
  }
});

// POST /api/extract-recipe — requires auth
app.post('/api/extract-recipe', requireAuth, aiLimiter, async (req, res) => {
  const { pageText, sourceUrl, existingDefs } = req.body;
  if (!pageText) return res.status(400).json({ error: 'pageText is required' });

  const prompt = `You are a recipe extractor and ingredient parser for a meal planning app.

I have the text content of a web page. First, determine if this page actually contains a recipe. If it does NOT contain a recipe (e.g., it's a news article, blog post without a recipe, social media page, search results, homepage, error page, etc.), return ONLY this JSON:
{"not_a_recipe": true}

If the page DOES contain a recipe, extract it and parse its ingredients.

Here are the existing ingredient definitions in the app (JSON object keyed by slug ID):
${JSON.stringify(existingDefs)}

Here is the page text:
---
${pageText.substring(0, 4000)}
---

Your job:
1. First, determine if this page contains a recipe. If not, return {"not_a_recipe": true}.
2. Extract the recipe name and author/source from the page.
3. For the image field, ALWAYS return an empty string "". Do NOT guess or invent image URLs — they are extracted separately.
4. Extract cooking times if mentioned: active/prep time and total time. Use short readable format like "15 min", "1 hr 30 min". Return null if not found.
5. Identify all recipe ingredients from the page text.
6. For each ingredient, determine the core ingredient and quantity, ignoring preparation instructions.
7. Match each ingredient to an existing ingredientDef by slug ID if a reasonable match exists. Use fuzzy matching — e.g., "yellow onion" matches "yellow-onion", "fresh basil leaves" matches "fresh-basil".
8. For ingredients that do NOT match any existing def, create a new ingredientDef entry with:
   - slug: lowercase, hyphenated (e.g., "coconut-milk")
   - name: Readable name (e.g., "Coconut milk")
   - units: the most appropriate unit (e.g., "cup", "oz", "count", "tbsp", "tsp", "lbs", "bunch", "can", "cloves", "g", "ml", "kg")
   - section: one of "Produce", "Bread", "Cooking", "Cheese section", "Dairy", "Nuts", "Frozen", "Snacks", "Other"
9. Skip ingredients that are just salt, pepper, water, or basic cooking oil (olive oil, vegetable oil) UNLESS they appear in the existing defs.
10. Convert fractional quantities to decimals (e.g., 1/2 = 0.5, 1/3 = 0.33, 2/3 = 0.67).
11. For "to taste" ingredients, use qty of 1.
12. For quantity RANGES like "120-150 g" or "2-3 cups", use the lower value of the range (e.g., 120 g, 2 cups).
13. IMPORTANT unit handling:
   - Return the quantity and unit EXACTLY as they appear in the recipe text. In addition to "id" and "qty", ALSO return "unit" — the unit from the recipe (e.g., "g", "cup", "tbsp", "ml", "oz", "lbs", "tsp", "kg", "count", "cloves", "bunch", "can"). Normalize to lowercase.
   - Do NOT convert units or do any math. Return the raw values from the recipe. Unit conversion is handled separately in code.
   - When creating a NEW ingredientDef, use the recipe's original units. If the recipe uses metric (g, ml, kg), keep those units.

Return ONLY valid JSON in this exact format, no other text:
{
  "name": "Recipe Name",
  "author": "Author or Source Name",
  "image": "",
  "activeTime": "15 min",
  "totalTime": "45 min",
  "ingredients": [
    { "id": "existing-slug-or-new-slug", "qty": 250, "unit": "g" }
  ],
  "newIngredientDefs": {
    "new-slug": { "name": "New Ingredient", "units": "cup", "section": "Produce" }
  }
}`;

  try {
    if (!groq) return res.status(500).json({ error: 'AI service not configured (GROQ_API_KEY missing)' });
    const result = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
    });
    const text = result.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse AI response as JSON' });
    }
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.not_a_recipe) {
      return res.status(422).json({ error: 'This page doesn\'t appear to contain a recipe. Please try a URL from a recipe website.' });
    }
    if (!parsed.ingredients || parsed.ingredients.length === 0) {
      return res.status(422).json({ error: 'No ingredients found on this page. Please make sure the URL points to a specific recipe.' });
    }
    if (parsed.ingredients) {
      parsed.ingredients = UnitConversion.convertParsedIngredients(
        parsed.ingredients,
        existingDefs || {},
        parsed.newIngredientDefs || {}
      );
    }
    logActivity(req.user.id, 'ai_extract_recipe', { source_url: sourceUrl || null }, req.ip);
    res.json(parsed);
  } catch (err) {
    console.error('Groq API error:', err.message);
    res.status(500).json({ error: `AI API error: ${err.message}` });
  }
});

// /api/convert-units removed — unit conversion now handled by js/unit-conversion.js density table

// POST /api/save-recipe — requires auth, branches by role
app.post('/api/save-recipe', requireAuth, async (req, res) => {
  const { recipe, newIngredientDefs } = req.body;
  if (!recipe) return res.status(400).json({ error: 'recipe is required' });

  try {
    if (req.user.role === 'admin') {
      // Admin: save to global preloaded data
      const recipeData = await getRecipeData();

      if (newIngredientDefs) {
        Object.assign(recipeData.ingredientDefs, newIngredientDefs);
      }

      if (recipe.ingredients) {
        recipe.ingredients.forEach(ing => {
          if (!recipeData.ingredientDefs[ing.id]) {
            console.warn(`Creating stub ingredientDef for orphaned ID: ${ing.id}`);
            recipeData.ingredientDefs[ing.id] = {
              name: ing.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              units: 'count',
              section: 'Other'
            };
          }
        });
      }

      const existingIdx = recipeData.recipes.findIndex(r => r.id === recipe.id);
      if (existingIdx >= 0) {
        recipeData.recipes[existingIdx] = recipe;
      } else {
        recipeData.recipes.push(recipe);
      }

      await saveRecipeData(recipeData);
    } else {
      // Regular user: save to user_recipes table
      if (!pool) return res.status(500).json({ error: 'Database not configured' });

      const count = await getUserRecipeCount(req.user.id);
      if (count >= 100) {
        return res.status(403).json({ error: 'Recipe limit reached (100 max). Delete some recipes to add more.' });
      }

      await pool.query(
        `INSERT INTO user_recipes (user_id, recipe_id, recipe_data, ingredient_defs)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, recipe_id) DO UPDATE
         SET recipe_data = $3, ingredient_defs = $4, updated_at = NOW()`,
        [req.user.id, recipe.id, JSON.stringify(recipe), JSON.stringify(newIngredientDefs || {})]
      );
    }

    logActivity(req.user.id, 'save_recipe', { recipe_id: recipe.id }, req.ip);
    res.json({ success: true });
  } catch (err) {
    console.error('Save error:', err.message);
    res.status(500).json({ error: `Failed to save recipe: ${err.message}` });
  }
});

// POST /api/archive-recipe — requires auth, ownership check
app.post('/api/archive-recipe', requireAuth, async (req, res) => {
  const { recipeId, hidden } = req.body;
  if (!recipeId) return res.status(400).json({ error: 'recipeId is required' });

  try {
    // Check if it's a preloaded recipe
    const recipeData = await getRecipeData();
    const preloadedRecipe = recipeData.recipes.find(r => r.id === recipeId);

    if (preloadedRecipe) {
      if (req.user.role === 'admin') {
        // Admin: update global state for all users
        preloadedRecipe.hidden = !!hidden;
        await saveRecipeData(recipeData);
      } else {
        // Regular user: store personal override
        if (!pool) return res.status(500).json({ error: 'Database not configured' });
        await pool.query(
          `INSERT INTO user_recipe_prefs (user_id, recipe_id, hidden)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, recipe_id) DO UPDATE SET hidden = $3`,
          [req.user.id, recipeId, !!hidden]
        );
      }
    } else if (pool) {
      // Check user_recipes for the current user
      const result = await pool.query(
        'SELECT id, recipe_data FROM user_recipes WHERE user_id = $1 AND recipe_id = $2',
        [req.user.id, recipeId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      const data = result.rows[0].recipe_data;
      data.hidden = !!hidden;
      await pool.query(
        'UPDATE user_recipes SET recipe_data = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(data), result.rows[0].id]
      );
    } else {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    logActivity(req.user.id, 'archive_recipe', { recipe_id: recipeId, hidden: !!hidden }, req.ip);
    res.json({ success: true });
  } catch (err) {
    console.error('Archive error:', err.message);
    res.status(500).json({ error: `Failed to archive recipe: ${err.message}` });
  }
});

// DELETE /api/recipes/:id — requires auth, ownership check
app.delete('/api/recipes/:id', requireAuth, async (req, res) => {
  const recipeId = req.params.id;

  try {
    // Check if it's a preloaded recipe
    const recipeData = await getRecipeData();
    const idx = recipeData.recipes.findIndex(r => r.id === recipeId);

    if (idx >= 0) {
      // Only admin can delete preloaded recipes
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can delete preloaded recipes' });
      }
      recipeData.recipes.splice(idx, 1);

      // Clean up orphaned ingredientDefs
      const usedIds = new Set();
      recipeData.recipes.forEach(r => r.ingredients.forEach(i => usedIds.add(i.id)));
      for (const defId of Object.keys(recipeData.ingredientDefs)) {
        if (!usedIds.has(defId)) delete recipeData.ingredientDefs[defId];
      }

      await saveRecipeData(recipeData);
    } else if (pool) {
      // Check user_recipes
      const result = await pool.query(
        'DELETE FROM user_recipes WHERE user_id = $1 AND recipe_id = $2 RETURNING id',
        [req.user.id, recipeId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
    } else {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    logActivity(req.user.id, 'delete_recipe', { recipe_id: recipeId }, req.ip);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: `Failed to delete recipe: ${err.message}` });
  }
});

// =============================
// MEAL PLAN SHARING
// =============================

function generateShareId() {
  return crypto.randomBytes(9).toString('base64url');
}

app.post('/api/meal-plans/share', requireAuth, shareLimiter, async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'Database not configured' });

  const { recipeIds } = req.body;
  if (!Array.isArray(recipeIds) || recipeIds.length === 0 || recipeIds.length > 20) {
    return res.status(400).json({ error: 'recipeIds must be an array of 1–20 recipe IDs' });
  }
  if (!recipeIds.every(id => typeof id === 'string' && id.length > 0 && id.length <= 255)) {
    return res.status(400).json({ error: 'Invalid recipe ID format' });
  }

  try {
    const [globalData, userRows] = await Promise.all([
      getRecipeData(),
      getUserRecipes(req.user.id)
    ]);

    const allRecipes = [
      ...globalData.recipes.map(r => ({ ...r })),
      ...userRows.map(row => ({ ...row.recipe_data, id: row.recipe_id }))
    ];

    const selectedRecipes = recipeIds
      .map(id => allRecipes.find(r => r.id === id))
      .filter(Boolean);

    if (selectedRecipes.length === 0) {
      return res.status(400).json({ error: 'None of the provided recipe IDs were found' });
    }

    // Get display name
    let createdBy = null;
    const userResult = await pool.query('SELECT display_name, email FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length > 0) {
      const u = userResult.rows[0];
      createdBy = u.display_name || u.email.split('@')[0];
    }

    const snapshot = {
      recipes: selectedRecipes.map(r => ({
        id: r.id,
        name: r.name,
        image: r.image || null,
        url: r.url || null,
        author: r.author || null,
        activeTime: r.activeTime || null,
        totalTime: r.totalTime || null
      })),
      createdBy
    };

    // Generate unique share ID (retry on collision)
    let shareId;
    for (let i = 0; i < 5; i++) {
      shareId = generateShareId();
      const existing = await pool.query('SELECT id FROM shared_meal_plans WHERE share_id = $1', [shareId]);
      if (existing.rows.length === 0) break;
      if (i === 4) return res.status(500).json({ error: 'Could not generate a unique share ID' });
    }

    await pool.query(
      `INSERT INTO shared_meal_plans (share_id, user_id, recipe_ids, recipe_snapshot)
       VALUES ($1, $2, $3, $4)`,
      [shareId, req.user.id, JSON.stringify(recipeIds), JSON.stringify(snapshot)]
    );

    logActivity(req.user.id, 'share_meal_plan', {
      share_id: shareId,
      recipe_ids: recipeIds,
      recipe_count: selectedRecipes.length
    }, req.ip);

    res.json({ shareId, url: `/plan/${shareId}` });
  } catch (err) {
    console.error('Share meal plan error:', err.message);
    res.status(500).json({ error: 'Failed to create shared meal plan' });
  }
});

app.get('/api/meal-plans/:shareId', async (req, res) => {
  const { shareId } = req.params;
  if (!/^[A-Za-z0-9_-]{12}$/.test(shareId)) {
    return res.status(400).json({ error: 'Invalid share ID format' });
  }
  if (!pool) return res.status(500).json({ error: 'Database not configured' });

  try {
    const result = await pool.query(
      `SELECT recipe_snapshot, created_at
       FROM shared_meal_plans
       WHERE share_id = $1 AND expires_at > NOW()`,
      [shareId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meal plan not found or has expired' });
    }

    const row = result.rows[0];
    res.json({
      ...row.recipe_snapshot,
      createdAt: row.created_at
    });
  } catch (err) {
    console.error('Get shared plan error:', err.message);
    res.status(500).json({ error: 'Failed to load meal plan' });
  }
});

// =============================
// ADMIN ROUTES
// =============================

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    // Exclude admin users — only count guests and regular accounts
    const [totalUsers, usersThisWeek, totalUserRecipes, activeUsersToday, actionsLast30d,
           shoppingLists30d, shares30d, aiCalls30d, failedLogins7d] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role != 'admin'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role != 'admin' AND created_at >= NOW() - INTERVAL '7 days'"),
      pool.query("SELECT COUNT(*) FROM user_recipes ur JOIN users u ON u.id = ur.user_id WHERE u.role != 'admin'"),
      pool.query("SELECT COUNT(DISTINCT al.user_id) FROM activity_log al JOIN users u ON u.id = al.user_id WHERE u.role != 'admin' AND al.created_at >= NOW() - INTERVAL '1 day'"),
      pool.query("SELECT COUNT(*) FROM activity_log al LEFT JOIN users u ON u.id = al.user_id WHERE (u.role IS NULL OR u.role != 'admin') AND al.created_at >= NOW() - INTERVAL '30 days'"),
      pool.query("SELECT COUNT(*) FROM activity_log al LEFT JOIN users u ON u.id = al.user_id WHERE (u.role IS NULL OR u.role != 'admin') AND al.action = 'generate_shopping_list' AND al.created_at >= NOW() - INTERVAL '30 days'"),
      pool.query("SELECT COUNT(*) FROM activity_log al LEFT JOIN users u ON u.id = al.user_id WHERE (u.role IS NULL OR u.role != 'admin') AND al.action = 'share_shopping_list' AND al.created_at >= NOW() - INTERVAL '30 days'"),
      pool.query("SELECT COUNT(*) FROM activity_log al LEFT JOIN users u ON u.id = al.user_id WHERE (u.role IS NULL OR u.role != 'admin') AND al.action LIKE 'ai_%' AND al.created_at >= NOW() - INTERVAL '30 days'"),
      pool.query("SELECT COUNT(*) FROM activity_log WHERE action = 'login_failed' AND created_at >= NOW() - INTERVAL '7 days'")
    ]);

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      usersThisWeek: parseInt(usersThisWeek.rows[0].count),
      totalUserRecipes: parseInt(totalUserRecipes.rows[0].count),
      activeUsersToday: parseInt(activeUsersToday.rows[0].count),
      totalActions30d: parseInt(actionsLast30d.rows[0].count),
      shoppingLists30d: parseInt(shoppingLists30d.rows[0].count),
      shares30d: parseInt(shares30d.rows[0].count),
      aiCalls30d: parseInt(aiCalls30d.rows[0].count),
      failedLogins7d: parseInt(failedLogins7d.rows[0].count)
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.display_name, u.role, u.created_at,
             COUNT(ur.id) as recipe_count,
             MAX(al.created_at) as last_active
      FROM users u
      LEFT JOIN user_recipes ur ON ur.user_id = u.id
      LEFT JOIN activity_log al ON al.user_id = u.id
      WHERE u.role != 'admin'
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const total = await pool.query("SELECT COUNT(*) FROM users WHERE role != 'admin'");
    res.json({
      users: result.rows,
      total: parseInt(total.rows[0].count),
      page,
      limit
    });
  } catch (err) {
    console.error('Admin users error:', err.message);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

app.get('/api/admin/activity', requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = (page - 1) * limit;
  const actionFilter = req.query.action || null;

  try {
    let query = `
      SELECT al.id, al.user_id, al.action, al.details, al.ip_address, al.created_at,
             u.email, u.display_name
      FROM activity_log al
      LEFT JOIN users u ON u.id = al.user_id
      WHERE (u.role IS NULL OR u.role != 'admin')`;
    const params = [];

    if (actionFilter) {
      const actions = actionFilter.split(',').map(a => a.trim());
      params.push(actions);
      query += ` AND al.action = ANY($1)`;
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({ activity: result.rows, page, limit });
  } catch (err) {
    console.error('Admin activity error:', err.message);
    res.status(500).json({ error: 'Failed to load activity' });
  }
});


// =============================
// START SERVER
// =============================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Recipe Planner running at http://localhost:${PORT}`);
  });
}

module.exports = app;
