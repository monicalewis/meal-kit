const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('./server');

// Self-hosted recipe pages served at GET /recipes/:id.
// These pages are public — identical for guests and logged-in users — so the
// guest path below is the full coverage for the route.
describe('GET /recipes/:id (self-hosted recipe pages)', () => {
  test('renders a hosted page for a cookbook recipe (guest)', async () => {
    const res = await request(app).get('/recipes/caponata');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    // Title + heading
    expect(res.text).toContain('Caponata');
    // A step and an ingredient actually render on the page
    expect(res.text).toContain('Transfer to a bowl and garnish with pine nuts and basil.');
    expect(res.text).toContain('3 Roma tomatoes, diced');
    // Shareable metadata
    expect(res.text).toContain('property="og:title"');
    // Hero image wired in
    expect(res.text).toContain('/images/recipes/caponata.jpg');
    // Link back into the app
    expect(res.text).toContain('href="/"');
  });

  test('renders each cookbook recipe with its name and numbered steps', async () => {
    const cases = [
      ['summer-corn-and-peach-salad', 'Summer Corn &amp; Peach Salad'],
      ['mushroom-croquettes', 'Mushroom Croquettes'],
      ['gnocchi-and-cauliflower-casserole', 'Gnocchi + Cauliflower Casserole'],
      ['mini-artichoke-lasagnas', 'Mini Artichoke Lasagnas'],
      ['charred-broccoli-with-onions', 'Charred Broccoli with Onions'],
    ];
    for (const [id, displayName] of cases) {
      const res = await request(app).get(`/recipes/${id}`);
      expect(res.status).toBe(200);
      expect(res.text).toContain(displayName);
      expect(res.text).toContain('Instructions');
    }
  });

  test('redirects an unknown recipe id back to the app', async () => {
    const res = await request(app).get('/recipes/does-not-exist-xyz');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });

  test('redirects an external-source recipe to its source URL', async () => {
    // baked-mediterranean-veggies has an external url and no hosted page content.
    const res = await request(app).get('/recipes/baked-mediterranean-veggies');
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^https?:\/\//);
  });
});

// The client (web / iOS / Android browsers all hit the same JSON) loads recipe
// data from /api/recipes. The new hosted recipes must flow through with their
// page fields so "View Recipe" links to /recipes/<id>.
describe('GET /api/recipes includes hosted recipes (guest)', () => {
  test('returns caponata with page fields and internal url', async () => {
    const res = await request(app).get('/api/recipes');
    expect(res.status).toBe(200);
    const caponata = res.body.recipes.find(r => r.id === 'caponata');
    expect(caponata).toBeTruthy();
    expect(caponata.url).toBe('/recipes/caponata');
    expect(Array.isArray(caponata.steps)).toBe(true);
    expect(caponata.steps.length).toBeGreaterThan(0);
    expect(Array.isArray(caponata.displayIngredients)).toBe(true);
  });

  test('new ingredient defs are present for the shopping list', async () => {
    const res = await request(app).get('/api/recipes');
    expect(res.status).toBe(200);
    expect(res.body.ingredientDefs['marinara-sauce']).toBeTruthy();
    expect(res.body.ingredientDefs['gnocchi']).toBeTruthy();
    expect(res.body.ingredientDefs['broccoli']).toBeTruthy();
  });
});

// Each cookbook recipe has a cropped image that feeds both the card thumbnail
// and the recipe-page hero. The image field must point at a file that exists.
describe('cookbook recipe images', () => {
  const cookbookRecipeIds = [
    'caponata',
    'summer-corn-and-peach-salad',
    'mushroom-croquettes',
    'gnocchi-and-cauliflower-casserole',
    'mini-artichoke-lasagnas',
    'charred-broccoli-with-onions',
  ];

  test.each(cookbookRecipeIds)('%s image is wired and the file exists', async (id) => {
    const res = await request(app).get('/api/recipes');
    const recipe = res.body.recipes.find(r => r.id === id);
    expect(recipe.image).toBe(`/images/recipes/${id}.jpg`);
    const filePath = path.join(__dirname, 'public', 'images', 'recipes', `${id}.jpg`);
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('image is served over HTTP with an image content-type', async () => {
    const res = await request(app).get('/images/recipes/caponata.jpg');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/jpeg/);
  });
});
