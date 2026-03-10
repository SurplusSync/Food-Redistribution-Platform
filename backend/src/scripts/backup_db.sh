#!/bin/bash
# ─── SurplusSync Database Backup Script ──────────────────────────────────────
# Usage: bash scripts/backup_db.sh
# Runs pg_dump inside the Docker container and saves to ./backups/
# Required by: Disaster Recovery & Reliability Testing (Section 7)

set -e

BACKUP_DIR="./backups"
CONTAINER_NAME="surplus_db"
DB_USER="surplus_admin"
DB_NAME="surplus_db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"
MAX_BACKUPS=5  # Keep only last 5 backups

# 1. Create backup directory if it does not exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting database backup..."
echo "   Container : $CONTAINER_NAME"
echo "   Database  : $DB_NAME"
echo "   Output    : $BACKUP_FILE"

# 2. Run pg_dump inside the Docker container
docker exec -t $CONTAINER_NAME pg_dump -c -U surplus_admin -d surplus_db > $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo "✅ Backup successful: $BACKUP_FILE"
  SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
  echo "   File size : $SIZE"
else
  echo "❌ Backup FAILED"
  rm -f "$BACKUP_FILE"
  exit 1
fi

# 3. Rotate old backups — keep only the last MAX_BACKUPS files
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
  echo "🧹 Rotating old backups (keeping last $MAX_BACKUPS)..."
  ls -1t "$BACKUP_DIR"/*.sql | tail -n +6 | xargs rm -f
fi

echo "📋 Current backups:"
ls -lh "$BACKUP_DIR"/*.sql 2>/dev/null || echo "   (none)"
echo "✅ Backup process complete."