/** @jest-environment jsdom */
/**
 * Tests for editing a suggested meal plan: removing a recipe (×), backfilling a
 * removed slot with a randomly chosen qualifying recipe, and "Select these N
 * recipes" taking the user straight to the shopping list.
 *
 * The planner logic is pure, framework-free DOM JS extracted from index.html, so
 * it runs identically on web, iOS and Android browsers — there is no
 * platform-specific branch here to test separately. Selection (logged-in vs
 * guest) is handled downstream in generateShoppingList(), which is stubbed here
 * so these tests assert the wiring, not the navigation.
 */
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('public/index.html', 'utf8');
const timing = html.slice(html.indexOf('        function totalTimeMinutes('), html.indexOf('        function setupTimeFilter('));
const planner = html.slice(html.indexOf('        function mpEsc('), html.indexOf("        (function(){ const b = document.getElementById('suggest-plan-button')"));

let recipes, context, shoppingCalls;
beforeEach(() => {
    document.body.innerHTML = '';
    // A pool of 5 qualifying recipes (all have ingredients, none quick-only filtered).
    recipes = [
        { id: 'r1', name: 'Alpha', totalTime: '45 min', ingredients: [{ id: 'a' }] },
        { id: 'r2', name: 'Bravo', totalTime: '45 min', ingredients: [{ id: 'b' }] },
        { id: 'r3', name: 'Charlie', totalTime: '45 min', ingredients: [{ id: 'c' }] },
        { id: 'r4', name: 'Delta', totalTime: '45 min', ingredients: [{ id: 'd' }] },
        { id: 'r5', name: 'Echo', totalTime: '45 min', ingredients: [{ id: 'e' }] },
    ];
    shoppingCalls = [];
    context = vm.createContext({
        document, selectedSeasons: [],
        getSelectableRecipes: () => recipes,
        generateShoppingList: (ids) => { shoppingCalls.push(ids); },
    });
    vm.runInContext("let timeFilter = 'all';\n" + timing + planner, context);
});

// Open the planner and generate plans with the defaults (3 meals, share = yes).
function openAndGenerate() {
    vm.runInContext('openMealPlanner()', context);
    document.querySelector('#mp-generate').click();
}

const removeButtons = plan => document.querySelectorAll(`.mp-remove[data-plan="${plan}"]`);
const names = plan => Array.from(removeButtons(plan)).map(b => b.getAttribute('aria-label'));

test('every suggested recipe gets a remove (×) control', () => {
    openAndGenerate();
    expect(removeButtons(0)).toHaveLength(3);
    expect(removeButtons(1)).toHaveLength(3);
});

test('a full plan shows no backfill option until something is removed', () => {
    openAndGenerate();
    expect(document.querySelector('.mp-backfill[data-plan="0"]')).toBeNull();

    document.querySelector('.mp-remove[data-plan="0"][data-idx="0"]').click();

    expect(removeButtons(0)).toHaveLength(2);
    expect(document.querySelector('.mp-backfill[data-plan="0"]')).not.toBeNull();
    // Editing one option leaves the other untouched.
    expect(removeButtons(1)).toHaveLength(3);
});

test('backfill fills the slot with a qualifying recipe and never duplicates', () => {
    openAndGenerate();
    document.querySelector('.mp-remove[data-plan="0"][data-idx="0"]').click();
    document.querySelector('.mp-backfill[data-plan="0"]').click();

    const after = names(0);
    expect(after).toHaveLength(3);            // back up to the requested count
    expect(new Set(after).size).toBe(3);      // no duplicate recipes
    // Full again, so the backfill option is withdrawn.
    expect(document.querySelector('.mp-backfill[data-plan="0"]')).toBeNull();
});

test('no backfill is offered when the plan already holds every qualifying recipe', () => {
    // Only 2 qualifying recipes for a 3-meal plan: the generated plan contains
    // both, so there is nothing left to backfill with — until one is removed.
    recipes = recipes.slice(0, 2);
    openAndGenerate();
    expect(removeButtons(0)).toHaveLength(2);
    expect(document.querySelector('.mp-backfill[data-plan="0"]')).toBeNull();

    // Removing one frees a slot and returns that recipe to the candidate pool.
    document.querySelector('.mp-remove[data-plan="0"][data-idx="0"]').click();
    expect(removeButtons(0)).toHaveLength(1);
    expect(document.querySelector('.mp-backfill[data-plan="0"]')).not.toBeNull();
});

test('selecting a plan builds the shopping list and closes the planner', () => {
    openAndGenerate();
    document.querySelector('.mp-select[data-plan="0"]').click();

    expect(shoppingCalls).toHaveLength(1);
    expect(shoppingCalls[0]).toHaveLength(3);
    shoppingCalls[0].forEach(id => expect(recipes.map(r => r.id)).toContain(id));
    expect(document.querySelector('#mp-results')).toBeNull(); // overlay was removed
});

test('select reflects edits: removing a recipe sends the reduced set', () => {
    openAndGenerate();
    document.querySelector('.mp-remove[data-plan="0"][data-idx="0"]').click();
    document.querySelector('.mp-select[data-plan="0"]').click();
    expect(shoppingCalls[0]).toHaveLength(2);
});

test('removing every recipe disables select and blocks navigation', () => {
    openAndGenerate();
    // Indices shift down after each removal, so index 0 always exists until empty.
    document.querySelector('.mp-remove[data-plan="0"][data-idx="0"]').click();
    document.querySelector('.mp-remove[data-plan="0"][data-idx="0"]').click();
    document.querySelector('.mp-remove[data-plan="0"][data-idx="0"]').click();

    const select = document.querySelector('.mp-select[data-plan="0"]');
    expect(select.disabled).toBe(true);
    select.click();
    expect(shoppingCalls).toHaveLength(0);
});
