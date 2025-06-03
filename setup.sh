#!/bin/bash
# setup.sh - Quick setup script for AdventureConnect MVP

echo "🚀 Setting up AdventureConnect MVP..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 14+ first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

if ! command_exists psql; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not installed or psql is not in PATH.${NC}"
    echo "Please ensure PostgreSQL is installed and running."
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Create .env files if they don't exist
echo "📝 Creating environment files..."

if [ ! -f backend/.env ]; then
    cat > backend/.env << EOL
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/adventureconnect
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adventureconnect
DB_USER=postgres
DB_PASSWORD=password

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email (Using Gmail as example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Amadeus API
AMADEUS_CLIENT_ID=Bd76Zxmr3DtsAgSCNVhRlgCzzFDROM07
AMADEUS_CLIENT_SECRET=Onw33473vAI1CTHS
AMADEUS_BASE_URL=https://test.api.amadeus.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/
EOL
    echo -e "${GREEN}✅ Created backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists, skipping...${NC}"
fi

# Create uploads directory
mkdir -p backend/uploads
touch backend/uploads/.gitkeep

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Create database
echo "🗄️  Setting up database..."
if command_exists psql; then
    # Try to create database
    createdb adventureconnect 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database created${NC}"
    else
        echo -e "${YELLOW}⚠️  Database might already exist or creation failed${NC}"
    fi
    
    # Run migrations
    npm run db:migrate
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database migrations completed${NC}"
    else
        echo -e "${RED}❌ Database migration failed. Please check your database connection.${NC}"
        exit 1
    fi
    
    # Seed database
    read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:seed
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database seeded with sample data${NC}"
        else
            echo -e "${YELLOW}⚠️  Database seeding failed${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  PostgreSQL not found. Please set up the database manually:${NC}"
    echo "  1. Create database: createdb adventureconnect"
    echo "  2. Run migrations: cd backend && npm run db:migrate"
    echo "  3. (Optional) Seed data: npm run db:seed"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Final instructions
echo
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo
echo "📋 Next steps:"
echo "  1. Update backend/.env with your actual email credentials"
echo "  2. Start the backend: cd backend && npm run dev"
echo "  3. Start the frontend: cd frontend && npm start"
echo
echo "🔐 Test accounts (if you seeded the database):"
echo "  Providers:"
echo "    - alex@adventureconnect.com / password123"
echo "    - sofia@adventureconnect.com / password123"
echo "  Travelers:"
echo "    - sarah@example.com / password123"
echo "    - john@example.com / password123"
echo
echo "🌐 Access the application at:"
echo "    Frontend: http://localhost:3000"
echo "    Backend API: http://localhost:5000/api"
echo
echo "Happy coding! 🚀"