# Podman Setup - Verified Working Commands

This document contains the **verified working commands** for running the crud-app with Podman on your system.

## System Configuration

- **Podman Location**: `/opt/podman/bin/podman`
- **Podman Version**: 5.8.2
- **OS**: macOS

## Quick Start (Verified Working)

### 1. Build the Image

```bash
cd crud-app
/opt/podman/bin/podman build -t crud-contact-manager -f Containerfile .
```

**Build time**: ~2-3 minutes on first run

### 2. Run the Container

```bash
/opt/podman/bin/podman run -d \
  --name crud-app \
  -p 8080:5000 \
  -v $(pwd)/data.json:/app/data.json:Z \
  crud-contact-manager
```

**Note**: Using port 8080 because 5000 and 5001 were already in use on your system.

### 3. Access the Application

Open your browser to: **http://localhost:8080**

### 4. Check Status

```bash
# View running containers
/opt/podman/bin/podman ps

# View logs
/opt/podman/bin/podman logs crud-app

# Follow logs in real-time
/opt/podman/bin/podman logs -f crud-app
```

### 5. Stop and Remove

```bash
# Stop the container
/opt/podman/bin/podman stop crud-app

# Remove the container
/opt/podman/bin/podman rm crud-app

# Or do both at once
/opt/podman/bin/podman rm -f crud-app
```

## Making Podman Easier to Use

To avoid typing the full path every time, add Podman to your PATH:

### Option 1: Temporary (Current Terminal Session)

```bash
export PATH="/opt/podman/bin:$PATH"
```

Then you can use `podman` instead of `/opt/podman/bin/podman`:

```bash
podman ps
podman logs crud-app
```

### Option 2: Permanent (Add to Shell Profile)

Add this line to your `~/.zshrc` or `~/.bash_profile`:

```bash
export PATH="/opt/podman/bin:$PATH"
```

Then reload your shell:

```bash
source ~/.zshrc  # or source ~/.bash_profile
```

## Troubleshooting

### Port Already in Use

If you get "address already in use" error, use a different port:

```bash
/opt/podman/bin/podman run -d --name crud-app -p 8081:5000 -v $(pwd)/data.json:/app/data.json:Z crud-contact-manager
```

### Container Name Already in Use

Remove the existing container first:

```bash
/opt/podman/bin/podman rm -f crud-app
```

### View All Containers (Including Stopped)

```bash
/opt/podman/bin/podman ps -a
```

## Verified API Test

The application is working correctly. Test the API:

```bash
# Get all contacts
curl http://localhost:8080/api/contacts

# Get specific contact
curl http://localhost:8080/api/contacts/1
```

## Build Notes

The Containerfile was updated to use `npm install --omit=dev` instead of `npm ci --only=production` because the package-lock.json files had dependency mismatches. This is more forgiving and works correctly.

## Success Indicators

When everything is working, you should see:

1. **Build output**: "Successfully tagged localhost/crud-contact-manager:latest"
2. **Container status**: "Up X seconds" in `podman ps`
3. **Logs**: "Server running on port 5000" and "Environment: production"
4. **API response**: JSON array of contacts when accessing http://localhost:8080/api/contacts

## Next Steps

- Access the web UI at http://localhost:8080
- Add Podman to your PATH for easier use
- Consider using `podman compose` for easier management (see PODMAN.md)