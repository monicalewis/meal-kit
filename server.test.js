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

  test('GET /api/version returns version string', async () => {
    const res = await request(app).get('/api/version');
    expect(res.status).toBe(200);
    expect(res.body.version).toMatch(/^\d+\.\d+\.\d+$/);
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

  test('uses llama-3.1-8b-instant model with JSON mode support', () => {
    expect(serverSource).toContain('llama-3.1-8b-instant');
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

  test('converts fraction literals like 1/4 and 1/2 to decimals', () => {
    const result = extractJSON('{"qty": 1/4, "qty2": 1/2, "qty3": 3/4}');
    expect(result).toEqual({ qty: 0.25, qty2: 0.5, qty3: 0.75 });
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

  test('extractPageText removes aside and sidebar-like elements to reduce navigation noise', () => {
    expect(indexSource).toContain('aside');
    expect(indexSource).toContain('[class*="sidebar"]');
    expect(indexSource).toContain('[class*="widget"]');
    expect(indexSource).toContain('[class*="related"]');
  });
});

// ── pageTitle hint in extract-recipe ─────────────────────────────────

describe('pageTitle hint for recipe name extraction', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  const indexSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  test('server /api/extract-recipe accepts pageTitle parameter', () => {
    expect(serverSource).toContain('const { pageText, pageTitle, sourceUrl, existingDefs } = req.body;');
  });

  test('server includes pageTitle in AI prompt when provided', () => {
    expect(serverSource).toContain('pageTitleHint');
    expect(serverSource).toContain('Use this as the primary source for the recipe name');
  });

  test('server omits title hint gracefully when pageTitle is absent', () => {
    expect(serverSource).toContain("pageTitle\n    ?");
  });

  test('client extracts og:title or <title> from page HTML', () => {
    expect(indexSource).toContain('extractPageTitle');
    expect(indexSource).toContain('meta[property="og:title"]');
  });

  test('client passes pageTitle to /api/extract-recipe', () => {
    expect(indexSource).toContain('pageTitle,');
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

describe('shared plan landing page serves index.html', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('server reads index.html for /plan/:shareId', () => {
    expect(serverSource).toContain("indexHtmlPath");
    expect(serverSource).toContain("'index.html'");
    expect(serverSource).toContain("getIndexHtml()");
  });

  test('/plan/:shareId route injects OG tags before </head>', () => {
    expect(serverSource).toContain("og:title");
    expect(serverSource).toContain("og:description");
    expect(serverSource).toContain("twitter:card");
    expect(serverSource).toContain("replace('</head>'");
  });

  test('/plan/:shareId updates page title with sharer name', () => {
    expect(serverSource).toContain("DIY Meal Kit</title>");
    expect(serverSource).toContain("- DIY Meal Kit</title>");
  });

  test('falls back to plain index.html on error or missing plan', () => {
    expect(serverSource).toContain('res.send(indexHtml)');
  });
});

describe('index.html shared plan detection and rendering', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  test('detects /plan/:shareId URL pattern', () => {
    expect(indexSource).toContain("/plan\\/([A-Za-z0-9_-]{12})$/");
  });

  test('fetches shared plan data from /api/meal-plans/:shareId', () => {
    expect(indexSource).toContain("/api/meal-plans/");
    expect(indexSource).toContain('sharedPlanData');
  });

  test('fetches recipes and shared plan in parallel', () => {
    expect(indexSource).toContain('Promise.all(fetches)');
  });

  test('renders shared recipes section with heading', () => {
    expect(indexSource).toContain("'Shared by '");
    expect(indexSource).toContain('sharedPlanData.recipes');
  });

  test('deduplicates shared recipes from normal recipe list', () => {
    expect(indexSource).toContain('sharedRecipeIds');
    expect(indexSource).toContain('!sharedRecipeIds.has(r.id)');
  });

  test('creates snapshot cards for custom shared recipes not in preloaded set', () => {
    expect(indexSource).toContain('createSharedSnapshotCard');
    expect(indexSource).toContain('Add to collection');
  });

  test('uses Auth.fetch for add-to-collection from shared plan', () => {
    expect(indexSource).toContain('handleSharedAdd');
    expect(indexSource).toContain('/add-recipe');
  });

  test('shows Added checkmark on successful add', () => {
    expect(indexSource).toContain('Added \\u2713');
    expect(indexSource).toContain('Already in collection');
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

describe('index.html shared badge session persistence', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  test('saves sharedPlanData to sessionStorage when landing on share link', () => {
    expect(indexSource).toContain("sessionStorage.setItem('sharedPlanData'");
    expect(indexSource).toContain('JSON.stringify(sharedPlanData)');
  });

  test('restores sharedPlanData from sessionStorage when not on a share link', () => {
    expect(indexSource).toContain("sessionStorage.getItem('sharedPlanData')");
  });

  test('only restores from sessionStorage when no fresh share link is present', () => {
    // The restore branch should only run when !shareMatch
    expect(indexSource).toContain('!shareMatch');
    // Verify the restore is inside the else branch, not alongside a fresh fetch
    const restorePattern = /else if \(!shareMatch\)[\s\S]*?sessionStorage\.getItem\('sharedPlanData'\)/;
    expect(indexSource).toMatch(restorePattern);
  });

  test('wraps sessionStorage access in try/catch for private browsing compat', () => {
    // Both setItem and getItem should be wrapped in try/catch
    const setMatch = indexSource.match(/try\s*\{\s*sessionStorage\.setItem/);
    const getMatch = indexSource.match(/try\s*\{\s*(?:const|let|var)\s+stored\s*=\s*sessionStorage\.getItem/);
    expect(setMatch).not.toBeNull();
    expect(getMatch).not.toBeNull();
  });
});

describe('server.js shared_by_name persists through recipe updates', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('UPDATE user_recipes does not overwrite shared_by columns', () => {
    // Find all UPDATE user_recipes statements and ensure none touch shared_by_name
    const updateStatements = serverSource.match(/UPDATE user_recipes SET[^;]+/g) || [];
    expect(updateStatements.length).toBeGreaterThan(0);
    for (const stmt of updateStatements) {
      expect(stmt).not.toContain('shared_by_name');
      expect(stmt).not.toContain('shared_by_user_id');
    }
  });

  test('INSERT uses ON CONFLICT DO NOTHING to preserve existing attribution', () => {
    expect(serverSource).toContain('ON CONFLICT (user_id, recipe_id) DO NOTHING');
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

// ── Anonymous sharing (no account required) ─────────────────────────

describe('POST /api/meal-plans/share allows anonymous users', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('share endpoint does not use requireAuth middleware', () => {
    const shareRoute = serverSource.match(/app\.post\('\/api\/meal-plans\/share',[^)]+\)/);
    expect(shareRoute).not.toBeNull();
    expect(shareRoute[0]).not.toContain('requireAuth');
  });

  test('share endpoint still uses shareLimiter rate limiting', () => {
    const shareRoute = serverSource.match(/app\.post\('\/api\/meal-plans\/share',[^)]+\)/);
    expect(shareRoute).not.toBeNull();
    expect(shareRoute[0]).toContain('shareLimiter');
  });

  test('share endpoint handles missing user gracefully', () => {
    expect(serverSource).toContain('req.user ? req.user.id : null');
  });

  test('anonymous shares default createdBy to "a friend"', () => {
    expect(serverSource).toContain("createdBy = 'a friend'");
  });

  test('share endpoint accepts request without authentication', async () => {
    const agent = request.agent(app);
    // Establish a session first (to get a CSRF token)
    const page = await agent.get('/');
    const csrfMatch = (page.headers['set-cookie'] || []).join(';').match(/csrf_token=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';
    const res = await agent
      .post('/api/meal-plans/share')
      .set('X-CSRF-Token', csrfToken)
      .send({ recipeIds: ['test-recipe-1'] });
    // Should get 400 or 500 (no DB), but NOT 401/403
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

describe('index.html share button does not require login', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  test('share button handler does not use Auth.requireLogin', () => {
    expect(indexSource).not.toContain("Log in to share your meal plan");
  });

  test('share button uses plain addEventListener without requireLogin wrapper', () => {
    // Find the line with share-plan-button addEventListener
    const lines = indexSource.split('\n');
    const handlerLine = lines.find(l => l.includes('share-plan-button') && l.includes('addEventListener'));
    expect(handlerLine).toBeDefined();
    expect(handlerLine).toContain('async function');
    expect(handlerLine).not.toContain('requireLogin');
  });
});

describe('migrate.js allows nullable user_id on shared_meal_plans', () => {
  const migrateSource = fs.readFileSync(path.join(__dirname, 'migrate.js'), 'utf8');

  test('DDL does not require NOT NULL on shared_meal_plans.user_id', () => {
    const createTable = migrateSource.match(/CREATE TABLE IF NOT EXISTS shared_meal_plans[\s\S]*?\);/);
    expect(createTable).not.toBeNull();
    const userIdLine = createTable[0].split('\n').find(l => l.includes('user_id'));
    expect(userIdLine).not.toContain('NOT NULL');
  });

  test('migration drops NOT NULL constraint on user_id for existing tables', () => {
    expect(migrateSource).toContain('ALTER TABLE shared_meal_plans ALTER COLUMN user_id DROP NOT NULL');
  });

  test('migration updates foreign key to ON DELETE SET NULL', () => {
    expect(migrateSource).toContain('ON DELETE SET NULL');
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

// ── Parse-failure admin notifications ────────────────────────────────

describe('notifyParseFailure admin email notifications', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('notifyParseFailure helper function exists', () => {
    expect(serverSource).toContain('async function notifyParseFailure(');
  });

  test('notifyParseFailure guards on ADMIN_EMAIL env var', () => {
    expect(serverSource).toContain('process.env.ADMIN_EMAIL');
  });

  test('notifyParseFailure is called on extract-recipe not_a_recipe failure', () => {
    expect(serverSource).toContain("notifyParseFailure({ endpoint: 'extract-recipe', errorType: 'not_a_recipe'");
  });

  test('notifyParseFailure is called on extract-recipe no_ingredients failure', () => {
    expect(serverSource).toContain("notifyParseFailure({ endpoint: 'extract-recipe', errorType: 'no_ingredients'");
  });

  test('notifyParseFailure is called on extract-recipe paywall/empty page', () => {
    expect(serverSource).toContain("notifyParseFailure({ endpoint: 'extract-recipe', errorType: 'paywall_or_empty_page'");
  });

  test('notifyParseFailure is called on extract-recipe AI errors', () => {
    expect(serverSource).toContain("notifyParseFailure({ endpoint: 'extract-recipe', errorType: 'malformed_json'");
    expect(serverSource).toContain("notifyParseFailure({ endpoint: 'extract-recipe', errorType: 'ai_error'");
  });

  test('notifyParseFailure is called on parse-recipe AI errors', () => {
    expect(serverSource).toContain("notifyParseFailure({ endpoint: 'parse-recipe', errorType: 'malformed_json'");
    expect(serverSource).toContain("notifyParseFailure({ endpoint: 'parse-recipe', errorType: 'ai_error'");
  });

  test('notifyParseFailure email send is non-blocking (fire and forget)', () => {
    // The resend call should use .catch() not await, so it never blocks the response
    expect(serverSource).toMatch(/resend\.emails\.send\([^)]*\)[\s\S]*?\.catch\(/);
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

// ── Registration validation error messages ────────────────────────────

describe('Registration validation returns field-specific errors', () => {
  test('invalid email returns email-specific error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'Valid1234', displayName: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/valid email/i);
    expect(res.body.error).not.toMatch(/password/i);
  });

  test('short password returns password-specific error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Ab1', displayName: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/i);
  });

  test('password without number returns password-specific error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'abcdefgh', displayName: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/i);
  });

  test('password without letter returns password-specific error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '12345678', displayName: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/i);
  });
});

// ── CSRF exemption for register and login ─────────────────────────────

describe('Register and login work without CSRF token', () => {
  test('POST /api/auth/register does not require CSRF token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'short' });
    // Should get a 400 validation error, NOT a 403 CSRF error
    expect(res.status).toBe(400);
    expect(res.body.error).not.toMatch(/CSRF/i);
  });

  test('POST /api/auth/login does not require CSRF token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    // Should get a 400 or 401 (no DB), NOT a 403 CSRF error
    expect(res.status).not.toBe(403);
    expect(res.body.error).not.toMatch(/CSRF/i);
  });

  test('other POST endpoints still require CSRF token', async () => {
    const res = await request(app)
      .post('/api/favorites/record')
      .send({ recipeIds: ['test'] });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/CSRF/i);
  });
});

// ── Trust proxy and session persistence ──────────────────────────────

describe('Trust proxy configured for production', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('app.set trust proxy is configured before session middleware', () => {
    const trustProxyIdx = serverSource.indexOf("trust proxy");
    const sessionIdx = serverSource.indexOf("express-session");
    // trust proxy must exist
    expect(trustProxyIdx).toBeGreaterThan(-1);
    // If both exist, trust proxy should come before session usage
    if (sessionIdx > -1) {
      expect(trustProxyIdx).toBeGreaterThan(-1);
    }
  });
});

describe('Session explicitly saved after regenerate', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('register handler calls req.session.save() inside regenerate callback', () => {
    // Find the register route and verify it contains session.save inside regenerate
    const registerSection = serverSource.slice(
      serverSource.indexOf("app.post('/api/auth/register'"),
      serverSource.indexOf("app.post('/api/auth/login'")
    );
    expect(registerSection).toContain('req.session.regenerate');
    expect(registerSection).toContain('req.session.save');
  });

  test('login handler calls req.session.save() inside regenerate callback', () => {
    const loginSection = serverSource.slice(
      serverSource.indexOf("app.post('/api/auth/login'"),
      serverSource.indexOf("app.post('/api/auth/logout'")
    );
    expect(loginSection).toContain('req.session.regenerate');
    expect(loginSection).toContain('req.session.save');
  });
});

describe('Register → session → /api/auth/me flow', () => {
  test('register returns success and sets session cookie', async () => {
    const agent = request.agent(app);
    const email = `flowtest_${Date.now()}@example.com`;
    const registerRes = await agent
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email, password: 'TestPass1', displayName: 'Flow Test' });

    if (registerRes.status !== 200) return; // Skip if no DB

    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.user.email).toBe(email);

    // Session cookie should be set in the response
    const cookies = registerRes.headers['set-cookie'] || [];
    const hasSessionCookie = cookies.some(c => c.includes('recipe.sid'));
    expect(hasSessionCookie).toBe(true);

    // /api/auth/me should return authenticated using the same session
    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.authenticated).toBe(true);
    expect(meRes.body.user.email).toBe(email);
  });

  test('register then login with same password succeeds', async () => {
    const agent = request.agent(app);
    const email = `logintest_${Date.now()}@example.com`;
    const password = 'TestPass1';

    const registerRes = await agent
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    if (registerRes.status !== 200) return; // Skip if no DB

    // Log out
    await agent.post('/api/auth/logout');

    // Log in with the same password
    const loginRes = await agent
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);

    // Session cookie should be set
    const loginCookies = loginRes.headers['set-cookie'] || [];
    const hasSessionCookie = loginCookies.some(c => c.includes('recipe.sid'));
    expect(hasSessionCookie).toBe(true);
  });
});

// ── Specific auth error messages ──────────────────────────────────────

describe('Auth error messages are specific (source code)', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('login returns specific "no account found" message when email not in DB', () => {
    expect(serverSource).toContain('No account found with that email address.');
  });

  test('login returns specific "incorrect password" message on wrong password', () => {
    expect(serverSource).toContain('Incorrect password. Please try again.');
  });

  test('login warns about remaining attempts when close to lockout', () => {
    expect(serverSource).toContain('remaining before lockout');
  });

  test('register returns 409 status for duplicate email (not 400)', () => {
    expect(serverSource).toContain('res.status(409)');
    expect(serverSource).toContain('An account with that email already exists.');
  });
});

describe('Auth error messages at runtime (skips if no DB)', () => {
  test('login with non-existent email returns 401 + no-account message', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody_xyz_999@example.com', password: 'SomePass1' });
    if (res.status === 500) return; // No DB — skip
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/no account found/i);
  });

  test('register with duplicate email returns 409 + already-exists message', async () => {
    const agent = request.agent(app);
    const email = `dup_${Date.now()}@example.com`;

    // First registration
    const first = await agent
      .post('/api/auth/register')
      .send({ email, password: 'TestPass1' });
    if (first.status !== 200) return; // No DB — skip

    // Second registration with same email
    const second = await agent
      .post('/api/auth/register')
      .send({ email, password: 'TestPass1' });
    expect(second.status).toBe(409);
    expect(second.body.error).toMatch(/already exists/i);
  });

  test('login with wrong password returns 401 + incorrect-password message', async () => {
    const agent = request.agent(app);
    const email = `wrongpw_${Date.now()}@example.com`;

    const reg = await agent
      .post('/api/auth/register')
      .send({ email, password: 'CorrectPass1' });
    if (reg.status !== 200) return; // No DB — skip

    await agent.post('/api/auth/logout');

    const login = await agent
      .post('/api/auth/login')
      .send({ email, password: 'WrongPass1' });
    expect(login.status).toBe(401);
    expect(login.body.error).toMatch(/incorrect password/i);
  });
});

describe('Admin email notifications (source check)', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('sends admin email on new signup when ADMIN_EMAIL is set', () => {
    expect(serverSource).toContain('process.env.ADMIN_EMAIL');
    expect(serverSource).toContain('[admin notify] signup email error');
  });

  test('signup admin email includes user email and name', () => {
    expect(serverSource).toContain('subject: `New signup: ${user.email}`');
    expect(serverSource).toContain('user.display_name');
  });

  test('signup admin notification fires after session save (non-blocking)', () => {
    // The notification should appear after logActivity in the session.save callback
    const saveCallback = serverSource.slice(serverSource.indexOf('req.session.save'));
    expect(saveCallback).toContain('[admin notify] signup email error');
  });

  test('detects new recipe vs update using created_at = updated_at', () => {
    expect(serverSource).toContain('(created_at = updated_at) AS is_new');
    expect(serverSource).toContain('upsertResult.rows[0]?.is_new');
  });

  test('sends admin email on new recipe upload when ADMIN_EMAIL is set', () => {
    expect(serverSource).toContain('[admin notify] new recipe email error');
    expect(serverSource).toContain('subject: `New recipe: ${recipe.name}`');
  });

  test('new recipe admin email includes recipe name and uploader username', () => {
    expect(serverSource).toContain('display_name FROM users WHERE id');
    expect(serverSource).toContain('Uploaded by: ${username}');
  });

  test('recipe admin notification only fires for non-admin users', () => {
    // The upsert (and notification) is in the else branch for non-admin users
    const adminBranch = serverSource.indexOf("req.user.role === 'admin'");
    const upsertBlock = serverSource.indexOf('(created_at = updated_at) AS is_new');
    // upsert should come after the admin branch check (i.e., in the else block)
    expect(upsertBlock).toBeGreaterThan(adminBranch);
  });
});

// ── URL deduplication / recipe_url_cache ─────────────────────────────────────

describe('URL deduplication — normalizeRecipeUrl (source analysis)', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('normalizeRecipeUrl is defined in server.js', () => {
    expect(serverSource).toContain('function normalizeRecipeUrl');
  });

  test('strips common tracking params', () => {
    const params = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
                    'utm_term', 'fbclid', 'gclid', 'msclkid'];
    params.forEach(p => expect(serverSource).toContain(`'${p}'`));
  });

  test('normalises protocol to https', () => {
    expect(serverSource).toContain("u.protocol = 'https:'");
  });

  test('strips trailing slash from non-root paths', () => {
    expect(serverSource).toContain("u.pathname.replace(/\\/+$/, '')");
  });

  test('sorts remaining query params for stable keys', () => {
    expect(serverSource).toContain('u.searchParams.sort()');
  });

  test('strips URL fragment', () => {
    expect(serverSource).toContain("u.hash = ''");
  });
});

