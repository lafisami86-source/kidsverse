'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChildProfile } from '../layout';

/**
 * Bridge page: saves the active child profile to localStorage,
 * then redirects to the standalone /watch page.
 */
export default function WatchBridge() {
  const router = useRouter();
  const { profile } = useChildProfile();

  useEffect(() => {
    if (profile) {
      try {
        localStorage.setItem('kv-active-profile', JSON.stringify({
          id: profile.id,
          name: profile.name,
          age: profile.age,
          avatar: profile.avatar,
          ageGroup: profile.ageGroup,
          screenTimeLimit: profile.screenTimeLimit,
        }));
      } catch {
        // localStorage not available
      }
      router.replace('/watch');
    } else {
      router.replace('/kids');
    }
  }, [profile, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-kids-offwhite">
      <div className="text-6xl animate-bounce">🎬</div>
    </div>
  );
}
