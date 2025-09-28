import '@testing-library/jest-dom';
import './src/__tests__/setup';

// Polyfill for Web APIs needed by Next.js API routes
import {TextEncoder, TextDecoder} from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock NextResponse for API route testing
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      statusText: init?.statusText || 'OK',
      headers: new Map(Object.entries(init?.headers || {})),
    })),
  },
}));

// Polyfill for structuredClone (needed for Chakra UI in Jest)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => {
    if (obj === undefined) return undefined;
    return JSON.parse(JSON.stringify(obj));
  };
}

// Mock fetch API
global.fetch = jest.fn();

// Mock fetch responses
global.fetch.mockImplementation((url) => {
  if (url === '/api/user') {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: '123',
          username: 'testuser',
          email: 'test@example.com',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }),
    });
  }
  return Promise.reject(new Error('Unknown URL'));
});

// Suppress act warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: An update to') ||
        args[0].includes('An update to') ||
        args[0].includes('was not wrapped in act'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
