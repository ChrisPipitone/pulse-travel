# Rating & Compatibility Matrix

---

## Rating System

Three values, each with a deliberate meaning:

| Rating | Weight | Meaning |
|---|---|---|
| `MUST` | 3 | Non-negotiable — I will be disappointed if we skip this |
| `MAYBE` | 1 | Flexible — I'll join if timing works, no loss if not |
| `SKIP` | 0 | Not interested — excluded from crew calculations |

SKIP contributes zero to the score intentionally. Three people MUSTing beats ten people in MAYBE (3×3=9 vs 10×1=10, barely — but one more MUST tips it decisively).

MAYBE is not weak enthusiasm — it's a deliberate "available but not driving" signal. Excluded from Jaccard compatibility calculations (Travel Twin), but still contributes to group score.

---

## Scoring

```mermaid
flowchart LR
    R["activity_ratings rows\nfor one activity"]
    R --> M["must_count × 3"]
    R --> W["maybe_count × 1"]
    R --> E["skip_count × 0"]
    M & W & E --> S["score\n= must_count×3 + maybe_count"]
    S --> Sort["activities sorted by score DESC\nin useCompatibilityMatrix"]
```

**Formula:** `score = (MUST count × 3) + (MAYBE count × 1)`

Example — 8-member trip, activity "Colosseum Tour":

| Member | Rating |
|---|---|
| Marco | MUST |
| Sara | MUST |
| Lena | MAYBE |
| Chris | MAYBE |
| Alex | MAYBE |
| Priya | MUST |
| Kai | SKIP |
| Yuki | — |

`score = 3×3 + 3×1 = 12`. Sorted above any activity with score < 12.

---

## Data Flow

```mermaid
flowchart TD
    subgraph db["Postgres"]
        AR["activity_ratings\n(activity_id, user_id, rating)"]
    end

    subgraph service["@pulse/services"]
        GR["getRatings(activityIds)\nSELECT * WHERE activity_id IN (...)"]
        UR["upsertRating(rating)\nUPSERT on conflict activity_id,user_id"]
    end

    subgraph store["@pulse/store — Zustand"]
        ST["ratings: ActivityRating[]\nupsertRating(rating)\nsetRatings(ratings)"]
    end

    subgraph hooks["@pulse/hooks"]
        CM["useCompatibilityMatrix()\nuseMemo → CompatibilityScore[]"]
        RA["useRateActivity()\noptimistic update + rollback"]
    end

    subgraph ui["Trip page / Find Your Crew"]
        UI["render cards by score"]
    end

    AR -->|initial fetch| GR
    GR --> ST
    RA -->|optimistic| ST
    RA -->|persist| UR
    UR --> AR
    AR -->|Realtime postgres_changes| ST
    ST --> CM
    CM --> UI
```

---

## Optimistic Rating Update

User taps MUST/MAYBE/SKIP → UI responds immediately, network follows:

```mermaid
sequenceDiagram
    participant U as User
    participant Hook as useRateActivity
    participant Store as Zustand store
    participant DB as Postgres

    U->>Hook: rateActivity(activityId, 'MUST')
    Hook->>Hook: snapshot = current ratings
    Hook->>Store: upsertRating({...placeholder id, rating: 'MUST'})
    Note over Store: UI re-renders instantly
    Hook->>DB: UPSERT activity_ratings (onConflict: activity_id,user_id)
    alt success
        DB-->>Hook: ok
        Note over Store: Realtime event corrects placeholder id
    else failure
        DB-->>Hook: error
        Hook->>Store: setRatings(snapshot)
        Note over Store: UI rolls back to previous state
    end
```

The placeholder `id` (`crypto.randomUUID()`) is overwritten when the real-time channel re-fetches ratings after the DB write — no stale id persists.

---

## CompatibilityScore Type

```ts
interface CompatibilityScore {
  activity_id: string
  score: number          // must×3 + maybe×1
  must_count: number
  maybe_count: number
  skip_count: number
  ratings: Record<string, Rating>  // keyed by user_id — O(1) lookup in matrix UI
}
```

`useCompatibilityMatrix` returns `CompatibilityScore[]` sorted by `score` descending. The `ratings` map lets the Find Your Crew UI look up any member's rating for any activity in O(1) — no `.find()` per cell.

---

## Find Your Crew View

The primary view for sub-group formation. Each activity card shows:
- MUST members — the core crew (always in)
- MAYBE members — flexible capacity (joins if timing works)
- Unrated members — no signal yet

Cards sorted by `score` descending. At large group sizes (>8), cards truncate to top avatars + count pills.

```
                Marco   Sara    Lena    Chris   Alex
Colosseum       MUST    MUST    MAYBE   MAYBE   MAYBE    score: 12
Wine Tasting    MUST    MAYBE   MUST    SKIP    MAYBE    score: 10
Vatican         MAYBE   MUST    SKIP    MAYBE   MUST     score: 10
Amalfi Day      SKIP    MAYBE   MAYBE   —       MAYBE    score:  3
```

Cell colours:

| Rating | Background | Text |
|---|---|---|
| MUST | `--must-bg` (coral) | `--must-text` |
| MAYBE | `--maybe-bg` (yellow) | `--maybe-text` |
| SKIP | `--skip-bg` (gray) | `--skip-text` |
| — (unrated) | `--cell-empty` | — |

---

## Real-time Sync

`useTripData` subscribes to two Postgres change channels on mount:

```
channel: trip-<tripId>
  ├── activities table, filter: trip_id=eq.<tripId>
  │   → on any change: refetch activities → setActivities
  └── activity_ratings table (no trip_id column — unfiltered)
      → on any change: refetch activities, then ratings for those activity IDs
```

`activity_ratings` has no `trip_id` column, so it can't be filtered server-side by trip. The channel fires on any rating change in the session. The re-fetch is scoped by activity IDs which already belong to the trip — RLS further ensures only permitted rows are returned.

Channel cleanup on unmount: `client.removeChannel(channel)` — prevents duplicate events on re-mount.
