'use client'

import { useState, useMemo } from 'react'
import { useTripStore } from '@pulse/store'
import { useCompatibilityMatrix } from '@pulse/hooks'
import type { Activity, Member, Rating, CompatibilityScore } from '@pulse/types'

const ACT_PER_PAGE   = 10
const MEM_PER_PAGE   = 8
const ROSTER_CAP     = 9   // avatars shown per roster cell before +N

type Orientation = 'activities-rows' | 'members-rows' | 'roster'

const cellStyle: Record<Rating, string> = {
  MUST: 'bg-cell-must text-must-text',
  WANT: 'bg-cell-want text-want-text',
  MEH:  'bg-cell-meh text-meh-text',
}

// Stable per-member colors — same person = same color across all activity rows
const AVATAR_PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: '#ef4444', fg: '#fff' },
  { bg: '#f97316', fg: '#fff' },
  { bg: '#eab308', fg: '#000' },
  { bg: '#22c55e', fg: '#fff' },
  { bg: '#14b8a6', fg: '#fff' },
  { bg: '#3b82f6', fg: '#fff' },
  { bg: '#8b5cf6', fg: '#fff' },
  { bg: '#ec4899', fg: '#fff' },
  { bg: '#64748b', fg: '#fff' },
  { bg: '#a16207', fg: '#fff' },
]

// ── Shared sub-components ──────────────────────────────────────────────────

function Cell({ rating }: { rating?: Rating }) {
  const base = 'w-8 h-8 rounded-[var(--radius-cell)] flex items-center justify-center text-[10px] font-bold mx-auto select-none'
  if (!rating) return <div className={`${base} bg-cell-empty text-text-subtle`}>–</div>
  return <div className={`${base} ${cellStyle[rating]}`}>{rating[0]}</div>
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0
  return (
    <div className="flex items-center gap-2 min-w-[72px]">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-text-muted tabular-nums w-5 text-right">{score}</span>
    </div>
  )
}

function Paginator({ page, total, perPage, onChange }: {
  page: number; total: number; perPage: number; onChange: (p: number) => void
}) {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null
  return (
    <div className="flex items-center gap-0.5">
      <button
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
        aria-label="Previous page"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.5 2L3.5 6l4 4"/>
        </svg>
      </button>
      <span className="text-xs text-text-muted tabular-nums px-1">{page + 1}/{pages}</span>
      <button
        disabled={page >= pages - 1}
        onClick={() => onChange(page + 1)}
        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
        aria-label="Next page"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 2L8.5 6l-4 4"/>
        </svg>
      </button>
    </div>
  )
}

// ── Roster view: avatar with stable color + visible first name ─────────────

function MemberAvatar({
  member,
  colorIdx,
}: {
  member: Member
  colorIdx: number
}) {
  const color = AVATAR_PALETTE[colorIdx % AVATAR_PALETTE.length]
  const firstName = member.name.split(' ')[0]
  return (
    <div className="flex flex-col items-center gap-0.5 w-9">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold select-none shrink-0"
        style={{ backgroundColor: color.bg, color: color.fg }}
        title={member.name}
      >
        {member.name.charAt(0).toUpperCase()}
      </div>
      <span
        className="text-[9px] text-text-muted leading-none text-center w-full truncate"
        title={member.name}
      >
        {firstName}
      </span>
    </div>
  )
}

function AvatarGroup({
  members,
  colorMap,
}: {
  members: Member[]
  colorMap: Map<string, number>
}) {
  if (members.length === 0) {
    return <span className="text-[10px] text-text-subtle select-none">—</span>
  }
  const shown    = members.slice(0, ROSTER_CAP)
  const overflow = members.length - ROSTER_CAP
  return (
    <div className="flex flex-wrap gap-x-1 gap-y-2">
      {shown.map((m) => (
        <MemberAvatar key={m.id} member={m} colorIdx={colorMap.get(m.id) ?? 0} />
      ))}
      {overflow > 0 && (
        <div className="flex flex-col items-center gap-0.5 w-9">
          <div className="w-7 h-7 rounded-full bg-border flex items-center justify-center text-[10px] font-semibold text-text-muted select-none">
            +{overflow}
          </div>
          <span className="text-[9px] text-text-subtle leading-none">more</span>
        </div>
      )}
    </div>
  )
}

