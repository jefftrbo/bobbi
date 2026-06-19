# 🚀 Deploy CRUD App v3.2 - Podman Instructions

**Status:** ✅ Code is ready for deployment  
**Version:** 3.2.0 with UI/UX enhancements  
**Container Runtime:** Podman + Kubernetes

---

## 📋 Quick Deployment (Already Done!)

The application has been successfully deployed with Podman. The v3.2 UI enhancements are now live!

### Current Status:
```bash
✅ postgres-db container: Running (healthy)
✅ crud-contact-manager container: Running with v3.2
✅ Database: Connected successfully
✅ Port 8080: Application accessible
```

---

## 🌐 Access Your Application

**URL:** http://localhost:8080

**Important:** Do a **hard refresh** to see the new v3.2 UI:
- **Mac:** `Cmd + Shift + R`
- **Windows/Linux:** `Ctrl + Shift + R`

---

## 🔄 Manual Rebuild (If Needed)

If you need to rebuild the application manually:

### Step 1: Stop and Remove Old Container
```bash
cd ~/Desktop/bobbi/crud-app
/opt/podman/bin/podman stop crud-contact-manager
/opt/podman/bin/podman rm crud-contact-manager
```

### Step 2: Rebuild Image
```bash
/opt/podman/bin/podman build --no-cache -t crud-app-crud-app:latest -f Containerfile .
```

### Step 3: Start New Container
```bash
/opt/podman/bin/podman run -d \
  --name crud-contact-manager \
  --network crud-app_default \
  -p 8080:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e DB_HOST=postgres-db \
  -e DB_PORT=5432 \
  -e DB_NAME=contacts_db \
  -e DB_USER=contacts_user \
  -e DB_PASSWORD=contacts_secure_pass \
  crud-app-crud-app:latest
```

### Step 4: Verify Deployment
```bash
/opt/podman/bin/podman ps
/opt/podman/bin/podman logs crud-contact-manager
```

---

## ✅ What to Test

### 1. Loading Skeletons
- **Action:** Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- **Expected:** See animated loading skeletons before contacts appear

### 2. Avatars
- **Action:** View your contact list
- **Expected:** Each contact has a colorful circular avatar with initials

### 3. Toast Notifications
- **Action:** Create a new contact
- **Expected:** Green success toast appears in bottom-right corner
- **Action:** Update a contact
- **Expected:** Green success toast appears
- **Action:** Delete a contact
- **Expected:** Green success toast appears
- **Action:** Try to save without filling required fields
- **Expected:** Red error toast appears

### 4. Hover Effects
- **Action:** Hover over a contact card
- **Expected:** Card slides right slightly with shadow effect
- **Action:** Hover over an avatar
- **Expected:** Avatar scales up slightly
- **Action:** Hover over buttons
- **Expected:** Buttons elevate with enhanced shadow

### 5. Button Ripple Effect
- **Action:** Click any button
- **Expected:** See a ripple animation from click point

---

## 🐛 Troubleshooting

### Issue: Port 8080 already in use

**Solution:**
```bash
# Find what's using port 8080
lsof -i :8080

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Restart container
/opt/podman/bin/podman start crud-contact-manager
```

### Issue: Old styles still showing

**Solution:**
```bash
# Hard refresh browser
# Mac: Cmd+Shift+R
# Windows/Linux: Ctrl+Shift+R

# Or clear browser cache completely
```

### Issue: Container won't start

**Solution:**
```bash
# Check container logs
/opt/podman/bin/podman logs crud-contact-manager

# Check if database is running
/opt/podman/bin/podman ps | grep postgres-db

# Restart database if needed
/opt/podman/bin/podman restart postgres-db

# Wait 10 seconds, then restart app
/opt/podman/bin/podman restart crud-contact-manager
```

### Issue: Database connection errors

