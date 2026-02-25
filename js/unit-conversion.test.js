const UC = require('./unit-conversion');

// ── convertQty: identity ────────────────────────────────────────────

describe('convertQty — identity', () => {
  test('same unit returns qty unchanged', () => {
    expect(UC.convertQty(5, 'cup', 'cup', 'flour')).toBe(5);
    expect(UC.convertQty(3, 'g', 'g', null)).toBe(3);
  });
});

// ── convertQty: same-type volume ────────────────────────────────────

describe('convertQty — same-type volume', () => {
  test('cups to tbsp', () => {
    expect(UC.convertQty(1, 'cup', 'tbsp', null)).toBe(16);
  });

  test('tbsp to tsp', () => {
    expect(UC.convertQty(1, 'tbsp', 'tsp', null)).toBe(3);
  });

  test('tsp to tbsp', () => {
    expect(UC.convertQty(3, 'tsp', 'tbsp', null)).toBe(1);
  });

  test('ml to cups (237 ml ≈ 1 cup)', () => {
    const result = UC.convertQty(237, 'ml', 'cup', null);
    expect(result).toBeCloseTo(1, 0);
  });

  test('cups alias works', () => {
    expect(UC.convertQty(1, 'cups', 'tbsp', null)).toBe(16);
  });
});

// ── convertQty: same-type weight ────────────────────────────────────

describe('convertQty — same-type weight', () => {
  test('g to kg', () => {
    expect(UC.convertQty(1000, 'g', 'kg', null)).toBe(1);
  });

  test('kg to g', () => {
    expect(UC.convertQty(1.5, 'kg', 'g', null)).toBe(1500);
  });

  test('lbs to oz', () => {
    expect(UC.convertQty(1, 'lbs', 'oz', null)).toBeCloseTo(16, 0);
  });

  test('oz to g', () => {
    expect(UC.convertQty(1, 'oz', 'g', null)).toBeCloseTo(28.35, 1);
  });

  test('lb alias works same as lbs', () => {
    expect(UC.convertQty(1, 'lb', 'oz', null)).toBeCloseTo(16, 0);
  });

  test('ounces alias works same as oz', () => {
    expect(UC.convertQty(1, 'ounces', 'g', null)).toBeCloseTo(28.35, 1);
  });
});

// ── convertQty: cross-type with known density ───────────────────────

describe('convertQty — cross-type (weight↔volume)', () => {
  test('grams of flour to cups (flour=120 g/cup)', () => {
    // 240g / 120 g/cup = 2 cups
    expect(UC.convertQty(240, 'g', 'cup', 'flour')).toBe(2);
  });

  test('cups of butter to grams (butter=227 g/cup)', () => {
    expect(UC.convertQty(1, 'cup', 'g', 'butter')).toBe(227);
  });

  test('grams of tahini to tbsp (tahini=240 g/cup = 15 g/tbsp)', () => {
    // 120g / (240/16) g/tbsp = 120/15 = 8 tbsp
    expect(UC.convertQty(120, 'g', 'tbsp', 'tahini')).toBe(8);
  });

  test('oz of baby spinach to cups (30 g/cup)', () => {
    // 1 oz = 28.3495g, 28.3495/30 ≈ 0.94 cups
    const result = UC.convertQty(1, 'oz', 'cup', 'baby-spinach');
    expect(result).toBeCloseTo(0.95, 1);
  });

  test('lbs of eggplant to cups (82 g/cup)', () => {
    // 1 lb = 453.592g, 453.592/82 ≈ 5.53 cups
    const result = UC.convertQty(1, 'lbs', 'cup', 'eggplant');
    expect(result).toBeCloseTo(5.53, 1);
  });

  test('tbsp of maple syrup to grams (315 g/cup)', () => {
    // 1 tbsp = 3 tsp, gramsPerTsp = 315/48 = 6.5625
    // 1 tbsp in tsp = 3, grams = 3 * 6.5625 = 19.6875
    expect(UC.convertQty(1, 'tbsp', 'g', 'maple-syrup')).toBeCloseTo(19.69, 1);
  });
});

// ── convertQty: cross-type with default density ─────────────────────

