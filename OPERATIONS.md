# MGNREGA App - Operations Guide

## Server Information

- **VPS URL**: http://172.105.36.247
- **Platform**: Linode Ubuntu + PM2 + Nginx + MongoDB
- **SSH Access**: `ssh dozzer@172.105.36.247`
- **App Directory**: `/home/dozzer/mgnrega-app`

---

## System Architecture

### Services Running on Boot

| Service | Status | Purpose |
|---------|--------|---------|
| `nginx` | Enabled | Reverse proxy (port 80 → 3000) |
| `mongod` | Enabled | MongoDB database |
| `pm2-dozzer.service` | Enabled | PM2 process manager (runs Next.js app) |

### PM2 Processes

| Name | Status | Port | Description |
|------|--------|------|-------------|
| `mgnrega-app` | Online | 3000 | Next.js application |

---

## Automated Jobs (Crontab)

```bash
# View current crontab
ssh dozzer@172.105.36.247 "crontab -l"
```

| Schedule | Script | Purpose |
|----------|--------|---------|
| `0 2 * * *` | `/home/dozzer/mgnrega-app/scripts/cron-sync-data.sh` | Daily data sync from data.gov.in at 2 AM UTC |
| `0 3 * * *` | `/home/dozzer/mgnrega-app/scripts/backup-mongodb.sh` | Daily MongoDB backup at 3 AM UTC |
| `*/5 * * * *` | `/home/dozzer/mgnrega-app/scripts/monitor-health.sh` | Health monitoring every 5 minutes |
| `*/5 * * * *` | `/home/dozzer/mgnrega-app/scripts/alert-webhook.sh check` | Alert checking every 5 minutes |
| `0 9 * * *` | `/home/dozzer/mgnrega-app/scripts/alert-webhook.sh summary` | Daily health summary at 9 AM UTC |

---

## Health Monitoring

### Automated Health Checks

The monitoring system runs every 5 minutes and checks:

1. **App Health**: HTTP 200 response from `/api/health`
2. **Disk Usage**: Alerts if >85% full
3. **MongoDB**: Verifies mongod process is running
4. **PM2 Status**: Checks for online processes and handles errored states

**Recovery Actions**:
- Restarts PM2 app if unhealthy or errored
- Restarts MongoDB if down
- Performs clean PM2 restart for errored processes

### Viewing Logs

```bash
# Health monitoring logs
ssh dozzer@172.105.36.247 "tail -50 /home/dozzer/mgnrega-app/logs/health.log"

# Critical alerts
ssh dozzer@172.105.36.247 "tail -50 /home/dozzer/mgnrega-app/logs/alerts.log"

# Data sync logs
ssh dozzer@172.105.36.247 "tail -50 /home/dozzer/mgnrega-app/logs/sync.log"

# Backup logs
ssh dozzer@172.105.36.247 "tail -50 /home/dozzer/mgnrega-app/logs/backup.log"

# PM2 logs
ssh dozzer@172.105.36.247 "pm2 logs mgnrega-app --lines 50"
```

---

## Manual Operations

### Check Application Status

```bash
# Quick health check
curl http://172.105.36.247/api/health

# PM2 status
./scripts/check-pm2-service.exp

# View all service statuses
ssh dozzer@172.105.36.247 "systemctl status nginx pm2-dozzer mongod"
```

### Restart Application

```bash
# Clean restart (recommended)
./scripts/fix-pm2-app.exp

# Quick restart
ssh dozzer@172.105.36.247 "pm2 restart mgnrega-app"

# Restart system services
ssh dozzer@172.105.36.247 "sudo systemctl restart pm2-dozzer"
ssh dozzer@172.105.36.247 "sudo systemctl restart nginx"
ssh dozzer@172.105.36.247 "sudo systemctl restart mongod"
```

### Manual Data Sync

```bash
# Sync MGNREGA data manually
ssh dozzer@172.105.36.247 "/home/dozzer/mgnrega-app/scripts/cron-sync-data.sh"

# Or use the local script
./scripts/test-cron-sync.exp
```

