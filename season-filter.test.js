/** @jest-environment jsdom */
const fs = require('node:fs');
const vm = require('node:vm');
const RecipeSeasons = require('./public/js/recipe-seasons');
const html = fs.readFileSync('public/index.html', 'utf8');
const dropdownStart = html.indexOf('<details id="season-filter"');
const dropdown = html.slice(dropdownStart, html.indexOf('</details>', dropdownStart) + '</details>'.length);
const seasons = html.slice(html.indexOf('        // Seasons live in an external'), html.indexOf('        // --- Get Selectable Recipes'));
const selectable = html.slice(html.indexOf('        // --- Get Selectable Recipes'), html.indexOf('        // --- Cooking time filter'));
const timing = html.slice(html.indexOf('        // --- Cooking time filter'), html.indexOf('        function createRecipeTitle('));
const cards = html.slice(html.indexOf('        function createRecipeTitle('), html.indexOf('        // --- Initialize ---'));
const planner = html.slice(html.indexOf('        function mpEsc('), html.indexOf('        function mpResetTimeFilterToAll('));

function setup(loggedIn = false) {
    document.body.innerHTML = dropdown + '<button class="time-filter-btn" data-time="all">All</button><button class="time-filter-btn" data-time="under30">Under 30 min</button><div id="recipe-list"></div><button id="generate-list-button"></button><button id="share-plan-button"></button>';
    localStorage.clear();
    const recipes = [
        { id: 'caponata', name: 'Caponata', totalTime: '20 min' },
        { id: 'summer-corn-and-peach-salad', name: 'Corn salad', totalTime: '15 min' },
        { id: 'mushroom-croquettes', name: 'Croquettes', totalTime: '45 min' },
        { id: 'burrito-bowls', name: 'Burrito bowls', totalTime: '20 min' },
        { id: 'personal-recipe', name: 'Personal recipe', totalTime: '10 min' }
    ].map(recipe => ({ ...recipe, owner: 'preloaded', ingredients: [{ id: 'flour', qty: 1 }] }));
    const before = JSON.stringify(recipes);
    const ctx = vm.createContext({ document, localStorage, Event, window: { location: {} }, RecipeSeasons,
        recipeData: { recipes, ingredientDefs: { flour: { name: 'Flour', units: 'cup' } } },
        favoritesData: {}, sharedPlanData: null, DEFAULT_IMAGE: 'default.jpg',
        recipeListDiv: document.getElementById('recipe-list'), generateButton: document.getElementById('generate-list-button'),
        Auth: { isGuest: () => !loggedIn, isUser: () => loggedIn, isAdmin: () => false, fetch: jest.fn().mockResolvedValue({}), trackActivity: jest.fn() }
    });
    vm.runInContext(seasons + selectable + timing + cards + planner + '; populateRecipeCards();', ctx);
    return { ctx, recipes, before };
}
function visible() { return Array.from(document.querySelectorAll('input[name="recipe"]'), input => input.value).sort(); }
function choose(season) { document.querySelector(`input[name="season"][value="${season}"]`).click(); }

test('external lookup covers every CSV row and points at real recipe IDs', () => {
    const data = {};
    vm.runInNewContext(fs.readFileSync('recipes.js', 'utf8').replace(/^const recipeData/m, 'var recipeData'), data);
    const ids = new Set(data.recipeData.recipes.map(recipe => recipe.id));
    const rows = fs.readFileSync('Seasons.csv', 'utf8').trim().split(/\r?\n/).length - 1;
    expect(Object.keys(RecipeSeasons.byRecipeId)).toHaveLength(rows);
    for (const [id, assigned] of Object.entries(RecipeSeasons.byRecipeId)) {
        expect(ids.has(id)).toBe(true);
        expect(assigned.length).toBeGreaterThan(0);
        assigned.forEach(season => expect(RecipeSeasons.SEASONS).toContain(season));
    }
});
test('uses the CSV as written, including spring corn salad and the squash alias', () => {
    expect(RecipeSeasons.matches('summer-corn-and-peach-salad', ['Spring'])).toBe(true);
    expect(RecipeSeasons.matches('roast-butternut-squash-and-red-onion-with-zaatar-tahini-by-ottolenghi', ['Winter'])).toBe(true);
});

