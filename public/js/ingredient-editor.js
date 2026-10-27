/**
 * Ingredient-row editor helpers, extracted from index.html so they can be unit-tested.
 *
 * Covers the "change an ingredient's unit" behavior in the recipe-import preview:
 *   - buildUnitSelect: build the inline unit <select> for a row
 *   - applyUnitChange: convert the quantity when units are compatible and persist the
 *     chosen unit as a per-user ingredientDef override (written into newIngredientDefs,
 *     which the server merges over the global defs on reload)
 *
 * UMD: works as <script> in browser (window.IngredientEditor) and require() in Node/Jest.
 * Depends on UnitConversion (global in browser, ./unit-conversion.js in Node).
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./unit-conversion.js'));
  } else {
    root.IngredientEditor = factory(root.UnitConversion);
  }
})(typeof self !== 'undefined' ? self : this, function (UnitConversion) {

  // Mirrors UNIT_OPTIONS in index.html; used when the caller doesn't pass its own list.
  const DEFAULT_UNIT_OPTIONS = ['count', 'cup', 'cups', 'tbsp', 'tsp', 'oz', 'lbs', 'g', 'ml', 'kg', 'bunch', 'can', 'cloves', 'bag', 'bottle', 'box', 'package'];

  const UNIT_SELECT_CLASS = 'w-20 px-1 py-0.5 border border-slate-300 rounded text-xs text-slate-600 bg-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none';

  /**
   * Build a unit <select> seeded with unitOptions (plus the current unit if it isn't one
   * of the presets), defaulting to the ingredient's current unit. Requires a DOM
   * (browser or jsdom).
   *
   * @param {string} currentUnit        - The unit to pre-select.
   * @param {string[]} [unitOptions]    - Allowed units (defaults to DEFAULT_UNIT_OPTIONS).
   * @returns {HTMLSelectElement}
   */
  function buildUnitSelect(currentUnit, unitOptions) {
    const opts = unitOptions || DEFAULT_UNIT_OPTIONS;
    const sel = document.createElement('select');
    sel.className = UNIT_SELECT_CLASS;
    sel.setAttribute('aria-label', 'Unit');
    const unit = currentUnit || 'count';
    const choices = opts.includes(unit) ? opts : [unit].concat(opts);
    choices.forEach(function (u) {
      const opt = document.createElement('option');
      opt.value = u;
      opt.textContent = u;
      sel.appendChild(opt);
    });
    sel.value = unit;
    return sel;
  }

  /**
   * The unit a recipe line currently displays in: a per-line override (ing.unit) if set,
   * otherwise the shared definition's unit.
   *
   * @param {{id:string, unit?:string}} ing
   * @param {Object} newIngredientDefs
   * @param {Object} ingredientDefs
   * @returns {string}
   */
  function effectiveUnit(ing, newIngredientDefs, ingredientDefs) {
    const defs = newIngredientDefs || {};
    const globals = ingredientDefs || {};
    const def = Object.prototype.hasOwnProperty.call(defs, ing.id) ? defs[ing.id] : globals[ing.id];
    return ing.unit || (def ? def.units : 'count');
  }

  /**
   * Change an ingredient line's unit. When the old and new units are convertible, the
   * quantity is converted so the amount stays physically equivalent (e.g. 30 tsp -> 150 ml);
   * otherwise the quantity is left as-is.
   *
   * Scope is PER RECIPE LINE: for an existing (shared) ingredient the new unit is stored as
   * ing.unit, overriding the unit for THIS line only and leaving the shared definition — and
   * every other recipe that uses it — untouched. A brand-new ingredient (present in
   * newIngredientDefs) has no other dependents, so its definition's unit is updated instead
   * and no per-line override is kept. Selecting the shared default again clears the override.
   *
   * Mutates ctx.ing (ing.qty, ing.unit) and, for new ingredients, ctx.newIngredientDefs.
   *
   * @param {Object} ctx
   * @param {{id:string, qty:number, unit?:string}} ctx.ing  - The recipe ingredient line.
   * @param {Object} ctx.newIngredientDefs  - Per-recipe new ingredient defs { slug: {name,units,section} }.
   * @param {Object} ctx.ingredientDefs     - Global ingredient defs { slug: {name,units,section} }.
   * @param {string} newUnit                - The unit to switch to.
   * @returns {{changed:boolean, qty:number, unit:string, converted:(number|null)}}
   */
  function applyUnitChange(ctx, newUnit) {
    const ing = ctx.ing;
    const newIngredientDefs = ctx.newIngredientDefs || {};
    const ingredientDefs = ctx.ingredientDefs || {};

    const isNew = Object.prototype.hasOwnProperty.call(newIngredientDefs, ing.id);
    const def = isNew ? newIngredientDefs[ing.id] : ingredientDefs[ing.id];
    const defUnit = def ? def.units : 'count';
    const oldUnit = ing.unit || defUnit;

    if (!newUnit || newUnit === oldUnit) {
      return { changed: false, qty: ing.qty, unit: oldUnit, converted: null };
    }

    const converted = UnitConversion.convertQty(ing.qty, oldUnit, newUnit, ing.id);
    if (converted !== null && !Number.isNaN(converted)) {
      ing.qty = converted;
    }

    if (isNew) {
      newIngredientDefs[ing.id].units = newUnit;
      delete ing.unit;
    } else if (newUnit === defUnit) {
      delete ing.unit;
    } else {
      ing.unit = newUnit;
    }

    return { changed: true, qty: ing.qty, unit: effectiveUnit(ing, newIngredientDefs, ingredientDefs), converted: converted };
  }

  return {
    effectiveUnit: effectiveUnit,
    DEFAULT_UNIT_OPTIONS: DEFAULT_UNIT_OPTIONS,
    buildUnitSelect: buildUnitSelect,
    applyUnitChange: applyUnitChange,
  };
});
