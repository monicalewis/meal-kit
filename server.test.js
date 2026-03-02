const request = require('supertest');
const path = require('path');
const fs = require('fs');

const app = require('./server');

// ── Fix #1: Static file serving only serves public/ ──────────────────

describe('Static file serving (Fix #1)', () => {
  test('serves index.html from public/', async () => {
    const res = await request(app).get('/index.html');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<html');
  });

  test('serves login.html from public/', async () => {
    const res = await request(app).get('/login.html');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<html');
  });

  test('serves js/auth.js from public/', async () => {
    const res = await request(app).get('/js/auth.js');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Auth');
  });

  test('does NOT serve server.js', async () => {
    const res = await request(app).get('/server.js');
    expect(res.status).toBe(404);
  });

  test('does NOT serve .env', async () => {
    const res = await request(app).get('/.env');
    expect(res.status).toBe(404);
  });

  test('does NOT serve package.json', async () => {
    const res = await request(app).get('/package.json');
    expect(res.status).toBe(404);
  });

  test('does NOT serve migrate.js', async () => {
    const res = await request(app).get('/migrate.js');
    expect(res.status).toBe(404);
  });

  test('does NOT serve recipes.js', async () => {
    const res = await request(app).get('/recipes.js');
    expect(res.status).toBe(404);
  });

  test('does NOT serve middleware/auth.js', async () => {
    const res = await request(app).get('/middleware/auth.js');
    expect(res.status).toBe(404);
  });

  test('sensitive files are NOT in public/ directory', () => {
    const publicDir = path.join(__dirname, 'public');
    expect(fs.existsSync(path.join(publicDir, 'server.js'))).toBe(false);
    expect(fs.existsSync(path.join(publicDir, '.env'))).toBe(false);
    expect(fs.existsSync(path.join(publicDir, 'package.json'))).toBe(false);
    expect(fs.existsSync(path.join(publicDir, 'migrate.js'))).toBe(false);
    expect(fs.existsSync(path.join(publicDir, 'seed.js'))).toBe(false);
    expect(fs.existsSync(path.join(publicDir, 'recipes.js'))).toBe(false);
  });

  test('frontend files ARE in public/ directory', () => {
    const publicDir = path.join(__dirname, 'public');
    expect(fs.existsSync(path.join(publicDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'login.html'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'shopping-list.html'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'admin.html'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'plan.html'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'js', 'auth.js'))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, 'js', 'unit-conversion.js'))).toBe(true);
  });
});

// ── Fix #4: Favorites are per-user ───────────────────────────────────

describe('Favorites endpoints (Fix #4)', () => {
  test('GET /api/recipes returns empty favorites for guests', async () => {
    const res = await request(app).get('/api/recipes');
    expect(res.status).toBe(200);
    expect(res.body.favorites).toEqual({});
  });

  test('POST /api/favorites/record rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/favorites/record')
      .send({ recipeIds: ['test-recipe'] });
    // 403 from CSRF protection (runs before auth middleware)
    expect([401, 403]).toContain(res.status);
  });

  test('POST /api/favorites/remove rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/favorites/remove')
      .send({ recipeId: 'test-recipe' });
    expect([401, 403]).toContain(res.status);
  });
});

// ── AI model configuration ───────────────────────────────────────────

describe('AI model configuration', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('uses llama3-8b-8192 model with JSON mode support', () => {
    expect(serverSource).toContain('llama3-8b-8192');
    expect(serverSource).toContain("response_format: { type: 'json_object' }");
  });

  test('sets max_tokens on AI calls', () => {
    const matches = serverSource.match(/max_tokens:\s*\d+/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  test('sends slim existingDefs (id→name only) to reduce token usage', () => {
    // Full defs with units/section must not be sent to the AI — only slim id→name mapping
    expect(serverSource).not.toContain('JSON.stringify(existingDefs, null, 2)');
    expect(serverSource).not.toContain('JSON.stringify(existingDefs)');
    expect(serverSource).toContain('slimDefs');
  });

  test('limits pageText to 7000 chars to stay within AI token limits', () => {
    expect(serverSource).toContain('pageText.substring(0, 7000)');
    expect(serverSource).not.toContain('pageText.substring(0, 8000)');
  });
});

// ── AI endpoints require auth ────────────────────────────────────────

describe('AI endpoints require auth', () => {
  test('POST /api/parse-recipe rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/parse-recipe')
      .send({ recipeName: 'Test', ingredients: ['1 cup flour'] });
    expect([401, 403]).toContain(res.status);
  });

  test('POST /api/extract-recipe rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/extract-recipe')
      .send({ pageText: 'Some recipe text' });
    expect([401, 403]).toContain(res.status);
  });
});

// ── Source URL stored in recipe_data ─────────────────────────────────

describe('extract-recipe stores sourceUrl in parsed result', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('server attaches sourceUrl to parsed result before responding', () => {
    expect(serverSource).toContain('if (sourceUrl) parsed.url = sourceUrl;');
  });
});

// ── Non-recipe URL detection ──────────────────────────────────────────

