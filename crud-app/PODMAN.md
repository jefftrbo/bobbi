# Podman Deployment Guide

This guide explains how to build and run the Contact Manager CRUD application using Podman, a daemonless container engine that's a drop-in replacement for Docker.

## Prerequisites

- Podman installed (version 4.0 or higher)
- Git (to clone the repository)

### Install Podman

**macOS:**
```bash
brew install podman
podman machine init
podman machine start
```

**Linux (Fedora/RHEL/CentOS):**
```bash
sudo dnf install podman
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install podman
```

### Verify Podman Installation

```bash
podman --version
```

**Note:** Modern Podman (v4.0+) has built-in support for Docker Compose files via `podman compose` (no separate installation needed).

## Quick Start

### 1. Verify Podman is Running

**macOS users:** Ensure the Podman machine is running:
```bash
podman machine list
# If not running:
podman machine start
```

**Linux users:** Podman runs natively, no machine needed.

### 2. Clone the Repository

```bash
git clone <your-repo-url>
cd bobbi/crud-app
```

### 3. Build and Run with Podman Compose (Recommended)

```bash
podman compose up -d
```

This will:
- Build the container image using the Containerfile
- Start the container in detached mode
- Expose the application on port 5000

**Note:** First build may take 2-5 minutes to download base images and build.

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

The React frontend and Node.js backend are served from the same port in production mode.

### 5. Stop the Application

```bash
podman compose down
```

## Manual Podman Commands

### Build the Image

```bash
podman build -t crud-contact-manager -f Containerfile .
```

### Run the Container

```bash
podman run -d \
  --name crud-app \
  -p 5000:5000 \
  -v $(pwd)/data.json:/app/data.json:Z \
  crud-contact-manager
```

**Note:** The `:Z` flag is important for SELinux systems (Fedora, RHEL, CentOS) to properly label the volume.

### Stop and Remove Container

```bash
podman stop crud-app
podman rm crud-app
```

## Podman vs Docker Differences

### Key Advantages of Podman

1. **Daemonless**: No background daemon required
2. **Rootless**: Can run containers without root privileges
3. **Systemd Integration**: Native systemd support for container management
4. **Pod Support**: Can group containers into pods (Kubernetes-style)
5. **Docker Compatible**: Drop-in replacement with compatible CLI

### Command Equivalents

| Docker Command | Podman Command |
|----------------|----------------|
| `docker build` | `podman build` |
| `docker run` | `podman run` |
| `docker ps` | `podman ps` |
| `docker images` | `podman images` |
| `docker-compose up` | `podman compose up` |
| `docker-compose down` | `podman compose down` |

### Volume Mounting with SELinux

On SELinux-enabled systems (Fedora, RHEL, CentOS), use the `:Z` or `:z` flag:

```bash
# Private volume (recommended)
-v $(pwd)/data.json:/app/data.json:Z

# Shared volume
-v $(pwd)/data.json:/app/data.json:z
```

## Podman Architecture

### Multi-Stage Build

The Containerfile uses a multi-stage build process (identical to Docker):

1. **Stage 1 (frontend-build)**: Builds the React application
   - Uses Node.js 18 Alpine image
   - Installs dependencies
   - Creates production build

2. **Stage 2 (production)**: Sets up the backend with built frontend
   - Uses Node.js 18 Alpine image
   - Installs backend dependencies
   - Copies backend code and built frontend
   - Configures the server to serve both API and static files

### Volume Mounting

The `data.json` file is mounted as a volume to persist contact data between container restarts:

```yaml
volumes:
  - ./data.json:/app/data.json:Z
```

This means:
- Changes to contacts are saved to your local `data.json`
- Data persists even if you stop/remove the container
- You can backup the data by copying `data.json`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Application environment |
| `PORT` | `5000` | Port the server listens on |

### Custom Port Example

```bash
podman run -d \
  --name crud-app \
  -p 8080:8080 \
  -e PORT=8080 \
  -v $(pwd)/data.json:/app/data.json:Z \
  crud-contact-manager
```

## Health Checks

The container includes a health check that runs every 30 seconds:

```bash
# Check container health status
podman ps

# View health check logs
podman inspect --format='{{json .State.Health}}' crud-app | jq
```

## Rootless Containers

One of Podman's key features is the ability to run containers without root privileges:

```bash
# Run as regular user (no sudo needed)
podman run -d \
  --name crud-app \
  -p 5000:5000 \
  -v $(pwd)/data.json:/app/data.json:Z \
  crud-contact-manager

# Check running containers
podman ps
```

### Port Binding for Rootless

For ports below 1024, you may need to adjust:

```bash
# Allow binding to privileged ports
sudo sysctl net.ipv4.ip_unprivileged_port_start=80

# Or use port mapping
podman run -d -p 8080:5000 crud-contact-manager
```

## Systemd Integration

Podman integrates natively with systemd for container management:

### Generate Systemd Unit File

```bash
# Run the container first
podman run -d --name crud-app -p 5000:5000 \
  -v $(pwd)/data.json:/app/data.json:Z \
  crud-contact-manager

# Generate systemd unit file
podman generate systemd --new --name crud-app > ~/.config/systemd/user/crud-app.service

# Enable and start the service
systemctl --user enable crud-app.service
systemctl --user start crud-app.service

# Check status
systemctl --user status crud-app.service
```

### Auto-start on Boot

```bash
# Enable lingering (allows user services to run without login)
loginctl enable-linger $USER

# Enable the service
systemctl --user enable crud-app.service
```

## Troubleshooting

### View Container Logs

```bash
# Follow logs in real-time
podman compose logs -f

# Or for manual podman run
podman logs -f crud-app
```