describe('convertQty — cross-type (default density)', () => {
  test('uses DEFAULT_DENSITY for unknown ingredient', () => {
    // DEFAULT_DENSITY = 150 g/cup → 150g = 1 cup
    expect(UC.convertQty(150, 'g', 'cup', 'some-unknown-thing')).toBe(1);
  });

  test('uses DEFAULT_DENSITY for null slug', () => {
    expect(UC.convertQty(150, 'g', 'cup', null)).toBe(1);
  });
});

// ── convertQty: non-convertible / unknown units ─────────────────────

describe('convertQty — non-convertible', () => {
  test('count to cup returns null', () => {
    expect(UC.convertQty(3, 'count', 'cup', 'eggs')).toBeNull();
  });

  test('can to g returns null', () => {
    expect(UC.convertQty(1, 'can', 'g', 'tomato-sauce')).toBeNull();
  });

  test('bunch to oz returns null', () => {
    expect(UC.convertQty(2, 'bunch', 'oz', 'cilantro')).toBeNull();
  });

  test('unknown unit returns null', () => {
    expect(UC.convertQty(1, 'sprinkle', 'cup', 'salt')).toBeNull();
  });

  test('null units return null', () => {
    expect(UC.convertQty(1, null, 'cup', 'flour')).toBeNull();
    expect(UC.convertQty(1, 'cup', null, 'flour')).toBeNull();
  });
});

// ── getDensity ──────────────────────────────────────────────────────

describe('getDensity', () => {
  test('returns known density for flour', () => {
    expect(UC.getDensity('flour')).toBe(120);
  });

  test('returns known density for butter', () => {
    expect(UC.getDensity('butter')).toBe(227);
  });

  test('returns DEFAULT_DENSITY for unknown slug', () => {
    expect(UC.getDensity('mystery-ingredient')).toBe(UC.DEFAULT_DENSITY);
  });

  test('returns DEFAULT_DENSITY for null slug', () => {
    expect(UC.getDensity(null)).toBe(UC.DEFAULT_DENSITY);
  });

  test('returns DEFAULT_DENSITY for undefined slug', () => {
    expect(UC.getDensity(undefined)).toBe(UC.DEFAULT_DENSITY);
  });
});

// ── bestVolumeUnit ──────────────────────────────────────────────────

describe('bestVolumeUnit', () => {
  test('picks cup for >= 48 tsp', () => {
    expect(UC.bestVolumeUnit(96)).toBe('cup');
    expect(UC.bestVolumeUnit(48)).toBe('cup');
  });

  test('picks tbsp for >= 3 tsp', () => {
    expect(UC.bestVolumeUnit(12)).toBe('tbsp');
    expect(UC.bestVolumeUnit(3)).toBe('tbsp');
  });

  test('picks tsp for < 3 tsp', () => {
    expect(UC.bestVolumeUnit(2)).toBe('tsp');
    expect(UC.bestVolumeUnit(0.5)).toBe('tsp');
  });
});

// ── isConvertibleUnit ───────────────────────────────────────────────

describe('isConvertibleUnit', () => {
  test('volume units are convertible', () => {
    expect(UC.isConvertibleUnit('cup')).toBe(true);
    expect(UC.isConvertibleUnit('tbsp')).toBe(true);
    expect(UC.isConvertibleUnit('ml')).toBe(true);
  });

  test('weight units are convertible', () => {
    expect(UC.isConvertibleUnit('g')).toBe(true);
    expect(UC.isConvertibleUnit('oz')).toBe(true);
    expect(UC.isConvertibleUnit('lbs')).toBe(true);
  });

  test('count-like units are not convertible', () => {
    expect(UC.isConvertibleUnit('count')).toBe(false);
    expect(UC.isConvertibleUnit('can')).toBe(false);
    expect(UC.isConvertibleUnit('bunch')).toBe(false);
  });

  test('null/undefined returns false', () => {
    expect(UC.isConvertibleUnit(null)).toBe(false);
    expect(UC.isConvertibleUnit(undefined)).toBe(false);
  });
});

// ── findSlugByName ──────────────────────────────────────────────────

