# CRUD Contact Manager - Troubleshooting & Deployment Guide

**Version:** v3.2.2  
**Last Updated:** June 23, 2026

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Common Issues](#common-issues)
3. [Database Schema Issues](#database-schema-issues)
4. [Container Issues](#container-issues)
5. [Frontend Issues](#frontend-issues)
6. [Complete Rebuild Process](#complete-rebuild-process)
7. [Verification Steps](#verification-steps)

---

## Quick Start

### Prerequisites
- Podman installed and running
- Ports 8080 (app) and 5434 (database) available

### Start Application

```bash
cd /Users/trbo/Desktop/bobbi/crud-app

# Create pod for networking
podman pod create --name crud-app-pod -p 8080:5000 -p 5434:5432

# Start PostgreSQL
podman run -d --pod crud-app-pod --name postgres-db \
  -e POSTGRES_DB=contacts_db \
  -e POSTGRES_USER=contacts_user \
  -e POSTGRES_PASSWORD=contacts_secure_pass \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15-alpine

# Wait for database to be ready (5 seconds)
sleep 5

# Initialize database schema
podman exec -i postgres-db psql -U contacts_user -d contacts_db < scripts/init-database.sql

# Build application image
podman build -t crud-app-crud-app:latest -f Containerfile .

# Start application
podman run -d --pod crud-app-pod --name crud-contact-manager \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_NAME=contacts_db \
  -e DB_USER=contacts_user \
  -e DB_PASSWORD=contacts_secure_pass \
  localhost/crud-app-crud-app:latest

# Verify application is running
sleep 3
curl http://localhost:8080/api/contacts
```

### Access Application
- **Frontend:** http://localhost:8080
- **API:** http://localhost:8080/api/contacts

---

## Common Issues

### Issue 1: Web Page Flashes and Disappears

**Symptoms:**
- Browser loads page briefly then shows blank screen
- No error messages visible
- API endpoints return errors

**Cause:**
Missing database columns causing API failures, which crash the React frontend.

**Solution:**
```bash
# Check for missing columns
podman exec postgres-db psql -U contacts_user -d contacts_db -c "\d groups"

# If description or updated_at columns are missing, add them:
podman exec postgres-db psql -U contacts_user -d contacts_db -c "ALTER TABLE groups ADD COLUMN IF NOT EXISTS description TEXT;"
podman exec postgres-db psql -U contacts_user -d contacts_db -c "ALTER TABLE groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"

# Restart application
podman restart crud-contact-manager
```

### Issue 2: Database Connection Refused

**Symptoms:**
- Error: `ECONNREFUSED ::1:5432`
- Application logs show connection errors

**Cause:**
PostgreSQL container not running or not in the same pod.

**Solution:**
```bash
# Check if postgres is running
podman ps | grep postgres-db

# If not running, start it
podman start postgres-db

# If doesn't exist, recreate with proper pod
podman run -d --pod crud-app-pod --name postgres-db \
  -e POSTGRES_DB=contacts_db \
  -e POSTGRES_USER=contacts_user \
  -e POSTGRES_PASSWORD=contacts_secure_pass \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### Issue 3: Role "contacts_user" Does Not Exist

**Symptoms:**
- Error: `FATAL: role "contacts_user" does not exist`
- Database connection fails

**Cause:**
Using existing postgres-data volume from different database setup.

**Solution:**
```bash
# Create the user and database
podman exec postgres-db psql -U postgres -c "CREATE USER contacts_user WITH PASSWORD 'contacts_secure_pass';"
podman exec postgres-db psql -U postgres -c "CREATE DATABASE contacts_db OWNER contacts_user;"
podman exec postgres-db psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE contacts_db TO contacts_user;"

# Initialize schema
podman exec -i postgres-db psql -U contacts_user -d contacts_db < scripts/init-database.sql
```

### Issue 4: Database Files Incompatible with Server

**Symptoms:**
- Error: `database files are incompatible with server`
- PostgreSQL version mismatch (e.g., v15 vs v16)

**Cause:**
Existing postgres-data volume has different PostgreSQL version.

**Solution:**
```bash
# Option 1: Use matching PostgreSQL version (recommended)
# Change postgres:16-alpine to postgres:15-alpine in your commands

# Option 2: Create new volume (WARNING: loses data)
podman volume rm postgres-data
podman volume create postgres-data
# Then restart postgres container
```

---

## Database Schema Issues

### Verify Complete Schema

```bash
# Check all tables exist
podman exec postgres-db psql -U contacts_user -d contacts_db -c "\dt"

# Expected output:
# - audit_log
# - contact_groups
# - contacts
# - groups

# Check contacts table columns
podman exec postgres-db psql -U contacts_user -d contacts_db -c "\d contacts"

# Expected columns:
# - id (SERIAL PRIMARY KEY)
# - name (VARCHAR(255) NOT NULL)
# - address (TEXT NOT NULL)
# - created_at (TIMESTAMP)
# - updated_at (TIMESTAMP)
# - search_vector (tsvector)

# Check groups table columns
podman exec postgres-db psql -U contacts_user -d contacts_db -c "\d groups"

# Expected columns:
# - id (SERIAL PRIMARY KEY)
# - name (VARCHAR(255) NOT NULL UNIQUE)
# - description (TEXT)
# - created_at (TIMESTAMP)
# - updated_at (TIMESTAMP)
```

### Reinitialize Database Schema

```bash
# Drop and recreate all tables (WARNING: loses data)
podman exec -i postgres-db psql -U contacts_user -d contacts_db << 'EOF'
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS contact_groups CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
EOF

# Reinitialize from script
podman exec -i postgres-db psql -U contacts_user -d contacts_db < scripts/init-database.sql
```

---

## Container Issues

### Check Container Status

```bash
# View all containers in crud-app-pod
podman ps --pod --filter "pod=crud-app-pod"

# Check container logs
podman logs crud-contact-manager
podman logs postgres-db

# Check container health
podman inspect crud-contact-manager | grep -A 5 Health
```

### Restart Containers

```bash
# Restart application only
podman restart crud-contact-manager

# Restart database only
podman restart postgres-db

# Restart entire pod
podman pod restart crud-app-pod
```

### Clean Restart

```bash
# Stop and remove containers
podman stop crud-contact-manager postgres-db
podman rm crud-contact-manager postgres-db

# Remove pod
podman pod rm crud-app-pod

# Follow Quick Start steps to recreate
```

---

## Frontend Issues

### React App Not Loading

**Check if build exists:**
```bash
# Verify build directory in container
podman exec crud-contact-manager ls -la /app/client/build

# Check if static files are accessible
curl -I http://localhost:8080/static/js/main.3be4b90f.js
curl -I http://localhost:8080/static/css/main.76588ad8.css
```

**Rebuild frontend:**
```bash
# Rebuild application image
podman build -t crud-app-crud-app:latest -f Containerfile .

# Stop and remove old container
podman rm -f crud-contact-manager

# Start new container with fresh image
podman run -d --pod crud-app-pod --name crud-contact-manager \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_NAME=contacts_db \
  -e DB_USER=contacts_user \
  -e DB_PASSWORD=contacts_secure_pass \
  localhost/crud-app-crud-app:latest
```

---

## Complete Rebuild Process

Use this when you need to completely rebuild and redeploy the application:

```bash
#!/bin/bash
# Complete rebuild and redeploy script

cd /Users/trbo/Desktop/bobbi/crud-app

echo "Step 1: Stop and remove existing containers..."
podman stop crud-contact-manager postgres-db 2>/dev/null
podman rm crud-contact-manager postgres-db 2>/dev/null

echo "Step 2: Remove and recreate pod..."
podman pod rm -f crud-app-pod 2>/dev/null
podman pod create --name crud-app-pod -p 8080:5000 -p 5434:5432

echo "Step 3: Start PostgreSQL..."
podman run -d --pod crud-app-pod --name postgres-db \
  -e POSTGRES_DB=contacts_db \
  -e POSTGRES_USER=contacts_user \
  -e POSTGRES_PASSWORD=contacts_secure_pass \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15-alpine

echo "Step 4: Wait for PostgreSQL to be ready..."
sleep 8

echo "Step 5: Initialize database schema..."
podman exec -i postgres-db psql -U contacts_user -d contacts_db < scripts/init-database.sql

echo "Step 6: Rebuild application image..."
podman build -t crud-app-crud-app:latest -f Containerfile .

echo "Step 7: Start application..."
podman run -d --pod crud-app-pod --name crud-contact-manager \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_NAME=contacts_db \
  -e DB_USER=contacts_user \
  -e DB_PASSWORD=contacts_secure_pass \
  localhost/crud-app-crud-app:latest

echo "Step 8: Wait for application to start..."
sleep 5

echo "Step 9: Verify deployment..."
echo "Testing API endpoints..."
curl -s http://localhost:8080/api/contacts | head -20
echo ""
curl -s http://localhost:8080/api/groups | head -20
echo ""
curl -s http://localhost:8080/api/stats
echo ""

echo "Deployment complete!"
echo "Access application at: http://localhost:8080"
```

---

## Verification Steps

### 1. Check Pod Status
```bash
podman pod ps
# Expected: crud-app-pod status = Running
```

### 2. Check Container Status
```bash
podman ps --pod --filter "pod=crud-app-pod"
# Expected: 3 containers (infra, postgres-db, crud-contact-manager) all Up
```

### 3. Test Database Connection
```bash
podman exec postgres-db psql -U contacts_user -d contacts_db -c "SELECT 1;"
# Expected: Returns 1
```

### 4. Test API Endpoints
```bash
# Test contacts endpoint
curl http://localhost:8080/api/contacts
# Expected: [] or array of contacts

# Test groups endpoint
curl http://localhost:8080/api/groups
# Expected: [] or array of groups

# Test stats endpoint
curl http://localhost:8080/api/stats
# Expected: JSON with statistics

# Test audit endpoint
curl http://localhost:8080/api/audit
# Expected: [] or array of audit entries
```

### 5. Test Frontend
```bash
# Test HTML loads
curl -I http://localhost:8080/
# Expected: HTTP/1.1 200 OK

# Test JavaScript loads
curl -I http://localhost:8080/static/js/main.3be4b90f.js
# Expected: HTTP/1.1 200 OK

# Test CSS loads
curl -I http://localhost:8080/static/css/main.76588ad8.css
# Expected: HTTP/1.1 200 OK
```

### 6. Check Application Logs
```bash
podman logs --tail 20 crud-contact-manager
# Expected: "Database connected successfully" message
# Expected: No error messages
```

### 7. Browser Test
Open http://localhost:8080 in browser:
- ✅ Page loads without flashing
- ✅ Contact list displays (empty or with data)
- ✅ Add contact button visible
- ✅ Search bar functional
- ✅ No console errors in browser DevTools

---

## Environment Variables

### Required Variables
```bash
NODE_ENV=production          # Run in production mode
PORT=5000                    # Application port (internal)
DB_HOST=localhost            # Database host (localhost in pod)
DB_PORT=5432                 # Database port (internal)
DB_NAME=contacts_db          # Database name
DB_USER=contacts_user        # Database user
DB_PASSWORD=contacts_secure_pass  # Database password
```

### Port Mapping
- **8080** → 5000 (Application)
- **5434** → 5432 (PostgreSQL - external access)

---

## Support

### Get Help
1. Check logs: `podman logs crud-contact-manager`
2. Check database: `podman logs postgres-db`
3. Verify schema: Run verification steps above
4. Review this guide for common issues

### Report Issues
Include the following information:
- Output of `podman ps --pod`
- Output of `podman logs crud-contact-manager`
- Output of `podman logs postgres-db`
- Browser console errors (if frontend issue)
- Steps to reproduce the issue

---

**Made with Bob - Complete Troubleshooting Guide**