require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const DDL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100),
  role          VARCHAR(20) NOT NULL DEFAULT 'user',
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until  TIMESTAMPTZ,
  email_unsubscribed BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Session store (connect-pg-simple)
CREATE TABLE IF NOT EXISTS session (
  sid     VARCHAR NOT NULL COLLATE "default",
  sess    JSON NOT NULL,
  expire  TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (sid)
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);

-- Per-user custom recipes
CREATE TABLE IF NOT EXISTS user_recipes (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id       VARCHAR(255) NOT NULL,
  recipe_data     JSONB NOT NULL,
  ingredient_defs   JSONB NOT NULL DEFAULT '{}',
  shared_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  shared_by_name    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);
CREATE INDEX IF NOT EXISTS idx_user_recipes_user ON user_recipes (user_id);

-- Per-user visibility overrides for preloaded recipes
CREATE TABLE IF NOT EXISTS user_recipe_prefs (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id  VARCHAR(255) NOT NULL,
  hidden     BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);
CREATE INDEX IF NOT EXISTS idx_user_recipe_prefs_user ON user_recipe_prefs (user_id);

-- Activity log for admin dashboard
CREATE TABLE IF NOT EXISTS activity_log (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  details     JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log (action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log (created_at);

-- Per-user favorites
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id    VARCHAR(255) NOT NULL,
  last_selected TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites (user_id);

-- Shareable meal plan links
CREATE TABLE IF NOT EXISTS shared_meal_plans (
  id               SERIAL PRIMARY KEY,
  share_id         VARCHAR(12) NOT NULL UNIQUE,
  user_id          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  recipe_ids       JSONB NOT NULL,
  recipe_snapshot  JSONB NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);
CREATE INDEX IF NOT EXISTS idx_shared_plans_share_id ON shared_meal_plans (share_id);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_hash ON password_reset_tokens (token_hash);

-- Per-user pantry: ingredients they always have at home
CREATE TABLE IF NOT EXISTS user_pantry (
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ingredient_slug VARCHAR(100) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, ingredient_slug)
);
CREATE INDEX IF NOT EXISTS idx_user_pantry_user ON user_pantry (user_id);

-- Recipe import event log
CREATE TABLE IF NOT EXISTS recipe_import_log (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(50) NOT NULL,
  url         TEXT,
  recipe_name TEXT,
  recipe_id   VARCHAR(255),
  error       TEXT,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recipe_import_log_user    ON recipe_import_log (user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_import_log_action  ON recipe_import_log (action);
CREATE INDEX IF NOT EXISTS idx_recipe_import_log_created ON recipe_import_log (created_at);

-- Shared parse cache: one canonical record per URL so the same URL is never AI-parsed twice
CREATE TABLE IF NOT EXISTS recipe_url_cache (
  id              SERIAL PRIMARY KEY,
  normalized_url  TEXT NOT NULL UNIQUE,
  recipe_data     JSONB NOT NULL,
  ingredient_defs JSONB NOT NULL DEFAULT '{}',
  cached_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recipe_url_cache_url ON recipe_url_cache (normalized_url);
`;

async function migrate() {
  console.log('Running database migration...');
  await pool.query(DDL);

  // Add lockout columns to existing users tables
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN NOT NULL DEFAULT false;
  `);

  // Add shared-recipe attribution columns to user_recipes
  await pool.query(`
    ALTER TABLE user_recipes ADD COLUMN IF NOT EXISTS shared_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE user_recipes ADD COLUMN IF NOT EXISTS shared_by_name TEXT;
  `);

  // Allow anonymous sharing (make user_id nullable on shared_meal_plans)
  await pool.query(`
    ALTER TABLE shared_meal_plans ALTER COLUMN user_id DROP NOT NULL;
    ALTER TABLE shared_meal_plans DROP CONSTRAINT IF EXISTS shared_meal_plans_user_id_fkey;
    ALTER TABLE shared_meal_plans ADD CONSTRAINT shared_meal_plans_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  `);

  // Link user_recipes to the URL parse cache
  await pool.query(`
    ALTER TABLE user_recipes ADD COLUMN IF NOT EXISTS url_cache_id INTEGER REFERENCES recipe_url_cache(id) ON DELETE SET NULL;
  `);

  console.log('Migration complete — all tables created.');
}

async function createAdmin(email, password) {
  const hash = await bcrypt.hash(password, 12);
  try {
    await pool.query(
      `INSERT INTO users (email, password_hash, display_name, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET password_hash = $2, role = 'admin', updated_at = NOW()`,
      [email.toLowerCase().trim(), hash, 'Admin']
    );
    console.log(`Admin account created/updated for ${email}`);
  } catch (err) {
    console.error('Failed to create admin:', err.message);
  }
}

async function deleteUser(email) {
  const result = await pool.query(
    'DELETE FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );
  if (result.rowCount > 0) {
    console.log(`Deleted user: ${email}`);
  } else {
    console.log(`No user found with email: ${email}`);
  }
}

async function main() {
  try {
    await migrate();

    // Check for --delete-user flag: node migrate.js --delete-user email
    const delIdx = process.argv.indexOf('--delete-user');
    if (delIdx !== -1) {
      const email = process.argv[delIdx + 1];
      if (!email) {
        console.error('Usage: node migrate.js --delete-user <email>');
        process.exit(1);
      }
      await deleteUser(email);
    }

    // Check for --create-admin flag: node migrate.js --create-admin email password
    const idx = process.argv.indexOf('--create-admin');
    if (idx !== -1) {
      const email = process.argv[idx + 1];
      const password = process.argv[idx + 2];
      if (!email || !password) {
        console.error('Usage: node migrate.js --create-admin <email> <password>');
        process.exit(1);
      }
      await createAdmin(email, password);
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