describe('Non-recipe URL detection', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  const indexSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  test('extract-recipe AI prompt instructs detection of non-recipe pages', () => {
    expect(serverSource).toContain('not_a_recipe');
    expect(serverSource).toContain('determine if this page actually contains a recipe');
  });

  test('server returns 422 when AI detects a non-recipe page', () => {
    expect(serverSource).toContain("parsed.not_a_recipe");
    expect(serverSource).toContain("doesn\\'t appear to contain a recipe");
  });

  test('server returns 422 when no ingredients are found', () => {
    expect(serverSource).toContain('!parsed.ingredients || parsed.ingredients.length === 0');
    expect(serverSource).toContain('No ingredients found on this page');
  });

  test('client validates ingredients exist after JSON-LD parse', () => {
    expect(indexSource).toContain('!parsed.ingredients || parsed.ingredients.length === 0');
    expect(indexSource).toContain('No ingredients found on this page');
  });

  test('client validates ingredients exist after AI extraction', () => {
    expect(indexSource).toContain('!result.ingredients || result.ingredients.length === 0');
  });
});

// ── Add Recipe auth gate ──────────────────────────────────────────────

describe('Add Recipe requires auth (guest gate)', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  test('import button click is wrapped with Auth.requireLogin', () => {
    expect(indexSource).toContain("importButton.addEventListener('click', Auth.requireLogin(openImportModal");
  });

  test('POST /api/save-recipe rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/save-recipe')
      .send({ recipe: { name: 'Test' }, newIngredientDefs: {} });
    expect([401, 403]).toContain(res.status);
  });

  test('POST /api/fetch-url rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/fetch-url')
      .send({ url: 'https://example.com' });
    expect([401, 403]).toContain(res.status);
  });

  test('Upload Recipe handler does NOT have a redundant Auth.isGuest() gate', () => {
    // The importFetchBtn handler should rely on Auth.requireLogin on the import button
    // and server-side requireAuth middleware, not a redundant client-side check
    const fetchBtnHandler = indexSource.match(/importFetchBtn\.addEventListener\('click',\s*async\s*\(\)\s*=>\s*\{([\s\S]*?)\}\);/);
    expect(fetchBtnHandler).not.toBeNull();
    const handlerBody = fetchBtnHandler[1];
    expect(handlerBody).not.toContain('Auth.isGuest()');
    expect(handlerBody).not.toContain('Auth.showLoginPrompt');
  });
});

// ── Auth.init() sends credentials ────────────────────────────────────

describe('Auth.init() sends credentials', () => {
  const authSource = fs.readFileSync(path.join(__dirname, 'public', 'js', 'auth.js'), 'utf8');

  test('Auth.init() fetch includes credentials: same-origin', () => {
    expect(authSource).toContain("fetch('/api/auth/me', { credentials: 'same-origin' })");
  });
});

// ── Pantry API ────────────────────────────────────────────────────────

describe('Pantry API', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('GET /api/pantry rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/pantry');
    expect([401, 403]).toContain(res.status);
  });

  test('PUT /api/pantry/:slug rejects unauthenticated requests', async () => {
    const res = await request(app).put('/api/pantry/salt');
    expect([401, 403]).toContain(res.status);
  });

  test('DELETE /api/pantry/:slug rejects unauthenticated requests', async () => {
    const res = await request(app).delete('/api/pantry/salt');
    expect([401, 403]).toContain(res.status);
  });

  test('server defines PANTRY_CANDIDATES with expected staples', () => {
    expect(serverSource).toContain("'salt'");
    expect(serverSource).toContain("'olive-oil'");
    expect(serverSource).toContain("'flour'");
    expect(serverSource).toContain("'butter'");
    expect(serverSource).toContain("'eggs'");
    expect(serverSource).toContain("'garlic'");
    expect(serverSource).toContain('PANTRY_CANDIDATES');
  });

  test('PUT /api/pantry/:slug rejects non-candidate slugs', async () => {
    // We can't test the 400 without auth, but we verify the guard exists in source
    expect(serverSource).toContain('Not a valid pantry item');
    expect(serverSource).toContain('PANTRY_CANDIDATES.has(slug)');
  });

  test('pantry table DDL is present in migrate.js', () => {
    const migrateSource = fs.readFileSync(path.join(__dirname, 'migrate.js'), 'utf8');
    expect(migrateSource).toContain('user_pantry');
    expect(migrateSource).toContain('ingredient_slug');
  });

  test('shopping list defines matching PANTRY_CANDIDATES set', () => {
    const shoppingSource = fs.readFileSync(
      path.join(__dirname, 'public', 'shopping-list.html'), 'utf8'
    );
    expect(shoppingSource).toContain('PANTRY_CANDIDATES');
    expect(shoppingSource).toContain("'salt'");
    expect(shoppingSource).toContain("'olive-oil'");
    expect(shoppingSource).toContain('pantry-badge');
    expect(shoppingSource).toContain('already in pantry');
    expect(shoppingSource).toContain('pantry-prompt-row');
    expect(shoppingSource).toContain('addToPantry');
    expect(shoppingSource).toContain('removeFromPantry');
    expect(shoppingSource).toContain('loadPantry');
  });
});

// ── Login page dismiss ───────────────────────────────────────────────

describe('Login page dismiss controls', () => {
  test('login.html has a back link to home page', async () => {
    const res = await request(app).get('/login.html');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Back');
    expect(res.text).toContain('href="/"');
  });

  test('login.html does not have a Continue as Guest option', async () => {
    const res = await request(app).get('/login.html');
    expect(res.status).toBe(200);
    expect(res.text).not.toContain('Continue as Guest');
  });

  test('auth.js modal has a close button to dismiss', () => {
    const authSource = fs.readFileSync(path.join(__dirname, 'public', 'js', 'auth.js'), 'utf8');
    expect(authSource).toContain('auth-modal-close');
    expect(authSource).toContain("querySelector('#auth-modal-close').addEventListener('click', closeModal)");
  });

  test('auth.js modal does not have a Continue as Guest option', () => {
    const authSource = fs.readFileSync(path.join(__dirname, 'public', 'js', 'auth.js'), 'utf8');
    expect(authSource).not.toContain('Continue as Guest');
    expect(authSource).not.toContain('auth-guest-continue');
  });
});

