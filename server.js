require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname)));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const gemini = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// --- Database setup (optional — falls back to file if DATABASE_URL not set) ---
let pool = null;
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// Read recipeData from DB or file
async function getRecipeData() {
  if (pool) {
    const result = await pool.query("SELECT value FROM app_data WHERE key = 'recipeData'");
    if (result.rows.length > 0) return result.rows[0].value;
    return { ingredientDefs: {}, recipes: [] };
  }
  // File-based fallback
  const recipesPath = path.join(__dirname, 'recipes.js');
  const content = fs.readFileSync(recipesPath, 'utf-8')
    .replace(/^const recipeData/m, 'var recipeData');
  const sandbox = {};
  vm.runInNewContext(content, sandbox);
  return sandbox.recipeData || { ingredientDefs: {}, recipes: [] };
}

// Write recipeData to DB or file
async function saveRecipeData(recipeData) {
  if (pool) {
    await pool.query(
      `INSERT INTO app_data (key, value) VALUES ('recipeData', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [JSON.stringify(recipeData)]
    );
    return;
  }
  // File-based fallback
  const recipesPath = path.join(__dirname, 'recipes.js');
  const newContent = '// Recipe data - edit this file to add/modify recipes\nconst recipeData = ' +
    JSON.stringify(recipeData, null, 2) + ';\n';
  fs.writeFileSync(recipesPath, newContent, 'utf-8');
}

// --- GET /api/recipes ---
// Serves recipe data as JSON (replaces static recipes.js script tag)
app.get('/api/recipes', async (req, res) => {
  try {
    const data = await getRecipeData();
    res.json(data);
  } catch (err) {
    console.error('Error loading recipes:', err.message);
    res.status(500).json({ error: 'Failed to load recipe data' });
  }
});

// --- POST /api/fetch-url ---
// Fetches a recipe page HTML server-side (avoids CORS)
app.post('/api/fetch-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipePlanner/1.0)',
        'Accept': 'text/html'
      }
    });
    if (!response.ok) {
      return res.status(502).json({ error: `Failed to fetch URL (HTTP ${response.status})` });
    }
    const html = await response.text();
    res.json({ html });
  } catch (err) {
    res.status(502).json({ error: `Could not reach URL: ${err.message}` });
  }
});

// --- POST /api/parse-recipe ---
// Sends recipe ingredients to Claude for structured parsing
app.post('/api/parse-recipe', async (req, res) => {
  const { recipeName, ingredients, existingDefs } = req.body;
  if (!recipeName || !ingredients) {
    return res.status(400).json({ error: 'recipeName and ingredients are required' });
  }

  const prompt = `You are a recipe ingredient parser for a meal planning app.

Here are the existing ingredient definitions in the app (JSON object keyed by slug ID):
${JSON.stringify(existingDefs, null, 2)}

A user wants to import a recipe called "${recipeName}" with these raw ingredient strings:
${ingredients.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Your job:
1. For each ingredient string, determine the core ingredient, the quantity, and ignore preparation instructions (e.g., "finely chopped", "divided").
2. Match each ingredient to an existing ingredientDef by slug ID if a reasonable match exists. Use fuzzy matching — e.g., "yellow onion" matches "yellow-onion", "fresh basil leaves" matches "fresh-basil".
3. For ingredients that do NOT match any existing def, create a new ingredientDef entry with:
   - slug: lowercase, hyphenated (e.g., "coconut-milk")
   - name: Readable name (e.g., "Coconut milk")
   - units: the most appropriate unit from the recipe (e.g., "cup", "oz", "count", "tbsp", "tsp", "lbs", "bunch", "can", "cloves", "g", "ml", "kg")
   - section: one of "Produce", "Bread", "Cooking", "Cheese section", "Dairy", "Nuts", "Frozen", "Snacks", "Other"
4. Skip ingredients that are just salt, pepper, water, or basic cooking oil (olive oil, vegetable oil) UNLESS they appear in the existing defs.
5. Convert fractional quantities to decimals (e.g., 1/2 = 0.5, 1/3 = 0.33, 2/3 = 0.67).
6. For "to taste" ingredients, use qty of 1.
7. IMPORTANT unit handling:
   - When matching to an EXISTING ingredientDef, you MUST convert the quantity to the existing def's units. For example, if the existing def for flour uses "cup" and the recipe says "250g flour", convert to approximately 2 cups (qty: 2). Use standard cooking conversions (1 cup flour ≈ 125g, 1 cup sugar ≈ 200g, 1 cup liquid ≈ 240ml, etc.).
   - When creating a NEW ingredientDef, use the recipe's original units. If the recipe uses metric (g, ml, kg), keep those units.

Return ONLY valid JSON in this exact format, no other text:
{
  "ingredients": [
    { "id": "existing-slug-or-new-slug", "qty": 2 }
  ],
  "newIngredientDefs": {
    "new-slug": { "name": "New Ingredient", "units": "cup", "section": "Produce" }
  }
}`;

  try {
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse AI response as JSON' });
    }
    res.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error('Gemini API error:', err.message);
    res.status(500).json({ error: `Gemini API error: ${err.message}` });
  }
});

// --- POST /api/extract-recipe ---
// Fallback: uses Claude to extract recipe data from raw page text (for sites without JSON-LD)
app.post('/api/extract-recipe', async (req, res) => {
  const { pageText, sourceUrl, existingDefs } = req.body;
  if (!pageText) return res.status(400).json({ error: 'pageText is required' });

  const prompt = `You are a recipe extractor and ingredient parser for a meal planning app.

I have the text content of a recipe web page. Extract the recipe and parse its ingredients.

Here are the existing ingredient definitions in the app (JSON object keyed by slug ID):
${JSON.stringify(existingDefs, null, 2)}

Here is the page text:
---
${pageText.substring(0, 8000)}
---

Your job:
1. Extract the recipe name and author/source from the page.
2. Extract the image URL if visible in the text (often not available from text-only extraction — return empty string if not found).
3. Identify all recipe ingredients from the page text.
4. For each ingredient, determine the core ingredient and quantity, ignoring preparation instructions.
5. Match each ingredient to an existing ingredientDef by slug ID if a reasonable match exists. Use fuzzy matching — e.g., "yellow onion" matches "yellow-onion", "fresh basil leaves" matches "fresh-basil".
6. For ingredients that do NOT match any existing def, create a new ingredientDef entry with:
   - slug: lowercase, hyphenated (e.g., "coconut-milk")
   - name: Readable name (e.g., "Coconut milk")
   - units: the most appropriate unit (e.g., "cup", "oz", "count", "tbsp", "tsp", "lbs", "bunch", "can", "cloves", "g", "ml", "kg")
   - section: one of "Produce", "Bread", "Cooking", "Cheese section", "Dairy", "Nuts", "Frozen", "Snacks", "Other"
7. Skip ingredients that are just salt, pepper, water, or basic cooking oil (olive oil, vegetable oil) UNLESS they appear in the existing defs.
8. Convert fractional quantities to decimals (e.g., 1/2 = 0.5, 1/3 = 0.33, 2/3 = 0.67).
9. For "to taste" ingredients, use qty of 1.
10. IMPORTANT unit handling:
   - When matching to an EXISTING ingredientDef, you MUST convert the quantity to the existing def's units. For example, if the existing def for flour uses "cup" and the recipe says "250g flour", convert to approximately 2 cups (qty: 2). Use standard cooking conversions (1 cup flour ≈ 125g, 1 cup sugar ≈ 200g, 1 cup liquid ≈ 240ml, etc.).
   - When creating a NEW ingredientDef, use the recipe's original units. If the recipe uses metric (g, ml, kg), keep those units.

Return ONLY valid JSON in this exact format, no other text:
{
  "name": "Recipe Name",
  "author": "Author or Source Name",
  "image": "",
  "ingredients": [
    { "id": "existing-slug-or-new-slug", "qty": 2 }
  ],
  "newIngredientDefs": {
    "new-slug": { "name": "New Ingredient", "units": "cup", "section": "Produce" }
  }
}`;

  try {
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse AI response as JSON' });
    }
    res.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error('Gemini API error:', err.message);
    res.status(500).json({ error: `Gemini API error: ${err.message}` });
  }
});

// --- POST /api/convert-units ---
// Uses Claude to get grams-per-cup for a list of ingredients (for merging volume + weight on shopping list)
app.post('/api/convert-units', async (req, res) => {
  const { ingredients } = req.body;
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'ingredients array is required' });
  }

  const prompt = `You are a cooking unit conversion expert.

For each ingredient below, provide the weight in grams of 1 US cup of that ingredient.
Use standard cooking/baking reference values.

Ingredients:
${ingredients.map((name, i) => `${i + 1}. ${name}`).join('\n')}

Return ONLY valid JSON in this exact format, no other text:
{
  ${ingredients.map(name => `"${name}": <grams per cup as a number>`).join(',\n  ')}
}`;

  try {
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse conversion response' });
    }
    res.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error('Convert units error:', err.message);
    res.status(500).json({ error: `Conversion error: ${err.message}` });
  }
});

// --- POST /api/save-recipe ---
// Saves a new recipe (and any new ingredientDefs) to DB or file
app.post('/api/save-recipe', async (req, res) => {
  const { recipe, newIngredientDefs } = req.body;
  if (!recipe) return res.status(400).json({ error: 'recipe is required' });

  try {
    const recipeData = await getRecipeData();

    // Add new ingredient defs
    if (newIngredientDefs) {
      Object.assign(recipeData.ingredientDefs, newIngredientDefs);
    }

    // Safety net: create stub defs for any ingredient IDs that have no definition
    if (recipe.ingredients) {
      recipe.ingredients.forEach(ing => {
        if (!recipeData.ingredientDefs[ing.id]) {
          console.warn(`Creating stub ingredientDef for orphaned ID: ${ing.id}`);
          recipeData.ingredientDefs[ing.id] = {
            name: ing.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            units: 'count',
            section: 'Other'
          };
        }
      });
    }

    // Check for duplicate recipe ID
    const existingIdx = recipeData.recipes.findIndex(r => r.id === recipe.id);
    if (existingIdx >= 0) {
      recipeData.recipes[existingIdx] = recipe;
    } else {
      recipeData.recipes.push(recipe);
    }

    await saveRecipeData(recipeData);
    res.json({ success: true });
  } catch (err) {
    console.error('Save error:', err.message);
    res.status(500).json({ error: `Failed to save recipe: ${err.message}` });
  }
});

// --- POST /api/archive-recipe ---
// Toggles the hidden flag on a recipe (archive/restore)
app.post('/api/archive-recipe', async (req, res) => {
  const { recipeId, hidden } = req.body;
  if (!recipeId) return res.status(400).json({ error: 'recipeId is required' });

  try {
    const recipeData = await getRecipeData();
    const recipe = recipeData.recipes.find(r => r.id === recipeId);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    recipe.hidden = !!hidden;
    await saveRecipeData(recipeData);
    res.json({ success: true });
  } catch (err) {
    console.error('Archive error:', err.message);
    res.status(500).json({ error: `Failed to archive recipe: ${err.message}` });
  }
});

// --- DELETE /api/recipes/:id ---
// Permanently removes a recipe and cleans up orphaned ingredientDefs
app.delete('/api/recipes/:id', async (req, res) => {
  const recipeId = req.params.id;

  try {
    const recipeData = await getRecipeData();
    const idx = recipeData.recipes.findIndex(r => r.id === recipeId);
    if (idx < 0) return res.status(404).json({ error: 'Recipe not found' });

    recipeData.recipes.splice(idx, 1);

    // Clean up orphaned ingredientDefs
    const usedIds = new Set();
    recipeData.recipes.forEach(r => r.ingredients.forEach(i => usedIds.add(i.id)));
    for (const defId of Object.keys(recipeData.ingredientDefs)) {
      if (!usedIds.has(defId)) delete recipeData.ingredientDefs[defId];
    }

    await saveRecipeData(recipeData);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: `Failed to delete recipe: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Recipe Planner running at http://localhost:${PORT}`);
});
