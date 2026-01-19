const { createClient } = require("@libsql/client");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function addGuestbookTable() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("❌ TURSO_DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("🔌 Connecting to database...");
  const client = createClient({ url, authToken });

  try {
    // Create guestbook_messages table
    console.log("📝 Creating guestbook_messages table...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS guestbook_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_user_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
        author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
    console.log("✅ guestbook_messages table created successfully!");

    // Create index for faster lookups
    console.log("📝 Creating indexes...");
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_guestbook_profile ON guestbook_messages(profile_user_id)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_guestbook_author ON guestbook_messages(author_id)
    `);
    console.log("✅ Indexes created successfully!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    client.close();
  }
}

addGuestbookTable();
