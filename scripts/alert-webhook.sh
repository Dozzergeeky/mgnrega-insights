#!/bin/bash
# Alert Notification Script
# Sends critical alerts via webhook

WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"  # Set via environment or leave empty to skip
ALERT_FILE="/home/dozzer/mgnrega-app/logs/alerts.log"
NOTIFIED_FILE="/home/dozzer/mgnrega-app/logs/.notified"

# Function to send webhook alert
send_webhook() {
    local message="$1"
    local severity="${2:-warning}"
    
    if [ -z "$WEBHOOK_URL" ]; then
        return 0  # Skip if no webhook configured
    fi
    
    # Discord/Slack compatible webhook format
    local payload=$(cat <<EOF
{
    "content": "🚨 **MGNREGA App Alert** 🚨",
    "embeds": [{
        "title": "Server Alert",
        "description": "$message",
        "color": $([ "$severity" = "critical" ] && echo "15158332" || echo "16776960"),
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)",
        "fields": [
            {"name": "Server", "value": "172.105.36.247", "inline": true},
            {"name": "Severity", "value": "$severity", "inline": true}
        ]
    }]
}
EOF
)
    
    # Send webhook
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "$payload" > /dev/null 2>&1
}

# Function to check for new alerts
check_alerts() {
    if [ ! -f "$ALERT_FILE" ]; then
        return
    fi
    
    # Get timestamp of last notification
    local last_notified=0
    if [ -f "$NOTIFIED_FILE" ]; then
        last_notified=$(cat "$NOTIFIED_FILE")
    fi
    
    # Get timestamp of latest alert
    local latest_alert=$(stat -c %Y "$ALERT_FILE" 2>/dev/null || echo 0)
    
    # If new alerts exist, send notification
    if [ "$latest_alert" -gt "$last_notified" ]; then
        # Get recent alerts (last 5 lines)
        local recent_alerts=$(tail -5 "$ALERT_FILE" | sed 's/"/\\"/g')
        
        # Determine severity
        local severity="warning"
        if echo "$recent_alerts" | grep -iq "mongodb not running\|app returned http 50"; then
            severity="critical"
        fi
        
        # Send webhook
        send_webhook "$recent_alerts" "$severity"
        
        # Update last notified timestamp
        echo "$latest_alert" > "$NOTIFIED_FILE"
    fi
}

# Function to send daily health summary
send_summary() {
    if [ -z "$WEBHOOK_URL" ]; then
        return 0
    fi
    
    local pm2_status=$(pm2 list | grep "online" | wc -l)
    local mongodb_status=$(pgrep mongod > /dev/null && echo "✅ Running" || echo "❌ Down")
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}')
    local uptime=$(uptime -p)
    
    local summary="**Daily Health Summary**\n\n• PM2 Processes: $pm2_status online\n• MongoDB: $mongodb_status\n• Disk Usage: $disk_usage\n• Uptime: $uptime"
    
    send_webhook "$summary" "info"
}

# Main logic
case "${1:-check}" in
    check)
        check_alerts
        ;;
    summary)
        send_summary
        ;;
    test)
        send_webhook "Test alert from MGNREGA monitoring system" "info"
        echo "Test alert sent"
        ;;
    *)
        echo "Usage: $0 {check|summary|test}"
        exit 1
        ;;
esac
