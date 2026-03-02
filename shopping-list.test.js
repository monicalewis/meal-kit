/**
 * Tests for shopping list recipe-tracking feature.
 *
 * The logic under test lives in public/shopping-list.html but is pure JS —
 * we inline the functions here to allow Jest to run them without a browser.
 */

const UnitConversion = require('./public/js/unit-conversion.js');

// ── Inline the shoppingList-building logic ───────────────────────────────────
// Mirrors the loop in loadShoppingList() inside shopping-list.html.
function buildShoppingList(recipeData, selectedRecipes) {
    const shoppingList = {};
    recipeData.forEach(item => {
        if (selectedRecipes.includes(item.recipeName)) {
            const { ingredient, quantity, units, section } = item;
            const numQuantity = Number(quantity);
            if (isNaN(numQuantity)) return;

            const ingredientKey = ingredient.toLowerCase().trim();
            const unitKey = units ? units.toLowerCase().trim() : '';
            const combinedKey = `${ingredientKey}|${unitKey}`;
            const normalizedSection = section === 'Cheese area' ? 'Dairy' : section;

            if (shoppingList[combinedKey]) {
                shoppingList[combinedKey].quantity += numQuantity;
                shoppingList[combinedKey].recipes.add(item.recipeName);
            } else {
                shoppingList[combinedKey] = {
                    quantity: numQuantity,
                    units: units || '',
                    section: normalizedSection || 'Uncategorized',
                    originalName: ingredient,
                    recipes: new Set([item.recipeName])
                };
            }
        }
    });
    return shoppingList;
}

// ── Inline mergeCompatibleUnits ───────────────────────────────────────────────
// Mirrors the function in shopping-list.html.
function mergeCompatibleUnits(shoppingList, ingredientDefs) {
    const UI = UnitConversion.UNIT_INFO;
    const byName = {};
    for (const [key, item] of Object.entries(shoppingList)) {
        const name = item.originalName.toLowerCase().trim();
        if (!byName[name]) byName[name] = [];
        byName[name].push({ key, item });
    }

    const merged = {};
    for (const [name, entries] of Object.entries(byName)) {
        if (entries.length === 1) {
            merged[entries[0].key] = entries[0].item;
            continue;
        }

        const units = entries.map(e => e.item.units.toLowerCase().trim());
        const infos = units.map(u => UI[u]);
        const types = new Set(infos.filter(i => i).map(i => i.type));
        const allKnown = infos.every(i => i);

        if (!allKnown) {
            entries.forEach(e => { merged[e.key] = e.item; });
            continue;
        }

        const ingredientName = entries[0].item.originalName;
        const slug = UnitConversion.findSlugByName(ingredientName, ingredientDefs || {});
        const gpc = UnitConversion.getDensity(slug);

        if (types.size === 1) {
            const type = infos[0].type;
            let totalBase = 0;
            entries.forEach((e, i) => {
                totalBase += e.item.quantity * infos[i].toBase;
            });
            let displayUnit, displayQty;
            if (type === 'volume') {
                displayUnit = UnitConversion.bestVolumeUnit(totalBase);
                displayQty = totalBase / UI[displayUnit].toBase;
            } else {
                const totalCups = totalBase / gpc;
                const totalTsp = totalCups * 48;
                displayUnit = UnitConversion.bestVolumeUnit(totalTsp);
                displayQty = totalTsp / UI[displayUnit].toBase;
            }
            const first = entries[0].item;
            const mergedRecipes = new Set(entries.flatMap(e => [...(e.item.recipes || [])]));
            merged[`${name}|${displayUnit}`] = {
                quantity: displayQty,
                units: displayUnit,
                section: first.section,
                originalName: first.originalName,
                recipes: mergedRecipes
            };
        } else if (types.has('volume') && types.has('weight')) {
            let totalTsp = 0;
            entries.forEach((e, i) => {
                const info = infos[i];
                if (info.type === 'volume') {
                    totalTsp += e.item.quantity * info.toBase;
                } else {
                    const grams = e.item.quantity * info.toBase;
                    const cups = grams / gpc;
                    totalTsp += cups * 48;
                }
            });
            const displayUnit = UnitConversion.bestVolumeUnit(totalTsp);
            const displayQty = totalTsp / UI[displayUnit].toBase;
            const first = entries[0].item;
            const mergedRecipes2 = new Set(entries.flatMap(e => [...(e.item.recipes || [])]));
            merged[`${name}|${displayUnit}`] = {
                quantity: displayQty,
                units: displayUnit,
                section: first.section,
                originalName: first.originalName,
                recipes: mergedRecipes2
            };
        } else {
            entries.forEach(e => { merged[e.key] = e.item; });
        }
    }
    return merged;
}

