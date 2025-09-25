# TeWorkspace

A workspace containing Angular projects for development and deployment.

## 📁 Projects

This workspace contains two Angular applications:

- **e-suggestion** - Suggestion management application
- **tableland** - Data table management application

## 🛠️ Prerequisites

- Node.js and npm installed
- Docker and Docker Compose (for containerized deployment)

## 🚀 Development

### Local Development

To run projects locally in development mode:

```bash
# Run e-suggestion locally
npm run start:e-suggestion
# Serves at: http://localhost:4200/

# Run tableland locally  
npm run start:tableland
# Serves at: http://localhost:4201/ (or next available port)
```

## 🐳 Docker Deployment

### Building Docker Images

Build production-ready Docker images for each project:

```bash
# Build e-suggestion frontend image
docker build -t e-suggestion-frontend -f e-suggestion.Dockerfile .

# Build tableland frontend image
docker build -t tableland-frontend -f tableland.Dockerfile .
```

### Running with Docker Compose

Deploy both applications using Docker Compose:

```bash
# Start all services in detached mode
docker compose -p e-suggestion up -d

# Stop all services
docker compose -p e-suggestion down
```

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run start:e-suggestion` | Start e-suggestion in development mode |
| `npm run start:tableland` | Start tableland in development mode |


## 🔧 Configuration

Each project maintains its own configuration files and dependencies. Refer to individual project directories for specific setup instructions.