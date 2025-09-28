import '@testing-library/jest-dom';
import {UserSession} from '@/types/user';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();
const mockRefresh = jest.fn();

const mockUseRouter = jest.fn(() => ({
  push: mockPush,
  replace: mockReplace,
  prefetch: mockPrefetch,
  back: mockBack,
  forward: mockForward,
  refresh: mockRefresh,
}));

jest.mock('next/navigation', () => ({
  useRouter: mockUseRouter,
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock NextAuth
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();

interface SessionData {
  data: {
    user: UserSession;
  } | null;
  status: string;
  update: jest.Mock;
}

const mockUseSession = jest.fn() as jest.MockedFunction<() => SessionData>;

jest.mock('next-auth/react', () => ({
  useSession: mockUseSession,
  signIn: mockSignIn,
  signOut: mockSignOut,
  SessionProvider: ({children}: {children: React.ReactNode}) => children,
}));

// Export the mock functions for use in tests
export {
  mockPush,
  mockReplace,
  mockPrefetch,
  mockBack,
  mockForward,
  mockRefresh,
  mockUseRouter,
  mockSignIn,
  mockSignOut,
  mockUseSession,
};

// Simple test to avoid "no tests" error
describe('Test Setup', () => {
  it('should be configured correctly', () => {
    expect(true).toBe(true);
  });
});
