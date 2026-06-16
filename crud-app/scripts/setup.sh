#!/bin/bash

# Contact Manager CRUD App - Setup Script
# This script helps set up the application for different deployment scenarios

set -e

echo "=========================================="
echo "Contact Manager CRUD App - Setup"
echo "=========================================="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js is installed: $NODE_VERSION"
else
    echo "✗ Node.js is not installed"
    echo "  Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm is installed: $NPM_VERSION"
else
    echo "✗ npm is not installed"
    exit 1
fi

# Check Docker (optional)
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    echo "✓ Docker is installed: $DOCKER_VERSION"
    DOCKER_AVAILABLE=true
else
    echo "⚠ Docker is not installed (optional for local development)"
    DOCKER_AVAILABLE=false
fi

# Check Docker Compose (optional)
if command_exists docker-compose; then
    DOCKER_COMPOSE_VERSION=$(docker-compose --version)
    echo "✓ Docker Compose is installed: $DOCKER_COMPOSE_VERSION"
    DOCKER_COMPOSE_AVAILABLE=true
else
    echo "⚠ Docker Compose is not installed (optional for local development)"
    DOCKER_COMPOSE_AVAILABLE=false
fi

echo ""
echo "=========================================="
echo "Choose deployment option:"
echo "=========================================="
echo "1. Local Development (Node.js)"
echo "2. Docker (Production-ready)"
echo "3. Install dependencies only"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Setting up for local development..."
        echo ""
        
        # Install backend dependencies
        echo "Installing backend dependencies..."
        npm install
        
        # Install frontend dependencies
        echo "Installing frontend dependencies..."
        cd client
        npm install
        cd ..
        
        echo ""
        echo "✓ Setup complete!"
        echo ""
        echo "To start the application:"
        echo "  Terminal 1: npm start"
        echo "  Terminal 2: cd client && npm start"
        echo ""
        echo "Backend will run on: http://localhost:5000"
        echo "Frontend will run on: http://localhost:3000"
        ;;
        
    2)
        if [ "$DOCKER_AVAILABLE" = false ] || [ "$DOCKER_COMPOSE_AVAILABLE" = false ]; then
            echo ""
            echo "✗ Docker or Docker Compose is not installed"
            echo "  Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
            exit 1
        fi
        
        echo ""
        echo "Building and starting Docker containers..."
        echo ""
        
        docker-compose up -d --build
        
        echo ""
        echo "✓ Docker setup complete!"
        echo ""
        echo "Application is running on: http://localhost:5000"
        echo ""
        echo "Useful commands:"
        echo "  View logs: docker-compose logs -f"
        echo "  Stop: docker-compose down"
        echo "  Restart: docker-compose restart"
        ;;
        
    3)
        echo ""
        echo "Installing dependencies..."
        echo ""
        
        # Install backend dependencies
        echo "Installing backend dependencies..."
        npm install
        
        # Install frontend dependencies
        echo "Installing frontend dependencies..."
        cd client
        npm install
        cd ..
        
        echo ""
        echo "✓ Dependencies installed!"
        ;;
        
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "Setup completed successfully!"
echo "=========================================="

# Made with Bob
