/**
 * Script to cleanup old analytics data (older than 1 day)
 * Run this script daily via cron job or scheduled task
 * 
 * Usage: node scripts/cleanup-analytics.js
 * 
 * Or set up a cron job:
 * 0 0 * * * node /path/to/scripts/cleanup-analytics.js
 */

const { createClient } = require("@libsql/client");
require("dotenv/config");

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables");
  process.exit(1);
}

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function cleanupAnalytics() {
  try {
    // Delete records older than 1 day
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const oneDayAgoTimestamp = Math.floor(oneDayAgo.getTime() / 1000);

    // Clean up old profile views
    const deletedViewsResult = await client.execute({
      sql: "DELETE FROM profile_views WHERE viewed_at < ?",
      args: [oneDayAgoTimestamp],
    });

    // Clean up old link clicks
    const deletedClicksResult = await client.execute({
      sql: "DELETE FROM link_clicks WHERE clicked_at < ?",
      args: [oneDayAgoTimestamp],
    });

    console.log(`✅ Cleanup completed:`);
    console.log(`   - Deleted ${deletedViewsResult.rowsAffected} old profile views`);
    console.log(`   - Deleted ${deletedClicksResult.rowsAffected} old link clicks`);
  } catch (error) {
    console.error("❌ Error cleaning up analytics:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

cleanupAnalytics().catch(console.error);