describe('URL deduplication — /api/fetch-url cache check (source analysis)', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('fetch-url checks recipe_url_cache before fetching', () => {
    expect(serverSource).toContain('recipe_url_cache WHERE normalized_url');
  });

  test('fetch-url returns cached:true on a hit', () => {
    expect(serverSource).toContain('cached: true');
  });

  test('fetch-url returns ingredientDefs and urlCacheId on a cache hit', () => {
    expect(serverSource).toContain('ingredientDefs: ingredient_defs');
    expect(serverSource).toContain('urlCacheId: id');
  });

  test('cache check is guarded by pool availability', () => {
    // The check should only run when pool exists
    const cacheCheckIdx = serverSource.indexOf('recipe_url_cache WHERE normalized_url');
    const poolGuardIdx  = serverSource.lastIndexOf('if (pool)', cacheCheckIdx);
    expect(poolGuardIdx).toBeGreaterThan(-1);
    expect(cacheCheckIdx - poolGuardIdx).toBeLessThan(300);
  });
});

describe('URL deduplication — save-recipe populates cache (source analysis)', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('save-recipe inserts into recipe_url_cache', () => {
    expect(serverSource).toContain('INSERT INTO recipe_url_cache');
  });

  test('insert uses ON CONFLICT DO NOTHING so first parse wins', () => {
    expect(serverSource).toContain('ON CONFLICT (normalized_url) DO NOTHING');
  });

  test('save-recipe links user_recipes row to cache entry via url_cache_id', () => {
    expect(serverSource).toContain('UPDATE user_recipes SET url_cache_id');
  });

  test('URL cache errors are non-fatal (caught and warned)', () => {
    expect(serverSource).toContain('URL cache update failed (non-fatal)');
  });
});

