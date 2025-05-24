// Test setup file
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/thinkaton-test';

// Global test timeout
jest.setTimeout(10000);