describe.each([['guest', false], ['signed-in user', true]])('%s seasonal filtering', (_, loggedIn) => {
    test('single season includes year-round recipes; multiple seasons use OR', () => {
        setup(loggedIn);
        choose('Summer');
        expect(visible()).toEqual(['burrito-bowls', 'caponata', 'summer-corn-and-peach-salad']);
        choose('Winter');
        expect(visible()).toEqual(['burrito-bowls', 'caponata', 'mushroom-croquettes', 'summer-corn-and-peach-salad']);
        expect(document.getElementById('season-filter-label').textContent).toBe('Seasons (2)');
    });
    test('combines season and cooking time, and resets to all seasons', () => {
        setup(loggedIn); choose('Winter');
        document.querySelector('[data-time="under30"]').click();
        expect(visible()).toEqual(['burrito-bowls']);
        document.getElementById('season-filter-clear').click();
        expect(visible()).toEqual(['burrito-bowls', 'caponata', 'personal-recipe', 'summer-corn-and-peach-salad']);
        expect(document.getElementById('season-filter-label').textContent).toBe('Seasons: All');
    });
    test('filters suggested plans without mutating recipes or adding season badges', () => {
        const f = setup(loggedIn); choose('Winter');
        const plans = vm.runInContext('mpGenerate(7, "yes")', f.ctx);
        plans.forEach(plan => expect(Array.from(plan, recipe => recipe.id).sort()).toEqual(['burrito-bowls', 'mushroom-croquettes']));
        expect(JSON.stringify(f.recipes)).toBe(f.before);
        document.querySelectorAll('.recipe-card-content').forEach(card => expect(card.textContent).not.toMatch(/Spring|Summer|Fall|Winter/));
    });
    test('dropdown changes preserve saved recipe selections and restored checkmarks', () => {
        const f = setup(loggedIn);
        localStorage.setItem('selectedRecipeIds', '["caponata"]');
        choose('Winter');
        expect(localStorage.getItem('selectedRecipeIds')).toBe('["caponata"]');
        document.getElementById('season-filter-clear').click();
        const input = document.querySelector('input[value="caponata"]');
        expect(input.checked).toBe(true);
        expect(input.closest('.group').querySelector('[data-icon="check"]').classList.contains('hidden')).toBe(false);
    });
});
test('empty seasonal results explain how to reset', () => {
    const f = setup(); f.ctx.recipeData.recipes = [f.recipes[4]];
    choose('Winter');
    expect(document.getElementById('recipe-list').textContent).toContain('No recipes match your filters');
    document.getElementById('season-filter-clear').click();
    expect(visible()).toEqual(['personal-recipe']);
});
test('dropdown closes on outside click and Escape', () => {
    setup(); const details = document.getElementById('season-filter'); details.open = true;
    document.body.click(); expect(details.open).toBe(false);
    details.open = true; details.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(details.querySelector('summary'));
});

test('shared-plan recipes obey the season filter and are not duplicated', () => {
    const f = setup();
    f.ctx.sharedPlanData = { createdBy: 'Friend', createdAt: '2026-10-27T12:00:00Z', recipes: [f.recipes[0], f.recipes[2]] };
    choose('Winter');
    expect(visible()).toEqual(['burrito-bowls', 'mushroom-croquettes']);
    expect(document.getElementById('recipe-list').textContent).toContain('Shared by Friend');
    expect(document.querySelectorAll('input[value="mushroom-croquettes"]')).toHaveLength(1);
});

test('opening the dropdown shifts an overflowing panel inside a narrow viewport', () => {
    const f = setup(); f.ctx.window.innerWidth = 390;
    const details = document.getElementById('season-filter');
    const panel = details.querySelector('fieldset');
    panel.getBoundingClientRect = () => ({ left: -65, right: 143 });
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    expect(panel.style.transform).toBe('translateX(77px)');
});

function openSeasonPlanner(fixture) {
    const modal = html.slice(html.indexOf('        function mpResetTimeFilterToAll('), html.indexOf("        (function(){ const b = document.getElementById('suggest-plan-button')"));
    vm.runInContext(modal + '; openMealPlanner();', fixture.ctx);
}
function planSeason(season) {
    document.querySelector(`#mp-season-filter input[value="${season}"]`).click();
}
function planNames() {
    return Array.from(document.querySelectorAll('.mp-remove[data-plan="0"]'), button => button.getAttribute('aria-label').replace(/^Remove /, '')).sort();
}

test('planner inherits page seasons, permits independent multi-select, and clears stale plans', () => {
    const f = setup(); choose('Winter'); openSeasonPlanner(f);
    expect(document.querySelector('#mp-season-filter input[value="Winter"]').checked).toBe(true);
    document.querySelector('#mp-generate').click();
    expect(planNames()).toEqual(['Burrito bowls', 'Croquettes']);
    planSeason('Summer');
    expect(document.querySelector('#mp-results').textContent).toBe('');
    planSeason('Winter');
    document.querySelector('#mp-generate').click();
    expect(planNames()).toEqual(['Burrito bowls', 'Caponata', 'Corn salad']);
    expect(document.querySelector('#season-filter input[value="Winter"]').checked).toBe(true);
    expect(visible()).toEqual(['burrito-bowls', 'mushroom-croquettes']);
    document.querySelector('.mp-select[data-plan="0"]').click();
    expect(JSON.parse(localStorage.getItem('selectedRecipeIds')).sort()).toEqual(['burrito-bowls', 'caponata', 'summer-corn-and-peach-salad']);
});
test('planner combines season with quick cooking and keeps backfills within the selected season', () => {
    const f = setup(); openSeasonPlanner(f); planSeason('Winter');
    document.querySelector('#mp-generate').click();
    document.querySelector('.mp-remove[data-plan="0"]').click();
    document.querySelector('.mp-backfill[data-plan="0"]').click();
    expect(planNames()).toEqual(['Burrito bowls', 'Croquettes']);
    document.querySelector('[data-quick="yes"]').click();
    document.querySelector('#mp-generate').click();
    expect(planNames()).toEqual(['Burrito bowls']);
});
test('planner All seasons overrides page filtering without changing it', () => {
    const f = setup(); choose('Winter'); openSeasonPlanner(f);
    document.querySelector('#mp-season-clear').click();
    expect(document.querySelector('#mp-season-label').textContent).toBe('All seasons');
    const pool = vm.runInContext('mpPool(false, [])', f.ctx);
    expect(pool).toHaveLength(5);
    expect(document.querySelector('#season-filter input[value="Winter"]').checked).toBe(true);
});
test('planner empty results explain how to change seasonal preferences', () => {
    const f = setup(); f.ctx.recipeData.recipes = [f.recipes[0]];
    openSeasonPlanner(f); planSeason('Winter');
    document.querySelector('#mp-generate').click();
    expect(document.querySelector('#mp-results').textContent).toContain('Try other seasons');
    expect(document.querySelectorAll('.mp-select')).toHaveLength(0);
});
