// Environment variables utility with TypeScript types

export const env = {
  // Public environment variables (accessible on client-side)
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Next.js App',
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',

  // Server-side only environment variables
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/myapp',
  SECRET_KEY: process.env.SECRET_KEY || 'your-secret-key-here',
} as const;

// Type definitions for environment variables
export type Env = typeof env;

// Validation function to check required environment variables
export function validateEnv() {
  const requiredVars = ['NEXT_PUBLIC_APP_NAME', 'NEXT_PUBLIC_API_URL'];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.warn(`Warning: ${varName} is not set in environment variables`);
    }
  }
}

// Call validation in development
if (process.env.NODE_ENV === 'development') {
  validateEnv();
}
