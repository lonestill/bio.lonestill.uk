const { createClient } = require("@libsql/client");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function addSpotifyTokensTable() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("❌ TURSO_DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("🔌 Connecting to database...");
  const client = createClient({ url, authToken });

  try {
    // Create spotify_tokens table
    console.log("📝 Creating spotify_tokens table...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS spotify_tokens (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        spotify_user_id TEXT,
        spotify_display_name TEXT
      )
    `);
    console.log("✅ spotify_tokens table created successfully!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    client.close();
  }
}

addSpotifyTokensTable();
