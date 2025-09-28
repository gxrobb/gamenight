import {NextAuthOptions} from 'next-auth';
import {PrismaAdapter} from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import {verifyPassword} from './user-service';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter({
    // We'll need to set up Prisma for this to work
    // For now, we'll use a custom adapter approach
  }),

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: {label: 'Username', type: 'text'},
        password: {label: 'Password', type: 'password'},
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Use your existing user service to verify credentials
          const user = await verifyPassword(
            credentials.username,
            credentials.password
          );

          if (!user) {
            return null;
          }

          return {
            id: user.id.toString(),
            name: user.username,
            email: user.email,
            username: user.username,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({token, user}) {
      if (user) {
        token.username = user.username;
      }
      return token;
    },

    async session({session, token}) {
      if (token) {
        session.user.id = token.sub;
        session.user.username = token.username;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