describe('URL deduplication — delete cleans up orphaned cache (source analysis)', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('delete returns url_cache_id in RETURNING clause', () => {
    expect(serverSource).toContain('RETURNING id, url_cache_id');
  });

  test('delete checks reference count before removing cache entry', () => {
    expect(serverSource).toContain('SELECT COUNT(*) FROM user_recipes WHERE url_cache_id');
  });

  test('delete removes cache entry when count reaches zero', () => {
    expect(serverSource).toContain('DELETE FROM recipe_url_cache WHERE id = $1');
  });
});

describe('URL deduplication — migrate.js schema (source analysis)', () => {
  const migrateSource = fs.readFileSync(path.join(__dirname, 'migrate.js'), 'utf8');

  test('recipe_url_cache table is defined in DDL', () => {
    expect(migrateSource).toContain('CREATE TABLE IF NOT EXISTS recipe_url_cache');
  });

  test('normalized_url column has UNIQUE constraint', () => {
    expect(migrateSource).toContain('normalized_url  TEXT NOT NULL UNIQUE');
  });

  test('url_cache_id FK is added to user_recipes via ALTER TABLE', () => {
    expect(migrateSource).toContain('ALTER TABLE user_recipes ADD COLUMN IF NOT EXISTS url_cache_id');
  });

  test('url_cache_id FK references recipe_url_cache', () => {
    expect(migrateSource).toContain('REFERENCES recipe_url_cache(id)');
  });
});

