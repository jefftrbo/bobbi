# Quick Start Guide - Contact Manager CRUD App v3.2.3

This guide will get you up and running in under 5 minutes with PostgreSQL database.

## For New Users Cloning This Repository

### Prerequisites Check

Before starting, ensure you have:

**Required:**
- Podman Desktop installed
- Ports 8080 (app) and 5434 (database) available

**Version:** v3.2.3 with PostgreSQL 15

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd bobbi/crud-app
```

### Step 2: Start the Application

#### Quick Start (Recommended)

```bash
# Create pod for networking
podman pod create --name crud-app-pod -p 8080:5000 -p 5434:5432

# Start PostgreSQL
podman run -d --pod crud-app-pod --name postgres-db \
  -e POSTGRES_DB=contacts_db \
  -e POSTGRES_USER=contacts_user \
  -e POSTGRES_PASSWORD=contacts_secure_pass \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15-alpine

# Wait for database to be ready
sleep 8

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

# Wait for application to start
sleep 5

# Open your browser
open http://localhost:8080
```

**What just happened?**
- Created a Podman pod for container networking
- Started PostgreSQL 15 database with persistent storage
- Initialized complete database schema (contacts, groups, audit log)
- Built production-ready application image
- Started application container connected to database
- Application is now running on port 8080

**Useful Commands:**
```bash
# View application logs
podman logs -f crud-contact-manager

# View database logs
podman logs -f postgres-db

# Check container status
podman ps --pod --filter "pod=crud-app-pod"

# Stop the application
podman stop crud-contact-manager postgres-db

# Restart the application
podman restart crud-contact-manager postgres-db

# Complete shutdown
podman pod stop crud-app-pod
podman pod rm crud-app-pod
```

### Step 3: Verify Installation

```bash
# Test API endpoints
curl http://localhost:8080/api/contacts
# Expected: [] (empty array for new installation)

curl http://localhost:8080/api/groups
# Expected: [] (empty array)

curl http://localhost:8080/api/stats
# Expected: {"total_contacts":"0","total_groups":"0",...}

# Test frontend
curl -I http://localhost:8080/
# Expected: HTTP/1.1 200 OK
```

### Step 4: Use the Application

1. **View Contacts**: Empty list on fresh install
2. **Add Contact**: Click "Add Contact" button, fill form, and save
3. **Create Groups**: Organize contacts into groups
4. **Search**: Use full-text search to find contacts
5. **Edit Contact**: Click edit icon on any contact card
6. **Delete Contact**: Click delete icon (with confirmation)

All changes are automatically saved to PostgreSQL database!

**Features:**
- ✅ Full-text search across name and address
- ✅ Contact groups for organization
- ✅ Audit trail tracking all changes
- ✅ Advanced filtering by group and date
- ✅ Export/Import functionality
- ✅ Statistics dashboard

## Troubleshooting

### Common Issues

**Web page flashes and disappears:**
```bash
# Check if groups table has required columns
podman exec postgres-db psql -U contacts_user -d contacts_db -c "\d groups"

# If missing columns, reinitialize schema
podman exec -i postgres-db psql -U contacts_user -d contacts_db < scripts/init-database.sql

# Restart application
podman restart crud-contact-manager
```

**Database connection errors:**
```bash
# Check if PostgreSQL is running
podman ps | grep postgres-db

# Check logs
podman logs postgres-db

# Restart database
podman restart postgres-db
```

**Port already in use:**
```bash
# Check what's using the ports
lsof -ti:8080
lsof -ti:5434

# Change ports in pod creation:
podman pod create --name crud-app-pod -p 8081:5000 -p 5435:5432
```

**For detailed troubleshooting:**
See [TROUBLESHOOTING-DEPLOYMENT.md](./TROUBLESHOOTING-DEPLOYMENT.md)

## What's Next?

- **Read the full documentation**: [POSTGRESQL-MIGRATION.md](./POSTGRESQL-MIGRATION.md)
- **Troubleshooting guide**: [TROUBLESHOOTING-DEPLOYMENT.md](./TROUBLESHOOTING-DEPLOYMENT.md)
- **Explore the API**: Try the endpoints at http://localhost:8080/api/contacts
- **View changelog**: [CHANGELOG-v3.2.3-SCHEMA-FIX.md](./CHANGELOG-v3.2.3-SCHEMA-FIX.md)

## API Quick Reference

```bash
# Get all contacts
curl http://localhost:5000/api/contacts

# Get single contact
curl http://localhost:5000/api/contacts/1

# Create contact
curl -X POST http://localhost:5000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","address":"123 Main St"}'

# Update contact
curl -X PUT http://localhost:5000/api/contacts/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","address":"456 Oak Ave"}'

# Delete contact
curl -X DELETE http://localhost:5000/api/contacts/1
```

## Need Help?

1. Check the [README.md](./README.md) for detailed information
2. Review [DOCKER.md](./DOCKER.md) for Podman-specific help
3. Look at the logs: `podman-compose logs` or check terminal output
4. Ensure all prerequisites are installed correctly

## Success Checklist

- [ ] Repository cloned
- [ ] Podman or Node.js installed
- [ ] Application running (Podman or local)
- [ ] Can access http://localhost:5000 (Podman) or http://localhost:3000 (local)
- [ ] Can view the 20 pre-loaded contacts
- [ ] Can add, edit, and delete contacts
- [ ] Changes persist after refresh

**Congratulations! You're all set up! 🎉**