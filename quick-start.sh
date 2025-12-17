#!/bin/bash

# ThinkTap Quick Start Script
# This script sets up and starts the ThinkTap development environment

set -e

echo "🎓 ThinkTap - Quick Start Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js 20+ first.${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites met${NC}"
echo ""

# Setup Backend
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp env.example .env
    echo -e "${YELLOW}⚠ Please edit backend/.env with your configuration${NC}"
fi

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Setup Frontend
echo -e "${BLUE}Setting up Frontend...${NC}"
cd ../frontend

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file from example..."
    cp env.example .env.local
fi

echo "Installing dependencies..."
npm install

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# Setup Mobile (optional)
echo -e "${BLUE}Setting up Mobile App (optional)...${NC}"
read -p "Do you want to set up the mobile app? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd ../mobile
    echo "Installing dependencies..."
    npm install
    echo -e "${GREEN}✓ Mobile setup complete${NC}"
else
    echo "Skipping mobile setup"
fi

cd ..
echo ""

# Start services
echo -e "${BLUE}Starting services...${NC}"
echo ""
echo "Choose how to start:"
echo "1. Docker Compose (recommended)"
echo "2. Manual (separate terminals)"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo "Starting with Docker Compose..."
    docker-compose up -d
    echo ""
    echo -e "${GREEN}✓ All services started!${NC}"
    echo ""
    echo "Services running:"
    echo "  - Backend: http://localhost:3001"
    echo "  - Frontend: http://localhost:3000"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo ""
    echo "View logs: docker-compose logs -f"
    echo "Stop services: docker-compose down"
else
    echo ""
    echo -e "${YELLOW}Manual start instructions:${NC}"
    echo ""
    echo "Terminal 1 - Backend:"
    echo "  cd backend"
    echo "  npx prisma migrate dev"
    echo "  npm run start:dev"
    echo ""
    echo "Terminal 2 - Frontend:"
    echo "  cd frontend"
    echo "  npm run dev"
    echo ""
    echo "Terminal 3 - Mobile (optional):"
    echo "  cd mobile"
    echo "  npm start"
fi

echo ""
echo -e "${GREEN}🎉 ThinkTap setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Register a new account"
echo "3. Create your first session"
echo ""
echo "Documentation:"
echo "  - README.md - Quick overview"
echo "  - DOCUMENTATION.md - Complete guide"
echo "  - API_REFERENCE.md - API docs"
echo ""
echo "Happy teaching! 🎓"