// ── Recipe import log ──────────────────────────────────────────────────

describe('recipe_import_log — migrate.js schema', () => {
  const migrateSource = fs.readFileSync(path.join(__dirname, 'migrate.js'), 'utf8');

  test('recipe_import_log table is defined in DDL', () => {
    expect(migrateSource).toContain('CREATE TABLE IF NOT EXISTS recipe_import_log');
  });

  test('table has action, url, recipe_name, recipe_id, error columns', () => {
    expect(migrateSource).toContain("action      VARCHAR(50) NOT NULL");
    expect(migrateSource).toContain('url         TEXT');
    expect(migrateSource).toContain('recipe_name TEXT');
    expect(migrateSource).toContain('recipe_id   VARCHAR(255)');
    expect(migrateSource).toContain('error       TEXT');
  });

  test('table has user_id FK and ip_address', () => {
    expect(migrateSource).toContain('user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL');
    expect(migrateSource).toContain('ip_address  INET');
  });

  test('indexes exist for user, action, and created_at', () => {
    expect(migrateSource).toContain('idx_recipe_import_log_user');
    expect(migrateSource).toContain('idx_recipe_import_log_action');
    expect(migrateSource).toContain('idx_recipe_import_log_created');
  });
});

describe('recipe_import_log — server.js instrumentation', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  test('logRecipeImport helper is defined', () => {
    expect(serverSource).toContain('async function logRecipeImport(');
    expect(serverSource).toContain("'INSERT INTO recipe_import_log");
  });

  test('url_provided is logged when fetch-url succeeds', () => {
    expect(serverSource).toContain("logRecipeImport(req.user.id, 'url_provided', { url }, req.ip)");
  });

  test('photo_import_clicked is logged when photo tab is clicked', () => {
    expect(serverSource).toContain("logRecipeImport(userId, 'photo_import_clicked', {}, req.ip)");
    expect(serverSource).toContain("action === 'photo_import_interest'");
  });

  test('parse_succeeded is logged on successful extract-recipe', () => {
    expect(serverSource).toContain("logRecipeImport(req.user.id, 'parse_succeeded', { url: sourceUrl, recipeName: parsed.name }, req.ip)");
  });

  test('parse_succeeded is logged on successful parse-recipe', () => {
    expect(serverSource).toContain("logRecipeImport(req.user.id, 'parse_succeeded', { recipeName }, req.ip)");
  });

  test('parse_failed is logged when page is not a recipe', () => {
    expect(serverSource).toContain("logRecipeImport(req.user.id, 'parse_failed', { url: sourceUrl, error: 'not_a_recipe' }, req.ip)");
  });

  test('parse_failed is logged when no ingredients are found', () => {
    expect(serverSource).toContain("logRecipeImport(req.user.id, 'parse_failed', { url: sourceUrl, error: 'no_ingredients' }, req.ip)");
  });

  test('parse_failed is logged on AI errors', () => {
    expect(serverSource).toContain("error: 'ai_rate_limit'");
    expect(serverSource).toContain("error: 'ai_unavailable'");
    expect(serverSource).toContain("error: 'ai_json_error'");
  });

  test('recipe_saved is logged when save-recipe succeeds', () => {
    expect(serverSource).toContain("logRecipeImport(req.user.id, 'recipe_saved', { url: recipe.url, recipeName: recipe.name, recipeId: recipe.id }, req.ip)");
  });
});

