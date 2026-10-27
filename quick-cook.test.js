/** @jest-environment jsdom */
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('public/index.html', 'utf8');
const timing = html.slice(html.indexOf('        function totalTimeMinutes('), html.indexOf('        function setupTimeFilter('));
const planner = html.slice(html.indexOf('        function mpEsc('), html.indexOf("        (function(){ const b = document.getElementById('suggest-plan-button')"));
let recipes, context;
beforeEach(() => {
    document.body.innerHTML = '';
    recipes = [
        { id: 'quick', name: 'Quick', totalTime: '20 min', ingredients: [{ id: 'flour' }] },
        { id: 'boundary', name: 'Exactly 30', totalTime: '30 min', ingredients: [{ id: 'flour' }] },
        { id: 'slow', name: 'Slow', activeTime: '10 min', totalTime: '1 hour 10 minutes', ingredients: [{ id: 'flour' }] },
        { id: 'unknown', name: 'Unknown time', ingredients: [{ id: 'flour' }] }
    ];
    context = vm.createContext({ document, selectedSeasons: [], getSelectableRecipes: () => recipes });
    vm.runInContext("let timeFilter = 'all';\n" + timing + planner, context);
});
test('quick plans exclude unknown, exactly 30-minute, and slow total times', () => {
    const plans = vm.runInContext("mpGenerate(3, 'yes', true)", context);
    expect(plans).toHaveLength(2);
    plans.forEach(plan => expect(Array.from(plan, r => r.id)).toEqual(['quick']));
});
test('no preference includes every cooking time', () => {
    const plans = vm.runInContext("mpGenerate(7, 'no', false)", context);
    expect(plans[0]).toHaveLength(4);
});
test.each([['1 hr 20 min',80],['1 hour',60],['25 minutes',25],['29.5 min',29.5],['25',25],['overnight',null]])('parses %s', (value, result) => {
    context.value = value;
    expect(vm.runInContext('totalTimeMinutes(value)', context)).toBe(result);
});
test('planner preference controls suggestions and clears stale results', () => {
    vm.runInContext('openMealPlanner()', context);
    document.querySelector('#mp-generate').click();
    expect(document.querySelector('#mp-results').textContent).toContain('Slow');
    const yes = document.querySelector('[data-quick="yes"]');
    yes.click();
    expect(yes.getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('#mp-results').textContent).toBe('');
    document.querySelector('#mp-generate').click();
    const results = document.querySelector('#mp-results').textContent;
    expect(results).toContain('Only 1 matching recipe');
    expect(results).toContain('Quick');
    expect(results).not.toContain('Slow');
    document.querySelector('[data-quick="no"]').click();
    document.querySelector('#mp-generate').click();
    expect(document.querySelector('#mp-results').textContent).toContain('Slow');
});
test('empty quick results offer a way to include all times', () => {
    recipes = recipes.filter(r => r.id !== 'quick');
    vm.runInContext('openMealPlanner()', context);
    document.querySelector('[data-quick="yes"]').click();
    document.querySelector('#mp-generate').click();
    expect(document.querySelector('#mp-results').textContent).toContain('No recipes with a total time under 30 minutes');
    expect(document.querySelectorAll('.mp-select')).toHaveLength(0);
});
test('all page scripts still parse', () => {
    for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
});
