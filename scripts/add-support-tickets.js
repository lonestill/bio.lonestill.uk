// Script to add support_tickets table
// Run with: node scripts/add-support-tickets.js

import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addSupportTicketsTable() {
  console.log("Adding support_tickets table...");

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        email TEXT NOT NULL,
        username TEXT,
        category TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        admin_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        admin_response TEXT,
        responded_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    console.log("✅ support_tickets table created successfully!");

    // Create index for faster queries
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status)
    `);
    
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id)
    `);

    console.log("✅ Indexes created successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
}

addSupportTicketsTable();
