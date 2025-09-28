# Rate Limiting

This application implements comprehensive rate limiting for all API endpoints to prevent abuse and ensure fair usage.

## Rate Limits

### General API Endpoints

- **Limit**: 100 requests per 15 minutes
- **Applies to**: All general API routes
- **Headers**: Standard rate limit headers included

### Authentication Endpoints

- **Limit**: 10 requests per 15 minutes
- **Applies to**: `/api/auth/*` routes (login, logout, etc.)
- **Reasoning**: More strict to prevent brute force attacks

### User Data Endpoints

- **Limit**: 30 requests per 5 minutes
- **Applies to**: `/api/user` and similar user-specific endpoints
- **Reasoning**: Balance between usability and security

## Implementation

### For New API Routes

```typescript
import {withAPIRateLimit} from '@/lib/api-middleware';

async function myHandler(request: Request) {
  // Your API logic here
  return NextResponse.json({data: 'success'});
}

export const GET = withAPIRateLimit(myHandler);
export const POST = withAPIRateLimit(myHandler);
```

### For Custom Rate Limits

```typescript
import {withRateLimit, RateLimiter} from '@/lib/rate-limit';

const customLimiter = new RateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 50, // 50 requests per 10 minutes
});

export const GET = withRateLimit(
  customLimiter,
  'Custom rate limit message'
)(myHandler);
```

## Rate Limit Headers

All rate-limited responses include these headers:

- `X-RateLimit-Limit`: Maximum requests allowed in the window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Timestamp when the window resets
- `Retry-After`: Seconds to wait before retrying (on 429 responses)

## Error Response

When rate limit is exceeded:

```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

Status: `429 Too Many Requests`

## Client IP Detection

The rate limiter automatically detects client IPs from these headers (in order):

1. `x-forwarded-for` (first IP in comma-separated list)
2. `x-real-ip`
3. `cf-connecting-ip` (Cloudflare)
4. Fallback to `127.0.0.1`

## Testing

Rate limiting is mocked in tests to avoid interference. See `src/lib/__tests__/rate-limit.test.ts` for comprehensive test coverage.

## Configuration

Rate limits are configured in `src/lib/rate-limit.ts`. Adjust the limits as needed for your application's requirements.

### Current Configuration

```typescript
// General API rate limiter
apiRateLimiter: 100 requests / 15 minutes

// Authentication rate limiter
authRateLimiter: 10 requests / 15 minutes

// User data rate limiter
userDataRateLimiter: 30 requests / 5 minutes
```

## Security Considerations

- Rate limits are applied per IP + User-Agent combination
- Different IPs and user agents are tracked separately
- Expired entries are automatically cleaned up every 5 minutes
- Rate limiting is applied before any business logic to minimize resource usage
- All rate limit violations are logged for monitoring
