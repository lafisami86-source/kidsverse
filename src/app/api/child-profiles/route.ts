// Child Profiles CRUD — GET (list) & POST (create)
// Resilient: works on Vercel serverless where SQLite may not persist

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function getAgeGroup(age: number): string {
  if (age <= 3) return 'toddler';
  if (age <= 6) return 'early';
  return 'kid';
}

const FREE_PROFILE_LIMIT = 3;
const PREMIUM_PROFILE_LIMIT = 10;

// In-memory fallback for when SQLite is not available
const memoryProfiles: Map<string, {
  id: string;
  name: string;
  age: number;
  avatar: string;
  ageGroup: string;
  screenTimeLimit: number;
  contentFilter: string;
  parentId: string;
  createdAt: Date;
}> = new Map();

export async function GET() {
  try {
    const profiles = await db.childProfile.findMany({
      include: {
        _count: { select: { badges: true, gameScores: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ profiles });
  } catch {
    // DB not available — return empty list; client will use localStorage fallback
    return NextResponse.json({ profiles: [] }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, age, avatar, screenTimeLimit, contentFilter, parentId } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!age || typeof age !== 'number' || age < 2 || age > 10) {
      return NextResponse.json({ error: 'Age must be between 2 and 10' }, { status: 400 });
    }

    const effectiveParentId = parentId || 'local_user';

    // Try DB first
    try {
      const profile = await db.childProfile.create({
        data: {
          name: name.trim(),
          age,
          avatar: avatar || '🐾',
          ageGroup: getAgeGroup(age),
          screenTimeLimit: screenTimeLimit || 60,
          contentFilter: contentFilter || 'all',
          parentId: effectiveParentId,
        },
      });

      return NextResponse.json({
        profile: {
          ...profile,
          _count: { badges: 0, gameScores: 0 },
        },
      }, { status: 201 });
    } catch {
      // DB write failed — generate a local profile and return it
      const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const localProfile = {
        id: localId,
        name: name.trim(),
        age,
        avatar: avatar || '🐾',
        ageGroup: getAgeGroup(age),
        screenTimeLimit: screenTimeLimit || 60,
        contentFilter: contentFilter || 'all',
        parentId: effectiveParentId,
        createdAt: new Date(),
        _count: { badges: 0, gameScores: 0 },
      };

      memoryProfiles.set(localId, localProfile);

      return NextResponse.json({
        profile: localProfile,
        _localStorage: true,
      }, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}
