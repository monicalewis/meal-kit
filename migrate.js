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
  ingredient_defs JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
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

-- Shareable meal plan links
CREATE TABLE IF NOT EXISTS shared_meal_plans (
  id               SERIAL PRIMARY KEY,
  share_id         VARCHAR(12) NOT NULL UNIQUE,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_ids       JSONB NOT NULL,
  recipe_snapshot  JSONB NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);
CREATE INDEX IF NOT EXISTS idx_shared_plans_share_id ON shared_meal_plans (share_id);
`;

async function migrate() {
  console.log('Running database migration...');
  await pool.query(DDL);
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
