// Script to add numeric UIDs to existing users
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

async function addNumericUids() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  console.log('URL:', url ? 'found' : 'missing');
  console.log('Token:', authToken ? 'found' : 'missing');
  
  if (!url || !authToken) {
    console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
  }
  
  const client = createClient({ url, authToken });

  try {
    // First, add the uid column if it doesn't exist (without UNIQUE - SQLite limitation)
    console.log('Adding uid column...');
    try {
      await client.execute('ALTER TABLE users ADD COLUMN uid INTEGER');
      console.log('✓ Column added');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('✓ Column already exists');
      } else {
        throw e;
      }
    }
    
    // Try to create unique index
    try {
      await client.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uid ON users(uid)');
      console.log('✓ Unique index created');
    } catch (e) {
      console.log('Index creation skipped:', e.message);
    }

    // Get all users ordered by creation date
    console.log('Fetching users...');
    const result = await client.execute('SELECT id, created_at, uid FROM users ORDER BY created_at ASC');
    console.log(`Found ${result.rows.length} users`);

    // Assign UIDs starting from 1000
    let uid = 1000;
    for (const user of result.rows) {
      if (user.uid === null) {
        console.log(`Assigning UID ${uid} to user ${user.id}...`);
        await client.execute({
          sql: 'UPDATE users SET uid = ? WHERE id = ?',
          args: [uid, user.id]
        });
        uid++;
      } else {
        console.log(`User ${user.id} already has UID ${user.uid}`);
        if (user.uid >= uid) {
          uid = user.uid + 1;
        }
      }
    }

    console.log('✓ Done! All users have numeric UIDs');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addNumericUids();
