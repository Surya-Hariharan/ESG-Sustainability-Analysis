#!/bin/bash

# ESG Sustainability Analysis - Quick Start Script
# This script automates the initial setup process

set -e

echo "🌱 ESG Sustainability Analysis - Quick Start"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo "-----------------------------------"

MISSING_DEPS=0

if command_exists docker; then
    print_success "Docker is installed ($(docker --version))"
else
    print_error "Docker is not installed"
    MISSING_DEPS=1
fi

if command_exists docker-compose; then
    print_success "Docker Compose is installed ($(docker-compose --version))"
else
    print_error "Docker Compose is not installed"
    MISSING_DEPS=1
fi

if command_exists python3; then
    print_success "Python is installed ($(python3 --version))"
else
    print_warning "Python 3 is not installed (needed for local development)"
fi

if command_exists bun; then
    print_success "Bun is installed ($(bun --version))"
elif command_exists npm; then
    print_success "npm is installed ($(npm --version))"
else
    print_warning "Neither Bun nor npm is installed (needed for local frontend development)"
fi

if [ $MISSING_DEPS -eq 1 ]; then
    print_error "Missing required dependencies. Please install them first."
    echo ""
    echo "Installation guides:"
    echo "  Docker: https://docs.docker.com/get-docker/"
    echo "  Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo ""

# Step 2: Environment setup
echo "Step 2: Setting up environment..."
echo "-----------------------------------"

if [ ! -f .env ]; then
    cp .env.example .env
    print_success "Created .env file from template"
    print_warning "Please edit .env with your configuration before continuing"
    
    read -p "Do you want to edit .env now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${EDITOR:-nano} .env
    fi
else
    print_info ".env file already exists"
fi

echo ""

# Step 3: Choose deployment method
echo "Step 3: Choose deployment method"
echo "-----------------------------------"
echo "1) Docker Compose (Recommended)"
echo "2) Local Development Setup"
echo "3) Skip deployment"
echo ""
read -p "Enter your choice (1-3): " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        echo ""
        echo "Starting Docker Compose deployment..."
        echo "--------------------------------------"
        
        # Create necessary directories
        mkdir -p logs data/processed data/raw models
        
        # Start services
        print_info "Building and starting containers..."
        docker-compose up -d --build
        
        # Wait for services to be ready
        print_info "Waiting for services to be ready..."
        sleep 10
        
        # Check health
        print_info "Checking service health..."
        
        if curl -f http://localhost:8000/health >/dev/null 2>&1; then
            print_success "Backend is running and healthy"
        else
            print_error "Backend health check failed"
        fi
        
        if curl -f http://localhost:3000 >/dev/null 2>&1; then
            print_success "Frontend is running"
        else
            print_warning "Frontend health check failed (may still be building)"
        fi
        
        echo ""
        print_success "Docker deployment complete!"
        echo ""
        echo "Access your applications:"
        echo "  Frontend:  http://localhost:3000"
        echo "  Backend:   http://localhost:8000"
        echo "  API Docs:  http://localhost:8000/api/docs"
        echo "  MLflow:    http://localhost:5000"
        echo ""
        echo "View logs: docker-compose logs -f"
        echo "Stop services: docker-compose down"
        ;;
        
    2)
        echo ""
        echo "Setting up local development environment..."
        echo "-------------------------------------------"
        
        # Backend setup
        print_info "Setting up backend..."
        
        if command_exists python3; then
            if [ ! -d "venv" ]; then
                python3 -m venv venv
                print_success "Created Python virtual environment"
            fi
            
            source venv/bin/activate 2>/dev/null || . venv/Scripts/activate
            
            pip install -r requirements.txt
            print_success "Installed Python dependencies"
            
            # Install pre-commit hooks
            if command_exists pre-commit; then
                pre-commit install
                print_success "Installed pre-commit hooks"
            fi
        fi
        
        # Frontend setup
        print_info "Setting up frontend..."
        cd frontend
        
        if command_exists bun; then
            bun install
            print_success "Installed frontend dependencies with Bun"
        elif command_exists npm; then
            npm install
            print_success "Installed frontend dependencies with npm"
        fi
        
        cd ..
        
        echo ""
        print_success "Local development setup complete!"
        echo ""
        echo "To start development:"
        echo ""
        echo "Terminal 1 (Backend):"
        echo "  source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
        echo "  python -m backend.app"
        echo ""
        echo "Terminal 2 (Frontend):"
        echo "  cd frontend"
        echo "  bun run dev  # or npm run dev"
        echo ""
        ;;
        
    3)
        print_info "Skipping deployment"
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "🎉 Quick start complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Configure your database connection in .env"
echo "2. Apply database schema: psql -h localhost -U postgres -d esg_db -f backend/sql/schema.sql"
echo "3. Load sample data: python scripts/load_db.py"
echo "4. Train ML model: python scripts/train_pipeline.py"
echo ""
echo "Documentation:"
echo "  README.md        - General information"
echo "  DEPLOYMENT.md    - Deployment guide"
echo "  CONTRIBUTING.md  - Contribution guidelines"
echo ""
echo "Need help? Open an issue at: https://github.com/Surya-Hariharan/ESG-Sustainability-Analysis/issues"
echo ""
