// Child Profiles CRUD — GET (list) & POST (create)

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isPremiumUser } from '@/lib/auth';
import { db } from '@/lib/db';

function getAgeGroup(age: number): string {
  if (age <= 3) return 'toddler';
  if (age <= 6) return 'early';
  return 'kid';
}

const FREE_PROFILE_LIMIT = 3;
const PREMIUM_PROFILE_LIMIT = 10;

export async function GET() {
  try {
    const user = await requireAuth();
    const profiles = await db.childProfile.findMany({
      where: { parentId: user.id },
      include: {
        _count: { select: { badges: true, gameScores: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ profiles });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'Authentication required') {
      return NextResponse.json({ profiles: [] }, { status: 200 });
    }
    // Database not available — return empty list instead of error
    return NextResponse.json({ profiles: [] }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, age, avatar, screenTimeLimit, contentFilter } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!age || typeof age !== 'number' || age < 2 || age > 10) {
      return NextResponse.json({ error: 'Age must be between 2 and 10' }, { status: 400 });
    }

    const premium = await isPremiumUser(user.id);
    const maxProfiles = premium ? PREMIUM_PROFILE_LIMIT : FREE_PROFILE_LIMIT;
    const existingCount = await db.childProfile.count({
      where: { parentId: user.id },
    });

    if (existingCount >= maxProfiles) {
      return NextResponse.json(
        { error: `Profile limit reached (${maxProfiles}). Upgrade to premium for more profiles.` },
        { status: 403 }
      );
    }

    const profile = await db.childProfile.create({
      data: {
        name: name.trim(),
        age,
        avatar: avatar || '🐾',
        ageGroup: getAgeGroup(age),
        screenTimeLimit: screenTimeLimit || 60,
        contentFilter: contentFilter || 'all',
        parentId: user.id,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create profile';
    if (message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}
