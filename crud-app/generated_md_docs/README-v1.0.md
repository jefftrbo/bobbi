# Bobbi Repository

This repository contains various projects and applications.

## Projects

### CRUD Contact Manager Application

A full-stack contact management application with Docker support.

**Location:** `crud-app/`

**Quick Start:**

```bash
# Clone the repository
git clone <your-repo-url>
cd bobbi/crud-app

# Option 1: Docker (Recommended)
docker-compose up -d
# Access at http://localhost:5000

# Option 2: Local Development
./scripts/setup.sh
# Follow the interactive prompts
```

**Documentation:**
- [Application README](./crud-app/README.md) - Full application documentation
- [Docker Guide](./crud-app/DOCKER.md) - Detailed Docker deployment instructions

**Features:**
- ✅ Full CRUD operations for contacts
- ✅ 20 pre-loaded fictitious contacts
- ✅ Modern React UI with responsive design
- ✅ RESTful API with Node.js/Express
- ✅ Docker containerization
- ✅ Persistent JSON storage
- ✅ Production-ready deployment

## Getting Started

### Prerequisites

**For Local Development:**
- Node.js v14 or higher
- npm

**For Docker Deployment:**
- Docker 20.10+
- Docker Compose 2.0+

### Quick Setup

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd bobbi
```

2. **Choose your deployment method:**

**Docker (Recommended for Production):**
```bash
cd crud-app
docker-compose up -d
```

**Local Development:**
```bash
cd crud-app
./scripts/setup.sh
```

## Repository Structure

```
bobbi/
├── README.md           # This file
├── test.yaml          # Test configuration
└── crud-app/          # Contact Manager Application
    ├── README.md      # Application documentation
    ├── DOCKER.md      # Docker deployment guide
    ├── Dockerfile     # Docker image definition
    ├── docker-compose.yml  # Docker Compose configuration
    ├── server.js      # Express backend
    ├── data.json      # Contact data storage
    ├── package.json   # Backend dependencies
    ├── scripts/       # Setup and utility scripts
    │   └── setup.sh   # Interactive setup script
    └── client/        # React frontend
        ├── src/
        │   ├── App.js
        │   └── App.css
        └── package.json
```

## Contributing

When adding new projects to this repository:

1. Create a new directory for your project
2. Include a comprehensive README.md
3. Add Docker support if applicable
4. Update this main README.md with project information

## License

MIT