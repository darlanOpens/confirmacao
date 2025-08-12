#!/bin/sh

echo "🚀 Starting application startup script..."

# Function to wait for database
wait_for_db() {
  echo "⏳ Waiting for database to be ready..."
  
  # Extract connection details from DATABASE_URL
  DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  
  echo "🔍 Checking connection to $DB_HOST:$DB_PORT..."
  
  # Wait for database with timeout
  timeout=60
  elapsed=0
  
  while ! nc -z $DB_HOST $DB_PORT; do
    if [ $elapsed -ge $timeout ]; then
      echo "❌ Database connection timeout after ${timeout}s"
      exit 1
    fi
    echo "⏳ Database not ready yet... waiting 2s"
    sleep 2
    elapsed=$((elapsed + 2))
  done
  
  echo "✅ Database is ready!"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "📊 DATABASE_URL is configured"

# Wait for database
wait_for_db

# Rename table Guest -> guest if needed (idempotent)
echo "🔧 Checking and renaming table if necessary..."
node <<'NODE'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const rows = await prisma.$queryRawUnsafe("SELECT to_regclass('\"Guest\"') AS old, to_regclass('guest') AS new");
    const row = Array.isArray(rows) ? rows[0] : null;
    if (row && row.old && !row.new) {
      console.log('Renaming table "Guest" -> "guest"...');
      await prisma.$executeRawUnsafe('ALTER TABLE "Guest" RENAME TO guest');
      try { await prisma.$executeRawUnsafe('ALTER INDEX "Guest_pkey" RENAME TO guest_pkey'); } catch {}
      try { await prisma.$executeRawUnsafe('ALTER INDEX "Guest_email_key" RENAME TO guest_email_key'); } catch {}
      console.log('Rename completed');
    } else {
      console.log('No rename needed');
    }
  } catch (e) {
    console.error('Rename check failed', e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
})();
NODE

# Sync database schema
echo "🔄 Syncing database schema..."
npx prisma db push

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migration failed"
  exit 1
fi

# Start the application
echo "🚀 Starting Next.js application..."
exec npm start 