/** @jest-environment jsdom */
// Execute the actual client functions rather than a duplicate implementation.
const fs = require('node:fs');
const vm = require('node:vm');
const RecipeSeasons = require('./public/js/recipe-seasons');
const html = fs.readFileSync('public/index.html', 'utf8');
const selectionCode = html.slice(html.indexOf('        function createRecipeTitle('), html.indexOf('        // --- Initialize ---'));
const plannerCode = html.slice(html.indexOf('        function mpResetTimeFilterToAll('), html.indexOf('        let mealPlannerEl'));

function fixture(loggedIn) {
    document.body.innerHTML = '<div id="recipe-list"></div><button id="generate-list-button"></button><button id="share-plan-button"></button>';
    localStorage.clear();
    const recipes = [
        { id: 'alpha', name: 'Alpha', owner: 'preloaded', ingredients: [{ id: 'flour', qty: 120, unit: 'g' }] },
        { id: 'beta', name: 'Beta', owner: 'preloaded', ingredients: [{ id: 'flour', qty: 1 }] },
        { id: 'archived', name: 'Archived', owner: 'preloaded', hidden: true, ingredients: [] }
    ];
    const context = vm.createContext({
        document, localStorage, Event, Set, console,
        window: { location: { href: '/' } },
        Auth: { user: loggedIn ? { id: 7 } : null, isGuest: () => !loggedIn, isUser: () => loggedIn, isAdmin: () => false, fetch: jest.fn().mockResolvedValue({}), trackActivity: jest.fn() },
        DEFAULT_IMAGE: 'default.jpg', favoritesData: {}, sharedPlanData: null, showArchived: true, timeFilter: 'all',
        recipeData: { recipes, ingredientDefs: { flour: { name: 'Flour', units: 'cup', section: 'Cooking' } } },
        getSelectableRecipes: () => recipes, passesTimeFilter: () => true, selectedSeasons: [], passesSeasonFilter: recipe => RecipeSeasons.matches(recipe.id, []),
        recipeListDiv: document.getElementById('recipe-list'), generateButton: document.getElementById('generate-list-button'),
        closeMealPlanner: jest.fn()
    });
    vm.runInContext(selectionCode + plannerCode, context);
    const render = () => vm.runInContext('populateRecipeCards()', context);
    const checkbox = id => document.querySelector(`input[value="${id}"]`);
    const card = id => checkbox(id).closest('.group');
    return { context, render, checkbox, card };
}
afterEach(() => jest.restoreAllMocks());

function assertVisualState(card, selected) {
    expect(card.querySelector('input').checked).toBe(selected);
    expect(card.classList.contains('ring-green-500')).toBe(selected);
    expect(card.querySelector('[data-icon="plus"]').classList.contains('hidden')).toBe(selected);
    expect(card.querySelector('[data-icon="check"]').classList.contains('hidden')).toBe(!selected);
}

describe.each([['guest', false], ['signed-in user', true]])('%s recipe selection', (_, loggedIn) => {
    let f;
    beforeEach(() => { f = fixture(loggedIn); });
    test('restores multiple selections, rings, icons, and action buttons without changing saved IDs', () => {
        const saved = JSON.stringify(['alpha', 'beta', 'missing', 'archived']);
        localStorage.setItem('selectedRecipeIds', saved);
        const write = jest.spyOn(Storage.prototype, 'setItem');
        f.render();
        assertVisualState(f.card('alpha'), true);
        assertVisualState(f.card('beta'), true);
        expect(document.querySelector('.card-archived')?.classList.contains('ring-green-500') || false).toBe(false);
        expect(document.getElementById('generate-list-button').textContent.trim()).toBe('Get shopping list');
        expect(document.getElementById('generate-list-button').disabled).toBe(false);
        expect(document.getElementById('share-plan-button').disabled).toBe(false);
        expect(localStorage.getItem('selectedRecipeIds')).toBe(saved);
        expect(write).not.toHaveBeenCalled();
        write.mockRestore();
    });
    test.each(['img', '.recipe-card-title', '[data-icon="plus"]', '[data-icon="plus"] path', 'label > div', 'label'])('%s toggles once, persists, and toggles off on a second tap', target => {
        f.render();
        const tap = () => f.card('alpha').querySelector(target).dispatchEvent(new MouseEvent('click', { bubbles: true }));
        tap();
        assertVisualState(f.card('alpha'), true);
        expect(JSON.parse(localStorage.getItem('selectedRecipeIds'))).toEqual(['alpha']);
        expect(document.getElementById('generate-list-button').disabled).toBe(false);
        tap();
        assertVisualState(f.card('alpha'), false);
        expect(JSON.parse(localStorage.getItem('selectedRecipeIds'))).toEqual([]);
        expect(document.getElementById('generate-list-button').disabled).toBe(true);
        expect(document.getElementById('share-plan-button').disabled).toBe(true);
    });
    test('menu and favorite controls do not select the card', () => {
        f.render();
        f.card('alpha').querySelector('.card-menu-btn').click();
        assertVisualState(f.card('alpha'), false);
        f.context.favoritesData.alpha = { lastSelected: new Date().toISOString() };
        f.render();
        f.card('alpha').querySelector('button[title="Remove from favorites"]').click();
        assertVisualState(f.card('alpha'), false);
    });
    test('card has the iOS tap affordance; archived cards do not toggle', () => {
        f.render();
        expect(f.card('alpha').classList.contains('cursor-pointer')).toBe(true);
        vm.runInContext('archivedCard = createRecipeCard(recipeData.recipes[2])', f.context);
        const archived = f.context.archivedCard;
        document.body.appendChild(archived);
        archived.click();
        expect(archived.classList.contains('ring-green-500')).toBe(false);
    });
    test('re-render preserves checkmarks, then generates the correct shopping list', () => {
        f.render();
        f.card('alpha').querySelector('.recipe-card-title').click();
        f.card('beta').querySelector('.recipe-card-title').click();
        f.render();
        assertVisualState(f.card('alpha'), true);
        assertVisualState(f.card('beta'), true);
        document.getElementById('generate-list-button').click();
        expect(f.context.window.location.href).toBe('/shopping-list.html');
        expect(JSON.parse(localStorage.getItem('selectedRecipes'))).toEqual(['Alpha', 'Beta']);
        expect(JSON.parse(localStorage.getItem('recipeData')).map(item => [item.quantity, item.units])).toEqual([[120, 'g'], [1, 'cup']]);
        expect(f.context.Auth.fetch).toHaveBeenCalledTimes(loggedIn ? 1 : 0);
    });
    test('planner selection persists and is restored when returning to the recipe page', () => {
        f.render();
        vm.runInContext('mpApplyPlan(["alpha", "beta"])', f.context);
        expect(f.context.window.location.href).toBe('/shopping-list.html');
        f.render();
        assertVisualState(f.card('alpha'), true);
        assertVisualState(f.card('beta'), true);
    });
    test.each(['not json', '{}', 'null'])('invalid saved selection %s does not break rendering', value => {
        localStorage.setItem('selectedRecipeIds', value);
        expect(f.render).not.toThrow();
        assertVisualState(f.card('alpha'), false);
    });
});
