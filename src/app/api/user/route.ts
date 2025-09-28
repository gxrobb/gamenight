import {NextResponse} from 'next/server';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {findUserById} from '@/lib/user-service';
import {NextAuthUser} from '@/types/user';
import {withRateLimit, userDataRateLimiter} from '@/lib/rate-limit';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getUserHandler(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const userId = (session.user as NextAuthUser).id;
    if (!userId) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const user = await findUserById(userId);

    if (!user) {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    // Return user data without sensitive information
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}

export const GET = withRateLimit(
  userDataRateLimiter,
  'Too many requests. Please try again later.'
)(getUserHandler);