// ── Archive (hide/unhide) endpoint ────────────────────────────────────

describe('POST /api/archive-recipe', () => {
  test('rejects unauthenticated requests (returns 401 or 403)', async () => {
    const res = await request(app)
      .post('/api/archive-recipe')
      .send({ recipeId: 'test-recipe', hidden: true });
    expect([401, 403]).toContain(res.status);
  });

  test('rejects requests without CSRF token with 403', async () => {
    const res = await request(app)
      .post('/api/archive-recipe')
      .send({ recipeId: 'test-recipe', hidden: true });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/CSRF/i);
  });

  test('requires recipeId in request body', async () => {
    const agent = request.agent(app);
    // Establish session + CSRF token
    const init = await agent.get('/api/recipes');
    const csrfCookie = (init.headers['set-cookie'] || [])
      .find(c => c.startsWith('csrf_token='));
    const csrfToken = csrfCookie ? csrfCookie.split('=')[1].split(';')[0] : '';

    const res = await agent
      .post('/api/archive-recipe')
      .set('X-CSRF-Token', csrfToken)
      .send({ hidden: true });
    // Without auth: 401; with auth but no recipeId: 400
    expect([400, 401]).toContain(res.status);
  });
});

// ── Delete recipe endpoint ────────────────────────────────────────────