// ── Grid: activities as rows, members as columns ───────────────────────────

function ActivitiesRowsTable({ activities, scores, members, maxScore }: {
  activities: Activity[]
  scores: CompatibilityScore[]
  members: Member[]
  maxScore: number
}) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="sticky left-0 z-10 bg-bg-card text-left px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wide min-w-[160px] max-w-[200px]">
            Activity
          </th>
          {members.map((m) => (
            <th key={m.id} className="px-1.5 py-2.5 text-center w-12">
              <div
                className="w-8 h-8 mx-auto rounded-full bg-border flex items-center justify-center text-xs font-semibold text-text-subtle"
                title={m.name}
              >
                {m.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[9px] text-text-subtle mt-0.5 block truncate w-8 mx-auto">
                {m.name.split(' ')[0]}
              </span>
            </th>
          ))}
          <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wide min-w-[96px]">
            Score
          </th>
        </tr>
      </thead>
      <tbody>
        {activities.map((activity, i) => {
          const score = scores[i]
          return (
            <tr key={activity.id} className="border-b border-border last:border-0 hover:bg-bg/40 transition-colors">
              <td className="sticky left-0 z-10 bg-bg-card px-4 py-2.5 align-middle">
                <p className="text-xs font-medium text-text-primary truncate max-w-[148px]" title={activity.name}>
                  {activity.name}
                </p>
                {activity.location && (
                  <p className="text-[10px] text-text-muted truncate max-w-[148px]">{activity.location}</p>
                )}
              </td>
              {members.map((m) => (
                <td key={m.id} className="px-1.5 py-2 align-middle">
                  <Cell rating={score?.ratings[m.id]} />
                </td>
              ))}
              <td className="px-4 py-2.5 align-middle">
                <ScoreBar score={score?.score ?? 0} max={maxScore} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ── Grid: members as rows, activities as columns ───────────────────────────

function MembersRowsTable({ members, activities, scores, maxScore }: {
  members: Member[]
  activities: Activity[]
  scores: CompatibilityScore[]
  maxScore: number
}) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="sticky left-0 z-10 bg-bg-card text-left px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wide min-w-[120px]">
            Member
          </th>
          {activities.map((a) => (
            <th key={a.id} className="px-1.5 py-2.5 text-center w-16">
              <p className="text-[10px] font-medium text-text-muted truncate w-14 mx-auto" title={a.name}>
                {a.name}
              </p>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {members.map((m) => (
          <tr key={m.id} className="border-b border-border last:border-0 hover:bg-bg/40 transition-colors">
            <td className="sticky left-0 z-10 bg-bg-card px-4 py-2.5 align-middle">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs font-semibold text-text-subtle shrink-0">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-text-primary truncate max-w-[80px]">
                  {m.name.split(' ')[0]}
                </span>
              </div>
            </td>
            {scores.map((score, i) => (
              <td key={activities[i]?.id ?? i} className="px-1.5 py-2 align-middle">
                <Cell rating={score.ratings[m.id]} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot className="border-t-2 border-border">
        <tr>
          <td className="sticky left-0 z-10 bg-bg-card px-4 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wide align-middle">
            Score
          </td>
          {scores.map((score, i) => (
            <td key={activities[i]?.id ?? i} className="px-1.5 py-2.5 align-middle">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-[width]"
                    style={{ width: maxScore > 0 ? `${Math.round((score.score / maxScore) * 100)}%` : '0%' }}
                  />
                </div>
                <span className="text-[10px] text-text-muted tabular-nums">{score.score}</span>
              </div>
            </td>
          ))}
        </tr>
      </tfoot>
    </table>
  )
}

// ── Roster: activities as rows, rating columns, member avatars in cells ────

const ROSTER_RATINGS: Rating[] = ['MUST', 'WANT', 'MEH']

const rosterHeaderStyle: Record<Rating, string> = {
  MUST: 'bg-cell-must text-must-text',
  WANT: 'bg-cell-want text-want-text',
  MEH:  'bg-cell-meh text-meh-text',
}

function RosterTable({ activities, scores, members, maxScore, colorMap }: {
  activities: Activity[]
  scores: CompatibilityScore[]
  members: Member[]
  maxScore: number
  colorMap: Map<string, number>
}) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="sticky left-0 z-10 bg-bg-card text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wide min-w-[160px] max-w-[200px]">
            Activity
          </th>
          {ROSTER_RATINGS.map((r) => (
            <th key={r} className="px-4 py-3 text-left align-bottom min-w-[120px]">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-badge)] text-[10px] font-bold ${rosterHeaderStyle[r]}`}>
                {r}
              </span>
            </th>
          ))}
          <th className="px-4 py-3 text-left align-bottom text-[10px] font-semibold text-text-subtle uppercase tracking-wide min-w-[100px]">
            Unrated
          </th>
          <th className="px-4 py-3 text-left align-bottom text-[10px] font-semibold text-text-muted uppercase tracking-wide min-w-[96px]">
            Score
          </th>
        </tr>
      </thead>
      <tbody>
        {activities.map((activity, i) => {
          const score = scores[i]
          const byRating: Record<Rating, Member[]> = { MUST: [], WANT: [], MEH: [] }
          const unrated: Member[] = []

          for (const m of members) {
            const r = score?.ratings[m.id] as Rating | undefined
            if (r) byRating[r].push(m)
            else unrated.push(m)
          }

          return (
            <tr key={activity.id} className="border-b border-border last:border-0 hover:bg-bg/40 transition-colors">
              <td className="sticky left-0 z-10 bg-bg-card px-4 py-3 align-top">
                <p className="text-xs font-medium text-text-primary truncate max-w-[148px]" title={activity.name}>
                  {activity.name}
                </p>
                {activity.location && (
                  <p className="text-[10px] text-text-muted truncate max-w-[148px]">{activity.location}</p>
                )}
              </td>
              {ROSTER_RATINGS.map((r) => (
                <td key={r} className="px-4 py-3 align-top">
                  <AvatarGroup members={byRating[r]} colorMap={colorMap} />
                </td>
              ))}
              <td className="px-4 py-3 align-top opacity-50">
                <AvatarGroup members={unrated} colorMap={colorMap} />
              </td>
              <td className="px-4 py-3 align-middle">
                <ScoreBar score={score?.score ?? 0} max={maxScore} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ── Orientation toggle ─────────────────────────────────────────────────────

const ORIENTATIONS: Array<{ id: Orientation; label: string }> = [
  { id: 'activities-rows', label: 'By activity' },
  { id: 'members-rows',    label: 'By member'   },
  { id: 'roster',          label: "Who's in"    },
]

// ── Main component ─────────────────────────────────────────────────────────

export function CompatibilityMatrix() {
  const activities = useTripStore((s) => s.activities)
  const members    = useTripStore((s) => s.members)
  const { matrix } = useCompatibilityMatrix()

  const [orientation, setOrientation] = useState<Orientation>('activities-rows')
  const [actPage, setActPage] = useState(0)
  const [memPage, setMemPage] = useState(0)

  // Activities in score-sorted order (from matrix)
  const orderedActivities = useMemo(
    () => matrix
      .map((s) => activities.find((a) => a.id === s.activity_id))
      .filter((a): a is Activity => !!a),
    [matrix, activities]
  )

  // Stable color index per member (index in the full members array)
  const colorMap = useMemo(
    () => new Map(members.map((m, idx) => [m.id, idx])),
    [members]
  )

  const maxScore   = matrix[0]?.score ?? 0
  const isActRows  = orientation === 'activities-rows'
  const isMemRows  = orientation === 'members-rows'
  const isRoster   = orientation === 'roster'

  // Paginated slices
  const actStart   = actPage * ACT_PER_PAGE
  const actSlice   = orderedActivities.slice(actStart, actStart + ACT_PER_PAGE)
  const scoreSlice = matrix.slice(actStart, actStart + ACT_PER_PAGE)
  const memStart   = memPage * MEM_PER_PAGE
  const memSlice   = members.slice(memStart, memStart + MEM_PER_PAGE)

  // Horizontal axis config (columns that can be paginated)
  const hLabel   = isActRows ? 'Members' : 'Activities'
  const hTotal   = isActRows ? members.length : orderedActivities.length
  const hPerPage = isActRows ? MEM_PER_PAGE : ACT_PER_PAGE
  const hPage    = isActRows ? memPage : actPage
  const setHPage = isActRows ? setMemPage : setActPage

  // Vertical axis config (rows that can be paginated)
  const vLabel   = isMemRows ? 'Members' : 'Activities'
  const vTotal   = isMemRows ? members.length : orderedActivities.length
  const vPerPage = isMemRows ? MEM_PER_PAGE : ACT_PER_PAGE
  const vPage    = isMemRows ? memPage : actPage
  const setVPage = isMemRows ? setMemPage : setActPage

  if (activities.length === 0 || members.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-text-muted">Add activities and members to see the matrix.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Controls: orientation selector + horizontal paginator */}
      <div className="flex items-center justify-between gap-3 flex-wrap">

        {/* 3-way orientation toggle */}
        <div className="inline-flex items-center border border-border rounded-[var(--radius-btn)] overflow-hidden">
          {ORIENTATIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setOrientation(id)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-l first:border-l-0 border-border ${
                orientation === id
                  ? 'bg-accent text-white'
                  : 'bg-bg-card text-text-muted hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Horizontal paginator (not used by roster — fixed columns) */}
        {!isRoster && hTotal > hPerPage && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="opacity-60">{hLabel}</span>
            <Paginator page={hPage} total={hTotal} perPage={hPerPage} onChange={setHPage} />
          </div>
        )}
      </div>

      {/* Matrix table */}
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-bg-card">
        {isActRows && (
          <ActivitiesRowsTable
            activities={actSlice}
            scores={scoreSlice}
            members={memSlice}
            maxScore={maxScore}
          />
        )}
        {isMemRows && (
          <MembersRowsTable
            members={memSlice}
            activities={actSlice}
            scores={scoreSlice}
            maxScore={maxScore}
          />
        )}
        {isRoster && (
          <RosterTable
            activities={actSlice}
            scores={scoreSlice}
            members={members}
            maxScore={maxScore}
            colorMap={colorMap}
          />
        )}
      </div>

      {/* Bottom: vertical paginator + legend */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {vTotal > vPerPage ? (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="opacity-60">{vLabel}</span>
            <Paginator page={vPage} total={vTotal} perPage={vPerPage} onChange={setVPage} />
          </div>
        ) : <div />}

        {/* Legend — rating cells only, not shown for roster (avatars are self-explanatory) */}
        {!isRoster && (
          <div className="flex items-center gap-3">
            {(['MUST', 'WANT', 'MEH'] as Rating[]).map((r) => (
              <div key={r} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${cellStyle[r]}`} />
                <span className="text-[10px] text-text-muted">{r}</span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-cell-empty" />
              <span className="text-[10px] text-text-muted">No rating</span>
            </div>
          </div>
        )}

        {/* Roster legend: member color swatches */}
        {isRoster && members.length <= 10 && (
          <div className="flex items-center gap-2 flex-wrap">
            {members.map((m, idx) => {
              const color = AVATAR_PALETTE[idx % AVATAR_PALETTE.length]
              return (
                <div key={m.id} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.bg }} />
                  <span className="text-[10px] text-text-muted">{m.name.split(' ')[0]}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
