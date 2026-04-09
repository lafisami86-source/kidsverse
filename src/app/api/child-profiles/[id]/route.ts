// Single Child Profile — GET, PUT, DELETE

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getChildProfile } from '@/lib/auth';
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
    const user = await requireAuth();
    const { id } = await params;
    const profile = await getChildProfile(id, user.id);

    const badgesCount = await db.badge.count({ where: { childId: id } });
    const gameScoresCount = await db.gameScore.count({ where: { childId: id } });

    return NextResponse.json({
      profile,
      badgesCount,
      gameScoresCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Not found';
    if (message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (message === 'Child profile not found') {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    await getChildProfile(id, user.id);

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

    const profile = await db.childProfile.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    if (message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (message === 'Child profile not found') {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    await getChildProfile(id, user.id);

    await db.childProfile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    if (message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (message === 'Child profile not found') {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
}
