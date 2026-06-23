# PostgreSQL Migration Guide

## Overview

This document describes the migration from JSON file storage to PostgreSQL database for the CRUD Contact Manager application.

**Migration Date:** June 18, 2026  
**Version:** v3.0 (PostgreSQL Edition)

---

## What Changed

### Before (v2.1)
- **Storage:** JSON file (`data.json`)
- **Persistence:** File-based with manual read/write operations
- **Scalability:** Limited to single file operations
- **Concurrency:** No transaction support
- **Data Integrity:** Manual validation only

### After (v3.0)
- **Storage:** PostgreSQL 16 Alpine database
- **Persistence:** ACID-compliant relational database
- **Scalability:** Production-ready with connection pooling
- **Concurrency:** Full transaction support with row-level locking
- **Data Integrity:** Database constraints, indexes, and triggers

---

## Database Schema

### Contacts Table

```sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Features

1. **Auto-incrementing ID:** `SERIAL PRIMARY KEY`
2. **Required Fields:** `NOT NULL` constraints on name and address
3. **Timestamps:** Automatic `created_at` and `updated_at` tracking
4. **Index:** `idx_contacts_name` for faster name-based searches
5. **Trigger:** Auto-updates `updated_at` on record modification

### Trigger Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE
    ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Architecture Changes

### Server Configuration

**New Dependencies:**
- `pg` (node-postgres): PostgreSQL client for Node.js

**Environment Variables:**
```bash
DB_HOST=postgres          # Database hostname (container name)
DB_PORT=5432             # PostgreSQL default port
DB_NAME=contacts_db      # Database name
DB_USER=contacts_user    # Database user
DB_PASSWORD=contacts_secure_pass  # Database password
```

**Connection Pool:**
```javascript
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'contacts_db',
  user: process.env.DB_USER || 'contacts_user',
  password: process.env.DB_PASSWORD || 'contacts_secure_pass',
  max: 20,                      // Maximum pool size
  idleTimeoutMillis: 30000,     // Close idle clients after 30s
  connectionTimeoutMillis: 2000 // Fail fast if can't connect
});
```

### API Changes

All API endpoints now use PostgreSQL queries instead of file operations:

**GET /api/contacts**
```javascript
// Before: const contacts = await readData();
// After:
const result = await pool.query(
  'SELECT id, name, address, created_at, updated_at FROM contacts ORDER BY id ASC'
);
res.json(result.rows);
```

**POST /api/contacts**
```javascript
// Before: Manual ID generation and array push
// After:
const result = await pool.query(
  'INSERT INTO contacts (name, address) VALUES ($1, $2) RETURNING *',
  [name, address]
);
res.status(201).json(result.rows[0]);
```

**PUT /api/contacts/:id**
```javascript
// Before: Find index, update array, write file
// After:
const result = await pool.query(
  'UPDATE contacts SET name = $1, address = $2 WHERE id = $3 RETURNING *',
  [name, address, id]
);
```

**DELETE /api/contacts/:id**
```javascript
// Before: Filter array, write file
// After:
const result = await pool.query(
  'DELETE FROM contacts WHERE id = $1 RETURNING id',
  [id]
);
```

---

## Container Configuration

### PostgreSQL Service

```yaml
postgres:
  image: postgres:16-alpine
  container_name: postgres-db
  environment:
    - POSTGRES_DB=contacts_db
    - POSTGRES_USER=contacts_user
    - POSTGRES_PASSWORD=contacts_secure_pass
  volumes:
    - postgres-data:/var/lib/postgresql/data
  ports:
    - "5432:5432"
  restart: unless-stopped
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U contacts_user -d contacts_db"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 10s
```

### Application Service Updates

```yaml
crud-app:
  # ... existing config ...
  environment:
    - NODE_ENV=production
    - PORT=5000
    - DB_HOST=postgres        # NEW: Database hostname
    - DB_PORT=5432           # NEW: Database port
    - DB_NAME=contacts_db    # NEW: Database name
    - DB_USER=contacts_user  # NEW: Database user
    - DB_PASSWORD=contacts_secure_pass  # NEW: Database password
  depends_on:
    postgres:
      condition: service_healthy  # Wait for DB to be ready
