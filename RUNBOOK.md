# TalentForge Runbook

This document outlines standard operating procedures (SOPs), emergency playbooks, and administrative tasks for maintaining the TalentForge platform.

## Table of Contents
- [Infrastructure Operations](#infrastructure-operations)
  - [Docker Compose High Availability](#docker-compose-high-availability)
  - [Postgres Backup and Restore Drill](#postgres-backup-and-restore-drill)
  - [MinIO Object Storage Administration](#minio-object-storage-administration)
- [Emergency Playbooks](#emergency-playbooks)
  - [LLM Provider Outage Playbook](#llm-provider-outage-playbook)
  - [Disk Space Alerts](#disk-space-alerts)

---

## Infrastructure Operations

### Docker Compose High Availability
All containers are configured with `restart: always` to ensure they recover automatically after unexpected host reboots or daemon crashes. Redis is configured with `--appendonly yes` (AOF) to ensure BullMQ jobs and cached data survive container restarts. 

To forcefully restart the entire stack:
```bash
docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml up -d
```

### Postgres Backup and Restore Drill

**Backup Database:**
Run `pg_dump` inside the container and pipe to the host system:
```bash
docker exec -t talentforge-postgres-1 pg_dump -U talentforge -d talentforge -F c > backup_$(date +%F).dump
```

**Restore Database:**
If a catastrophic failure occurs, you can restore from a `.dump` file:
```bash
# 1. Drop existing connections and DB
docker exec -it talentforge-postgres-1 psql -U talentforge -c "DROP DATABASE talentforge WITH (FORCE);"
docker exec -it talentforge-postgres-1 psql -U talentforge -c "CREATE DATABASE talentforge;"

# 2. Restore
docker exec -i talentforge-postgres-1 pg_restore -U talentforge -d talentforge < backup_XXXX-XX-XX.dump
```

### MinIO Object Storage Administration
MinIO hosts all user submissions. It runs on ports `9000` (API) and `9001` (Console).
- **Console Access**: `http://localhost:9001`
- **Credentials**: See `.env` (default: `minioadmin` / `minioadmin_dev_secret`)

If the primary bucket (`submissions`) is accidentally deleted, restarting the stack will trigger `minio-init` to recreate the buckets automatically. Note: This will not restore deleted data.

---

## Emergency Playbooks

### LLM Provider Outage Playbook

If the primary LLM provider (Ollama or OpenAI) experiences a severe outage or rate limits the TalentForge backend, the platform is designed to degrade gracefully without bringing down core functionality.

1. **AI Copilot (Chat)**:
   - **Symptoms**: The copilot responds with timeouts, connection refused, or generic error messages.
   - **System Behavior**: The `aiAdapterFactory` will detect the network failure and immediately fall back to the `MockAdapter`. Users will receive simulated, pre-programmed responses prefixed with `(Mock Mode)`.
   - **Resolution**: No immediate backend action is required to keep the site online. If an alternative provider is desired, update `AI_PROVIDER` in `.env` (e.g., from `ollama` to `mock` or `openai`) and restart the backend.

2. **Learning Paths (Roadmaps)**:
   - **Symptoms**: Generating a new roadmap spins endlessly or fails.
   - **System Behavior**: `llmService.ts` will attempt 2 retries. If both fail, it intercepts the error and returns a predefined default static roadmap. 
   - **Caching**: The backend utilizes Redis to cache successful roadmaps for 24 hours. A significant portion of users will hit the cache instead of the broken LLM.

3. **Core Grading Engine**:
   - **Impact**: ZERO.
   - The automated code execution and grading pipelines do *not* rely on LLMs. They are strictly AST and test-runner based. An LLM outage will not prevent users from submitting code or receiving grades.

### Disk Space Alerts

If the host server receives a high disk usage alert (> 85%), it is typically caused by Docker logs, dangling images, or Postgres WAL accumulation.

**Immediate Actions:**
1. Prune unused Docker data:
   ```bash
   docker system prune -af --volumes
   ```
2. Clear large container logs:
   ```bash
   truncate -s 0 /var/lib/docker/containers/*/*-json.log
   ```
