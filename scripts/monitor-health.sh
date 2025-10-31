#!/bin/bash
# MGNREGA Health Monitoring Script
# Runs every 5 minutes to check app health and system resources

LOG_FILE="/home/dozzer/mgnrega-app/logs/health.log"
ALERT_FILE="/home/dozzer/mgnrega-app/logs/alerts.log"
APP_URL="http://172.105.36.247/api/health"
MAX_LOG_LINES=1000

# Function to check app health
check_app_health() {
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL --max-time 10)
    
    if [ "$http_code" != "200" ]; then
        echo "$(date): ⚠️  ALERT: App returned HTTP $http_code" | tee -a $ALERT_FILE
        # Try to restart PM2
        cd /home/dozzer/mgnrega-app && pm2 restart mgnrega-app
        echo "$(date): Attempted PM2 restart" | tee -a $ALERT_FILE
    else
        echo "$(date): ✅ App healthy (HTTP 200)"
    fi
}

# Function to check disk usage
check_disk_usage() {
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt 85 ]; then
        echo "$(date): ⚠️  ALERT: Disk usage at ${disk_usage}%" | tee -a $ALERT_FILE
    else
        echo "$(date): 💾 Disk usage: ${disk_usage}%"
    fi
}

# Function to check MongoDB
check_mongodb() {
    if pgrep -x mongod > /dev/null; then
        echo "$(date): ✅ MongoDB running"
    else
        echo "$(date): ⚠️  ALERT: MongoDB not running" | tee -a $ALERT_FILE
        sudo systemctl start mongod
        echo "$(date): Attempted MongoDB restart" | tee -a $ALERT_FILE
    fi
}

# Function to check PM2
check_pm2() {
    local pm2_status=$(pm2 list | grep -c "online")
    local pm2_errored=$(pm2 list | grep -c "errored")
    
    if [ "$pm2_errored" -gt 0 ]; then
        echo "$(date): ⚠️  ALERT: $pm2_errored PM2 process(es) in errored state" | tee -a $ALERT_FILE
        # Delete errored processes and do clean restart
        cd /home/dozzer/mgnrega-app
        pm2 delete all > /dev/null 2>&1
        pm2 start npm --name mgnrega-app -- start
        pm2 save
        echo "$(date): Performed clean PM2 restart" | tee -a $ALERT_FILE
    elif [ "$pm2_status" -eq 0 ]; then
        echo "$(date): ⚠️  ALERT: No PM2 processes online" | tee -a $ALERT_FILE
        cd /home/dozzer/mgnrega-app
        pm2 resurrect
        sleep 2
        # If resurrect didn't work, do clean start
        pm2_status=$(pm2 list | grep -c "online")
        if [ "$pm2_status" -eq 0 ]; then
            pm2 start npm --name mgnrega-app -- start
            pm2 save
            echo "$(date): Performed clean PM2 start" | tee -a $ALERT_FILE
        else
            echo "$(date): PM2 resurrect successful" | tee -a $ALERT_FILE
        fi
    else
        echo "$(date): ✅ PM2 has $pm2_status process(es) online"
    fi
}

# Function to rotate logs
rotate_logs() {
    if [ -f "$LOG_FILE" ]; then
        local line_count=$(wc -l < "$LOG_FILE")
        if [ "$line_count" -gt "$MAX_LOG_LINES" ]; then
            tail -$MAX_LOG_LINES "$LOG_FILE" > "${LOG_FILE}.tmp"
            mv "${LOG_FILE}.tmp" "$LOG_FILE"
            echo "$(date): 📝 Rotated health log (kept last $MAX_LOG_LINES lines)"
        fi
    fi
}

# Main monitoring logic
{
    echo "=== Health Check: $(date) ==="
    check_app_health
    check_disk_usage
    check_mongodb
    check_pm2
    rotate_logs
    echo ""
} >> $LOG_FILE