**Solution:**
```bash
# Check database logs
/opt/podman/bin/podman logs postgres-db

# Verify network
/opt/podman/bin/podman network ls

# Restart both containers
/opt/podman/bin/podman restart postgres-db
sleep 10
/opt/podman/bin/podman restart crud-contact-manager
```

---

## 📊 Container Management

### View Running Containers
```bash
/opt/podman/bin/podman ps
```

### View All Containers (including stopped)
```bash
/opt/podman/bin/podman ps -a
```

### View Container Logs
```bash
# Follow logs in real-time
/opt/podman/bin/podman logs -f crud-contact-manager

# View last 50 lines
/opt/podman/bin/podman logs --tail 50 crud-contact-manager
```

### Stop Containers
```bash
/opt/podman/bin/podman stop crud-contact-manager
/opt/podman/bin/podman stop postgres-db
```

### Start Containers
```bash
/opt/podman/bin/podman start postgres-db
sleep 5
/opt/podman/bin/podman start crud-contact-manager
```

### Restart Containers
```bash
/opt/podman/bin/podman restart crud-contact-manager
```

### Remove Containers
```bash
/opt/podman/bin/podman stop crud-contact-manager
/opt/podman/bin/podman rm crud-contact-manager
```

---

## 🔄 Complete Rebuild Process

If you need to completely rebuild everything:

```bash
cd ~/Desktop/bobbi/crud-app

# Stop and remove containers
/opt/podman/bin/podman stop crud-contact-manager postgres-db
/opt/podman/bin/podman rm crud-contact-manager postgres-db

# Remove old image
/opt/podman/bin/podman rmi crud-app-crud-app:latest

# Rebuild image
/opt/podman/bin/podman build --no-cache -t crud-app-crud-app:latest -f Containerfile .

# Start database first
/opt/podman/bin/podman run -d \
  --name postgres-db \
  --network crud-app_default \
  -p 5432:5432 \
  -e POSTGRES_DB=contacts_db \
  -e POSTGRES_USER=contacts_user \
  -e POSTGRES_PASSWORD=contacts_secure_pass \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:16-alpine

# Wait for database to be ready
sleep 10

# Start application
/opt/podman/bin/podman run -d \
  --name crud-contact-manager \
  --network crud-app_default \
  -p 8080:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e DB_HOST=postgres-db \
  -e DB_PORT=5432 \
  -e DB_NAME=contacts_db \
  -e DB_USER=contacts_user \
  -e DB_PASSWORD=contacts_secure_pass \
  crud-app-crud-app:latest
```

---

## 📱 Mobile Testing

To test on mobile devices:

1. **Find your local IP:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Access from mobile:**
   - Open browser on mobile device
   - Navigate to: `http://YOUR_IP:8080`
   - Test all features

---

## 🎯 Success Checklist

- [ ] Containers are running (`/opt/podman/bin/podman ps`)
- [ ] Application accessible at http://localhost:8080
- [ ] Hard refreshed browser to see new UI
- [ ] Avatars display on all contacts
- [ ] Loading skeletons appear on refresh
- [ ] Toast notifications work
- [ ] Hover effects are smooth
- [ ] Button ripple effects work
- [ ] All existing data is intact

---

## 📞 Need Help?

If you encounter issues:

1. **Check container status:**
   ```bash
   /opt/podman/bin/podman ps -a
   ```

2. **Check logs:**
   ```bash
   /opt/podman/bin/podman logs crud-contact-manager
   /opt/podman/bin/podman logs postgres-db
   ```

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors in Console tab

4. **Review documentation:**
   - CHANGELOG-v3.2-UI-UX.md
   - DEPLOYMENT-v3.2.md
   - PODMAN.md

---

## 🎉 You're Ready!

Your CRUD Contact Manager v3.2 is deployed and running with Podman!

**Access:** http://localhost:8080  
**Remember:** Hard refresh to see the new UI!

Enjoy your enhanced Contact Manager! 🚀

---

**Made with ❤️ by Bob - Podman Edition**