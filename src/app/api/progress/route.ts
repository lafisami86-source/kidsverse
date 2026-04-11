import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProgressPayload {
  profileId: string;
  moduleId: string;
  lessonId: string;
  stars: number;
  score: number;
}

// ─── GET ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/progress?profileId={profileId}
 *
 * Returns all progress records for a child profile.
 * Requires authentication — the caller must be the parent of the child.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: profileId' },
        { status: 400 },
      );
    }

    // Verify the child profile belongs to the authenticated parent
    const childProfile = await db.childProfile.findFirst({
      where: {
        id: profileId,
        parentId: user.id,
      },
    });

    if (!childProfile) {
      return NextResponse.json(
        { error: 'Child profile not found' },
        { status: 404 },
      );
    }

    // Fetch all progress records for this child
    const records = await db.progress.findMany({
      where: { childId: profileId },
      orderBy: { updatedAt: 'desc' },
    });

    const progress = records.map((record) => ({
      id: record.id,
      moduleId: record.moduleId,
      lessonId: record.lessonId,
      completed: record.completed,
      score: record.score,
      stars: record.stars,
      completedAt: record.completed ? record.updatedAt.toISOString() : null,
    }));

    return NextResponse.json({ progress });
  } catch (err) {
    if (err instanceof Error && err.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('GET /api/progress error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ─── POST ────────────────────────────────────────────────────────────────────

/**
 * POST /api/progress
 *
 * Upserts a lesson progress record.
 * Body: { profileId, moduleId, lessonId, stars, score }
 * Uses the unique constraint [childId, moduleId, lessonId] for upsert.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = (await request.json()) as ProgressPayload;
    const { profileId, moduleId, lessonId, stars, score } = body;

    // Validate required fields
    if (!profileId || !moduleId || !lessonId) {
      return NextResponse.json(
        { error: 'Missing required fields: profileId, moduleId, lessonId' },
        { status: 400 },
      );
    }

    // Validate stars and score ranges
    if (typeof stars !== 'number' || stars < 0 || stars > 3) {
      return NextResponse.json(
        { error: 'Invalid stars value: must be 0-3' },
        { status: 400 },
      );
    }

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'Invalid score value: must be 0-100' },
        { status: 400 },
      );
    }

    // Verify the child profile belongs to the authenticated parent
    const childProfile = await db.childProfile.findFirst({
      where: {
        id: profileId,
        parentId: user.id,
      },
    });

    if (!childProfile) {
      return NextResponse.json(
        { error: 'Child profile not found' },
        { status: 404 },
      );
    }

    // Check for existing record to preserve best score/stars
    const existing = await db.progress.findUnique({
      where: {
        childId_moduleId_lessonId: {
          childId: profileId,
          moduleId,
          lessonId,
        },
      },
    });

    const bestScore = existing
      ? Math.max(existing.score, score)
      : score;
    const bestStars = existing
      ? Math.max(existing.stars, stars)
      : stars;

    // Upsert the progress record with the best values
    const record = await db.progress.upsert({
      where: {
        childId_moduleId_lessonId: {
          childId: profileId,
          moduleId,
          lessonId,
        },
      },
      update: {
        completed: true,
        score: bestScore,
        stars: bestStars,
      },
      create: {
        childId: profileId,
        moduleId,
        lessonId,
        completed: true,
        score,
        stars,
      },
    });

    return NextResponse.json({
      progress: {
        id: record.id,
        moduleId: record.moduleId,
        lessonId: record.lessonId,
        completed: record.completed,
        score: record.score,
        stars: record.stars,
        completedAt: record.completed ? record.updatedAt.toISOString() : null,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('POST /api/progress error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