```

---

## Data Migration

### Migration Process

All 24 existing contacts were migrated from `data.json` to PostgreSQL:

```javascript
// Migration script
const contacts = JSON.parse(fs.readFileSync('data.json', 'utf8'));

for (const contact of contacts) {
  await pool.query(
    'INSERT INTO contacts (id, name, address) VALUES ($1, $2, $3)',
    [contact.id, contact.name, contact.address]
  );
}

// Update sequence to continue from max ID
const maxId = Math.max(...contacts.map(c => c.id));
await pool.query(`SELECT setval('contacts_id_seq', ${maxId})`);
```

### Verification

```bash
# Check contact count
podman exec postgres-db psql -U contacts_user -d contacts_db \
  -c "SELECT COUNT(*) FROM contacts;"

# View all contacts
podman exec postgres-db psql -U contacts_user -d contacts_db \
  -c "SELECT * FROM contacts ORDER BY id;"
```

---

## Benefits of PostgreSQL

### 1. **Data Integrity**
- ACID compliance ensures data consistency
- Foreign key constraints (for future features)
- Check constraints for data validation
- Unique constraints to prevent duplicates

### 2. **Performance**
- Indexed queries for fast lookups
- Connection pooling reduces overhead
- Query optimization by PostgreSQL planner
- Efficient handling of concurrent requests

### 3. **Scalability**
- Handles thousands of contacts efficiently
- Supports complex queries and joins
- Can add relationships (e.g., contact groups, tags)
- Ready for production workloads

### 4. **Features**
- Full-text search capabilities
- JSON/JSONB support for flexible data
- Triggers for automated actions
- Views for complex queries
- Backup and restore tools

### 5. **Reliability**
- Automatic crash recovery
- Point-in-time recovery (PITR)
- Replication support
- Transaction rollback on errors

---

## Development Workflow

### Starting the Application

```bash
# Start all services (PostgreSQL + App)
cd crud-app
/opt/podman/bin/podman compose -f podman-compose.yml up -d

# Check status
/opt/podman/bin/podman compose -f podman-compose.yml ps

# View logs
/opt/podman/bin/podman logs crud-contact-manager
/opt/podman/bin/podman logs postgres-db
```

### Database Operations

```bash
# Connect to PostgreSQL
/opt/podman/bin/podman exec -it postgres-db psql -U contacts_user -d contacts_db

# Common queries
SELECT * FROM contacts;
SELECT COUNT(*) FROM contacts;
SELECT * FROM contacts WHERE name LIKE '%Smith%';

# Backup database
/opt/podman/bin/podman exec postgres-db pg_dump -U contacts_user contacts_db > backup.sql

# Restore database
cat backup.sql | /opt/podman/bin/podman exec -i postgres-db psql -U contacts_user -d contacts_db
```

### Stopping the Application

```bash
# Stop all services
/opt/podman/bin/podman compose -f podman-compose.yml down

# Stop and remove volumes (WARNING: deletes all data)
/opt/podman/bin/podman compose -f podman-compose.yml down -v
```

---

## Testing

### API Tests

All CRUD operations were tested and verified:

**CREATE:**
```bash
curl -X POST http://localhost:8080/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","address":"123 Test St"}'
```

**READ:**
```bash
curl http://localhost:8080/api/contacts
curl http://localhost:8080/api/contacts/1
```

**UPDATE:**
```bash
curl -X PUT http://localhost:8080/api/contacts/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","address":"Updated Address"}'
```

**DELETE:**
```bash
curl -X DELETE http://localhost:8080/api/contacts/1
```

### Frontend Tests

1. ✅ Contact list displays all records
2. ✅ Modal opens for viewing contact details
3. ✅ Edit functionality updates database
4. ✅ Delete functionality removes records
5. ✅ Add new contact creates database entry
6. ✅ Timestamps display correctly

---

## Troubleshooting

### Database Connection Issues

**Problem:** "Database connection error"

**Solutions:**
```bash
# Check if PostgreSQL is running
/opt/podman/bin/podman ps | grep postgres

