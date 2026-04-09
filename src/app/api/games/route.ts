// Game Scores API — Submit and retrieve game scores
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET: Fetch high scores for a child profile ──────────────────────────
// Query: ?profileId=xxx&gameType=memory (optional filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const gameType = searchParams.get('gameType');

    if (!profileId) {
      return NextResponse.json(
        { error: 'profileId is required' },
        { status: 400 },
      );
    }

    const where: Record<string, unknown> = { childId: profileId };
    if (gameType) {
      where.gameType = gameType;
    }

    const scores = await prisma.gameScore.findMany({
      where,
      orderBy: { score: 'desc' },
      take: 50,
    });

    // Group best scores by game type
    const bestScores: Record<string, (typeof scores)[0]> = {};
    for (const score of scores) {
      if (!bestScores[score.gameType] || score.score > bestScores[score.gameType].score) {
        bestScores[score.gameType] = score;
      }
    }

    // Count total games played per type
    const counts: Record<string, number> = {};
    for (const score of scores) {
      counts[score.gameType] = (counts[score.gameType] || 0) + 1;
    }

    return NextResponse.json({
      scores: scores.map((s) => ({
        id: s.id,
        childId: s.childId,
        gameType: s.gameType,
        score: s.score,
        level: s.level,
        duration: s.duration,
        completedAt: s.completedAt.toISOString(),
      })),
      bestScores: Object.fromEntries(
        Object.entries(bestScores).map(([key, val]) => [
          key,
          {
            id: val.id,
            childId: val.childId,
            gameType: val.gameType,
            score: val.score,
            level: val.level,
            duration: val.duration,
            completedAt: val.completedAt.toISOString(),
          },
        ]),
      ),
      totalPlayed: counts,
    });
  } catch (error) {
    console.error('Failed to fetch game scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game scores' },
      { status: 500 },
    );
  }
}

// ─── POST: Submit a new game score ───────────────────────────────────────
// Body: { childId, gameType, score, level, duration }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { childId, gameType, score, level, duration } = body;

    if (!childId || !gameType || score === undefined) {
      return NextResponse.json(
        { error: 'childId, gameType, and score are required' },
        { status: 400 },
      );
    }

    const validTypes = ['memory', 'math', 'puzzle', 'spelling'];
    if (!validTypes.includes(gameType)) {
      return NextResponse.json(
        { error: `Invalid gameType: ${gameType}` },
        { status: 400 },
      );
    }

    const newScore = await prisma.gameScore.create({
      data: {
        childId,
        gameType,
        score: Math.max(0, Math.min(9999, Number(score) || 0)),
        level: Math.max(1, Math.min(99, Number(level) || 1)),
        duration: Math.max(0, Math.min(3600, Number(duration) || 0)),
      },
    });

    return NextResponse.json(
      {
        score: {
          id: newScore.id,
          childId: newScore.childId,
          gameType: newScore.gameType,
          score: newScore.score,
          level: newScore.level,
          duration: newScore.duration,
          completedAt: newScore.completedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to save game score:', error);
    return NextResponse.json(
      { error: 'Failed to save game score' },
      { status: 500 },
    );
  }
}
