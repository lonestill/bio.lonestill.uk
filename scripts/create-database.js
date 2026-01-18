/**
 * Скрипт для полного создания базы данных Turso
 * Создает все таблицы: users, sessions, profiles
 * 
 * Использование: node scripts/create-database.js
 */

const { createClient } = require("@libsql/client");
require("dotenv/config");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function createDatabase() {
  try {
    console.log("🔗 Connecting to Turso database...");
    
    // Проверка подключения
    await client.execute("SELECT 1");
    console.log("✓ Connected to database");

    console.log("\n🗑️  Cleaning existing tables (if any)...");
    
    // Удалить существующие таблицы в правильном порядке (с учетом foreign keys)
    const dropStatements = [
      "DROP TABLE IF EXISTS profiles",
      "DROP TABLE IF EXISTS sessions",
      "DROP TABLE IF EXISTS users",
    ];

    for (const statement of dropStatements) {
      try {
        await client.execute(statement);
        console.log(`✓ ${statement}`);
      } catch (error) {
        console.log(`⚠ Could not execute ${statement}:`, error.message);
      }
    }

    console.log("\n📦 Creating tables...");

    // Создать таблицу users
    console.log("Creating users table...");
    await client.execute(`
      CREATE TABLE users (
        id text PRIMARY KEY NOT NULL,
        username text NOT NULL,
        email text,
        password_hash text NOT NULL,
        role text DEFAULT 'user' NOT NULL,
        created_at integer NOT NULL
      )
    `);
    console.log("✓ users table created");

    // Создать уникальные индексы для users
    console.log("Creating indexes for users...");
    await client.execute(`
      CREATE UNIQUE INDEX users_username_unique ON users (username)
    `);
    console.log("✓ users_username_unique index created");

    // Индекс для email (если нужно быстро искать по email, но не unique т.к. email может быть null)
    await client.execute(`
      CREATE INDEX IF NOT EXISTS users_email_index ON users (email) WHERE email IS NOT NULL
    `);
    console.log("✓ users_email_index created");

    // Создать таблицу sessions
    console.log("Creating sessions table...");
    await client.execute(`
      CREATE TABLE sessions (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        expires_at integer NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
      )
    `);
    console.log("✓ sessions table created");

    // Создать таблицу profiles
    console.log("Creating profiles table...");
    await client.execute(`
      CREATE TABLE profiles (
        user_id text PRIMARY KEY NOT NULL,
        display_name text,
        views integer DEFAULT 0 NOT NULL,
        bio_text text,
        avatar_url text,
        background_url text,
        theme_config text,
        modules text,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
      )
    `);
    console.log("✓ profiles table created");

    console.log("\n✅ Database created successfully!");
    console.log("\n📊 Tables created:");
    console.log("   - users (id, username, email, password_hash, role, created_at)");
    console.log("   - sessions (id, user_id, expires_at)");
    console.log("   - profiles (user_id, display_name, views, bio_text, avatar_url, background_url, theme_config, modules)");
    console.log("\n🔍 Indexes created:");
    console.log("   - users_username_unique (unique)");
    console.log("   - users_email_index (non-unique, for nullable email)");

  } catch (error) {
    console.error("\n✗ Error creating database:", error.message);
    if (error.cause) {
      console.error("  Cause:", error.cause.message);
    }
    console.error("\nFull error:", error);
    process.exit(1);
  } finally {
    client.close();
    console.log("\n🔌 Connection closed");
  }
}

// Запуск скрипта
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error("❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env file");
  process.exit(1);
}

createDatabase();
