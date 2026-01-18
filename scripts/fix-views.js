// Script to fix corrupted views values in profiles table
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

async function fixViews() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!url || !authToken) {
    console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
  }
  
  const client = createClient({ url, authToken });

  try {
    console.log('Checking profiles table...');
    
    // Get all profiles
    const result = await client.execute('SELECT user_id, views FROM profiles');
    console.log(`Found ${result.rows.length} profiles`);
    
    for (const row of result.rows) {
      const userId = row.user_id;
      const views = row.views;
      
      console.log(`User ${userId}: views = ${views} (type: ${typeof views})`);
      
      // If views is not a proper number, reset it to 0
      if (views === null || views === undefined || typeof views === 'object' || isNaN(Number(views))) {
        console.log(`  -> Resetting to 0`);
        await client.execute({
          sql: 'UPDATE profiles SET views = 0 WHERE user_id = ?',
          args: [userId]
        });
      }
    }
    
    // Also count actual views from profile_views table
    console.log('\nCounting actual views from profile_views table...');
    const viewCounts = await client.execute(`
      SELECT profile_user_id, COUNT(*) as view_count 
      FROM profile_views 
      GROUP BY profile_user_id
    `);
    
    console.log('View counts per user:');
    for (const row of viewCounts.rows) {
      console.log(`  User ${row.profile_user_id}: ${row.view_count} unique views`);
    }
    
    console.log('\n✓ Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixViews();