// ── Tests: buildShoppingList recipe tracking ──────────────────────────────────

describe('buildShoppingList — recipe tracking', () => {
    test('single recipe: ingredient has that recipe in its set', () => {
        const recipeData = [
            { recipeName: 'Pasta Primavera', ingredient: 'Pasta', quantity: 8, units: 'oz', section: 'Other' }
        ];
        const result = buildShoppingList(recipeData, ['Pasta Primavera']);
        const item = result['pasta|oz'];
        expect(item.recipes).toBeInstanceOf(Set);
        expect([...item.recipes]).toEqual(['Pasta Primavera']);
    });

    test('same ingredient in two recipes: both recipe names are tracked', () => {
        const recipeData = [
            { recipeName: 'Pasta Primavera', ingredient: 'Olive oil', quantity: 2, units: 'tbsp', section: 'Cooking' },
            { recipeName: 'Caesar Salad',    ingredient: 'Olive oil', quantity: 1, units: 'tbsp', section: 'Cooking' }
        ];
        const result = buildShoppingList(recipeData, ['Pasta Primavera', 'Caesar Salad']);
        const item = result['olive oil|tbsp'];
        expect(item.quantity).toBe(3);
        expect(item.recipes.has('Pasta Primavera')).toBe(true);
        expect(item.recipes.has('Caesar Salad')).toBe(true);
        expect(item.recipes.size).toBe(2);
    });

    test('same ingredient in three recipes: all three recipe names are tracked', () => {
        const recipeData = [
            { recipeName: 'Recipe A', ingredient: 'Salt', quantity: 1, units: 'tsp', section: 'Cooking' },
            { recipeName: 'Recipe B', ingredient: 'Salt', quantity: 2, units: 'tsp', section: 'Cooking' },
            { recipeName: 'Recipe C', ingredient: 'Salt', quantity: 1, units: 'tsp', section: 'Cooking' }
        ];
        const result = buildShoppingList(recipeData, ['Recipe A', 'Recipe B', 'Recipe C']);
        const item = result['salt|tsp'];
        expect(item.quantity).toBe(4);
        expect(item.recipes.size).toBe(3);
        expect(item.recipes.has('Recipe A')).toBe(true);
        expect(item.recipes.has('Recipe B')).toBe(true);
        expect(item.recipes.has('Recipe C')).toBe(true);
    });

    test('ingredient unique to one recipe: only that recipe is tracked even when others are selected', () => {
        const recipeData = [
            { recipeName: 'Pasta Primavera', ingredient: 'Zucchini', quantity: 1, units: 'count', section: 'Produce' },
            { recipeName: 'Caesar Salad',    ingredient: 'Romaine',  quantity: 1, units: 'count', section: 'Produce' }
        ];
        const result = buildShoppingList(recipeData, ['Pasta Primavera', 'Caesar Salad']);
        expect([...result['zucchini|count'].recipes]).toEqual(['Pasta Primavera']);
        expect([...result['romaine|count'].recipes]).toEqual(['Caesar Salad']);
    });

    test('ingredient from unselected recipe is not included', () => {
        const recipeData = [
            { recipeName: 'Pasta Primavera', ingredient: 'Pasta', quantity: 8, units: 'oz', section: 'Other' },
            { recipeName: 'Tacos',           ingredient: 'Beef',  quantity: 1, units: 'lb', section: 'Other' }
        ];
        const result = buildShoppingList(recipeData, ['Pasta Primavera']);
        expect(result['pasta|oz']).toBeDefined();
        expect(result['beef|lb']).toBeUndefined();
    });
});

// ── Tests: mergeCompatibleUnits recipe propagation ────────────────────────────

