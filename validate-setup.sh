#!/bin/bash
# validate-setup.sh - Validates AdventureConnect project setup

echo "🔍 Validating AdventureConnect Setup..."
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 - Missing!"
        ((ERRORS++))
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ - Missing!"
        ((ERRORS++))
        return 1
    fi
}

# Function to check if file contains required content
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 contains '$2'"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $1 might be missing '$2'"
        ((WARNINGS++))
        return 1
    fi
}

echo ""
echo "📁 Checking Directory Structure..."
echo "----------------------------------"

# Root directories
check_dir "backend"
check_dir "frontend"

# Backend directories
check_dir "backend/src"
check_dir "backend/src/config"
check_dir "backend/src/controllers"
check_dir "backend/src/middleware"
check_dir "backend/src/models"
check_dir "backend/src/routes"

# Frontend directories
check_dir "frontend/src"
check_dir "frontend/src/components"
check_dir "frontend/src/contexts"
check_dir "frontend/src/pages"
check_dir "frontend/src/services"
check_dir "frontend/public"

echo ""
echo "📄 Checking Backend Files..."
echo "----------------------------"

# Backend core files
check_file "backend/package.json"
check_file "backend/src/app.js"
check_file "backend/src/server.js"

# Config files
check_file "backend/src/config/database.js"
check_file "backend/src/config/auth.js"

# Controllers
check_file "backend/src/controllers/authController.js"
check_file "backend/src/controllers/tripController.js"
check_file "backend/src/controllers/bookingController.js"
check_file "backend/src/controllers/providerController.js"

# Models
check_file "backend/src/models/index.js"
check_file "backend/src/models/User.js"
check_file "backend/src/models/Provider.js"
check_file "backend/src/models/Trip.js"
check_file "backend/src/models/Booking.js"

# Routes
check_file "backend/src/routes/auth.js"
check_file "backend/src/routes/trips.js"
check_file "backend/src/routes/bookings.js"
check_file "backend/src/routes/providers.js"

# Middleware
check_file "backend/src/middleware/auth.js"
check_file "backend/src/middleware/errorHandler.js"

echo ""
echo "📄 Checking Frontend Files..."
echo "-----------------------------"

# Frontend core files
check_file "frontend/package.json"
check_file "frontend/src/App.js"
check_file "frontend/src/index.js"
check_file "frontend/src/index.css"
check_file "frontend/tailwind.config.js"
check_file "frontend/public/index.html"

# Context
check_file "frontend/src/contexts/AuthContext.js"

# Services
check_file "frontend/src/services/api.js"

# Pages
check_file "frontend/src/pages/Home.js"
check_file "frontend/src/pages/Login.js"
check_file "frontend/src/pages/Register.js"
check_file "frontend/src/pages/ProviderDashboard.js"
check_file "frontend/src/pages/CreateTrip.js"
check_file "frontend/src/pages/TripList.js"
check_file "frontend/src/pages/TripDetail.js"
check_file "frontend/src/pages/BookingRequest.js"

echo ""
echo "📄 Checking Configuration Files..."
echo "----------------------------------"

check_file "docker-compose.yml"
check_file ".gitignore"

# Check for .env files
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env"
    check_content "backend/.env" "DATABASE_URL"
    check_content "backend/.env" "JWT_SECRET"
else
    echo -e "${YELLOW}⚠${NC} backend/.env - Missing (will use defaults)"
    ((WARNINGS++))
fi

if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env"
    check_content "frontend/.env" "REACT_APP_API_URL"
else
    echo -e "${YELLOW}⚠${NC} frontend/.env - Missing (will use defaults)"
    ((WARNINGS++))
fi

echo ""
echo "🔧 Checking Dependencies..."
echo "---------------------------"

# Check if node_modules exist
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Backend dependencies not installed - run: cd backend && npm install"
    ((WARNINGS++))
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Frontend dependencies not installed - run: cd frontend && npm install"
    ((WARNINGS++))
fi

echo ""
echo "🐳 Checking Docker Setup..."
echo "---------------------------"

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker is installed"
else
    echo -e "${YELLOW}⚠${NC} Docker is not installed"
    ((WARNINGS++))
fi

if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose is installed"
else
    echo -e "${YELLOW}⚠${NC} Docker Compose is not installed"
    ((WARNINGS++))
fi

echo ""
echo "===================================="
echo "📊 Validation Summary"
echo "===================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Your setup is complete.${NC}"
    echo ""
    echo "🚀 Ready to run:"
    echo "   Using Docker: docker-compose up -d"
    echo "   Without Docker: cd backend && npm run dev (Terminal 1)"
    echo "                   cd frontend && npm start (Terminal 2)"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Setup is functional with $WARNINGS warnings.${NC}"
    echo ""
    echo "Warnings are non-critical, but you should address them."
else
    echo -e "${RED}❌ Found $ERRORS errors and $WARNINGS warnings.${NC}"
    echo ""
    echo "Please fix the errors before running the application."
    echo "Run ./organize-files.sh to fix file structure issues."
fi

echo ""
echo "📚 For detailed setup instructions, see the README.md file."