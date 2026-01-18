/**
 * Скрипт для ручной миграции базы данных Turso
 * Выполняет SQL миграции напрямую
 */

const { createClient } = require("@libsql/client");
require("dotenv/config");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  try {
    console.log("Connecting to database...");
    
    // Очистить старые данные (если нужно)
    console.log("Cleaning old data...");
    try {
      await client.execute("DELETE FROM users WHERE email IS NULL OR email = ''");
      console.log("✓ Cleaned invalid user records");
    } catch (error) {
      console.log("⚠ Could not clean users (table might not exist yet):", error.message);
    }
    
    // Применить миграцию по шагам
    console.log("Applying migration...");
    
    const statements = [
      // Создать таблицу users
      `CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY NOT NULL,
        username text NOT NULL,
        email text NOT NULL,
        password_hash text NOT NULL,
        role text DEFAULT 'user' NOT NULL,
        created_at integer NOT NULL
      )`,
      
      // Создать индексы для users
      `CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)`,
      
      // Создать таблицу sessions
      `CREATE TABLE IF NOT EXISTS sessions (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        expires_at integer NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
      )`,
      
      // Создать таблицу profiles
      `CREATE TABLE IF NOT EXISTS profiles (
        user_id text PRIMARY KEY NOT NULL,
        display_name text,
        views integer DEFAULT 0 NOT NULL,
        bio_text text,
        avatar_url text,
        background_url text,
        theme_config text,
        modules text,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
      )`,
    ];

    for (const statement of statements) {
      try {
        await client.execute(statement);
        console.log("✓ Executed SQL statement");
      } catch (error) {
        if (error.message.includes("already exists") || error.message.includes("duplicate")) {
          console.log("⚠ Table/index already exists, skipping...");
        } else {
          console.error("Error executing:", statement.substring(0, 100));
          throw error;
        }
      }
    }

    console.log("✓ Migration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

migrate();