describe('mergeCompatibleUnits — recipes propagation', () => {
    test('single entry passes recipes through unchanged', () => {
        const shoppingList = {
            'olive oil|tbsp': {
                quantity: 2, units: 'tbsp', section: 'Cooking',
                originalName: 'Olive oil',
                recipes: new Set(['Pasta Primavera'])
            }
        };
        const result = mergeCompatibleUnits(shoppingList, {});
        const values = Object.values(result);
        expect(values[0].recipes.has('Pasta Primavera')).toBe(true);
    });

    test('same-type volume merge unions recipe sets', () => {
        // 1 cup (Recipe A) + 3 tbsp (Recipe B) → single merged entry with both recipes
        const shoppingList = {
            'olive oil|cup': {
                quantity: 1, units: 'cup', section: 'Cooking',
                originalName: 'Olive oil',
                recipes: new Set(['Recipe A'])
            },
            'olive oil|tbsp': {
                quantity: 3, units: 'tbsp', section: 'Cooking',
                originalName: 'Olive oil',
                recipes: new Set(['Recipe B'])
            }
        };
        const result = mergeCompatibleUnits(shoppingList, {});
        const values = Object.values(result);
        expect(values.length).toBe(1);
        expect(values[0].recipes.has('Recipe A')).toBe(true);
        expect(values[0].recipes.has('Recipe B')).toBe(true);
    });

    test('same-type merge with shared recipe: no duplicate entries in set', () => {
        // Same recipe contributes twice (shouldn't happen in practice, but Set handles it)
        const shoppingList = {
            'salt|tsp': {
                quantity: 1, units: 'tsp', section: 'Cooking',
                originalName: 'Salt',
                recipes: new Set(['Recipe A'])
            },
            'salt|tbsp': {
                quantity: 1, units: 'tbsp', section: 'Cooking',
                originalName: 'Salt',
                recipes: new Set(['Recipe A'])
            }
        };
        const result = mergeCompatibleUnits(shoppingList, {});
        const values = Object.values(result);
        expect(values.length).toBe(1);
        expect(values[0].recipes.size).toBe(1);
        expect(values[0].recipes.has('Recipe A')).toBe(true);
    });

    test('unknown units keep separate entries with own recipes', () => {
        const shoppingList = {
            'chicken|breast': {
                quantity: 2, units: 'breast', section: 'Other',
                originalName: 'Chicken',
                recipes: new Set(['Recipe A'])
            },
            'chicken|thigh': {
                quantity: 4, units: 'thigh', section: 'Other',
                originalName: 'Chicken',
                recipes: new Set(['Recipe B'])
            }
        };
        const result = mergeCompatibleUnits(shoppingList, {});
        const values = Object.values(result);
        expect(values.length).toBe(2);
        // Each kept its own recipe
        const breastEntry = values.find(v => v.units === 'breast');
        const thighEntry  = values.find(v => v.units === 'thigh');
        expect([...breastEntry.recipes]).toEqual(['Recipe A']);
        expect([...thighEntry.recipes]).toEqual(['Recipe B']);
    });
});

// ── Tests: share flow — navigator.share data and Copy Link text ───────────────
// Mirrors the share button logic in shopping-list.html.

function buildShareData(cachedPlanUrl, fullListText) {
    if (cachedPlanUrl) {
        return { text: "Hey! Check out what I'm cooking this week:", url: cachedPlanUrl };
    }
    return { text: fullListText };
}

function buildCopyLinkText(planUrl) {
    return "Hey! Check out what I'm cooking this week:\n" + planUrl;
}

describe('share flow — navigator.share data', () => {
    test('with plan URL: passes greeting text and url separately', () => {
        const data = buildShareData('https://example.com/plan/abc123', 'full list...');
        expect(data.text).toBe("Hey! Check out what I'm cooking this week:");
        expect(data.url).toBe('https://example.com/plan/abc123');
    });

    test('without plan URL: passes full shopping list as text', () => {
        const fullList = 'Shopping List:\n\nProduce:\n- Tomato: 2 count\n';
        const data = buildShareData(null, fullList);
        expect(data.text).toBe(fullList);
        expect(data.url).toBeUndefined();
    });
});

describe('share flow — Copy Link button text', () => {
    test('combines greeting and plan URL', () => {
        const result = buildCopyLinkText('https://example.com/plan/abc123');
        expect(result).toBe("Hey! Check out what I'm cooking this week:\nhttps://example.com/plan/abc123");
    });

    test('includes both greeting text and URL in copied content', () => {
        const url = 'https://example.com/plan/xyz';
        const result = buildCopyLinkText(url);
        expect(result).toContain("Hey! Check out what I'm cooking this week:");
        expect(result).toContain(url);
    });
});