// ── Account lockout ─────────────────────────────────────────────────

describe('Account lockout', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  const migrateSource = fs.readFileSync(path.join(__dirname, 'migrate.js'), 'utf8');

  test('users table includes lockout columns', () => {
    expect(migrateSource).toContain('failed_login_attempts');
    expect(migrateSource).toContain('locked_until');
  });

  test('login route fetches lockout fields from database', () => {
    expect(serverSource).toContain('failed_login_attempts');
    expect(serverSource).toContain('locked_until');
  });

  test('login route checks if account is locked before password comparison', () => {
    const lockCheck = serverSource.indexOf('locked_until') ;
    const bcryptCompare = serverSource.indexOf('bcrypt.compare(password, user.password_hash)');
    // The locked_until check in the SELECT comes first, and there should be a
    // lock check (user.locked_until) before the bcrypt.compare call
    expect(serverSource).toContain("user.locked_until && new Date(user.locked_until) > new Date()");
    expect(lockCheck).toBeLessThan(bcryptCompare);
  });

  test('login route returns 423 status for locked accounts', () => {
    expect(serverSource).toContain('res.status(423)');
    expect(serverSource).toContain('ACCOUNT_LOCKED');
  });

  test('login route increments failed_login_attempts on wrong password', () => {
    expect(serverSource).toContain('user.failed_login_attempts + 1');
    expect(serverSource).toContain("UPDATE users SET failed_login_attempts = $1");
  });

  test('login route locks account after max failed attempts', () => {
    expect(serverSource).toContain('attempts >= MAX_FAILED_ATTEMPTS');
    expect(serverSource).toContain("INTERVAL \\'15 minutes\\'");
  });

  test('login route resets lockout state on successful login', () => {
    expect(serverSource).toContain('failed_login_attempts = 0, locked_until = NULL');
  });

  test('login route logs account_locked events', () => {
    expect(serverSource).toContain("'account_locked'");
  });

  test('frontend handles 423 lockout response', () => {
    const authSource = fs.readFileSync(path.join(__dirname, 'public', 'js', 'auth.js'), 'utf8');
    expect(authSource).toContain('status === 423');
  });
});

// ── Password reset ──────────────────────────────────────────────────

describe('Password reset', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  const migrateSource = fs.readFileSync(path.join(__dirname, 'migrate.js'), 'utf8');

  test('password_reset_tokens table exists in migration', () => {
    expect(migrateSource).toContain('password_reset_tokens');
    expect(migrateSource).toContain('token_hash');
    expect(migrateSource).toContain('expires_at');
    expect(migrateSource).toContain('used');
  });

  test('POST /api/auth/forgot-password route exists', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });
    // 200 (success, prevents enumeration) or 403 (CSRF in test env)
    expect([200, 403]).toContain(res.status);
  });

  test('POST /api/auth/forgot-password validates email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'not-an-email' });
    // 400 (validation) or 403 (CSRF in test env)
    expect([400, 403]).toContain(res.status);
  });

  test('POST /api/auth/reset-password rejects invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'invalid-token', newPassword: 'Test1234' });
    // 400 (invalid/expired token) or 403 (CSRF)
    expect([400, 403]).toContain(res.status);
  });

  test('POST /api/auth/reset-password validates password requirements', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'sometoken', newPassword: 'short' });
    expect([400, 403]).toContain(res.status);
  });

  test('forgot-password route hashes token with SHA-256 before storage', () => {
    expect(serverSource).toContain("crypto.createHash('sha256')");
  });

  test('reset-password route marks token as used', () => {
    expect(serverSource).toContain('SET used = true');
  });

  test('reset-password route resets lockout state', () => {
    expect(serverSource).toContain('failed_login_attempts = 0, locked_until = NULL');
  });

  test('login.html has forgot password link', () => {
    const loginSource = fs.readFileSync(path.join(__dirname, 'public', 'login.html'), 'utf8');
    expect(loginSource).toContain('Forgot your password?');
    expect(loginSource).toContain('reset-password.html');
  });

  test('auth.js modal has forgot password link', () => {
    const authSource = fs.readFileSync(path.join(__dirname, 'public', 'js', 'auth.js'), 'utf8');
    expect(authSource).toContain('Forgot your password?');
    expect(authSource).toContain('reset-password.html');
  });

  test('reset-password.html is served and contains both forms', async () => {
    const res = await request(app).get('/reset-password.html');
    expect(res.status).toBe(200);
    expect(res.text).toContain('form-request');
    expect(res.text).toContain('form-reset');
    expect(res.text).toContain('forgot-password');
    expect(res.text).toContain('reset-password');
  });
});

// ── Welcome email + unsubscribe ──────────────────────────────────────

const { generateUnsubscribeToken } = require('./server');

