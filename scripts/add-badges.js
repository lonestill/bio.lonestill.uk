const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

async function addBadgesColumn() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  console.log('URL:', url ? 'found' : 'missing');
  console.log('Token:', authToken ? 'found' : 'missing');
  
  if (!url || !authToken) {
    console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
  }
  
  const client = createClient({ url, authToken });

  console.log('Adding badges column to users table...');
  
  try {
    await client.execute(`ALTER TABLE users ADD COLUMN badges TEXT DEFAULT '[]'`);
    console.log('✓ badges column added');
  } catch (error) {
    if (error.message.includes('duplicate column')) {
      console.log('✓ badges column already exists');
    } else {
      throw error;
    }
  }

  console.log('Done!');
  process.exit(0);
}

addBadgesColumn().catch(console.error);
