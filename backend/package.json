// backend/package.json
{
  "name": "adventureconnect-backend",
  "version": "1.0.0",
  "description": "AdventureConnect MVP Backend",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "sequelize": "^6.31.0",
    "pg": "^8.10.0",
    "pg-hstore": "^2.3.4",
    "redis": "^4.6.5",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "sequelize-cli": "^6.6.0"
  }
}

// frontend/package.json
{
  "name": "adventureconnect-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-hook-form": "^7.43.0",
    "axios": "^1.3.0",
    "@heroicons/react": "^2.0.16",
    "react-scripts": "5.0.1"
  },
  "devDependencies": {
    "tailwindcss": "^3.2.4",
    "autoprefixer": "^10.4.13",
    "postcss": "^8.4.21",
    "@tailwindcss/forms": "^0.5.3",
    "@tailwindcss/aspect-ratio": "^0.4.2",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^13.5.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}

// frontend/public/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="AdventureConnect - Discover unique travel experiences with local experts"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>AdventureConnect - Unique Travel Experiences</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>

// backend/src/server.js
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

// frontend/postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// .gitignore (root level)
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Editor directories and files
.idea
.vscode
*.swp
*.swo
*~

# OS files
Thumbs.db

# Uploads
uploads/
backend/uploads/

# Database
*.sqlite
*.sqlite3

# Docker
docker-compose.override.yml