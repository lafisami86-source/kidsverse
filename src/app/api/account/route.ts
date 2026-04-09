// Account Settings API — password change & account deletion

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { comparePasswords, hashPassword } from '@/lib/password';

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { action, currentPassword, newPassword } = body;

    if (action === 'change-password') {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      }

      const dbUser = await db.user.findUnique({ where: { id: user.id } });
      if (!dbUser?.password) {
        return NextResponse.json(
          { error: 'Password cannot be changed for OAuth accounts' },
          { status: 400 }
        );
      }

      const isValid = await comparePasswords(currentPassword, dbUser.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }

      const hashed = await hashPassword(newPassword);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Operation failed';
    if (message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth();

    await db.user.delete({ where: { id: user.id } });

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    if (message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