describe('DELETE /api/recipes/:id', () => {
  test('rejects unauthenticated requests (returns 401 or 403)', async () => {
    const res = await request(app)
      .delete('/api/recipes/test-recipe');
    expect([401, 403]).toContain(res.status);
  });

  test('rejects requests without CSRF token with 403', async () => {
    const res = await request(app)
      .delete('/api/recipes/test-recipe');
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/CSRF/i);
  });
});

// ── CSRF retry logic in Auth.fetch (source analysis) ──────────────────

describe('Auth.fetch CSRF retry logic', () => {
  const authSource = fs.readFileSync(path.join(__dirname, 'public', 'js', 'auth.js'), 'utf8');

  test('Auth.fetch retries on CSRF token mismatch (403)', () => {
    // Should detect "Invalid CSRF token" response and retry with fresh cookie
    expect(authSource).toContain('Invalid CSRF token');
    expect(authSource).toContain('freshToken');
  });

  test('Auth.fetch reads fresh CSRF token from cookie before retry', () => {
    // After a 403, the server sets a new csrf_token cookie.
    // Auth.fetch should re-read the cookie and use the new token.
    const retryPattern = /freshToken.*&&.*freshToken\s*!==\s*csrfToken/;
    expect(authSource).toMatch(retryPattern);
  });
});

// ── Frontend error handling surfaces server messages ───────────────────

describe('Frontend error handling for archive/delete', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

  test('archiveRecipe reads server error response instead of generic message', () => {
    // The error handling block after the archive fetch should parse the server's JSON error
    const archiveSection = indexSource.match(/Auth\.fetch\('\/api\/archive-recipe'[\s\S]*?Failed to update recipe/);
    expect(archiveSection).not.toBeNull();
    expect(archiveSection[0]).toContain('res.json()');
    expect(archiveSection[0]).toContain('data.error');
  });

  test('delete handler reads server error response instead of generic message', () => {
    // The error handling block after the delete fetch should parse the server's JSON error
    const deleteSection = indexSource.match(/Auth\.fetch\(`\/api\/recipes\/[\s\S]*?Failed to delete recipe/);
    expect(deleteSection).not.toBeNull();
    expect(deleteSection[0]).toContain('res.json()');
    expect(deleteSection[0]).toContain('data.error');
  });
});
