import NextAuth from 'next-auth';
import {authOptions} from '@/lib/auth';
import {withRateLimit, authRateLimiter} from '@/lib/rate-limit';

const handler = NextAuth(authOptions);

// Apply rate limiting to auth endpoints
const rateLimitedHandler = withRateLimit(
  authRateLimiter,
  'Too many authentication attempts. Please try again later.'
)(handler);

export {rateLimitedHandler as GET, rateLimitedHandler as POST};
