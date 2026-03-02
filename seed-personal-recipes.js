// Loads recipes from "ML personal recipes" into user_recipes for a given user.
// Usage: node seed-personal-recipes.js <user-email>
//
// Idempotent: safe to run multiple times — existing recipes are updated in place.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DEFAULT_RECIPES_FILE = path.join(__dirname, 'ML personal recipes');

function parseRecipesFile(content) {
  const trimmed = content.trim().replace(/,\s*$/, '');
  return JSON.parse(`[${trimmed}]`);
}

async function seedPersonalRecipes(pool, email, recipesFilePath = DEFAULT_RECIPES_FILE) {
  const userResult = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );

  if (userResult.rowCount === 0) {
    throw new Error(`No user found with email: ${email}`);
  }

  const userId = userResult.rows[0].id;
  const content = fs.readFileSync(recipesFilePath, 'utf-8');
  const recipes = parseRecipesFile(content);

  console.log(`Seeding ${recipes.length} recipes for ${email} (user_id=${userId})...`);

  for (const recipe of recipes) {
    await pool.query(
      `INSERT INTO user_recipes (user_id, recipe_id, recipe_data, ingredient_defs)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, recipe_id) DO UPDATE
         SET recipe_data = $3, ingredient_defs = $4, updated_at = NOW()`,
      [userId, recipe.id, JSON.stringify(recipe), JSON.stringify({})]
    );
    console.log(`  + ${recipe.name} (${recipe.id})`);
  }

  return recipes.length;
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node seed-personal-recipes.js <user-email>');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL not set in .env');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const count = await seedPersonalRecipes(pool, email);
    console.log(`Done — ${count} recipes seeded.`);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseRecipesFile, seedPersonalRecipes };
