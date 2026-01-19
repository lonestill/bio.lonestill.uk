// Backup script for Turso database before migration
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function backup() {
  console.log("📦 Starting backup process...");
  
  try {
    // Backup premium_badge_config data
    console.log("\n1️⃣ Backing up premium_badge_config data...");
    const result = await client.execute(`
      SELECT user_id, premium_badge_config 
      FROM profiles 
      WHERE premium_badge_config IS NOT NULL
    `);
    
    console.log(`Found ${result.rows.length} profiles with premium_badge_config`);
    
    // Save to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-premium-badge-config-${timestamp}.json`;
    
    fs.writeFileSync(
      filename,
      JSON.stringify(result.rows, null, 2),
      "utf-8"
    );
    
    console.log(`✅ Backup saved to ${filename}`);
    
    // Also create SQL for restoring
    console.log("\n2️⃣ Creating SQL restore script...");
    const sqlStatements = result.rows.map((row) => {
      const userId = row.user_id;
      const config = row.premium_badge_config;
      
      return `-- Restore for user_id: ${userId}\n` +
        `UPDATE profiles SET modules = json_set(\n` +
        `  COALESCE(modules, '{}'),\n` +
        `  '$.badgeConfigs.premium',\n` +
        `  json('${typeof config === 'string' ? config : JSON.stringify(config)}')\n` +
        `) WHERE user_id = '${userId}';\n`;
    }).join("\n");
    
    const sqlFilename = `restore-premium-badge-config-${timestamp}.sql`;
    fs.writeFileSync(sqlFilename, sqlStatements, "utf-8");
    
    console.log(`✅ SQL restore script saved to ${sqlFilename}`);
    
    // Show sample of data
    if (result.rows.length > 0) {
      console.log("\n📊 Sample data:");
      console.log(JSON.stringify(result.rows[0], null, 2));
    }
    
    console.log("\n✅ Backup complete! You can now proceed with migration.");
    
  } catch (error) {
    console.error("❌ Backup failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

backup();
