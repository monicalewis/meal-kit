const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load recipes.js the same way the server does (canonical source).
function loadRecipeData() {
  const content = fs.readFileSync(path.join(__dirname, 'recipes.js'), 'utf-8')
    .replace(/^const recipeData/m, 'var recipeData');
  const sandbox = {};
  vm.runInNewContext(content, sandbox);
  return sandbox.recipeData;
}

describe('recipes.js data', () => {
  const data = loadRecipeData();

  test('parses into { ingredientDefs, recipes }', () => {
    expect(data).toBeTruthy();
    expect(typeof data.ingredientDefs).toBe('object');
    expect(Array.isArray(data.recipes)).toBe(true);
  });

  test('recipe ids are unique', () => {
    const ids = data.recipes.map(r => r.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  // Recipes added from source URLs. Each must resolve all of its ingredient
  // references to an entry in ingredientDefs so the shopping list renders.
  const newRecipeIds = [
    'apple-and-cheddar-crisp-salad-by-smitten-kitchen',
    'crispy-black-bean-tacos-with-feta-and-slaw-by-smitten-kitchen',
    'charred-brussels-sprouts-with-olive-oil-and-lemon-by-ottolenghi',
    'dutch-oven-bread-by-the-cookie-rookie',
  ];

  test.each(newRecipeIds)('recipe %s exists with required fields', (id) => {
    const recipe = data.recipes.find(r => r.id === id);
    expect(recipe).toBeTruthy();
    expect(typeof recipe.name).toBe('string');
    expect(recipe.name.length).toBeGreaterThan(0);
    expect(typeof recipe.url).toBe('string');
    expect(recipe.url).toMatch(/^https?:\/\//);
    expect(typeof recipe.totalTime).toBe('string');
    expect(Array.isArray(recipe.ingredients)).toBe(true);
    expect(recipe.ingredients.length).toBeGreaterThan(0);
  });

  test.each(newRecipeIds)('recipe %s ingredient refs all resolve to a def', (id) => {
    const recipe = data.recipes.find(r => r.id === id);
    const unresolved = recipe.ingredients
      .map(i => i.id)
      .filter(ingredientId => !data.ingredientDefs[ingredientId]);
    expect(unresolved).toEqual([]);
  });

  test.each(newRecipeIds)('recipe %s ingredient quantities are positive numbers', (id) => {
    const recipe = data.recipes.find(r => r.id === id);
    for (const ing of recipe.ingredients) {
      expect(typeof ing.qty).toBe('number');
      expect(ing.qty).toBeGreaterThan(0);
    }
  });

  // Recipes whose images were swapped from external placeholders to locally
  // hosted files under public/images/recipes/. Guards against a path typo or a
  // missing file silently reintroducing a broken image.
  const localImageRecipeIds = [
    'mushroom-buratta-pizza-by-good-eggs',
    'pea-fritters',
    'peach-panzanella-with-burrata-and-mint-by-good-eggs',
    'dutch-oven-bread-by-the-cookie-rookie',
  ];

  test.each(localImageRecipeIds)('recipe %s uses a locally hosted image that exists', (id) => {
    const recipe = data.recipes.find(r => r.id === id);
    expect(recipe).toBeTruthy();
    expect(recipe.image).toMatch(/^\/images\/recipes\//);
    const filePath = path.join(__dirname, 'public', recipe.image);
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('every local /images reference in recipes resolves to a file in public/', () => {
    const missing = data.recipes
      .filter(r => typeof r.image === 'string' && r.image.startsWith('/images/'))
      .filter(r => !fs.existsSync(path.join(__dirname, 'public', r.image)))
      .map(r => `${r.id} -> ${r.image}`);
    expect(missing).toEqual([]);
  });

  test('new ingredient defs have name, units and section', () => {
    const newDefs = [
      'apple-cider-vinegar', 'dijon-mustard', 'powdered-sugar', 'cayenne',
      'cabbage', 'hot-sauce', 'brussels-sprouts', 'green-chili',
      'tarragon', 'dill', 'parsley', 'preserved-lemon',
      'active-dry-yeast', 'fresh-rosemary',
    ];
    for (const key of newDefs) {
      const def = data.ingredientDefs[key];
      expect(def).toBeTruthy();
      expect(typeof def.name).toBe('string');
      expect(typeof def.units).toBe('string');
      expect(typeof def.section).toBe('string');
    }
  });
});

// Recipes hand-entered from a cookbook (not published elsewhere on the web).
// These carry page content (description/steps/displayIngredients) AND an internal
// url so the server can render a hosted recipe page at /recipes/<id>.
describe('cookbook recipes (self-hosted pages)', () => {
  const data = loadRecipeData();

  const cookbookRecipeIds = [
    'caponata',
    'summer-corn-and-peach-salad',
    'mushroom-croquettes',
    'gnocchi-and-cauliflower-casserole',
    'mini-artichoke-lasagnas',
    'charred-broccoli-with-onions',
  ];

  test.each(cookbookRecipeIds)('%s exists with hosted-page fields', (id) => {
    const recipe = data.recipes.find(r => r.id === id);
    expect(recipe).toBeTruthy();
    expect(typeof recipe.name).toBe('string');
    expect(recipe.name.length).toBeGreaterThan(0);
    // Internal url so "View Recipe" opens the hosted page, not an external site.
    expect(recipe.url).toBe(`/recipes/${id}`);
    expect(typeof recipe.totalTime).toBe('string');
    // Page content for rendering the recipe page.
    expect(Array.isArray(recipe.steps)).toBe(true);
    expect(recipe.steps.length).toBeGreaterThan(0);
    recipe.steps.forEach(s => expect(typeof s).toBe('string'));
    expect(Array.isArray(recipe.displayIngredients)).toBe(true);
    expect(recipe.displayIngredients.length).toBeGreaterThan(0);
    // Shopping-list data.
    expect(Array.isArray(recipe.ingredients)).toBe(true);
    expect(recipe.ingredients.length).toBeGreaterThan(0);
  });

  test.each(cookbookRecipeIds)('%s ingredient refs all resolve to a def', (id) => {
    const recipe = data.recipes.find(r => r.id === id);
    const unresolved = recipe.ingredients
      .map(i => i.id)
      .filter(ingredientId => !data.ingredientDefs[ingredientId]);
    expect(unresolved).toEqual([]);
  });

  test.each(cookbookRecipeIds)('%s ingredient quantities are positive numbers', (id) => {
    const recipe = data.recipes.find(r => r.id === id);
    for (const ing of recipe.ingredients) {
      expect(typeof ing.qty).toBe('number');
      expect(ing.qty).toBeGreaterThan(0);
    }
  });

  test('new cookbook ingredient defs have name, units and section', () => {
    const newDefs = [
      'red-wine-vinegar', 'capers', 'honey', 'orange-bell-pepper',
      'russet-potato', 'breadcrumbs', 'gnocchi', 'marinara-sauce',
      'marinated-artichoke-hearts', 'no-boil-lasagna-noodles', 'broccoli',
    ];
    for (const key of newDefs) {
      const def = data.ingredientDefs[key];
      expect(def).toBeTruthy();
      expect(typeof def.name).toBe('string');
      expect(typeof def.units).toBe('string');
      expect(typeof def.section).toBe('string');
    }
  });
});
