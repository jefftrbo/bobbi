# Quick Start Guide - Contact Manager CRUD App

This guide will get you up and running in under 5 minutes.

## For New Users Cloning This Repository

### Prerequisites Check

Before starting, ensure you have one of the following:

**Option A: Podman (Recommended)**
- Podman Desktop installed
- No other software needed!

**Option B: Node.js**
- Node.js v14+ installed
- npm installed

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd bobbi/crud-app
```

### Step 2: Choose Your Path

#### Path A: Podman (Easiest - Recommended)

```bash
# Start the application
podman-compose up -d

# That's it! Open your browser
open http://localhost:5000
```

**What just happened?**
- Podman built a production-ready image
- Started a container with the app
- Mounted data.json for persistence
- Application is now running on port 5000

**Useful Commands:**
```bash
# View logs
podman-compose logs -f

# Stop the application
podman-compose down

# Restart
podman-compose restart
```

#### Path B: Local Development

```bash
# Run the interactive setup script
./scripts/setup.sh

# Choose option 1 (Local Development)
# The script will install all dependencies

# Start backend (Terminal 1)
npm start

# Start frontend (Terminal 2)
cd client && npm start
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Step 3: Use the Application

1. **View Contacts**: See 20 pre-loaded fictitious contacts
2. **Add Contact**: Fill the form at the top and click "Add Contact"
3. **Edit Contact**: Click the "Edit" button on any contact card
4. **Delete Contact**: Click the "Delete" button (with confirmation)

All changes are automatically saved to `data.json`!

## Troubleshooting

### Podman Issues

**Port 5000 already in use:**
```bash
# Stop whatever is using port 5000
lsof -ti:5000 | xargs kill -9

# Or change the port in podman-compose.yml
ports:
  - "8080:5000"  # Use port 8080 instead
```

**Container won't start:**
```bash
# Check logs
podman-compose logs

# Rebuild from scratch
podman-compose down
podman-compose up -d --build
```

### Local Development Issues

**Port conflicts:**
```bash
# Backend (port 5000)
PORT=5001 npm start

# Frontend (port 3000)
cd client && PORT=3001 npm start
```

**Dependencies not installing:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules client/node_modules
npm install
cd client && npm install
```

## What's Next?

- **Read the full documentation**: [README.md](./README.md)
- **Learn about Podman deployment**: [DOCKER.md](./DOCKER.md)
- **Explore the API**: Try the endpoints at http://localhost:5000/api/contacts
- **Customize**: Edit the code and see changes in real-time (dev mode)

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