# Check PostgreSQL logs
/opt/podman/bin/podman logs postgres-db

# Verify network connectivity
/opt/podman/bin/podman exec crud-contact-manager ping postgres

# Test database connection
/opt/podman/bin/podman exec postgres-db psql -U contacts_user -d contacts_db -c "SELECT 1;"
```

### Migration Issues

**Problem:** "Relation 'contacts' does not exist"

**Solution:**
```bash
# Recreate schema
/opt/podman/bin/podman exec -i postgres-db psql -U contacts_user -d contacts_db << 'EOF'
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF
```

### Performance Issues

**Problem:** Slow queries

**Solutions:**
```sql
-- Check for missing indexes
SELECT * FROM pg_indexes WHERE tablename = 'contacts';

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM contacts WHERE name LIKE '%Smith%';

-- Update statistics
ANALYZE contacts;
```

---

## Security Considerations

### Current Setup (Development)

⚠️ **WARNING:** Current credentials are for development only!

```
Database: contacts_db
User: contacts_user
Password: contacts_secure_pass
```

### Production Recommendations

1. **Use Strong Passwords:**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   ```

2. **Use Secrets Management:**
   - Podman secrets
   - Environment variable files (not in git)
   - External secret managers (Vault, etc.)

3. **Network Security:**
   - Don't expose PostgreSQL port externally
   - Use internal container network only
   - Enable SSL/TLS for connections

4. **Database Security:**
   ```sql
   -- Revoke public access
   REVOKE ALL ON DATABASE contacts_db FROM PUBLIC;
   
   -- Grant specific permissions
   GRANT CONNECT ON DATABASE contacts_db TO contacts_user;
   GRANT SELECT, INSERT, UPDATE, DELETE ON contacts TO contacts_user;
   ```

5. **Backup Strategy:**
   - Regular automated backups
   - Test restore procedures
   - Store backups securely off-site

---

## Future Enhancements

### Potential Features

1. **Full-Text Search:**
   ```sql
   ALTER TABLE contacts ADD COLUMN search_vector tsvector;
   CREATE INDEX idx_contacts_search ON contacts USING GIN(search_vector);
   ```

2. **Contact Groups:**
   ```sql
   CREATE TABLE groups (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL UNIQUE,
       description TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE TABLE contact_groups (
       contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
       group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
       PRIMARY KEY (contact_id, group_id)
   );
   ```

3. **Audit Trail:**
   ```sql
   CREATE TABLE audit_log (
       id SERIAL PRIMARY KEY,
       table_name VARCHAR(50),
       record_id INTEGER,
       action VARCHAR(10),
       old_data JSONB,
       new_data JSONB,
       changed_by VARCHAR(255),
       changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. **Soft Deletes:**
   ```sql
   ALTER TABLE contacts ADD COLUMN deleted_at TIMESTAMP;
   CREATE INDEX idx_contacts_deleted ON contacts(deleted_at);
   ```

---

## Version History

### v3.0 (PostgreSQL Edition) - June 18, 2026
- ✅ Migrated from JSON file to PostgreSQL database
- ✅ Added connection pooling
- ✅ Implemented automatic timestamps
- ✅ Added database indexes
- ✅ Created update triggers
- ✅ Updated podman-compose.yml with PostgreSQL service
- ✅ Migrated all 24 existing contacts
- ✅ Tested all CRUD operations
- ✅ Verified frontend compatibility

### v2.1 (Previous) - June 17, 2026
- Streamlined UI with modal-based add functionality
- JSON file storage

### v2.0 - June 17, 2026
- Responsive design
- Modal windows for contact management
- JSON file storage

---

## Conclusion

The migration to PostgreSQL provides a solid foundation for the CRUD Contact Manager application. The database offers:

- **Reliability:** ACID compliance and data integrity
- **Performance:** Indexed queries and connection pooling
- **Scalability:** Ready for production workloads
- **Features:** Advanced database capabilities for future enhancements

All existing functionality has been preserved while gaining the benefits of a professional database system.

---

**Made with Bob - PostgreSQL Edition**