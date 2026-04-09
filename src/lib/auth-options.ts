/**
 * NextAuth Configuration Options
 * Handles authentication for parent accounts
 */
import type { NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import { comparePasswords, hashPassword } from './password';

// In-memory user store as fallback when SQLite is not available (Vercel serverless)
const memoryUsers = new Map<string, { id: string; email: string; name: string; password: string; image?: string }>();

async function getDbUser(email: string) {
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (user) return user;
  } catch {
    // DB not available — fall through to memory store
  }
  return memoryUsers.get(email.toLowerCase()) || null;
}

async function createDbUser(data: { name: string; email: string; password: string }) {
  const email = data.email.toLowerCase();
  const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const hashedPassword = await hashPassword(data.password);
  const user = { id, email, name: data.name, password: hashedPassword };

  try {
    await db.user.create({
      data: { name: data.name, email, password: hashedPassword },
    });
    try {
      await db.subscription.create({
        data: { userId: id, plan: 'free', status: 'free' },
      });
    } catch {
      // Ignore subscription creation errors
    }
  } catch {
    // DB not available — store in memory
    memoryUsers.set(email, user);
  }

  return user;
}

export const authOptions: NextAuthOptions = {
  // @ts-expect-error - PrismaAdapter type mismatch with NextAuth v4
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await getDbUser(credentials.email);

          if (!user) {
            return null;
          }

          const isValid = await comparePasswords(credentials.password, user.password || '');

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error('Auth authorize error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/parent/login',
    error: '/parent/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.subscription = 'free';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        try {
          const subscription = await db.subscription.findUnique({
            where: { userId: token.id as string },
          });
          (session.user as Record<string, unknown>).subscription = subscription?.plan || 'free';
        } catch {
          (session.user as Record<string, unknown>).subscription = 'free';
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'kidsverse-fallback-secret-change-in-production',
};

export { createDbUser, getDbUser };
