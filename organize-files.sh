#!/bin/bash
# organize-files.sh - Script to organize AdventureConnect files into proper structure

echo "🗂️  Organizing AdventureConnect project files..."

# Create directory structure
echo "📁 Creating directory structure..."

# Backend directories
mkdir -p backend/src/{config,controllers,middleware,models,routes,utils}
mkdir -p backend/tests
mkdir -p backend/uploads

# Frontend directories
mkdir -p frontend/src/{components/{auth,common,provider,traveler},contexts,pages,services}
mkdir -p frontend/public

# Move backend files to correct locations
echo "📦 Moving backend files..."

# Config files
[ -f "backend-database.js" ] && mv backend-database.js backend/src/config/database.js
[ -f "backend-auth-config.js" ] && mv backend-auth-config.js backend/src/config/auth.js
[ -f "backend-email-util.js" ] && mv backend-email-util.js backend/src/config/email.js
[ -f "backend-amadeus-config.js" ] && mv backend-amadeus-config.js backend/src/config/amadeus.js

# Controllers
[ -f "backend-auth-controller.js" ] && mv backend-auth-controller.js backend/src/controllers/authController.js
[ -f "backend-controllers.js" ] && mv backend-controllers.js backend/src/controllers/
[ -f "booking-request.js" ] && grep -q "bookingController" booking-request.js && mv booking-request.js backend/src/controllers/bookingController.js

# Models
[ -f "backend-models.js" ] && mv backend-models.js backend/src/models/

# Routes
[ -f "backend-routes.js" ] && mv backend-routes.js backend/src/routes/
[ -f "app-routes.js" ] && grep -q "express" app-routes.js && mv app-routes.js backend/src/routes/

# Middleware
[ -f "backend-upload-middleware.js" ] && mv backend-upload-middleware.js backend/src/middleware/upload.js

# App and server files
[ -f "backend-app-server.js" ] && mv backend-app-server.js backend/src/app.js
[ -f "backend-structure.js" ] && rm backend-structure.js # This is just documentation

# Database schema
[ -f "database-schema.sql" ] && mv database-schema.sql backend/database/schema.sql

# Package files
[ -f "backend-package.json" ] && mv backend-package.json backend/package.json

# Docker files
[ -f "backend-dockerfile.txt" ] && mv backend-dockerfile.txt backend/Dockerfile
[ -f "docker-setup.txt" ] && mv docker-setup.txt docker-compose.yml

# Move frontend files to correct locations
echo "📱 Moving frontend files..."

# Pages
[ -f "frontend-home-page.js" ] && mv frontend-home-page.js frontend/src/pages/Home.js
[ -f "frontend-auth-pages.js" ] && mv frontend-auth-pages.js frontend/src/pages/
[ -f "trip-list.js" ] && mv trip-list.js frontend/src/pages/TripList.js
[ -f "trip-detail.js" ] && mv trip-detail.js frontend/src/pages/TripDetail.js
[ -f "create-trip.js" ] && mv create-trip.js frontend/src/pages/CreateTrip.js
[ -f "booking-request.js" ] && grep -q "BookingRequest" booking-request.js && mv booking-request.js frontend/src/pages/BookingRequest.js
[ -f "provider-dashboard.js" ] && mv provider-dashboard.js frontend/src/pages/ProviderDashboard.js

# Contexts
[ -f "auth-context.js" ] && mv auth-context.js frontend/src/contexts/AuthContext.js

# Services
[ -f "api-service.js" ] && mv api-service.js frontend/src/services/api.js

# App.js
[ -f "app-routes.js" ] && grep -q "BrowserRouter" app-routes.js && mv app-routes.js frontend/src/App.js

# Config files
[ -f "styles-config.js" ] && mv styles-config.js frontend/

# Testing files
[ -f "testing-setup.js" ] && mv testing-setup.js ./

# Move other root files
[ -f "setup-script.sh" ] && mv setup-script.sh setup.sh && chmod +x setup.sh
[ -f "readme-file.md" ] && mv readme-file.md README.md

# Split combined files if needed
echo "📄 Processing combined files..."

# If frontend-auth-pages.js contains both Login and Register
if [ -f "frontend/src/pages/frontend-auth-pages.js" ]; then
    # Extract Login.js
    sed -n '/\/\/ frontend\/src\/pages\/Login.js/,/export default Login;/p' frontend/src/pages/frontend-auth-pages.js > frontend/src/pages/Login.js
    
    # Extract Register.js
    sed -n '/\/\/ frontend\/src\/pages\/Register.js/,/export default Register;/p' frontend/src/pages/frontend-auth-pages.js > frontend/src/pages/Register.js
    
    rm frontend/src/pages/frontend-auth-pages.js
fi

# Create missing essential files
echo "📝 Creating missing essential files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://adventureconnect:password@localhost:5432/adventureconnect
JWT_SECRET=your-super-secret-jwt-key-change-this
EOF
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
EOF
fi

# Create index.js for frontend if missing
if [ ! -f "frontend/src/index.js" ]; then
    cat > frontend/src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF
fi

# Create index.css if missing
if [ ! -f "frontend/src/index.css" ] && [ -f "frontend/styles-config.js" ]; then
    # Extract CSS from styles-config.js
    sed -n '/\/\/ frontend\/src\/index.css/,/@layer utilities/p' frontend/styles-config.js > frontend/src/index.css
fi

# Create tailwind.config.js if missing
if [ ! -f "frontend/tailwind.config.js" ] && [ -f "frontend/styles-config.js" ]; then
    # Extract tailwind config
    sed -n '/\/\/ frontend\/tailwind.config.js/,/^}/p' frontend/styles-config.js > frontend/tailwind.config.js
fi

# Clean up
echo "🧹 Cleaning up..."
rm -f frontend/styles-config.js
rm -f adventureconnect-structure.js

echo "✅ File organization complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review the file structure"
echo "2. Install dependencies: cd backend && npm install && cd ../frontend && npm install"
echo "3. Set up the database"
echo "4. Run the application"