/** @jest-environment jsdom */
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('public/index.html', 'utf8');
const source = html.slice(html.indexOf('        function createRecipeTitle('), html.indexOf('        // --- Update Button State ---'));
let ctx;
beforeEach(() => {
    document.body.innerHTML = '';
    ctx = vm.createContext({ document, favoritesData: {}, Auth: { isGuest: () => true, isUser: () => false, isAdmin: () => false }, DEFAULT_IMAGE: 'default.jpg', updateButtonState: jest.fn(), saveSelectedRecipeIds: jest.fn(), recipe: { id: 'test', name: 'Pasta by A Very Long Source', owner: 'preloaded', activeTime: '7 min', totalTime: '25 min' } });
    vm.runInContext(source + '; card = createRecipeCard(recipe);', ctx);
    document.body.appendChild(ctx.card);
});
test('author follows the name inline and retains full name for tooltip', () => {
    const title = ctx.card.querySelector('.recipe-card-title');
    expect(title.textContent).toBe('Pasta by A Very Long Source');
    expect(title.title).toBe(title.textContent);
    expect(title.querySelector('.recipe-card-source').className).not.toContain('block ');
});
test('active time is desktop-only and total time remains visible', () => {
    const active = ctx.card.querySelector('.recipe-active-time');
    expect(active.textContent).toBe('7 min active');
    expect(active.classList.contains('hidden')).toBe(true);
    expect(active.classList.contains('sm:inline')).toBe(true);
    expect(ctx.card.querySelector('.recipe-total-time').textContent).toBe('25 min total');
});
test('active-only time row is hidden on mobile and shown on desktop', () => {
    delete ctx.recipe.totalTime;
    vm.runInContext('card = createRecipeCard(recipe);', ctx);
    const row = ctx.card.querySelector('.recipe-card-times');
    expect(row.classList.contains('hidden')).toBe(true);
    expect(row.classList.contains('sm:flex')).toBe(true);
    expect(row.textContent).toContain('7 min active');
});
test('plus SVG toggles the native checkbox exactly once', () => {
    const input = ctx.card.querySelector('input');
    ctx.card.querySelector('[data-icon="plus"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(input.checked).toBe(true);
    expect(ctx.saveSelectedRecipeIds).toHaveBeenCalledTimes(1);
});

test('recipe names and attributions are rendered as text, never executable markup', () => {
    ctx.recipe.name = '<img src=x onerror=alert(1)> by <script>alert(2)</script>';
    vm.runInContext('title = createRecipeTitle(recipe)', ctx);
    expect(ctx.title.textContent).toBe(ctx.recipe.name);
    expect(ctx.title.querySelector('img, script')).toBeNull();
});
