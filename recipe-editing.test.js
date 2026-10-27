/** @jest-environment jsdom */
const fs = require('fs');
const vm = require('vm');
const Editor = require('./public/js/ingredient-editor');
const Conversion = require('./public/js/unit-conversion');
const Shopping = require('./public/js/shopping-units');

test('editing one recipe converts quantity without changing shared defaults or another recipe', () => {
    const defs = { flour: { name: 'Flour', units: 'cup' } };
    const a = { id: 'flour', qty: 1 }, b = { id: 'flour', qty: 2 };
    Editor.applyUnitChange({ ing: a, ingredientDefs: defs }, 'g');
    expect(a).toEqual({ id: 'flour', qty: 120, unit: 'g' });
    expect(Editor.effectiveUnit(a, {}, defs)).toBe('g');
    expect(Editor.effectiveUnit(b, {}, defs)).toBe('cup');
    expect(Editor.buildUnitSelect(a.unit).value).toBe('g');
    Editor.applyUnitChange({ ing: a, ingredientDefs: defs }, 'cup');
    expect(a).toEqual({ id: 'flour', qty: 1 });
});
test('import preserves an incompatible original unit', () => {
    expect(Conversion.convertParsedIngredients([{ id: 'onion', qty: 100, unit: 'g' }], { onion: { units: 'count' } }, {}))
        .toEqual([{ id: 'onion', qty: 100, unit: 'g' }]);
    expect(Conversion.convertQty(1, 'cup', 'g', 'unknown')).toBeNull();
});
function item(quantity, units, recipe) {
    return { quantity, units, originalName: 'Onion', section: 'Produce', recipes: new Set([recipe]) };
}
test('shopping list combines weights even when a count entry also exists, preserving sources', () => {
    const merged = Shopping.mergeCompatibleUnits({ a: item(2, 'count', 'A'), b: item(100, 'g', 'B'), c: item(1, 'kg', 'C'), d: item(1, 'cup', 'D') }, {});
    expect(Object.keys(merged)).toHaveLength(3);
    expect(merged.b.quantity).toBe(1100);
    expect([...merged.b.recipes]).toEqual(['B', 'C']);
    expect(merged.a.quantity).toBe(2);
    expect(merged.d.units).toBe('cup');
});
test('known ingredient density allows volume and weight to combine', () => {
    const merged = Shopping.mergeCompatibleUnits({ a: { ...item(1, 'cup', 'A'), originalName: 'Flour' }, b: { ...item(120, 'g', 'B'), originalName: 'Flour' } }, { flour: { name: 'Flour' } });
    expect(merged.a.quantity).toBe(2);
});
test.each(['index', 'shopping-list'])('%s inline scripts parse', name => {
    const html = fs.readFileSync(`public/${name}.html`, 'utf8');
    for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
});
test('shopping list export uses recipe line units', () => {
    const html = fs.readFileSync('public/index.html', 'utf8');
    const start = html.indexOf('        function buildShoppingListData(');
    const end = html.indexOf('        // --- Event Listeners ---', start);
    const ctx = { recipeData: { ingredientDefs: { flour: { name: 'Flour', units: 'cup' } }, recipes: [{ id: 'a', name: 'A', ingredients: [{ id: 'flour', qty: 120, unit: 'g' }] }] } };
    vm.createContext(ctx);
    vm.runInContext(html.slice(start, end) + '; result = buildShoppingListData(["a"]);', ctx);
    expect(ctx.result[0].units).toBe('g');
});
