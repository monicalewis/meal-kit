const path = require('path');
const fs = require('fs');
const { parseRecipesFile, seedPersonalRecipes } = require('./seed-personal-recipes');

// Sample recipes matching the format of "ML personal recipes"
const SAMPLE_CONTENT = `
  {
    "id": "kale-salad",
    "name": "Kale salad by MoniLew",
    "image": "https://example.com/kale.jpg",
    "totalTime": "10 min",
    "ingredients": [
      { "id": "kale", "qty": 1 },
      { "id": "olive-oil", "qty": 1 }
    ]
  },
  {
    "id": "grazing-platter",
    "name": "Grazing platter by MoniLew",
    "image": "https://example.com/platter.jpg",
    "ingredients": [
      { "id": "hummus", "qty": 8 },
      { "id": "crackers", "qty": 1 }
    ]
  },
`;

describe('parseRecipesFile', () => {
  test('parses multiple recipe objects from comma-separated content', () => {
    const recipes = parseRecipesFile(SAMPLE_CONTENT);
    expect(recipes).toHaveLength(2);
    expect(recipes[0].id).toBe('kale-salad');
    expect(recipes[1].id).toBe('grazing-platter');
  });

  test('handles trailing comma', () => {
    const recipes = parseRecipesFile(SAMPLE_CONTENT);
    expect(recipes).toHaveLength(2);
  });

  test('preserves all recipe fields', () => {
    const recipes = parseRecipesFile(SAMPLE_CONTENT);
    expect(recipes[0]).toMatchObject({
      id: 'kale-salad',
      name: 'Kale salad by MoniLew',
      totalTime: '10 min',
      ingredients: expect.arrayContaining([{ id: 'kale', qty: 1 }])
    });
  });

  test('throws on malformed content', () => {
    expect(() => parseRecipesFile('{ not valid json')).toThrow();
  });
});

describe('seedPersonalRecipes', () => {
  let pool;
  let tmpFile;

  beforeEach(() => {
    // Write sample content to a temp file
    tmpFile = path.join(require('os').tmpdir(), 'ml-recipes-test');
    fs.writeFileSync(tmpFile, SAMPLE_CONTENT);

    // Mock pool
    pool = {
      query: jest.fn()
    };
  });

  afterEach(() => {
    fs.unlinkSync(tmpFile);
  });

  test('throws when user email is not found', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await expect(
      seedPersonalRecipes(pool, 'nobody@example.com', tmpFile)
    ).rejects.toThrow('No user found with email: nobody@example.com');
  });

  test('inserts each recipe into user_recipes', async () => {
    pool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 42 }] }) // user lookup
      .mockResolvedValue({});                                       // inserts

    const count = await seedPersonalRecipes(pool, 'user@example.com', tmpFile);

    expect(count).toBe(2);

    // First call is the user lookup
    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('SELECT id FROM users'),
      ['user@example.com']
    );

    // Subsequent calls are inserts
    const insertCalls = pool.query.mock.calls.slice(1);
    expect(insertCalls).toHaveLength(2);
    insertCalls.forEach(([sql, params]) => {
      expect(sql).toContain('INSERT INTO user_recipes');
      expect(sql).toContain('ON CONFLICT');
      expect(params[0]).toBe(42); // userId
    });
  });

  test('inserts correct recipe_id and recipe_data for each recipe', async () => {
    pool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 7 }] })
      .mockResolvedValue({});

    await seedPersonalRecipes(pool, 'user@example.com', tmpFile);

    const [, firstParams] = pool.query.mock.calls[1];
    expect(firstParams[1]).toBe('kale-salad');
    expect(JSON.parse(firstParams[2])).toMatchObject({ id: 'kale-salad', name: 'Kale salad by MoniLew' });
    expect(JSON.parse(firstParams[3])).toEqual({});

    const [, secondParams] = pool.query.mock.calls[2];
    expect(secondParams[1]).toBe('grazing-platter');
  });

  test('normalises email to lowercase before lookup', async () => {
    pool.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] })
      .mockResolvedValue({});

    await seedPersonalRecipes(pool, 'USER@Example.COM', tmpFile);

    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      ['user@example.com']
    );
  });
});