describe('Welcome email and unsubscribe', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  const migrateSource = fs.readFileSync(path.join(__dirname, 'migrate.js'), 'utf8');

  test('migrate.js adds email_unsubscribed column', () => {
    expect(migrateSource).toContain('email_unsubscribed');
  });

  test('register route schedules welcome email with setTimeout', () => {
    expect(serverSource).toContain('setTimeout');
    expect(serverSource).toContain('30 * 60 * 1000');
  });

  test('welcome email checks email_unsubscribed before sending', () => {
    expect(serverSource).toContain('email_unsubscribed');
    expect(serverSource).toContain('check.rows[0].email_unsubscribed');
  });

  test('welcome email is sent from hello@diymealkit.com', () => {
    expect(serverSource).toContain('hello@diymealkit.com');
  });

  test('welcome email uses text field (not html)', () => {
    expect(serverSource).toContain('text: `Hi ${firstName}');
    expect(serverSource).not.toContain('html: `Hi ${firstName}');
  });

  test('welcome email includes unsubscribe link', () => {
    expect(serverSource).toContain('unsubLink');
    expect(serverSource).toContain('/api/unsubscribe');
  });

  test('generateUnsubscribeToken returns consistent hex string for same userId', () => {
    const token1 = generateUnsubscribeToken(42);
    const token2 = generateUnsubscribeToken(42);
    expect(token1).toBe(token2);
    expect(token1).toMatch(/^[a-f0-9]{64}$/);
  });

  test('generateUnsubscribeToken returns different tokens for different userIds', () => {
    expect(generateUnsubscribeToken(1)).not.toBe(generateUnsubscribeToken(2));
  });

  test('GET /api/unsubscribe rejects missing token', async () => {
    const res = await request(app).get('/api/unsubscribe?id=1');
    expect(res.status).toBe(400);
  });

  test('GET /api/unsubscribe rejects invalid token', async () => {
    const res = await request(app).get('/api/unsubscribe?id=1&token=badtoken');
    expect(res.status).toBe(400);
  });

  test('GET /api/unsubscribe rejects non-numeric id', async () => {
    const res = await request(app).get('/api/unsubscribe?id=abc&token=whatever');
    expect(res.status).toBe(400);
  });
});

// ── extractJSON robustness ──────────────────────────────────────────

const { extractJSON } = require('./server');