### Manual Backup

```bash
# Create backup manually
./scripts/test-backup.exp

# View backups
ssh dozzer@172.105.36.247 "ls -lh /home/dozzer/mgnrega-app/backups/"
```

### Restore from Backup

```bash
# List available backups
ssh dozzer@172.105.36.247 "ls -lh /home/dozzer/mgnrega-app/backups/"

# Extract and restore
ssh dozzer@172.105.36.247 "
cd /home/dozzer/mgnrega-app/backups && \
tar -xzf mongodb_YYYYMMDD_HHMMSS.tar.gz && \
mongorestore --uri='mongodb://localhost:27017' --db=mgnrega mongodb_YYYYMMDD_HHMMSS/mgnrega/
"
```

---

## Webhook Alerting

### Configure Webhook

The alerting system supports Discord, Slack, or any webhook-compatible service.

#### Discord Setup

1. Create a Discord webhook in your server settings
2. Run the configuration script:

```bash
./scripts/configure-webhook.exp "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN"
```

#### Slack Setup

1. Create a Slack incoming webhook
2. Run the configuration script:

```bash
./scripts/configure-webhook.exp "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

### Test Webhook

```bash
ssh dozzer@172.105.36.247 "/home/dozzer/mgnrega-app/scripts/alert-webhook.sh test"
```

### Alert Types

- **Critical**: MongoDB down, App HTTP 500 errors
- **Warning**: PM2 processes errored, disk usage >85%
- **Info**: Daily health summaries

---

## Troubleshooting

### App Not Responding

1. Check if app is running:
```bash
curl http://172.105.36.247/api/health
```

2. Check PM2 status:
```bash
./scripts/check-pm2-service.exp
```

3. If errored, clean restart:
```bash
./scripts/fix-pm2-app.exp
```

### MongoDB Connection Issues

1. Check if MongoDB is running:
```bash
ssh dozzer@172.105.36.247 "sudo systemctl status mongod"
```

2. Restart MongoDB:
```bash
ssh dozzer@172.105.36.247 "sudo systemctl restart mongod"
```

3. Check MongoDB logs:
```bash
ssh dozzer@172.105.36.247 "sudo journalctl -u mongod -n 50"
```

### PM2 Not Starting on Boot

1. Verify systemd service is enabled:
```bash
./scripts/verify-boot-config.exp
```

2. If disabled, re-enable:
```bash
ssh dozzer@172.105.36.247 "sudo systemctl enable pm2-dozzer"
```

### Disk Space Issues

1. Check disk usage:
```bash
ssh dozzer@172.105.36.247 "df -h"
```

2. Clean up old logs:
```bash
ssh dozzer@172.105.36.247 "
cd /home/dozzer/mgnrega-app/logs && \
truncate -s 0 health.log sync.log backup.log alerts.log
"
```

3. Remove old backups:
```bash
ssh dozzer@172.105.36.247 "
cd /home/dozzer/mgnrega-app/backups && \
ls -t mongodb_*.tar.gz | tail -n +4 | xargs rm -f
"
```

### Monitoring Script Not Working

1. Check crontab is configured:
```bash
ssh dozzer@172.105.36.247 "crontab -l"
```

2. Test monitoring manually:
```bash
./scripts/test-monitoring.exp
```

3. Verify script has execute permissions:
```bash
ssh dozzer@172.105.36.247 "ls -l /home/dozzer/mgnrega-app/scripts/*.sh"
```

---

## Server Reboot

### Verify Boot Resilience

All services are configured to start automatically on boot:

```bash
./scripts/verify-boot-config.exp
```

### Perform Reboot (Caution!)

```bash
# This will take the server offline for ~60 seconds
./scripts/test-reboot.exp
```

**Note**: The reboot test script will automatically verify all services restart correctly.

---

## Deployment Scripts Reference

All deployment scripts are located in `scripts/` directory:

### Service Management
- `check-pm2-service.exp` - View PM2 systemd service status
- `fix-pm2-app.exp` - Clean restart PM2 app
- `cleanup-all-pm2.exp` - Kill all PM2 processes (emergency)

### Configuration
- `verify-boot-config.exp` - Check boot configuration
- `enable-mongodb-boot.exp` - Enable MongoDB on boot
- `configure-webhook.exp` - Set up webhook alerts

### Testing
- `test-monitoring.exp` - Test health monitoring
- `test-backup.exp` - Test MongoDB backup
- `test-cron-sync.exp` - Test data sync
- `test-reboot.exp` - Test server reboot resilience

### Setup
- `setup-cron-sync.exp` - Configure data sync cron
- `setup-mongodb-backup.exp` - Configure backup cron
- `setup-alerting.exp` - Configure alerting cron
- `upload-monitoring.exp` - Upload monitoring script

---

## Performance Monitoring

### Key Metrics to Track

1. **Response Time**: `/api/health` should respond in <100ms
2. **Memory Usage**: PM2 app typically uses ~60-80MB
3. **CPU Usage**: Should remain <10% during normal operation
4. **Disk Usage**: Monitor backup directory growth

### View Current Metrics

```bash
# PM2 metrics
ssh dozzer@172.105.36.247 "pm2 monit"

