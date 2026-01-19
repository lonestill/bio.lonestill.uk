const { createClient } = require("@libsql/client");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function addApiTokensTable() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("❌ TURSO_DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("🔌 Connecting to database...");
  const client = createClient({ url, authToken });

  try {
    // Create api_tokens table
    console.log("📝 Creating api_tokens table...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS api_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        last_used_at INTEGER,
        created_at INTEGER NOT NULL,
        expires_at INTEGER,
        rate_limit INTEGER NOT NULL DEFAULT 1000,
        request_count INTEGER NOT NULL DEFAULT 0,
        request_count_reset_at INTEGER
      )
    `);
    console.log("✅ api_tokens table created successfully!");

    // Create index for faster token lookups
    console.log("📝 Creating index on token column...");
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_api_tokens_token ON api_tokens(token)
    `);
    console.log("✅ Index created successfully!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    client.close();
  }
}

addApiTokensTable();
