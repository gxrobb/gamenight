import {withRateLimit, apiRateLimiter} from '@/lib/rate-limit';

// General API rate limiting middleware
export const withAPIRateLimit = withRateLimit(
  apiRateLimiter,
  'Too many API requests. Please try again later.'
);

// Helper function to create rate-limited API handlers
export function createRateLimitedHandler(
  handler: (request: Request, ...args: unknown[]) => Promise<Response>
) {
  return withAPIRateLimit(handler);
}
