/**
 * Shared unit conversion module with deterministic density lookup table.
 * Replaces LLM-based unit math for recipe import and shopping list aggregation.
 *
 * UMD: works as <script> in browser (window.UnitConversion) and require() in Node/Jest.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.UnitConversion = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // ── Unit definitions ─────────────────────────────────────────────────
  // Volume base = teaspoons (tsp), weight base = grams (g).
  const UNIT_INFO = {
    'tsp':    { type: 'volume', toBase: 1 },
    'tbsp':   { type: 'volume', toBase: 3 },
    'cup':    { type: 'volume', toBase: 48 },
    'cups':   { type: 'volume', toBase: 48 },
    'ml':     { type: 'volume', toBase: 1 / 4.929 },
    'l':      { type: 'volume', toBase: 48 * 4.227 },   // liters
    'g':      { type: 'weight', toBase: 1 },
    'kg':     { type: 'weight', toBase: 1000 },
    'oz':     { type: 'weight', toBase: 28.3495 },
    'ounces': { type: 'weight', toBase: 28.3495 },
    'lbs':    { type: 'weight', toBase: 453.592 },
    'lb':     { type: 'weight', toBase: 453.592 },
  };

  // ── Density table (grams per US cup) ─────────────────────────────────
  // Keyed by ingredient slug matching recipeData.ingredientDefs.
  // Values from USDA FoodData Central and standard baking references.
  const DENSITY = {
    // Grains & starches
    'flour':               120,
    'basmati-rice':        185,
    'jasmine-rice':        185,
    'red-rice':            190,
    'wild-rice':           160,
    'farro':               180,
    'semi-pearled-farro':  180,
    'israeli-couscous':    175,
    'quinoa':              170,
    'mixed-dried-beans':   180,
    'dried-sour-cherries': 140,
    'panko':                60,
    'spaghetti':           105,
    'macaroni':            105,
    'pasta':               105,
    'pasta-shells':        105,

    // Dairy & cheese
    'butter':              227,
    'heavy-cream':         238,
    'sour-cream':          230,
    'half-and-half':       242,
    'ricotta':             246,
    'feta---goat-cheese':  150,
    'mexican-cheese':      113,
    'mascarpone':          240,
    'shredded-mozzarella': 113,
    'fresh-mozzarella':    150,
    'grilling-cheese':     150,
    'gruyere-or-gouda':    100,
    'parmesan':             90,

    // Nuts & dried fruit
    'pistachios':          123,
    'walnuts-or-other':    120,
    'pine-nuts':           135,
    'sliced-almonds':       90,
    'peanuts':             146,
    'coconut':              85,
    'hazelnuts':           135,

    // Produce
    'baby-spinach':         30,
    'frozen-peas':         145,
    'kale':                 67,
    'mushrooms':            70,
    'grape-tomatoes':      149,
    'cherry-tomato':       149,
    'asparagus':           134,
    'broccoli-rabe':       100,
    'broccolini':          100,
    'eggplant':             82,
    'green-beans':         125,
    'sun-dried-tomatoes':  110,

    // Oils, vinegars, liquids
    'olive-oil':           216,
    'peanut-oil':          216,
    'balsamic-vinegar':    255,
    'white-wine-vinegar':  239,
    'white-wine':          227,
    'maple-syrup':         315,
    'tahini':              240,
    'tomato-paste':        262,
    'hummus':              246,
    'whole-milk':          245,

    // Spices & seasonings
    'cumin':               104,
    'oregano':              50,
    'paprika':             108,
    'harissa-powder':      108,
    'dried-basil':          35,
    'dried-mint':           40,
    'salt':                288,
    'chili-powder':        128,
    'fresh-ginger':        170,
  };

  // Fallback for ingredients not in the density table.
  const DEFAULT_DENSITY = 150;

  // ── Non-convertible units ────────────────────────────────────────────
  // Discrete/packaging units that cannot be mathematically converted.
  const NON_CONVERTIBLE_UNITS = new Set([
    'count', 'cloves', 'bunch', 'can', 'cans',
    'bag', 'bottle', 'bottles', 'box', 'package',
    'pack', 'packet', 'carton', 'case', 'container',
    'cube', 'cubes', 'balls', 'whole', 'oz can', 'Bag',
  ]);

  // ── Core functions ───────────────────────────────────────────────────

  /**
   * Get grams-per-cup for an ingredient slug. Returns DEFAULT_DENSITY for unknowns.
   */
  function getDensity(slug) {
    if (!slug) return DEFAULT_DENSITY;
    return DENSITY[slug] || DEFAULT_DENSITY;
  }

  /**
   * Returns true if a unit can participate in mathematical conversion.
   */
  function isConvertibleUnit(unit) {
    if (!unit) return false;
    const u = unit.toLowerCase().trim();
    return !!UNIT_INFO[u] && !NON_CONVERTIBLE_UNITS.has(u);
  }

  /**
   * Pick the best human-readable volume unit for a total expressed in teaspoons.
   */
  function bestVolumeUnit(totalTsp) {
    if (totalTsp >= 48) return 'cup';
    if (totalTsp >= 3)  return 'tbsp';
    return 'tsp';
  }

  /**
   * Pick the best human-readable weight unit for a total expressed in grams.
   */
  function bestWeightUnit(totalG) {
    if (totalG >= 1000) return 'kg';
    if (totalG >= 28.35) return 'oz';
    return 'g';
  }

  /**
   * Round to 2 decimal places.
   */
  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  /**
   * Convert a quantity from one unit to another.
   *
   * @param {number} qty           - The quantity to convert.
   * @param {string} fromUnit      - Source unit (e.g. 'g', 'cup', 'tbsp').
   * @param {string} toUnit        - Target unit.
   * @param {string} ingredientSlug - Ingredient slug for density lookup (needed for cross-type).
   * @returns {number|null} Converted quantity, or null if conversion is impossible.
   */
  function convertQty(qty, fromUnit, toUnit, ingredientSlug) {
    if (!fromUnit || !toUnit) return null;
    const from = fromUnit.toLowerCase().trim();
    const to = toUnit.toLowerCase().trim();
    if (from === to) return qty;

    const fromInfo = UNIT_INFO[from];
    const toInfo = UNIT_INFO[to];

    // Either unit is unknown or non-convertible
    if (!fromInfo || !toInfo) return null;
    if (NON_CONVERTIBLE_UNITS.has(from) || NON_CONVERTIBLE_UNITS.has(to)) return null;

    // Same type (volume→volume or weight→weight): direct ratio
    if (fromInfo.type === toInfo.type) {
      return round2(qty * fromInfo.toBase / toInfo.toBase);
    }

    // Cross-type: need density (grams per cup)
    const gpc = getDensity(ingredientSlug);
    // grams per tsp = gpc / 48
    const gramsPerTsp = gpc / 48;

    if (fromInfo.type === 'weight' && toInfo.type === 'volume') {
      // weight → grams → tsp → target volume unit
      const grams = qty * fromInfo.toBase;
      const tsp = grams / gramsPerTsp;
      return round2(tsp / toInfo.toBase);
    }

    if (fromInfo.type === 'volume' && toInfo.type === 'weight') {
      // volume → tsp → grams → target weight unit
      const tsp = qty * fromInfo.toBase;
      const grams = tsp * gramsPerTsp;
      return round2(grams / toInfo.toBase);
    }

    return null;
  }

  /**
   * Reverse lookup: find the ingredient slug given a display name and the ingredientDefs map.
   * Case-insensitive match on the `name` field.
   *
   * @param {string} name            - Display name to look up (e.g. "Flour").
   * @param {Object} ingredientDefs  - The ingredientDefs map { slug: { name, units, section } }.
   * @returns {string|null} The matching slug, or null.
   */
  function findSlugByName(name, ingredientDefs) {
    if (!name || !ingredientDefs) return null;
    const lower = name.toLowerCase().trim();
    for (const [slug, def] of Object.entries(ingredientDefs)) {
      if (def.name && def.name.toLowerCase().trim() === lower) return slug;
    }
    return null;
  }

  /**
   * Get grams-per-cup for a batch of ingredient display names.
   * Synchronous replacement for the old /api/convert-units endpoint.
   *
   * @param {string[]} ingredientNames - Array of display names.
   * @param {Object} ingredientDefs    - The ingredientDefs map.
   * @returns {Object} Map of { displayName: gramsPerCup }.
   */
  function getGramsPerCupBatch(ingredientNames, ingredientDefs) {
    const result = {};
    for (const name of ingredientNames) {
      const slug = findSlugByName(name, ingredientDefs);
      result[name] = getDensity(slug);
    }
    return result;
  }

  /**
   * Post-process LLM-parsed ingredients: convert each ingredient's quantity
   * from the recipe's original unit to the existing ingredientDef's unit.
   *
   * @param {Array} ingredients  - LLM output: [{ id, qty, unit? }, ...]
   * @param {Object} existingDefs - Existing ingredientDefs from the database.
   * @param {Object} newDefs      - New ingredientDefs created by the LLM for this recipe.
   * @returns {Array} Converted ingredients: [{ id, qty }, ...]
   */
  function convertParsedIngredients(ingredients, existingDefs, newDefs) {
    return ingredients.map(function (ing) {
      var def = (existingDefs && existingDefs[ing.id]) || (newDefs && newDefs[ing.id]);
      if (!def || !ing.unit) {
        // No def found or no unit returned by LLM — return as-is
        return { id: ing.id, qty: ing.qty };
      }
      var targetUnit = def.units.toLowerCase().trim();
      var sourceUnit = ing.unit.toLowerCase().trim();
      if (sourceUnit === targetUnit) {
        return { id: ing.id, qty: ing.qty };
      }
      var converted = convertQty(ing.qty, sourceUnit, targetUnit, ing.id);
      return { id: ing.id, qty: converted !== null ? converted : ing.qty };
    });
  }

  // ── Public API ───────────────────────────────────────────────────────
  return {
    UNIT_INFO: UNIT_INFO,
    DENSITY: DENSITY,
    DEFAULT_DENSITY: DEFAULT_DENSITY,
    NON_CONVERTIBLE_UNITS: NON_CONVERTIBLE_UNITS,
    getDensity: getDensity,
    isConvertibleUnit: isConvertibleUnit,
    bestVolumeUnit: bestVolumeUnit,
    bestWeightUnit: bestWeightUnit,
    convertQty: convertQty,
    findSlugByName: findSlugByName,
    getGramsPerCupBatch: getGramsPerCupBatch,
    convertParsedIngredients: convertParsedIngredients,
  };
});