### Container Won't Start

1. Check if port 5000 is already in use:
```bash
lsof -i :5000
# or
ss -tulpn | grep 5000
```

2. Check Podman logs for errors:
```bash
podman compose logs
# or
podman logs crud-app
```

3. Verify the image built successfully:
```bash
podman images | grep crud-contact-manager
```

### Data Not Persisting

Ensure the volume mount is correct:
```bash
podman inspect crud-app | grep -A 10 Mounts
```

### SELinux Permission Issues

If you encounter permission errors with `data.json` on SELinux systems:

```bash
# Use :Z flag for private volume
podman run -v $(pwd)/data.json:/app/data.json:Z ...

# Or adjust SELinux context
chcon -Rt svirt_sandbox_file_t data.json

# Or temporarily set to permissive (not recommended for production)
sudo setenforce 0
```

### Podman Machine Issues (macOS)

```bash
# Check machine status
podman machine list

# Restart machine
podman machine stop
podman machine start

# Reset machine (if needed)
podman machine rm
podman machine init
podman machine start
```

## Development vs Production

### Development Mode (Current Setup)
- Backend: `http://localhost:5001`
- Frontend: `http://localhost:3001`
- Hot reload enabled
- CORS configured for cross-origin requests

### Production Mode (Podman)
- Single endpoint: `http://localhost:5000`
- Frontend served as static files
- Backend serves API at `/api/*`
- Optimized build with smaller image size

## Image Size Optimization

The container image uses several optimization techniques:

1. **Alpine Linux**: Minimal base image (~5MB)
2. **Multi-stage build**: Build artifacts not included in final image
3. **Production dependencies only**: `npm ci --only=production`
4. **.containerignore**: Excludes unnecessary files

Expected image size: ~200-250MB

### Check Image Size

```bash
podman images crud-contact-manager
```

## Advanced Usage

### Build with Custom Tag

```bash
podman build -t crud-contact-manager:v1.0.0 -f Containerfile .
```

### Run with Custom Network

```bash
podman network create crud-network
podman run -d \
  --name crud-app \
  --network crud-network \
  -p 5000:5000 \
  -v $(pwd)/data.json:/app/data.json:Z \
  crud-contact-manager
```

### Create a Pod (Kubernetes-style)

```bash
# Create a pod
podman pod create --name crud-pod -p 5000:5000

# Run container in the pod
podman run -d \
  --pod crud-pod \
  --name crud-app \
  -v $(pwd)/data.json:/app/data.json:Z \
  crud-contact-manager

# Manage the entire pod
podman pod stop crud-pod
podman pod start crud-pod
podman pod rm crud-pod
```

### Export/Import Image

```bash
# Export image to tar file
podman save crud-contact-manager > crud-app.tar

# Import on another machine
podman load < crud-app.tar
```

### Push to Container Registry

```bash
# Tag the image
podman tag crud-contact-manager quay.io/yourusername/crud-contact-manager:latest

# Login to registry
podman login quay.io

# Push the image
podman push quay.io/yourusername/crud-contact-manager:latest
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Podman Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Podman
        run: |
          sudo apt-get update
          sudo apt-get install -y podman
      
      - name: Build Podman image
        run: podman build -t crud-contact-manager -f Containerfile .
      
      - name: Run tests
        run: podman run crud-contact-manager npm test
```

## Security Considerations

1. **Rootless by default**: Podman runs containers without root privileges
2. **No daemon**: Eliminates daemon attack surface
3. **SELinux support**: Better integration with SELinux
4. **User namespaces**: Improved isolation
5. **Read-only filesystem**: Consider adding `--read-only` flag for enhanced security

### Run with Enhanced Security

```bash
podman run -d \
  --name crud-app \
  --read-only \
  --tmpfs /tmp \
  --security-opt no-new-privileges \
  -p 5000:5000 \
  -v $(pwd)/data.json:/app/data.json:Z \
  crud-contact-manager
```

## Backup and Restore

### Backup Data

```bash
# Copy data from running container
podman cp crud-app:/app/data.json ./backup-data.json

# Or simply copy the mounted file
cp data.json backup-data.json
```

### Restore Data

```bash
# Stop container
podman compose down

# Restore backup
cp backup-data.json data.json

# Start container
podman compose up -d
```

## Performance Tuning

### Resource Limits

```yaml
services:
  crud-app:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

Or with CLI:

```bash
podman run -d \
  --name crud-app \
  --cpus=0.5 \
  --memory=512m \
  -p 5000:5000 \
  -v $(pwd)/data.json:/app/data.json:Z \
  crud-contact-manager
```

## Migrating from Docker

If you're migrating from Docker:

1. **Install Podman**: Follow installation instructions above
2. **Alias Docker to Podman** (optional):
   ```bash
   alias docker=podman
   alias docker-compose='podman compose'
   ```
3. **Update volume mounts**: Add `:Z` flag for SELinux systems
4. **Update compose files**: Rename to `podman-compose.yml` (optional, but works with docker-compose.yml too)
5. **Test thoroughly**: Especially volume permissions and networking

## Support

For issues or questions:
1. Check the logs: `podman compose logs` or `podman logs crud-app`
2. Verify health: `podman ps`
3. Review this documentation
4. Check the main README.md for application-specific help
5. Visit Podman documentation: https://docs.podman.io/

## Additional Resources

- [Podman Official Documentation](https://docs.podman.io/)
- [Podman Desktop](https://podman-desktop.io/)
- [Podman vs Docker Comparison](https://docs.podman.io/en/latest/Introduction.html)
- [Rootless Containers Guide](https://github.com/containers/podman/blob/main/docs/tutorials/rootless_tutorial.md)