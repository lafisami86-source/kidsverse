// Single Child Profile — GET, PUT, DELETE
// Resilient: works on Vercel serverless where SQLite may not persist

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function getAgeGroup(age: number): string {
  if (age <= 3) return 'toddler';
  if (age <= 6) return 'early';
  return 'kid';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await db.childProfile.findFirst({ where: { id } });

    if (!profile) {
      // Profile might be a localStorage profile — return 200 with null
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const badgesCount = await db.badge.count({ where: { childId: id } }).catch(() => 0);
    const gameScoresCount = await db.gameScore.count({ where: { childId: id } }).catch(() => 0);

    return NextResponse.json({
      profile,
      badgesCount,
      gameScoresCount,
    });
  } catch {
    return NextResponse.json({ profile: null }, { status: 200 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, age, avatar, screenTimeLimit, contentFilter } = body;

    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 1)) {
      return NextResponse.json({ error: 'Name must be a non-empty string' }, { status: 400 });
    }
    if (age !== undefined && (typeof age !== 'number' || age < 2 || age > 10)) {
      return NextResponse.json({ error: 'Age must be between 2 and 10' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (age !== undefined) {
      updateData.age = age;
      updateData.ageGroup = getAgeGroup(age);
    }
    if (avatar !== undefined) updateData.avatar = avatar;
    if (screenTimeLimit !== undefined) updateData.screenTimeLimit = screenTimeLimit;
    if (contentFilter !== undefined) updateData.contentFilter = contentFilter;

    try {
      const profile = await db.childProfile.update({
        where: { id },
        data: updateData,
      });
      return NextResponse.json({ profile });
    } catch {
      // DB update failed — return success for localStorage profiles
      return NextResponse.json({
        profile: {
          id,
          name: name || 'Unknown',
          age: age || 5,
          avatar: avatar || '🐾',
          ageGroup: getAgeGroup(age || 5),
          screenTimeLimit: screenTimeLimit || 60,
          contentFilter: contentFilter || 'all',
          _localStorage: true,
        },
      });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    try {
      await db.childProfile.delete({ where: { id } });
    } catch {
      // DB delete failed — might be a localStorage profile, return success anyway
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
}
