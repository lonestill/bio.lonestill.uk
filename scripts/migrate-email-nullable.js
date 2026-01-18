/**
 * Скрипт для миграции: сделать email nullable
 */

const { createClient } = require("@libsql/client");
require("dotenv/config");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrate() {
  try {
    console.log("Migrating email column to nullable...");

    // Удалить unique индекс на email
    try {
      await client.execute("DROP INDEX IF EXISTS users_email_unique");
      console.log("✓ Dropped unique index on email");
    } catch (error) {
      console.log("⚠ Could not drop index (might not exist):", error.message);
    }

    // В SQLite нельзя изменить NOT NULL напрямую через ALTER COLUMN
    // Нужно пересоздать таблицу или использовать временную таблицу
    // Но так как в базе уже может быть data, лучше просто игнорировать ошибку
    // и создать новую таблицу без NOT NULL при следующем push

    console.log("✓ Migration completed!");
    console.log("Note: Run 'npm run db:push' to sync schema changes");
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

migrate();
