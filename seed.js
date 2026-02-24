// Seed script: loads recipes.js data into the Neon PostgreSQL database.
// Run once: node seed.js
//
// Requires DATABASE_URL in .env (e.g., from Neon dashboard)

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { Pool } = require('pg');

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL not set in .env');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  // Read and evaluate recipes.js
  const recipesPath = path.join(__dirname, 'recipes.js');
  const content = fs.readFileSync(recipesPath, 'utf-8')
    .replace(/^const recipeData/m, 'var recipeData');
  const sandbox = {};
  vm.runInNewContext(content, sandbox);

  if (!sandbox.recipeData) {
    console.error('ERROR: Could not parse recipeData from recipes.js');
    process.exit(1);
  }

  // Create table and insert data
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_data (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    )
  `);

  await pool.query(
    `INSERT INTO app_data (key, value) VALUES ('recipeData', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1`,
    [JSON.stringify(sandbox.recipeData)]
  );

  console.log(`Seeded successfully — ${sandbox.recipeData.recipes.length} recipes, ${Object.keys(sandbox.recipeData.ingredientDefs).length} ingredient definitions`);
  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
