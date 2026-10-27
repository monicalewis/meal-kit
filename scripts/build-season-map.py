"""Build a separate filter lookup from Seasons.csv; never alter recipes.js."""
import csv
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEASONS = ['Spring', 'Summer', 'Fall', 'Winter']

def normalize(name):
    name = name.lower().split(' by ')[0].replace('w/', 'with').replace('&', 'and').replace('+', 'and')
    return re.sub(r'[^a-z0-9]+', ' ', name).strip()

loader = "const fs=require('fs'),vm=require('vm');const s={};vm.runInNewContext(fs.readFileSync('recipes.js','utf8').replace(/^const recipeData/m,'var recipeData'),s);console.log(JSON.stringify(s.recipeData.recipes));"
recipes = json.loads(subprocess.check_output(['node', '-e', loader], cwd=ROOT, text=True))
by_name = {normalize(recipe['name']): recipe['id'] for recipe in recipes}
aliases = {'roasted butternut squash and red onion': 'roast-butternut-squash-and-red-onion-with-zaatar-tahini-by-ottolenghi'}
lookup = {}
with (ROOT / 'Seasons.csv').open(newline='', encoding='utf-8-sig') as source:
    for row in csv.DictReader(source):
        name = normalize(row['Recipe'])
        recipe_id = by_name.get(name) or aliases.get(name)
        if not recipe_id or recipe_id not in {recipe['id'] for recipe in recipes}:
            raise ValueError(f"No recipe matches CSV row: {row['Recipe']}")
        seasons = SEASONS if row['Seasons'].strip().lower() == 'all seasons' else [part.strip() for part in row['Seasons'].split(',')]
        if any(season not in SEASONS for season in seasons) or not seasons:
            raise ValueError(f"Invalid seasons for {row['Recipe']}")
        if recipe_id in lookup:
            raise ValueError(f'Duplicate CSV recipe: {recipe_id}')
        lookup[recipe_id] = [season for season in SEASONS if season in seasons]

script = '''// Generated from Seasons.csv by python3 scripts/build-season-map.py.
// Filter lookup only: no season fields or badges are added to recipe objects.
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) module.exports = factory();
    else root.RecipeSeasons = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
    const byRecipeId = LOOKUP;
    function matches(recipeId, selected) {
        if (!selected || selected.length === 0) return true;
        const seasons = byRecipeId[recipeId] || [];
        return selected.some(season => seasons.includes(season));
    }
    return { SEASONS, byRecipeId, matches };
});
'''.replace('LOOKUP', json.dumps(lookup, indent=4))
(ROOT / 'public/js/recipe-seasons.js').write_text(script)
print(f'Built external season lookup for {len(lookup)} recipes. Recipe data unchanged.')
