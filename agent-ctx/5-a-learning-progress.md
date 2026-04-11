# Task 5-a: Learning Progress Tracking — Types, Hook, API

## Files Created

### 1. `src/types/learning.ts` (269 lines → **469 lines**)
Full type definitions and lesson data for all 4 learning modules:

- **Types**: `ModuleId`, `AgeGroup`, `Lesson`, `ModuleProgress`, `LessonProgress`, `LearningSummary`
- **Constants**: `MODULES` — 4 module definitions with icons, descriptions, and gradient tokens
- **Alphabet Lessons** (26): Letters A–Z with difficulty progression:
  - A–J (difficulty 1): toddler + early + kid
  - K–T (difficulty 2): early + kid
  - U–Z (difficulty 3): kid only
- **Numbers Lessons** (10): Counting 1–20, addition, subtraction, patterns, skip counting
- **Colors Lessons** (8): Primary/secondary colors, warm/cool, mixing, light/dark, patterns, art challenge
- **Science Lessons** (8): Body, animals, plants, weather, senses, habitats, life cycles, solar system
- **Helpers**: `getLessonsForModule()` (age-filtered), `getAllLessons()` (all lessons for a module)

### 2. `src/hooks/use-progress.ts` (9 lines → **324 lines**)
Client-side hook for managing learning progress state:

- **`useProgress({ profileId, moduleId? })`** — returns:
  - `lessons: Record<string, LessonProgress>` — per-lesson progress map
  - `modules: Record<ModuleId, ModuleProgress>` — computed per-module summaries
  - `summary: LearningSummary` — overall stats (stars, completed, streak)
  - `loading`, `error` states
  - `completeLesson(moduleId, lessonId, stars, score)` — optimistic POST with rollback
  - `refetch()` — re-fetches progress from API
- Fetches from `GET /api/progress?profileId=...` on mount
- Computes `ModuleProgress` and `LearningSummary` from raw lesson data via `useEffect`
- SSR-safe: no localStorage, proper mounted ref for async cleanup
- Optimistic updates with full rollback on error

### 3. `src/app/api/progress/route.ts` (9 lines → **200 lines**)
API route for persisting lesson progress:

- **GET `/api/progress?profileId={profileId}`**:
  - Auth-gated via `requireAuth()`
  - Verifies child profile belongs to authenticated parent
  - Returns all progress records with `completedAt` timestamps
- **POST `/api/progress`**:
  - Accepts `{ profileId, moduleId, lessonId, stars, score }`
  - Validates stars (0–3) and score (0–100) ranges
  - Preserves best score/stars (takes max of existing vs new)
  - Upserts using the `[childId, moduleId, lessonId]` unique constraint
  - Returns updated record

## Design Decisions
- `childId` in Prisma maps to `profileId` in API (consistent with parent-facing naming)
- Best-score preservation: if a child replays a lesson and scores lower, the higher score is kept
- All lessons are free (`isPremium: false`) — premium gating can be added later
- Exported as named exports (`useProgress`) to match existing hook patterns

## ESLint Result
✅ **Zero errors, zero warnings** across all 3 files (993 total lines)
