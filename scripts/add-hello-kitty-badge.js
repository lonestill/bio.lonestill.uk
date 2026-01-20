// Script to add hello_kitty badge to a user
// Usage: node scripts/add-hello-kitty-badge.js <username>

import Database from "better-sqlite3";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, "..", ".data", "sqlite.db"));

const username = process.argv[2];

if (!username) {
  console.error("Usage: node scripts/add-hello-kitty-badge.js <username>");
  process.exit(1);
}

try {
  // Get user
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  
  if (!user) {
    console.error(`User ${username} not found`);
    process.exit(1);
  }

  // Parse current badges
  let badges = [];
  try {
    badges = user.badges ? JSON.parse(user.badges) : [];
  } catch (e) {
    console.log("No existing badges or invalid JSON, starting fresh");
  }

  // Add hello_kitty badge if not already present
  if (!badges.includes("hello_kitty")) {
    badges.push("hello_kitty");
    
    // Update user
    db.prepare("UPDATE users SET badges = ? WHERE id = ?").run(
      JSON.stringify(badges),
      user.id
    );
    
    console.log(`✅ Added hello_kitty badge to ${username}`);
    console.log(`Current badges: ${badges.join(", ")}`);
  } else {
    console.log(`User ${username} already has hello_kitty badge`);
  }

} catch (error) {
  console.error("Error:", error);
  process.exit(1);
} finally {
  db.close();
}
