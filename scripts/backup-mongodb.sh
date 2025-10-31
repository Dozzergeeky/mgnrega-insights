#!/bin/bash
# MongoDB Backup Script for MGNREGA App
# Runs daily at 3 AM to backup MongoDB data

BACKUP_DIR="/home/dozzer/mgnrega-app/backups"
MONGODB_URI="mongodb://localhost:27017"
DB_NAME="mgnrega"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/mongodb_$TIMESTAMP"
LOG_FILE="/home/dozzer/mgnrega-app/logs/backup.log"
MAX_BACKUPS=7  # Keep last 7 days of backups

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Log function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" | tee -a "$LOG_FILE"
}

# Start backup
log "=== Starting MongoDB Backup ==="

# Create backup using mongodump
if mongodump --uri="$MONGODB_URI" --db="$DB_NAME" --out="$BACKUP_PATH" >> "$LOG_FILE" 2>&1; then
    log "✅ Backup created successfully: $BACKUP_PATH"
    
    # Compress backup
    if tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "mongodb_$TIMESTAMP" >> "$LOG_FILE" 2>&1; then
        log "✅ Backup compressed: $BACKUP_PATH.tar.gz"
        rm -rf "$BACKUP_PATH"
        
        # Get backup size
        BACKUP_SIZE=$(du -h "$BACKUP_PATH.tar.gz" | cut -f1)
        log "📦 Backup size: $BACKUP_SIZE"
    else
        log "⚠️  Failed to compress backup"
    fi
else
    log "❌ Backup failed"
    exit 1
fi

# Clean up old backups (keep only last MAX_BACKUPS)
log "🧹 Cleaning up old backups (keeping last $MAX_BACKUPS)..."
cd "$BACKUP_DIR"
ls -t mongodb_*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f
REMAINING=$(ls -1 mongodb_*.tar.gz 2>/dev/null | wc -l)
log "📁 Total backups retained: $REMAINING"

# Disk usage check
DISK_USAGE=$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
log "💾 Backup directory disk usage: ${DISK_USAGE}%"

# Log rotation (keep last 1000 lines)
if [ -f "$LOG_FILE" ]; then
    LINE_COUNT=$(wc -l < "$LOG_FILE")
    if [ "$LINE_COUNT" -gt 1000 ]; then
        tail -1000 "$LOG_FILE" > "${LOG_FILE}.tmp"
        mv "${LOG_FILE}.tmp" "$LOG_FILE"
        log "📝 Rotated backup log"
    fi
fi

log "=== Backup Complete ==="
log ""
