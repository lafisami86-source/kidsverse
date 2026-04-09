/**
 * Auth utilities for KidsVerse
 */
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { db } from './db';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function getChildProfile(profileId: string, parentId: string) {
  const profile = await db.childProfile.findFirst({
    where: {
      id: profileId,
      parentId,
    },
  });

  if (!profile) {
    throw new Error('Child profile not found');
  }

  return profile;
}

export async function getChildProfiles(parentId: string) {
  return db.childProfile.findMany({
    where: { parentId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function isPremiumUser(userId: string): Promise<boolean> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
  });
  return subscription?.status === 'active' && subscription?.plan === 'premium';
}
