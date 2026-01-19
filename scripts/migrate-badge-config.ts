// Migrate premium_badge_config to modules.badgeConfigs before schema change
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log("🔄 Starting data migration...");
  
  try {
    // Get all profiles with premium_badge_config
    const result = await client.execute(`
      SELECT user_id, premium_badge_config, modules 
      FROM profiles 
      WHERE premium_badge_config IS NOT NULL
    `);
    
    console.log(`Found ${result.rows.length} profiles to migrate`);
    
    let migrated = 0;
    let errors = 0;
    
    for (const row of result.rows) {
      try {
        const userId = row.user_id;
        const badgeConfig = row.premium_badge_config;
        const currentModules = row.modules;
        
        // Parse existing modules or create new object
        let modules = {};
        if (currentModules) {
          try {
            modules = typeof currentModules === 'string' 
              ? JSON.parse(currentModules) 
              : currentModules;
          } catch (e) {
            console.warn(`⚠️  Failed to parse modules for ${userId}, using empty object`);
          }
        }
        
        // Parse badge config
        let badgeConfigObj = {};
        if (badgeConfig) {
          try {
            badgeConfigObj = typeof badgeConfig === 'string'
              ? JSON.parse(badgeConfig)
              : badgeConfig;
          } catch (e) {
            console.warn(`⚠️  Failed to parse badge config for ${userId}, skipping`);
            continue;
          }
        }
        
        // Merge badge config into modules
        if (!modules.badgeConfigs) {
          modules.badgeConfigs = {};
        }
        modules.badgeConfigs.premium = badgeConfigObj;
        
        // Update the database
        await client.execute({
          sql: `UPDATE profiles SET modules = ? WHERE user_id = ?`,
          args: [JSON.stringify(modules), userId],
        });
        
        migrated++;
        console.log(`✅ Migrated user ${userId}`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Failed to migrate ${row.user_id}:`, error);
      }
    }
    
    console.log(`\n📊 Migration complete!`);
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    if (errors === 0) {
      console.log(`\n🎉 All data migrated successfully! You can now run: npx drizzle-kit push`);
    } else {
      console.log(`\n⚠️  Some migrations failed. Please review the errors above.`);
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

migrate();
