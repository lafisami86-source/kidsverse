'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Clock, Trophy, Gamepad2, BookOpen,
  Users, Crown, AlertCircle, Check, X,
} from 'lucide-react';
import { AVATAR_OPTIONS } from '@/lib/constants';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProfileData {
  id: string;
  name: string;
  age: number;
  avatar: string;
  ageGroup: string;
  screenTimeLimit: number;
  contentFilter: string;
  parentId: string;
  badgesCount?: number;
  totalProgress?: number;
  gamesPlayed?: number;
  drawingsCount?: number;
  _count?: { badges: number; gameScores: number };
}

interface ApiProfilesResponse {
  profiles: ProfileData[];
}

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'kidsverse_profiles';

function loadLocalProfiles(): ProfileData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProfileData[];
  } catch {
    return [];
  }
}

function saveLocalProfiles(profiles: ProfileData[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

function addLocalProfile(data: { name: string; age: number; avatar: string; screenTimeLimit: number }): ProfileData {
  const profiles = loadLocalProfiles();
  const ageGroup = data.age <= 3 ? 'toddler' : data.age <= 6 ? 'early' : 'kid';
  const newProfile: ProfileData = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name: data.name,
    age: data.age,
    avatar: data.avatar,
    ageGroup,
    screenTimeLimit: data.screenTimeLimit,
    contentFilter: 'all',
    parentId: 'local',
  };
  profiles.push(newProfile);
  saveLocalProfiles(profiles);
  return newProfile;
}

function updateLocalProfile(id: string, data: { name: string; age: number; avatar: string; screenTimeLimit: number }): ProfileData | null {
  const profiles = loadLocalProfiles();
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const ageGroup = data.age <= 3 ? 'toddler' : data.age <= 6 ? 'early' : 'kid';
  profiles[idx] = {
    ...profiles[idx],
    name: data.name,
    age: data.age,
    avatar: data.avatar,
    ageGroup,
    screenTimeLimit: data.screenTimeLimit,
  };
  saveLocalProfiles(profiles);
  return profiles[idx];
}

function deleteLocalProfile(id: string) {
  const profiles = loadLocalProfiles();
  const filtered = profiles.filter((p) => p.id !== id);
  saveLocalProfiles(filtered);
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const AGE_GROUP_LABELS: Record<string, string> = {
  toddler: 'Toddler (2-3)',
  early: 'Early (4-6)',
  kid: 'Kid (7-10)',
};

const AGE_GROUP_COLORS: Record<string, 'mint' | 'sun' | 'sky'> = {
  toddler: 'mint',
  early: 'sun',
  kid: 'sky',
};

const AGE_OPTIONS = Array.from({ length: 9 }, (_, i) => i + 2);

const FREE_LIMIT = 3;
const PREMIUM_LIMIT = 10;

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' },
  }),
  exit: { opacity: 0, scale: 0.9, y: 12, transition: { duration: 0.25 } },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatScreenTime(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

function getProfileBadgeCount(p: ProfileData): number {
  return p.badgesCount ?? p._count?.badges ?? 0;
}

function getProfileGamesPlayed(p: ProfileData): number {
  return p.gamesPlayed ?? p._count?.gameScores ?? 0;
}

/* ------------------------------------------------------------------ */
/*  Profile Form (shared between Create & Edit)                        */
/* ------------------------------------------------------------------ */

function ProfileForm({
  initialName,
  initialAge,
  initialAvatar,
  initialScreenTime,
  onSubmit,
  onCancel,
  submitLabel,
  loading,
}: {
  initialName: string;
  initialAge: number | null;
  initialAvatar: string;
  initialScreenTime: number;
  onSubmit: (data: { name: string; age: number; avatar: string; screenTimeLimit: number }) => void;
  onCancel: () => void;
  submitLabel: string;
  loading: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState<number | null>(initialAge);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [screenTime, setScreenTime] = useState(initialScreenTime);
  const [errors, setErrors] = useState<{ name?: string; age?: string }>({});

  function validate(): boolean {
    const next: { name?: string; age?: string } = {};
    if (!name.trim() || name.trim().length < 2) {
      next.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 30) {
      next.name = 'Name must be 30 characters or less';
    }
    if (age === null || age < 2 || age > 10) {
      next.age = 'Please select an age';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSubmit({ name: name.trim(), age: age!, avatar, screenTimeLimit: screenTime });
  }

  return (
    <div className="space-y-5">
      {/* Name input */}
      <div>
        <label className="block text-sm font-nunito font-bold text-kids-dark mb-1.5">
          Child&apos;s Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
          placeholder="Enter name"
          maxLength={30}
          className="w-full px-4 py-2.5 rounded-2xl border-2 border-kids-lightgray font-nunito text-kids-dark placeholder:text-kids-text-muted focus:outline-none focus:border-kids-sky transition-colors"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-kids-coral font-nunito flex items-center gap-1">
            <AlertCircle className="size-3" /> {errors.name}
          </p>
        )}
      </div>

      {/* Age selector */}
      <div>
        <label className="block text-sm font-nunito font-bold text-kids-dark mb-1.5">
          Age
        </label>
        <div className="flex flex-wrap gap-2">
          {AGE_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => { setAge(n); if (errors.age) setErrors((p) => ({ ...p, age: undefined })); }}
              className={`w-10 h-10 rounded-2xl font-nunito font-bold text-sm transition-all ${
                age === n
                  ? 'bg-kids-sky text-white shadow-kids scale-110'
                  : 'bg-kids-lightgray text-kids-dark hover:bg-kids-sky/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {errors.age && (
          <p className="mt-1 text-xs text-kids-coral font-nunito flex items-center gap-1">
            <AlertCircle className="size-3" /> {errors.age}
          </p>
        )}
      </div>

      {/* Avatar picker */}
      <div>
        <label className="block text-sm font-nunito font-bold text-kids-dark mb-1.5">
          Avatar
        </label>
        <div className="grid grid-cols-8 gap-2">
          {AVATAR_OPTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center transition-all ${
                avatar === a
                  ? 'bg-kids-sun/30 ring-2 ring-kids-sun scale-110'
                  : 'bg-kids-lightgray hover:bg-kids-sun/15'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Screen time slider */}
      <div>
        <label className="block text-sm font-nunito font-bold text-kids-dark mb-1.5">
          Daily Screen Time Limit
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={15}
            max={180}
            step={5}
            value={screenTime}
            onChange={(e) => setScreenTime(Number(e.target.value))}
            className="flex-1 accent-kids-sky h-2"
          />
          <span className="text-sm font-nunito font-bold text-kids-sky min-w-[3.5rem] text-right">
            {formatScreenTime(screenTime)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-kids-text-muted font-nunito mt-0.5">
          <span>15 min</span>
          <span>3 hrs</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-kids-sky text-white rounded-2xl font-nunito font-bold text-sm shadow-kids hover:bg-kids-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={loading ? {} : { scale: 1.03 }}
          whileTap={loading ? {} : { scale: 0.97 }}
        >
          {loading ? (
            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          {submitLabel}
        </motion.button>
        <motion.button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 bg-kids-lightgray text-kids-text-secondary rounded-2xl font-nunito font-bold text-sm hover:bg-kids-lightgray/70 transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <X className="size-4" />
          Cancel
        </motion.button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Fetch profiles (API + localStorage merge) ---------- */
  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Always load localStorage profiles first
      const localProfiles = loadLocalProfiles();

      // Try API
      let apiProfiles: ProfileData[] = [];
      try {
        const res = await fetch('/api/child-profiles');
        if (res.ok) {
          const data: ApiProfilesResponse = await res.json();
          apiProfiles = data.profiles || [];
        }
      } catch {
        // API failed — use localStorage only
      }

      // Merge: API profiles take precedence, add local ones that aren't in API
      const apiIds = new Set(apiProfiles.map((p) => p.id));
      const uniqueLocal = localProfiles.filter((p) => !apiIds.has(p.id));

      // Save API profiles to localStorage too (keeps them in sync)
      if (apiProfiles.length > 0) {
        const merged = [...apiProfiles, ...uniqueLocal];
        saveLocalProfiles(merged);
        setProfiles(merged);
      } else {
        setProfiles(localProfiles);
      }
    } catch {
      // Final fallback: load from localStorage
      setProfiles(loadLocalProfiles());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  /* ---------- Create ---------- */
  async function handleCreate(data: { name: string; age: number; avatar: string; screenTimeLimit: number }) {
    setCreating(true);
    setError(null);
    try {
      // Always save to localStorage first (guaranteed to work)
      const localProfile = addLocalProfile(data);

      // Also try API (best effort)
      try {
        const res = await fetch('/api/child-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.profile) {
            // API succeeded — replace local profile with server one
            deleteLocalProfile(localProfile.id);
            const all = loadLocalProfiles();
            all.unshift(result.profile);
            saveLocalProfiles(all);
            setProfiles(all);
            setShowAddForm(false);
            setCreating(false);
            return;
          }
        }
      } catch {
        // API failed — localStorage save already happened
      }

      // Use localStorage result
      setProfiles(loadLocalProfiles());
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setCreating(false);
    }
  }

  /* ---------- Update ---------- */
  async function handleUpdate(id: string, data: { name: string; age: number; avatar: string; screenTimeLimit: number }) {
    setSaving(true);
    setError(null);
    try {
      // Always update localStorage first
      const updated = updateLocalProfile(id, data);

      // Also try API
      try {
        const res = await fetch(`/api/child-profiles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.profile) {
            // Update localStorage with server result
            const all = loadLocalProfiles();
            const idx = all.findIndex((p) => p.id === id);
            if (idx !== -1) all[idx] = result.profile;
            saveLocalProfiles(all);
            setProfiles(all);
            setEditingId(null);
            setSaving(false);
            return;
          }
        }
      } catch {
        // API failed — localStorage update already done
      }

      // Use localStorage result
      if (updated) {
        setProfiles(loadLocalProfiles());
      }
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Delete ---------- */
  async function handleDelete(id: string) {
    setDeleting(true);
    setError(null);
    try {
      // Always delete from localStorage
      deleteLocalProfile(id);

      // Also try API
      try {
        await fetch(`/api/child-profiles/${id}`, { method: 'DELETE' });
      } catch {
        // API failed — localStorage delete already done
      }

      setProfiles(loadLocalProfiles());
      setDeletingId(null);
    } catch {
      setError('Failed to delete profile. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  /* ---------- Derived state ---------- */
  const atLimit = profiles.length >= FREE_LIMIT;
  const isEditing = editingId !== null;

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-10 w-64 rounded-2xl bg-kids-lightgray animate-pulse" />
        <div className="h-40 rounded-2xl bg-kids-lightgray animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-kids-lightgray animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ---- Page Header ---- */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-nunito font-black text-kids-dark">
            Child Profiles
          </h1>
          <KidsBadge variant="default" size="sm">
            <Users className="size-3" />
            {profiles.length}
          </KidsBadge>
        </div>
        <motion.button
          onClick={() => { if (!isEditing) { setShowAddForm((v) => !v); setError(null); } }}
          disabled={isEditing}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-nunito font-bold text-sm transition-colors ${
            showAddForm
              ? 'bg-kids-lightgray text-kids-text-secondary'
              : 'bg-kids-sky text-white shadow-kids hover:bg-kids-blue'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus className={`size-4 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
          {showAddForm ? 'Close' : 'Add New Profile'}
        </motion.button>
      </motion.div>

      {/* ---- Profile Limit Warning ---- */}
      {atLimit && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-3 px-4 py-3 bg-kids-sun/15 border-2 border-kids-sun/40 rounded-2xl"
        >
          <Crown className="size-5 text-kids-sun shrink-0" />
          <p className="text-sm font-nunito font-bold text-kids-dark flex-1">
            You&apos;ve reached the free profile limit ({FREE_LIMIT}).
          </p>
          <a
            href="/parent/subscription"
            className="text-sm font-nunito font-bold text-kids-sky hover:underline whitespace-nowrap"
          >
            Upgrade
          </a>
        </motion.div>
      )}

      {/* ---- Error Banner ---- */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-4 py-3 bg-kids-coral/10 border-2 border-kids-coral/30 rounded-2xl"
          >
            <AlertCircle className="size-5 text-kids-coral shrink-0" />
            <p className="text-sm font-nunito text-kids-coral flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-kids-coral hover:text-kids-dark transition-colors"
              aria-label="Dismiss error"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Add Profile Form ---- */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <KidsCard variant="default" padding="lg" color="sky" className="border-2 border-kids-sky/30">
              <h2 className="text-lg font-nunito font-black text-kids-dark mb-5 flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">✨</span>
                Create New Profile
              </h2>
              <ProfileForm
                initialName=""
                initialAge={null}
                initialAvatar={AVATAR_OPTIONS[0]}
                initialScreenTime={60}
                onSubmit={handleCreate}
                onCancel={() => setShowAddForm(false)}
                submitLabel="Create Profile"
                loading={creating}
              />
            </KidsCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Profiles Grid ---- */}
      {profiles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
        >
          <KidsCard variant="default" padding="xl" color="white" className="text-center py-16">
            <div className="text-6xl mb-4" aria-hidden="true">🌟</div>
            <h2 className="text-xl font-nunito font-bold text-kids-dark mb-2">
              No Profiles Yet
            </h2>
            <p className="text-kids-text-secondary font-nunito mb-6 max-w-sm mx-auto">
              Create your first child profile to unlock fun learning adventures, games, and activities!
            </p>
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-kids-sky text-white rounded-2xl font-nunito font-bold shadow-kids hover:bg-kids-blue transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="size-5" />
              Create First Profile
            </motion.button>
          </KidsCard>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {profiles.map((profile, i) => (
              <motion.div
                key={profile.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                {editingId === profile.id ? (
                  /* ---- Edit Mode ---- */
                  <KidsCard variant="featured" padding="lg" color="white" className="border-2 border-kids-sun/50">
                    <h3 className="text-base font-nunito font-black text-kids-dark mb-4 flex items-center gap-2">
                      <Pencil className="size-4 text-kids-sun" />
                      Edit {profile.name}
                    </h3>
                    <ProfileForm
                      initialName={profile.name}
                      initialAge={profile.age}
                      initialAvatar={profile.avatar}
                      initialScreenTime={profile.screenTimeLimit}
                      onSubmit={(data) => handleUpdate(profile.id, data)}
                      onCancel={() => setEditingId(null)}
                      submitLabel="Save Changes"
                      loading={saving}
                    />
                  </KidsCard>
                ) : (
                  /* ---- Display Mode ---- */
                  <KidsCard variant="interactive" padding="lg" color="white">
                    {/* Avatar + Name */}
                    <div className="flex items-start gap-4">
                      <div
                        className="text-5xl leading-none"
                        role="img"
                        aria-label={`Avatar for ${profile.name}`}
                      >
                        {profile.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-nunito font-black text-kids-dark truncate">
                          {profile.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <KidsBadge
                            variant={AGE_GROUP_COLORS[profile.ageGroup] || 'muted'}
                            size="sm"
                          >
                            {AGE_GROUP_LABELS[profile.ageGroup] || profile.ageGroup}
                          </KidsBadge>
                          <span className="text-xs text-kids-text-muted font-nunito">
                            Age {profile.age}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Screen time */}
                    <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-kids-lightgray rounded-2xl">
                      <Clock className="size-4 text-kids-sky" />
                      <span className="text-sm font-nunito font-bold text-kids-dark">
                        {formatScreenTime(profile.screenTimeLimit)} / day
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-4 text-sm text-kids-text-secondary font-nunito">
                      <span className="flex items-center gap-1">
                        <Trophy className="size-4 text-kids-sun" />
                        {getProfileBadgeCount(profile)}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="size-4 text-kids-lavender" />
                        {profile.totalProgress || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gamepad2 className="size-4 text-kids-grass" />
                        {getProfileGamesPlayed(profile)}
                      </span>
                    </div>

                    {/* Delete confirmation */}
                    {deletingId === profile.id ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 flex items-center gap-2 p-3 bg-kids-coral/10 rounded-2xl"
                      >
                        <p className="text-sm font-nunito font-bold text-kids-coral flex-1">
                          Delete {profile.name}?
                        </p>
                        <motion.button
                          onClick={() => handleDelete(profile.id)}
                          disabled={deleting}
                          className="flex items-center gap-1 px-3 py-1.5 bg-kids-coral text-white rounded-2xl text-xs font-nunito font-bold disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {deleting ? (
                            <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Check className="size-3" />
                          )}
                          Yes
                        </motion.button>
                        <motion.button
                          onClick={() => setDeletingId(null)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-kids-lightgray text-kids-text-secondary rounded-2xl text-xs font-nunito font-bold"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X className="size-3" />
                          No
                        </motion.button>
                      </motion.div>
                    ) : (
                      /* Action buttons */
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-kids-lightgray/60">
                        <motion.button
                          onClick={() => setEditingId(profile.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-nunito font-bold text-kids-sky bg-kids-sky/10 hover:bg-kids-sky/20 transition-colors flex-1 justify-center"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          aria-label={`Edit ${profile.name}`}
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => setDeletingId(profile.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-nunito font-bold text-kids-coral bg-kids-coral/10 hover:bg-kids-coral/20 transition-colors flex-1 justify-center"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          aria-label={`Delete ${profile.name}`}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </motion.button>
                      </div>
                    )}
                  </KidsCard>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
