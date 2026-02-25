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

  test('uses llama-3.1-8b-instant model (not 70b)', () => {
    expect(serverSource).not.toContain('llama-3.3-70b-versatile');
    expect(serverSource).toContain('llama-3.1-8b-instant');
  });

  test('sets max_tokens on AI calls', () => {
    const matches = serverSource.match(/max_tokens:\s*\d+/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  test('uses compact JSON for existingDefs (no pretty-printing)', () => {
    expect(serverSource).not.toContain('JSON.stringify(existingDefs, null, 2)');
    expect(serverSource).toContain('JSON.stringify(existingDefs)');
  });

  test('limits pageText to 4000 chars', () => {
    expect(serverSource).toContain('pageText.substring(0, 4000)');
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
