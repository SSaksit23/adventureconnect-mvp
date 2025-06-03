// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new traveler', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          userType: 'traveler'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should register a new provider', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'provider@example.com',
          password: 'password123',
          firstName: 'Provider',
          lastName: 'User',
          userType: 'provider'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.userType).toBe('provider');
    });

    it('should not register user with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          userType: 'traveler'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});

// backend/tests/trips.test.js
const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Provider, Trip } = require('../src/models');

describe('Trip Endpoints', () => {
  let authToken;
  let providerId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create a provider user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'provider@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Provider',
        userType: 'provider'
      });

    authToken = res.body.token;
    
    // Get provider ID
    const provider = await Provider.findOne({ where: { userId: res.body.user.id } });
    providerId = provider.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/trips', () => {
    it('should get all trips', async () => {
      const res = await request(app).get('/api/trips');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('trips');
      expect(res.body).toHaveProperty('total');
    });

    it('should filter trips by location', async () => {
      const res = await request(app)
        .get('/api/trips')
        .query({ location: 'Bangkok' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.trips).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/trips', () => {
    it('should create a new trip as provider', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tripType: 'service_component',
          title: 'Test Trip',
          description: 'This is a test trip',
          location: 'Bangkok, Thailand',
          activityType: 'Adventure',
          duration: '4 hours',
          maxGroupSize: 8,
          basePrice: 50,
          customizableComponents: {
            accommodation: true,
            activities: false
          }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Test Trip');
    });

    it('should not create trip without authentication', async () => {
      const res = await request(app)
        .post('/api/trips')
        .send({
          title: 'Test Trip'
        });

      expect(res.statusCode).toBe(401);
    });
  });
});

// frontend/src/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders AdventureConnect header', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const linkElement = screen.getByText(/AdventureConnect/i);
  expect(linkElement).toBeInTheDocument();
});

// frontend/src/pages/Login.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../contexts/AuthContext';

const LoginWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Login Component', () => {
  test('renders login form', () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('shows validation errors', async () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});

// backend/jest.config.js
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/*.js'
  ],
  setupFilesAfterEnv: ['./tests/setup.js']
};

// backend/tests/setup.js
require('dotenv').config({ path: '.env.test' });

// frontend/jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)'
  ]
};

// frontend/src/setupTests.js
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// .env.test
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/adventureconnect_test
JWT_SECRET=test-jwt-secret
PORT=5001