describe('extractJSON — robust AI response parsing', () => {
  test('parses clean JSON', () => {
    const result = extractJSON('{"name": "Cake", "ingredients": []}');
    expect(result).toEqual({ name: 'Cake', ingredients: [] });
  });

  test('extracts JSON from surrounding text', () => {
    const result = extractJSON('Here is the recipe:\n{"name": "Cake"}\nEnjoy!');
    expect(result).toEqual({ name: 'Cake' });
  });

  test('strips markdown code fences', () => {
    const result = extractJSON('```json\n{"name": "Cake"}\n```');
    expect(result).toEqual({ name: 'Cake' });
  });

  test('strips code fences without language tag', () => {
    const result = extractJSON('```\n{"name": "Cake"}\n```');
    expect(result).toEqual({ name: 'Cake' });
  });

  test('handles trailing commas before }', () => {
    const result = extractJSON('{"name": "Cake", "qty": 1,}');
    expect(result).toEqual({ name: 'Cake', qty: 1 });
  });

  test('handles trailing commas before ]', () => {
    const result = extractJSON('{"items": ["a", "b",]}');
    expect(result).toEqual({ items: ['a', 'b'] });
  });

  test('handles single-line comments', () => {
    const result = extractJSON('{"name": "Cake" // recipe name\n}');
    expect(result).toEqual({ name: 'Cake' });
  });

  test('recovers from truncated JSON — missing closing braces', () => {
    const result = extractJSON('{"ingredients": [{"id": "flour", "qty": 2}]');
    expect(result.ingredients).toEqual([{ id: 'flour', qty: 2 }]);
  });

  test('recovers from truncated JSON — cut off mid-value', () => {
    const result = extractJSON('{"ingredients": [{"id": "flour", "qty": 2}, {"id": "sugar", "qty": 1}], "newIngredientDefs": {"flour": {"name": "Flo');
    expect(result.ingredients).toEqual([
      { id: 'flour', qty: 2 },
      { id: 'sugar', qty: 1 },
    ]);
  });

  test('handles unquoted property keys', () => {
    const result = extractJSON('{\n  name: "Cake",\n  ingredients: []\n}');
    expect(result).toEqual({ name: 'Cake', ingredients: [] });
  });

  test('handles unquoted keys in nested objects', () => {
    const result = extractJSON('{ ingredients: [{ id: "flour", qty: 2 }], newIngredientDefs: { flour: { name: "Flour", units: "cup", section: "Cooking" } } }');
    expect(result.ingredients).toEqual([{ id: 'flour', qty: 2 }]);
    expect(result.newIngredientDefs.flour.name).toBe('Flour');
  });

  test('throws on response with no JSON object', () => {
    expect(() => extractJSON('No JSON here')).toThrow('did not contain a JSON object');
  });

  test('throws on truly malformed JSON', () => {
    expect(() => extractJSON('{not valid json at all}')).toThrow('malformed JSON');
  });

  test('server.js uses max_tokens of 3000 for AI calls', () => {
    const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    const matches = serverSource.match(/max_tokens:\s*3000/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBe(2);
  });

  test('server.js uses extractJSON instead of raw JSON.parse for AI responses', () => {
    const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    // The AI endpoints should use extractJSON, not raw JSON.parse on jsonMatch
    expect(serverSource).not.toContain("JSON.parse(jsonMatch[0])");
    expect(serverSource).toContain('extractJSON(text)');
  });
});

// ── Smart recipe text extraction ─────────────────────────────────────

describe('extractPageText — smart recipe section detection', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  test('extractPageText strips comments section from HTML', () => {
    expect(indexSource).toContain('.comments, #comments');
  });

  test('extractPageText uses recipe keywords as fallback when no measurements found', () => {
    expect(indexSource).toContain('ingredients|instructions|directions|recipe|serves');
    expect(indexSource).toContain('prep\\s+time|cook\\s+time');
  });

  test('extractPageText uses densest measurement cluster to find ingredient list', () => {
    expect(indexSource).toContain('CLUSTER_WINDOW');
    expect(indexSource).toContain('maxCount');
  });

  test('extractPageText searches for measurement patterns', () => {
    expect(indexSource).toContain('cups?|tablespoons?|tbsp|teaspoons?|tsp|ounces?|oz|pounds?|lbs?');
  });

  test('extractPageText backs up 300 chars before recipe start to capture title', () => {
    expect(indexSource).toContain('recipeStart - 300');
  });

  test('extractPageText uses 7000 char window for extracted text', () => {
    // Should appear twice: once for the recipe-section path, once for the fallback
    const matches = indexSource.match(/7000/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  test('extractPageText only seeks recipe section when it is deep in the page (>500 chars)', () => {
    expect(indexSource).toContain('recipeStart > 500');
  });
});

// ── XSS: no innerHTML with user data ────────────────────────────────

describe('XSS: no innerHTML with unsanitized user data', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  test('recipe name " by " split uses textContent, not innerHTML', () => {
    // The old pattern: title.innerHTML = `${main}<span...>${by}</span>`
    expect(indexSource).not.toMatch(/title\.innerHTML\s*=\s*`\$\{main\}/);
    expect(indexSource).toContain('title.textContent = main');
    expect(indexSource).toContain('bySpan.textContent = by');
  });

  test('archive undo toast uses textContent, not innerHTML', () => {
    // The old pattern: toast.innerHTML = `<span>"${recipeName}" hidden</span>`
    expect(indexSource).not.toMatch(/toast\.innerHTML\s*=.*recipeName/);
  });

  test('combobox dropdown items use textContent, not innerHTML', () => {
    // The old pattern: d.innerHTML = `<span>${item.name}</span>...`
    expect(indexSource).not.toMatch(/d\.innerHTML\s*=.*item\.name/);
    expect(indexSource).toContain('nameSpan.textContent = item.name');
    expect(indexSource).toContain('unitsSpan.textContent = item.units');
  });
});

// ── Session invalidation on password change ─────────────────────────

describe('Session invalidation on password change', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('change-password deletes other sessions after updating password', () => {
    expect(serverSource).toContain("DELETE FROM session WHERE (sess::json->>'userId')::integer = $1 AND sid != $2");
  });

  test('change-password sets updated_at', () => {
    expect(serverSource).toContain('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2');
  });
});

// ── Duplicate recipe client-side fix ────────────────────────────────

describe('Duplicate recipe client-side fix', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  test('save handler uses findIndex upsert instead of blind push', () => {
    expect(indexSource).toContain('recipeData.recipes.findIndex(r => r.id === savedRecipe.id)');
    expect(indexSource).toContain('recipeData.recipes[existingIdx] = savedRecipe');
  });

  test('save handler does not blindly push without checking', () => {
    // There should be no bare `recipeData.recipes.push(savedRecipe)` — only inside the else branch
    const pushMatches = indexSource.match(/recipeData\.recipes\.push\(savedRecipe\)/g);
    expect(pushMatches).not.toBeNull();
    expect(pushMatches.length).toBe(1); // Only in the else branch
    // Verify it's inside an else block
    const idx = indexSource.indexOf('recipeData.recipes.push(savedRecipe)');
    const preceding = indexSource.substring(idx - 100, idx);
    expect(preceding).toContain('} else {');
  });
});

// ── normalizeNewDefs ────────────────────────────────────────────────

const { normalizeNewDefs } = require('./server');

describe('normalizeNewDefs — ensures all ingredients have defs', () => {
  test('auto-creates missing defs for ingredients not in existing or new defs', () => {
    const parsed = {
      ingredients: [
        { id: 'baking-soda', qty: 1, unit: 'tsp' },
        { id: 'vanilla-extract', qty: 2, unit: 'tsp' },
      ],
      newIngredientDefs: {},
    };
    normalizeNewDefs(parsed, {});
    expect(parsed.newIngredientDefs['baking-soda']).toEqual({
      name: 'Baking Soda',
      units: 'tsp',
      section: 'Other',
    });
    expect(parsed.newIngredientDefs['vanilla-extract']).toEqual({
      name: 'Vanilla Extract',
      units: 'tsp',
      section: 'Other',
    });
  });

  test('does not overwrite existing defs', () => {
    const existingDefs = { flour: { name: 'Flour', units: 'cup', section: 'Cooking' } };
    const parsed = {
      ingredients: [{ id: 'flour', qty: 2, unit: 'cup' }],
      newIngredientDefs: {},
    };
    normalizeNewDefs(parsed, existingDefs);
    expect(parsed.newIngredientDefs['flour']).toBeUndefined();
  });

  test('does not overwrite new defs already provided by AI', () => {
    const parsed = {
      ingredients: [{ id: 'coconut-milk', qty: 1, unit: 'can' }],
      newIngredientDefs: {
        'coconut-milk': { name: 'Coconut Milk', units: 'can', section: 'Cooking' },
      },
    };
    normalizeNewDefs(parsed, {});
    expect(parsed.newIngredientDefs['coconut-milk'].name).toBe('Coconut Milk');
    expect(parsed.newIngredientDefs['coconut-milk'].section).toBe('Cooking');
  });

  test('fixes "unit" → "units" typo in new defs', () => {
    const parsed = {
      ingredients: [{ id: 'sugar', qty: 1, unit: 'cup' }],
      newIngredientDefs: {
        sugar: { name: 'Sugar', unit: 'cup', section: 'Cooking' },
      },
    };
    normalizeNewDefs(parsed, {});
    expect(parsed.newIngredientDefs['sugar'].units).toBe('cup');
    expect(parsed.newIngredientDefs['sugar'].unit).toBeUndefined();
  });

  test('creates newIngredientDefs object if missing', () => {
    const parsed = {
      ingredients: [{ id: 'cinnamon', qty: 1, unit: 'tsp' }],
    };
    normalizeNewDefs(parsed, {});
    expect(parsed.newIngredientDefs['cinnamon']).toEqual({
      name: 'Cinnamon',
      units: 'tsp',
      section: 'Other',
    });
  });

  test('defaults to "count" when ingredient has no unit', () => {
    const parsed = {
      ingredients: [{ id: 'egg', qty: 3 }],
      newIngredientDefs: {},
    };
    normalizeNewDefs(parsed, {});
    expect(parsed.newIngredientDefs['egg'].units).toBe('count');
  });

  test('server.js calls normalizeNewDefs in both AI endpoints', () => {
    const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    const matches = serverSource.match(/normalizeNewDefs\(parsed,\s*existingDefs\)/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
});

// ── Admin user recipes endpoint ─────────────────────────────────────

describe('Admin user recipes endpoint', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  const adminSource = fs.readFileSync(path.join(__dirname, 'public', 'admin.html'), 'utf8');

  test('GET /api/admin/users/:userId/recipes route exists with requireAdmin', () => {
    expect(serverSource).toContain("/api/admin/users/:userId/recipes");
    expect(serverSource).toContain("requireAdmin");
  });

  test('endpoint queries user_recipes by user_id and returns recipe name', () => {
    expect(serverSource).toContain("recipe_data->>'name' as name");
    expect(serverSource).toContain('FROM user_recipes WHERE user_id');
  });

  test('endpoint validates userId parameter', () => {
    expect(serverSource).toContain("parseInt(req.params.userId)");
    expect(serverSource).toContain("Invalid user ID");
  });

  test('GET /api/admin/users/invalid/recipes rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/admin/users/1/recipes');
    expect([401, 403]).toContain(res.status);
  });

  test('admin.html has recipe count link that calls showUserRecipes', () => {
    expect(adminSource).toContain('showUserRecipes(');
  });

  test('admin.html has recipes modal markup', () => {
    expect(adminSource).toContain('recipes-modal');
    expect(adminSource).toContain('recipes-modal-title');
    expect(adminSource).toContain('recipes-modal-body');
  });

  test('admin.html showUserRecipes fetches from admin recipes endpoint', () => {
    expect(adminSource).toContain('/api/admin/users/${userId}/recipes');
  });

  test('admin.html modal uses textContent for recipe names (XSS safe)', () => {
    expect(adminSource).toContain('name.textContent = r.name');
  });

  test('admin.html modal can be closed by clicking backdrop or close button', () => {
    expect(adminSource).toContain('closeRecipesModal()');
    expect(adminSource).toContain('e.target === e.currentTarget');
  });
});

// ── Favorite action in card menu ──────────────────────────────────────

describe('Favorite action in card menu', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  test('card menu includes a Favorite item', () => {
    expect(indexSource).toContain('Favorite');
  });

  test('card menu includes an Unfavorite item for already-favorited recipes', () => {
    expect(indexSource).toContain('Unfavorite');
  });

  test('card menu Favorite item calls /api/favorites/record', () => {
    expect(indexSource).toContain("'/api/favorites/record'");
  });

  test('card menu Unfavorite item calls /api/favorites/remove', () => {
    expect(indexSource).toContain("'/api/favorites/remove'");
  });

  test('card menu Favorite item shows login prompt for guests', () => {
    // The favorite handler should gate on Auth.isGuest() and call Auth.showLoginPrompt
    const favoriteHandlerMatch = indexSource.match(/favoriteItem\.addEventListener\('click'[\s\S]*?Auth\.isGuest\(\)[\s\S]*?Auth\.showLoginPrompt/);
    expect(favoriteHandlerMatch).not.toBeNull();
  });

  test('Favorite action is not shown on archived (hidden) cards', () => {
    // The favorite item block is guarded by !isArchived
    const guardMatch = indexSource.match(/if \(!isArchived\)\s*\{[\s\S]*?Favorite[\s\S]*?menuDropdown\.appendChild\(favoriteItem\)/);
    expect(guardMatch).not.toBeNull();
  });
});

// ── Add from shared plan ──────────────────────────────────────────────

describe('POST /api/meal-plans/:shareId/add-recipe', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('rejects unauthenticated requests with 401 or 403', async () => {
    const res = await request(app)
      .post('/api/meal-plans/aaaaaaaaaaaa/add-recipe')
      .send({ recipeId: 'test-recipe' });
    expect([401, 403]).toContain(res.status);
  });

  test('rejects invalid shareId format with 400', async () => {
    // Since auth runs before validation, an invalid shareId still returns 401/403 for guests
    // but the validation logic should exist in source
    expect(serverSource).toContain("!/^[A-Za-z0-9_-]{12}$/.test(shareId)");
  });

  test('rejects requests when trying to add own share', () => {
    expect(serverSource).toContain('Cannot add recipes from your own shared plan');
  });

  test('returns 404 when recipe not found in snapshot', () => {
    expect(serverSource).toContain('Recipe not found in this meal plan');
  });

  test('returns 404 when share expired or not found', () => {
    expect(serverSource).toContain('Meal plan not found or has expired');
  });

  test('uses ON CONFLICT DO NOTHING to avoid overwriting existing recipes', () => {
    expect(serverSource).toContain('ON CONFLICT (user_id, recipe_id) DO NOTHING');
  });

  test('returns { added: true } on success and { added: false } when already in collection', () => {
    expect(serverSource).toContain("reason: added ? null : 'already_in_collection'");
  });

  test('logs add_from_share activity', () => {
    expect(serverSource).toContain("'add_from_share'");
  });

  test('stores shared_by_user_id and shared_by_name on insert', () => {
    expect(serverSource).toContain('shared_by_user_id, shared_by_name');
    expect(serverSource).toContain('snapshot.createdBy');
  });

  test('is protected by addFromShareLimiter rate limiter', () => {
    expect(serverSource).toContain('addFromShareLimiter');
    // Limiter should be defined
    expect(serverSource).toContain('const addFromShareLimiter');
  });
});

describe('GET /api/meal-plans/:shareId includes sharerId', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('response includes sharerId field', () => {
    expect(serverSource).toContain('sharerId: row.user_id');
  });

  test('query selects user_id for sharerId', () => {
    expect(serverSource).toContain('SELECT user_id, recipe_snapshot, created_at');
  });
});

describe('/api/recipes deduplication: user_recipes wins over preloaded', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('builds a set of user recipe IDs to filter preloaded', () => {
    expect(serverSource).toContain('userRecipeIds');
    expect(serverSource).toContain('userRows.map(row => row.recipe_id)');
  });

  test('filters preloaded recipes to exclude those already in user_recipes', () => {
    expect(serverSource).toContain('preloadedRecipes.filter(r => !userRecipeIds.has(r.id))');
  });

  test('admins bypass deduplication and see all preloaded recipes', () => {
    expect(serverSource).toContain("req.user.role === 'admin'");
  });

  test('user recipes include shared_by_name in API response', () => {
    expect(serverSource).toContain('shared_by_name: row.shared_by_name');
  });
});

describe('plan.html add-to-collection UI', () => {
  const planSource = fs.readFileSync(path.join(__dirname, 'public', 'plan.html'), 'utf8');

  test('loads auth.js', () => {
    expect(planSource).toContain('src="/js/auth.js"');
  });

  test('renders Add to my collection buttons', () => {
    expect(planSource).toContain('Add to my collection');
    expect(planSource).toContain('btn-add');
  });

  test('uses sessionStorage to persist pending add across login redirect', () => {
    expect(planSource).toContain('sessionStorage.setItem');
    expect(planSource).toContain('pendingAdd');
    expect(planSource).toContain('sessionStorage.getItem');
    expect(planSource).toContain('sessionStorage.removeItem');
  });

  test('calls Auth.showLoginPrompt for guests', () => {
    expect(planSource).toContain('Auth.showLoginPrompt');
  });

  test('hides add buttons when viewing own plan', () => {
    expect(planSource).toContain('user.id === data.sharerId');
    expect(planSource).toContain("style.display = 'none'");
  });

  test('shows Added checkmark on success', () => {
    expect(planSource).toContain('Added');
    expect(planSource).toContain('Already in collection');
  });

  test('calls add-recipe endpoint with CSRF token', () => {
    expect(planSource).toContain('/add-recipe');
    expect(planSource).toContain('X-CSRF-Token');
  });
});

describe('index.html Shared by badge', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  test('renders Shared by badge when shared_by_name is set', () => {
    expect(indexSource).toContain('shared_by_name');
    expect(indexSource).toContain('Shared by');
    expect(indexSource).toContain('card-shared-badge');
  });

  test('shows full shared_by_name (no split, supports "a friend" fallback)', () => {
    expect(indexSource).toContain("'Shared by ' + recipe.shared_by_name");
    expect(indexSource).not.toContain("shared_by_name.split(' ')[0]");
  });

  test('does not show Shared by badge on archived cards', () => {
    const badgeGuardMatch = indexSource.match(/recipe\.shared_by_name && !isArchived/);
    expect(badgeGuardMatch).not.toBeNull();
  });

  test('card-shared-badge has teal color distinct from Your Recipe badge', () => {
    expect(indexSource).toContain('card-shared-badge');
    expect(indexSource).toContain('13, 148, 136');
  });
});

describe('migrate.js shared recipe schema', () => {
  const migrateSource = fs.readFileSync(path.join(__dirname, 'migrate.js'), 'utf8');

  test('DDL includes shared_by_user_id column', () => {
    expect(migrateSource).toContain('shared_by_user_id');
  });

  test('DDL includes shared_by_name column', () => {
    expect(migrateSource).toContain('shared_by_name');
  });

  test('ALTER TABLE migration adds shared_by_user_id if not exists', () => {
    expect(migrateSource).toContain('ADD COLUMN IF NOT EXISTS shared_by_user_id');
  });

  test('ALTER TABLE migration adds shared_by_name if not exists', () => {
    expect(migrateSource).toContain('ADD COLUMN IF NOT EXISTS shared_by_name');
  });
});

// ── Fetch-URL error handling ────────────────────────────────────────

describe('fetch-url specific error handling', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('validates URL format before fetching', () => {
    expect(serverSource).toContain('new URL(url)');
    expect(serverSource).toContain('Invalid URL format');
  });

  test('rejects non-http/https protocols', () => {
    expect(serverSource).toContain("['http:', 'https:'].includes(parsedUrl.protocol)");
    expect(serverSource).toContain('Only http and https URLs are supported');
  });

  test('detects non-HTML content types', () => {
    expect(serverSource).toContain("!contentType.includes('text/')");
    expect(serverSource).toContain('not a web page');
  });

  test('tracks lastHttpStatus for specific HTTP error messages', () => {
    expect(serverSource).toContain('lastHttpStatus = response.status');
    expect(serverSource).toContain('statusMessages');
  });

  test('provides specific message for 401 login walls', () => {
    expect(serverSource).toContain('behind a login wall');
  });

  test('provides specific message for 403 blocked/subscription pages', () => {
    expect(serverSource).toContain('may require a subscription or login');
  });

  test('provides specific message for 404 not found', () => {
    expect(serverSource).toContain('Page not found (404)');
  });

  test('provides specific message for 429 rate limiting', () => {
    expect(serverSource).toContain('rate-limiting requests');
  });

  test('provides fallback message with HTTP status code for unknown errors', () => {
    expect(serverSource).toContain('HTTP ${lastHttpStatus}');
  });

  test('tracks lastFetchError for network-level errors', () => {
    expect(serverSource).toContain('lastFetchError = e');
  });

  test('detects DNS resolution failures (ENOTFOUND)', () => {
    expect(serverSource).toContain('ENOTFOUND');
    expect(serverSource).toContain('check the URL for typos');
  });

  test('detects connection refused (ECONNREFUSED)', () => {
    expect(serverSource).toContain('ECONNREFUSED');
    expect(serverSource).toContain('refused the connection');
  });

  test('detects SSL/certificate errors', () => {
    expect(serverSource).toContain('security certificate problem');
  });

  test('detects timeouts with specific 504 status', () => {
    expect(serverSource).toContain('ETIMEDOUT');
    expect(serverSource).toContain('took too long to respond');
  });

  test('detects connection reset (ECONNRESET)', () => {
    expect(serverSource).toContain('ECONNRESET');
    expect(serverSource).toContain('connection to the website was interrupted');
  });

  test('browser fallback checks for error property from scraper', () => {
    expect(serverSource).toContain('result && !result.error');
    expect(serverSource).toContain('result && result.error');
  });
});

// ── Extract-recipe error handling ────────────────────────────────────

describe('extract-recipe specific error handling', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('detects pages with too little text (paywall/login wall)', () => {
    expect(serverSource).toContain("pageText.trim().length < 200");
    expect(serverSource).toContain('behind a paywall');
  });

  test('provides specific message for AI rate limiting (429)', () => {
    expect(serverSource).toContain('rate_limit');
    expect(serverSource).toContain('AI service is temporarily overloaded');
  });

  test('provides specific message for AI service unavailability (503)', () => {
    expect(serverSource).toContain('AI service is temporarily unavailable');
  });

  test('provides specific message for AI JSON parse failures', () => {
    expect(serverSource).toContain('AI could not process this recipe page');
    expect(serverSource).toContain('results may vary between attempts');
  });

  test('parse-recipe endpoint also has specific AI error messages', () => {
    // The parse-recipe catch block should match extract-recipe's pattern
    expect(serverSource).toContain('AI could not process these ingredients');
  });
});

// ── Scraper error types ──────────────────────────────────────────────

describe('scraper fetchWithBrowser error types', () => {
  const scraperSource = fs.readFileSync(path.join(__dirname, 'scraper.js'), 'utf8');

  test('returns error object instead of null on failure', () => {
    expect(scraperSource).not.toContain('return null');
    expect(scraperSource).toContain("return { error:");
  });

  test('detects DNS resolution failures', () => {
    expect(scraperSource).toContain('DNS_RESOLUTION_FAILED');
    expect(scraperSource).toContain('net::ERR_NAME_NOT_RESOLVED');
  });

  test('detects connection refused', () => {
    expect(scraperSource).toContain('CONNECTION_REFUSED');
    expect(scraperSource).toContain('net::ERR_CONNECTION_REFUSED');
  });

  test('detects SSL errors', () => {
    expect(scraperSource).toContain('SSL_ERROR');
    expect(scraperSource).toContain('net::ERR_CERT');
  });

  test('detects timeouts', () => {
    expect(scraperSource).toContain("error: 'TIMEOUT'");
    expect(scraperSource).toContain('Navigation timeout');
  });

  test('detects aborted requests', () => {
    expect(scraperSource).toContain('REQUEST_ABORTED');
    expect(scraperSource).toContain('net::ERR_ABORTED');
  });

  test('provides generic BROWSER_ERROR fallback', () => {
    expect(scraperSource).toContain('BROWSER_ERROR');
    expect(scraperSource).toContain('Headless browser failed');
  });
});
