# Docker Deployment Guide

This guide explains how to build and run the Contact Manager CRUD application using Docker.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)
- Git (to clone the repository)

### Verify Docker Installation

```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd bobbi/crud-app
```

### 2. Build and Run with Docker Compose (Recommended)

```bash
docker-compose up -d
```

This will:
- Build the Docker image
- Start the container in detached mode
- Expose the application on port 5000

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

The React frontend and Node.js backend are served from the same port in production mode.

### 4. Stop the Application

```bash
docker-compose down
```

## Manual Docker Commands

### Build the Image

```bash
docker build -t crud-contact-manager .
```

### Run the Container

```bash
docker run -d \
  --name crud-app \
  -p 5000:5000 \
  -v $(pwd)/data.json:/app/data.json \
  crud-contact-manager
```

### Stop and Remove Container

```bash
docker stop crud-app
docker rm crud-app
```

## Docker Architecture

### Multi-Stage Build

The Dockerfile uses a multi-stage build process:

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
  - ./data.json:/app/data.json
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
docker run -d \
  --name crud-app \
  -p 8080:8080 \
  -e PORT=8080 \
  -v $(pwd)/data.json:/app/data.json \
  crud-contact-manager
```

## Health Checks

The container includes a health check that runs every 30 seconds:

```bash
# Check container health status
docker ps

# View health check logs
docker inspect --format='{{json .State.Health}}' crud-app | jq
```

## Troubleshooting

### View Container Logs

```bash
# Follow logs in real-time
docker-compose logs -f

# Or for manual docker run
docker logs -f crud-app
```

### Container Won't Start

1. Check if port 5000 is already in use:
```bash
lsof -i :5000
```

2. Check Docker logs for errors:
```bash
docker-compose logs
```

3. Verify the image built successfully:
```bash
docker images | grep crud-contact-manager
```

### Data Not Persisting

Ensure the volume mount is correct:
```bash
docker inspect crud-app | grep -A 10 Mounts
```

### Permission Issues

If you encounter permission errors with `data.json`:
```bash
chmod 666 data.json
```

## Development vs Production

### Development Mode (Current Setup)
- Backend: `http://localhost:5001`
- Frontend: `http://localhost:3001`
- Hot reload enabled
- CORS configured for cross-origin requests

### Production Mode (Docker)
- Single endpoint: `http://localhost:5000`
- Frontend served as static files
- Backend serves API at `/api/*`
- Optimized build with smaller image size

## Image Size Optimization

The Docker image uses several optimization techniques:

1. **Alpine Linux**: Minimal base image (~5MB)
2. **Multi-stage build**: Build artifacts not included in final image
3. **Production dependencies only**: `npm ci --only=production`
4. **.dockerignore**: Excludes unnecessary files

Expected image size: ~200-250MB

### Check Image Size

```bash
docker images crud-contact-manager
```

## Advanced Usage

### Build with Custom Tag

```bash
docker build -t crud-contact-manager:v1.0.0 .
```

### Run with Custom Network

```bash
docker network create crud-network
docker run -d \
  --name crud-app \
  --network crud-network \
  -p 5000:5000 \
  -v $(pwd)/data.json:/app/data.json \
  crud-contact-manager
```

### Export/Import Image

```bash
# Export image to tar file
docker save crud-contact-manager > crud-app.tar

# Import on another machine
docker load < crud-app.tar
```

### Push to Docker Hub

```bash
# Tag the image
docker tag crud-contact-manager yourusername/crud-contact-manager:latest

# Login to Docker Hub
docker login

# Push the image
docker push yourusername/crud-contact-manager:latest
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t crud-contact-manager .
      
      - name: Run tests
        run: docker run crud-contact-manager npm test
```

## Security Considerations

1. **Non-root user**: The container runs as the default Node.js user
2. **Read-only filesystem**: Consider adding `--read-only` flag for enhanced security
3. **No secrets in image**: Use environment variables for sensitive data
4. **Regular updates**: Keep base image updated with security patches

## Backup and Restore

### Backup Data

```bash
# Copy data from running container
docker cp crud-app:/app/data.json ./backup-data.json

# Or simply copy the mounted file
cp data.json backup-data.json
```

### Restore Data

```bash
# Stop container
docker-compose down

# Restore backup
cp backup-data.json data.json

# Start container
docker-compose up -d
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

## Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Verify health: `docker ps`
3. Review this documentation
4. Check the main README.md for application-specific help