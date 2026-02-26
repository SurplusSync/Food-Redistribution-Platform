#!/bin/bash

# ==============================================================================
# SurplusSync - Database Backup Script
# Epic 7, User Story 5 (Disaster Recovery)
# ==============================================================================

# 1. Define backup directory and timestamp
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/database_backup_$TIMESTAMP.sql"
CONTAINER_NAME="surplus_db"

# 2. Create the backups folder if it doesn't exist
mkdir -p $BACKUP_DIR

echo "📦 Initiating database backup for container: $CONTAINER_NAME..."

# 3. Execute pg_dump inside the running Docker container
# Note: Ensure your POSTGRES_USER matches your .env file (defaulting to surplus_admin or student)
docker exec -t $CONTAINER_NAME pg_dump -c -U surplus_admin -d surplus_db > $BACKUP_FILE

# 4. Check if the command succeeded
if [ $? -eq 0 ]; then
  echo "✅ Backup successfully created!"
  echo "📂 Saved to: $BACKUP_FILE"

  # Optional: Keep only the last 5 backups to save space
  ls -tp $BACKUP_DIR/database_backup_*.sql | grep -v '/$' | tail -n +6 | xargs -I {} rm -- {}
  echo "🧹 Cleaned up old backups."
else
  echo "❌ Error: Backup failed. Is the Docker container running?"
  exit 1
fi