describe('findSlugByName', () => {
  const defs = {
    'flour': { name: 'Flour', units: 'cup', section: 'Cooking' },
    'butter': { name: 'Butter', units: 'tbsp', section: 'Dairy' },
    'baby-spinach': { name: 'Baby spinach', units: 'cups', section: 'Produce' },
  };

  test('finds slug by exact name (case-insensitive)', () => {
    expect(UC.findSlugByName('Flour', defs)).toBe('flour');
    expect(UC.findSlugByName('flour', defs)).toBe('flour');
    expect(UC.findSlugByName('BUTTER', defs)).toBe('butter');
  });

  test('finds slug with spaces in name', () => {
    expect(UC.findSlugByName('Baby spinach', defs)).toBe('baby-spinach');
  });

  test('returns null for unknown name', () => {
    expect(UC.findSlugByName('Unknown', defs)).toBeNull();
  });

  test('returns null for null inputs', () => {
    expect(UC.findSlugByName(null, defs)).toBeNull();
    expect(UC.findSlugByName('Flour', null)).toBeNull();
  });
});

// ── getGramsPerCupBatch ─────────────────────────────────────────────

describe('getGramsPerCupBatch', () => {
  const defs = {
    'flour': { name: 'Flour', units: 'cup', section: 'Cooking' },
    'butter': { name: 'Butter', units: 'tbsp', section: 'Dairy' },
  };

  test('returns density for known ingredients', () => {
    const result = UC.getGramsPerCupBatch(['Flour', 'Butter'], defs);
    expect(result['Flour']).toBe(120);
    expect(result['Butter']).toBe(227);
  });

  test('returns DEFAULT_DENSITY for unknown ingredients', () => {
    const result = UC.getGramsPerCupBatch(['Mystery food'], defs);
    expect(result['Mystery food']).toBe(UC.DEFAULT_DENSITY);
  });
});

// ── convertParsedIngredients ────────────────────────────────────────

describe('convertParsedIngredients', () => {
  const existingDefs = {
    'flour': { name: 'Flour', units: 'cup', section: 'Cooking' },
    'butter': { name: 'Butter', units: 'tbsp', section: 'Dairy' },
    'eggs': { name: 'Eggs', units: 'count', section: 'Dairy' },
  };

  test('converts grams to cups for flour', () => {
    const input = [{ id: 'flour', qty: 240, unit: 'g' }];
    const result = UC.convertParsedIngredients(input, existingDefs, {});
    expect(result[0]).toEqual({ id: 'flour', qty: 2 });
  });

  test('converts grams to tbsp for butter', () => {
    const input = [{ id: 'butter', qty: 227, unit: 'g' }];
    const result = UC.convertParsedIngredients(input, existingDefs, {});
    // 227g butter = 1 cup = 16 tbsp
    expect(result[0]).toEqual({ id: 'butter', qty: 16 });
  });

  test('passes through when units already match', () => {
    const input = [{ id: 'flour', qty: 2, unit: 'cup' }];
    const result = UC.convertParsedIngredients(input, existingDefs, {});
    expect(result[0]).toEqual({ id: 'flour', qty: 2 });
  });

  test('passes through when no unit field from LLM', () => {
    const input = [{ id: 'flour', qty: 2 }];
    const result = UC.convertParsedIngredients(input, existingDefs, {});
    expect(result[0]).toEqual({ id: 'flour', qty: 2 });
  });

  test('passes through count-based ingredients', () => {
    const input = [{ id: 'eggs', qty: 3, unit: 'count' }];
    const result = UC.convertParsedIngredients(input, existingDefs, {});
    expect(result[0]).toEqual({ id: 'eggs', qty: 3 });
  });

  test('uses newDefs when ingredient is not in existingDefs', () => {
    const newDefs = {
      'coconut-milk': { name: 'Coconut milk', units: 'cup', section: 'Cooking' },
    };
    const input = [{ id: 'coconut-milk', qty: 400, unit: 'ml' }];
    const result = UC.convertParsedIngredients(input, existingDefs, newDefs);
    // 400 ml → tsp → cups: 400/4.929 = ~81.15 tsp → ~1.69 cups
    expect(result[0].id).toBe('coconut-milk');
    expect(result[0].qty).toBeCloseTo(1.69, 1);
  });

  test('handles multiple ingredients at once', () => {
    const input = [
      { id: 'flour', qty: 120, unit: 'g' },
      { id: 'butter', qty: 2, unit: 'tbsp' },
      { id: 'eggs', qty: 3, unit: 'count' },
    ];
    const result = UC.convertParsedIngredients(input, existingDefs, {});
    expect(result).toHaveLength(3);
    expect(result[0].qty).toBe(1);       // 120g flour = 1 cup
    expect(result[1].qty).toBe(2);       // already tbsp
    expect(result[2].qty).toBe(3);       // count stays
  });
});