# System resources
ssh dozzer@172.105.36.247 "htop"

# Network connections
ssh dozzer@172.105.36.247 "netstat -tulpn | grep :3000"
```

---

## Security Best Practices

1. **SSH Key Authentication**: Use SSH keys instead of password (see `scripts/setup-ssh-key.sh`)
2. **Firewall**: UFW is configured to allow only ports 22, 80, 443
3. **Regular Updates**: Keep system packages updated
4. **Backup Encryption**: Consider encrypting backups for sensitive data
5. **Webhook Security**: Keep webhook URLs private (stored in environment variables)

---

## Data Management

### Database Collections

- `districts`: West Bengal district reference data (21 documents)
- `district_metrics`: MGNREGA metrics per district per month

### View Data

```bash
# Connect to MongoDB
ssh dozzer@172.105.36.247 "mongosh mongodb://localhost:27017/mgnrega"

# View collections
# > show collections
# > db.districts.count()
# > db.district_metrics.find().limit(5)
```

### Data Sync Status

Check last sync timestamp:
```bash
curl http://172.105.36.247/api/dashboard?district=3220 | jq '.timestamp'
```

---

## Maintenance Schedule

### Daily (Automated)
- 2:00 AM UTC: Data sync from data.gov.in
- 3:00 AM UTC: MongoDB backup
- 9:00 AM UTC: Health summary report (if webhook configured)
- Every 5 min: Health monitoring and alerts

### Weekly (Manual)
- Review alert logs for patterns
- Check disk usage trends
- Verify backup integrity

### Monthly (Manual)
- Review and archive old logs
- Update system packages
- Review and optimize database indexes
- Test disaster recovery procedures

---

## Emergency Contacts

- **Developer**: [Your contact info]
- **VPS Provider**: Linode Support
- **Escalation**: [Escalation contact]

---

## Useful Commands Cheatsheet

```bash
# Quick health check
curl http://172.105.36.247/api/health

# Restart app
./scripts/fix-pm2-app.exp

# View logs
ssh dozzer@172.105.36.247 "tail -f /home/dozzer/mgnrega-app/logs/health.log"

# Check crontab
ssh dozzer@172.105.36.247 "crontab -l"

# PM2 status
ssh dozzer@172.105.36.247 "pm2 list"

# Backup now
./scripts/test-backup.exp

# Sync data now
./scripts/test-cron-sync.exp

# Test monitoring
./scripts/test-monitoring.exp
```

---

## Version History

- **v1.0** (2025-10-31): Initial production deployment with automated monitoring, backups, and alerting

---

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
For application features, see [README.md](./README.md)
