'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTripStore } from '@pulse/store'
import { useCompatibilityMatrix } from '@pulse/hooks'
import type { Activity, Member, Rating, CompatibilityScore } from '@pulse/types'

const ACT_PER_PAGE = 10
const MEM_PER_PAGE = 8
const ROSTER_CAP   = 9

type Orientation = 'activities-rows' | 'members-rows' | 'roster' | 'crew' | 'twin'

interface ViewMeta { id: Orientation; label: string; shortLabel: string; description: string }
const VIEWS: ViewMeta[] = [
  {
    id: 'crew',
    label: 'Rundown',
    shortLabel: 'Rundown',
    description: 'Every activity at a glance — who\'s a MUST, who\'s a WANT, who\'s a MEH. Ranked by excitement.',
  },
  {
    id: 'twin',
    label: 'Travel twin',
    shortLabel: 'Twin',
    description: 'Pairwise compatibility based on shared MUST + WANT overlap. Higher % = more similar vacation style. MEH is ignored — it means "I\'ll go either way."',
  },
  {
    id: 'activities-rows',
    label: 'By activity',
    shortLabel: 'Activity',
    description: "Each activity's ratings across the whole group, sorted by group enthusiasm score.",
  },
  {
    id: 'members-rows',
    label: 'By member',
    shortLabel: 'Member',
    description: "Each member's full rating list side by side — spot who has strong opinions and where they align.",
  },
  {
    id: 'roster',
    label: "Who's in",
    shortLabel: "Who's in",
    description: "For every activity: exactly who's excited, who's neutral, and who hasn't responded yet.",
  },
]

// ── Styles ────────────────────────────────────────────────────────────────

const cellStyle: Record<Rating, string> = {
  MUST: 'bg-cell-must text-must-text',
  WANT: 'bg-cell-want text-want-text',
  MEH:  'bg-cell-meh text-meh-text',
}

// Stable per-member colors — same person = same color in every view
const PALETTE: Array<{ bg: string; fg: string }> = [
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

function paletteFor(idx: number) { return PALETTE[idx % PALETTE.length] }

// ── Shared primitives ─────────────────────────────────────────────────────

function Cell({ rating, ariaLabel }: { rating?: Rating; ariaLabel?: string }) {
  const base = 'w-8 h-8 rounded-[var(--radius-cell)] flex items-center justify-center text-[10px] font-bold mx-auto select-none'
  if (!rating) return <div className={`${base} bg-cell-empty text-text-subtle`} aria-label={ariaLabel ? `${ariaLabel}: unrated` : undefined}>–</div>
  return <div className={`${base} ${cellStyle[rating]}`} aria-label={ariaLabel ? `${ariaLabel}: ${rating}` : undefined}>{rating[0]}</div>
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const pct = max > 0 ? Math.round((score / max) * 100) : 0
  return (
    <div className="flex items-center gap-2 min-w-[56px]">
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-[width] duration-500 ease-out"
          style={{ width: mounted ? `${pct}%` : '0%' }}
        />
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

// Compact avatar circle + first-name label — consistent color per member
function MemberAvatar({ member, colorIdx }: { member: Member; colorIdx: number }) {
  const c = paletteFor(colorIdx)
  return (
    <div className="flex flex-col items-center gap-0.5 w-9">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold select-none shrink-0"
        style={{ backgroundColor: c.bg, color: c.fg }}
        title={member.name}
      >
        {member.name.charAt(0).toUpperCase()}
      </div>
      <span className="text-[9px] text-text-muted leading-none text-center w-full truncate" title={member.name}>
        {member.name.split(' ')[0]}
      </span>
    </div>
  )
}

function AvatarGroup({ members, colorMap, cap = ROSTER_CAP }: {
  members: Member[]
  colorMap: Map<string, number>
  cap?: number
}) {
  if (members.length === 0) return <span className="text-[10px] text-text-subtle select-none">—</span>
  const shown    = members.slice(0, cap)
  const overflow = members.length - cap
  return (
    <div className="flex flex-wrap gap-x-1 gap-y-2">
      {shown.map(m => (
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

// ── View 1: By activity — activities × members, colored rating cells ───────

function ActivitiesRowsTable({ activities, scores, members, maxScore }: {
  activities: Activity[]
  scores: CompatibilityScore[]
  members: Member[]
  maxScore: number
}) {
  return (
    <>
      {/* Mobile: one card per activity, members as rows */}
      <div className="sm:hidden flex flex-col divide-y divide-border">
        {activities.map((activity, i) => {
          const score = scores[i]
          return (
            <div key={activity.id} className="px-3 py-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-text-primary">{activity.name}</p>
                  {activity.location && <p className="text-[10px] text-text-muted">{activity.location}</p>}
                </div>
                <ScoreBar score={score?.score ?? 0} max={maxScore} />
              </div>
              <div className="flex flex-col gap-1">
                {members.map(m => {
                  const r = score?.ratings[m.id] as Rating | undefined
                  return (
                    <div key={m.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-border flex items-center justify-center text-[10px] font-semibold text-text-subtle shrink-0">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] text-text-muted">{m.name.split(' ')[0]}</span>
                      </div>
                      <div className="w-8 h-8 rounded-[var(--radius-cell)] flex items-center justify-center text-[10px] font-bold shrink-0 select-none">
                        {r ? <div className={`w-full h-full rounded-[var(--radius-cell)] flex items-center justify-center ${cellStyle[r]}`}>{r[0]}</div>
                            : <div className="w-full h-full rounded-[var(--radius-cell)] flex items-center justify-center bg-cell-empty text-text-subtle">–</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      {/* Desktop: full table */}
      <table className="hidden sm:table border-collapse text-sm w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="sticky left-0 z-10 bg-bg-card text-left px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wide min-w-[120px]">
              Activity
            </th>
            {members.map(m => (
              <th key={m.id} className="px-1 py-2.5 text-center min-w-[36px]">
                <div className="w-7 h-7 mx-auto rounded-full bg-border flex items-center justify-center text-xs font-semibold text-text-subtle" title={m.name}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[9px] text-text-subtle mt-0.5 block truncate w-7 mx-auto">
                  {m.name.split(' ')[0]}
                </span>
              </th>
            ))}
            <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wide min-w-[80px]">Score</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, i) => {
            const score = scores[i]
            return (
              <tr key={activity.id} className="border-b border-border last:border-0 hover:bg-bg/40 transition-colors">
                <td className="sticky left-0 z-10 bg-bg-card px-3 py-2.5 align-middle">
                  <p className="text-xs font-medium text-text-primary truncate max-w-[116px]" title={activity.name}>{activity.name}</p>
                  {activity.location && <p className="text-[10px] text-text-muted truncate max-w-[116px]">{activity.location}</p>}
                </td>
                {members.map(m => (
                  <td key={m.id} className="px-1 py-2 align-middle">
                    <Cell rating={score?.ratings[m.id]} ariaLabel={m.name.split(' ')[0]} />
                  </td>
                ))}
                <td className="px-3 py-2.5 align-middle">
                  <ScoreBar score={score?.score ?? 0} max={maxScore} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

// ── View 2: By member — members × activities, colored rating cells ─────────

function MembersRowsTable({ members, activities, scores, maxScore }: {
  members: Member[]
  activities: Activity[]
  scores: CompatibilityScore[]
  maxScore: number
}) {
  return (
    <>
      {/* Mobile: one card per member, activities as rows */}
      <div className="sm:hidden flex flex-col divide-y divide-border">
        {members.map(m => (
          <div key={m.id} className="px-3 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs font-semibold text-text-subtle shrink-0">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-text-primary">{m.name.split(' ')[0]}</span>
            </div>
            <div className="flex flex-col gap-1">
              {scores.map((score, i) => {
                const a = activities[i]
                if (!a) return null
                const r = score.ratings[m.id] as Rating | undefined
                return (
                  <div key={a.id} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-text-muted truncate">{a.name}</span>
                    <div className="w-8 h-8 shrink-0 rounded-[var(--radius-cell)] flex items-center justify-center text-[10px] font-bold select-none">
                      {r ? <div className={`w-full h-full rounded-[var(--radius-cell)] flex items-center justify-center ${cellStyle[r]}`}>{r[0]}</div>
                          : <div className="w-full h-full rounded-[var(--radius-cell)] flex items-center justify-center bg-cell-empty text-text-subtle">–</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {/* Desktop: full table */}
      <table className="hidden sm:table border-collapse text-sm w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="sticky left-0 z-10 bg-bg-card text-left px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wide min-w-[100px]">
              Member
            </th>
            {activities.map(a => (
              <th key={a.id} className="px-1 py-2.5 text-center min-w-[52px]">
                <p className="text-[10px] font-medium text-text-muted truncate w-12 mx-auto" title={a.name}>{a.name}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <tr key={m.id} className="border-b border-border last:border-0 hover:bg-bg/40 transition-colors">
              <td className="sticky left-0 z-10 bg-bg-card px-3 py-2.5 align-middle">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs font-semibold text-text-subtle shrink-0">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-text-primary truncate max-w-[60px]">{m.name.split(' ')[0]}</span>
                </div>
              </td>
              {scores.map((score, i) => (
                <td key={activities[i]?.id ?? i} className="px-1 py-2 align-middle">
                  <Cell rating={score.ratings[m.id]} ariaLabel={activities[i]?.name} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-border">
          <tr>
            <td className="sticky left-0 z-10 bg-bg-card px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wide align-middle">Score</td>
            {scores.map((score, i) => (
              <td key={activities[i]?.id ?? i} className="px-1 py-2.5 align-middle">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: maxScore > 0 ? `${Math.round((score.score / maxScore) * 100)}%` : '0%' }} />
                  </div>
                  <span className="text-[10px] text-text-muted tabular-nums">{score.score}</span>
                </div>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </>
  )
}

// ── View 3: Who's in — activities × rating buckets, member avatars in cells

const ROSTER_RATINGS: Rating[] = ['MUST', 'WANT', 'MEH']
const rosterBadge: Record<Rating, string> = {
  MUST: 'bg-cell-must text-must-text',
  WANT: 'bg-cell-want text-want-text',
  MEH:  'bg-cell-meh text-meh-text',
}

function RosterCards({ activities, scores, members, maxScore, colorMap }: {
  activities: Activity[]
  scores: CompatibilityScore[]
  members: Member[]
  maxScore: number
  colorMap: Map<string, number>
}) {
  return (
    <div className="flex flex-col divide-y divide-border">
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
          <div key={activity.id} className="px-3 py-3 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-text-primary">{activity.name}</p>
                {activity.location && <p className="text-[10px] text-text-muted">{activity.location}</p>}
              </div>
              <ScoreBar score={score?.score ?? 0} max={maxScore} />
            </div>
            <div className="flex flex-col gap-1.5">
              {ROSTER_RATINGS.map(r => byRating[r].length > 0 && (
                <div key={r} className="flex items-center gap-2">
                  <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-badge)] text-[9px] font-bold w-10 justify-center ${rosterBadge[r]}`}>{r}</span>
                  <AvatarGroup members={byRating[r]} colorMap={colorMap} cap={6} />
                </div>
              ))}
              {unrated.length > 0 && (
                <div className="flex items-center gap-2 opacity-40">
                  <span className="shrink-0 text-[9px] font-semibold text-text-subtle uppercase w-10 text-center">–</span>
                  <AvatarGroup members={unrated} colorMap={colorMap} cap={6} />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RosterTable({ activities, scores, members, maxScore, colorMap }: {
  activities: Activity[]
  scores: CompatibilityScore[]
  members: Member[]
  maxScore: number
  colorMap: Map<string, number>
}) {
  return (
    <>
      {/* Mobile: card layout */}
      <div className="sm:hidden">
        <RosterCards activities={activities} scores={scores} members={members} maxScore={maxScore} colorMap={colorMap} />
      </div>
      {/* Desktop: table */}
      <table className="hidden sm:table w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="sticky left-0 z-10 bg-bg-card text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wide min-w-[140px]">Activity</th>
            {ROSTER_RATINGS.map(r => (
              <th key={r} className="px-3 py-3 text-left align-bottom min-w-[100px]">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-badge)] text-[10px] font-bold ${rosterBadge[r]}`}>{r}</span>
              </th>
            ))}
            <th className="px-3 py-3 text-left align-bottom text-[10px] font-semibold text-text-subtle uppercase tracking-wide min-w-[80px]">Unrated</th>
            <th className="px-3 py-3 text-left align-bottom text-[10px] font-semibold text-text-muted uppercase tracking-wide min-w-[80px]">Score</th>
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
                  <p className="text-xs font-medium text-text-primary truncate max-w-[128px]" title={activity.name}>{activity.name}</p>
                  {activity.location && <p className="text-[10px] text-text-muted truncate max-w-[128px]">{activity.location}</p>}
                </td>
                {ROSTER_RATINGS.map(r => (
                  <td key={r} className="px-3 py-3 align-top">
                    <AvatarGroup members={byRating[r]} colorMap={colorMap} />
                  </td>
                ))}
                <td className="px-3 py-3 align-top opacity-50">
                  <AvatarGroup members={unrated} colorMap={colorMap} />
                </td>
                <td className="px-3 py-3 align-middle">
                  <ScoreBar score={score?.score ?? 0} max={maxScore} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

// ── View 4: Find your crew — activities ranked by excited count ────────────

interface CrewRow {
  activity: Activity
  score: CompatibilityScore | undefined
  mustMembers: Member[]
  wantMembers: Member[]
  mehMembers: Member[]
  excitedCount: number
}

function CrewCards({ rows, maxScore, colorMap }: {
  rows: CrewRow[]
  maxScore: number
  colorMap: Map<string, number>
}) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map(({ activity, score, mustMembers, wantMembers, mehMembers, excitedCount }) => {
        const isEmpty = excitedCount === 0
        return (
          <div
            key={activity.id}
            className={`bg-bg-card rounded-[var(--radius-card)] border border-border px-4 py-4 flex flex-col gap-3 transition-opacity ${isEmpty ? 'opacity-40' : ''}`}
          >
            {/* Header: name + excited count */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary leading-snug">{activity.name}</p>
                {activity.location && <p className="text-xs text-text-muted mt-0.5">{activity.location}</p>}
              </div>
              <span className={`shrink-0 text-xs font-semibold tabular-nums px-2.5 py-0.5 rounded-full ${
                excitedCount > 0 ? 'bg-accent/10 text-accent' : 'bg-border text-text-subtle'
              }`}>
                {excitedCount} excited
              </span>
            </div>

            {/* Crew rows */}
            {isEmpty ? (
              <p className="text-xs text-text-subtle">Nobody's excited yet.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {mustMembers.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded-[var(--radius-badge)] text-[10px] font-bold bg-cell-must text-must-text">
                      MUST
                    </span>
                    <AvatarGroup members={mustMembers} colorMap={colorMap} />
                  </div>
                )}
                {wantMembers.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded-[var(--radius-badge)] text-[10px] font-bold bg-cell-want text-want-text">
                      WANT
                    </span>
                    <AvatarGroup members={wantMembers} colorMap={colorMap} />
                  </div>
                )}
                {mehMembers.length > 0 && (
                  <div className="flex items-start gap-3 opacity-50">
                    <span className="shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded-[var(--radius-badge)] text-[10px] font-bold bg-cell-meh text-meh-text">
                      MEH
                    </span>
                    <AvatarGroup members={mehMembers} colorMap={colorMap} />
                  </div>
                )}
              </div>
            )}

            {/* Score footer */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-[10px] text-text-subtle uppercase tracking-wide shrink-0">Enthusiasm</span>
              <ScoreBar score={score?.score ?? 0} max={maxScore} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── View 5: Travel twin — N×N Jaccard compatibility heatmap ──────────────

function TwinGrid({ members, jaccardMatrix, colorMap }: {
  members: Member[]
  jaccardMatrix: Map<string, Map<string, number | null>>
  colorMap: Map<string, number>
}) {
  // Build unique pairs sorted by compatibility for mobile list
  const pairs = useMemo(() => {
    const result: { a: Member; b: Member; pct: number | null }[] = []
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const val = jaccardMatrix.get(members[i].id)?.get(members[j].id) ?? null
        result.push({ a: members[i], b: members[j], pct: val !== null ? Math.round(val * 100) : null })
      }
    }
    return result.sort((x, y) => (y.pct ?? -1) - (x.pct ?? -1))
  }, [members, jaccardMatrix])

  return (
    <>
      {/* Mobile: sorted pair list */}
      <div className="sm:hidden flex flex-col divide-y divide-border">
        {pairs.map(({ a, b, pct }) => {
          const ca = paletteFor(colorMap.get(a.id) ?? 0)
          const cb = paletteFor(colorMap.get(b.id) ?? 0)
          return (
            <div key={`${a.id}-${b.id}`} className="px-4 py-3 flex items-center gap-3">
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: ca.bg, color: ca.fg }}>
                  {a.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] text-text-muted">↔</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: cb.bg, color: cb.fg }}>
                  {b.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-text-muted truncate">{a.name.split(' ')[0]} & {b.name.split(' ')[0]}</span>
              </div>
              {pct !== null ? (
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-text-primary tabular-nums w-9 text-right">{pct}%</span>
                </div>
              ) : (
                <span className="text-xs text-text-subtle">?</span>
              )}
            </div>
          )
        })}
      </div>
      {/* Desktop: N×N heatmap grid */}
      <div className="hidden sm:block overflow-x-auto scrollbar-hide">
        <table className="border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 z-10 bg-bg-card min-w-[112px] w-28" />
              {members.map(m => {
                const c = paletteFor(colorMap.get(m.id) ?? 0)
                return (
                  <th key={m.id} className="px-1.5 py-3 text-center min-w-[52px]">
                    <div
                      className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold select-none"
                      style={{ backgroundColor: c.bg, color: c.fg }}
                      title={m.name}
                    >
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[9px] text-text-subtle mt-0.5 block truncate w-10 mx-auto">
                      {m.name.split(' ')[0]}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {members.map(rowMember => {
              const c = paletteFor(colorMap.get(rowMember.id) ?? 0)
              return (
                <tr key={rowMember.id} className="border-b border-border last:border-0">
                  <td className="sticky left-0 z-10 bg-bg-card px-3 py-2 align-middle">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold select-none shrink-0"
                        style={{ backgroundColor: c.bg, color: c.fg }}
                      >
                        {rowMember.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-text-primary truncate max-w-[72px]">
                        {rowMember.name.split(' ')[0]}
                      </span>
                    </div>
                  </td>
                  {members.map(colMember => {
                    const val = jaccardMatrix.get(rowMember.id)?.get(colMember.id) ?? null
                    const isSelf = rowMember.id === colMember.id
                    if (isSelf || val === null) {
                      return (
                        <td key={colMember.id} className="px-1.5 py-2 text-center align-middle">
                          <div className="w-10 h-8 mx-auto rounded flex items-center justify-center bg-border/50 text-text-subtle text-xs font-medium select-none">
                            {isSelf ? '·' : '?'}
                          </div>
                        </td>
                      )
                    }
                    const pct = Math.round(val * 100)
                    return (
                      <td key={colMember.id} className="px-1.5 py-2 text-center align-middle">
                        <div
                          className="w-10 h-8 mx-auto rounded flex items-center justify-center text-xs font-bold select-none tabular-nums"
                          style={{
                            backgroundColor: `color-mix(in srgb, var(--accent) ${Math.round(val * 80)}%, var(--bg-card))`,
                            color: 'var(--text-primary)',
                          }}
                          title={`${rowMember.name.split(' ')[0]} ↔ ${colMember.name.split(' ')[0]}: ${pct}% overlap`}
                        >
                          {pct}%
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function CompatibilityMatrix() {
  const activities = useTripStore(s => s.activities)
  const members    = useTripStore(s => s.members)
  const ratings    = useTripStore(s => s.ratings)
  const { matrix } = useCompatibilityMatrix()

  const [orientation, setOrientation] = useState<Orientation>('activities-rows')
  const [actPage, setActPage] = useState(0)
  const [memPage, setMemPage] = useState(0)

  // Activities in score-sorted order (from useCompatibilityMatrix)
  const orderedActivities = useMemo(
    () => matrix.map(s => activities.find(a => a.id === s.activity_id)).filter((a): a is Activity => !!a),
    [matrix, activities]
  )

  // Stable color index per member — index in full members array
  const colorMap = useMemo(() => new Map(members.map((m, i) => [m.id, i])), [members])

  // View 4: re-sort activities by excited-member count (MUST + WANT), score as tiebreaker
  const crewRows = useMemo((): CrewRow[] =>
    orderedActivities
      .map(activity => {
        const score = matrix.find(s => s.activity_id === activity.id)
        const mustMembers = members.filter(m => score?.ratings[m.id] === 'MUST')
        const wantMembers = members.filter(m => score?.ratings[m.id] === 'WANT')
        const mehMembers  = members.filter(m => score?.ratings[m.id] === 'MEH')
        return { activity, score, mustMembers, wantMembers, mehMembers, excitedCount: mustMembers.length + wantMembers.length }
      })
      .sort((a, b) => b.excitedCount - a.excitedCount || (b.score?.score ?? 0) - (a.score?.score ?? 0)),
    [orderedActivities, matrix, members]
  )

  // View 5: Jaccard similarity — excited set = MUST + WANT only, MEH excluded
  const jaccardMatrix = useMemo((): Map<string, Map<string, number | null>> => {
    const excitedSets = new Map<string, Set<string>>()
    for (const m of members) {
      excitedSets.set(
        m.id,
        new Set(
          ratings
            .filter(r => r.user_id === m.id && (r.rating === 'MUST' || r.rating === 'WANT'))
            .map(r => r.activity_id)
        )
      )
    }
    const result = new Map<string, Map<string, number | null>>()
    for (const a of members) {
      const row = new Map<string, number | null>()
      const aSet = excitedSets.get(a.id)!
      for (const b of members) {
        if (a.id === b.id) { row.set(b.id, null); continue }
        const bSet  = excitedSets.get(b.id)!
        const inter = [...aSet].filter(x => bSet.has(x)).length
        const union = new Set([...aSet, ...bSet]).size
        row.set(b.id, union > 0 ? inter / union : null)
      }
      result.set(a.id, row)
    }
    return result
  }, [members, ratings])

  const maxScore  = matrix[0]?.score ?? 0
  const isActRows = orientation === 'activities-rows'
  const isMemRows = orientation === 'members-rows'
  const isRoster  = orientation === 'roster'
  const isCrew    = orientation === 'crew'
  const isTwin    = orientation === 'twin'

  // Paginated slices
  const actStart   = actPage * ACT_PER_PAGE
  const actSlice   = orderedActivities.slice(actStart, actStart + ACT_PER_PAGE)
  const scoreSlice = matrix.slice(actStart, actStart + ACT_PER_PAGE)
  const memStart   = memPage * MEM_PER_PAGE
  const memSlice   = members.slice(memStart, memStart + MEM_PER_PAGE)
  const crewSlice  = crewRows.slice(actStart, actStart + ACT_PER_PAGE)

  // Horizontal axis — only activities-rows (members) and members-rows (activities)
  const showHPaginator = isActRows || isMemRows
  const hLabel   = isActRows ? 'Members' : 'Activities'
  const hTotal   = isActRows ? members.length : orderedActivities.length
  const hPerPage = isActRows ? MEM_PER_PAGE : ACT_PER_PAGE
  const hPage    = isActRows ? memPage : actPage
  const setHPage = isActRows ? setMemPage : setActPage

  // Vertical axis — all views except twin
  const showVPaginator = !isTwin
  const vLabel   = isMemRows ? 'Members' : 'Activities'
  const vTotal   = isMemRows ? members.length : isCrew ? crewRows.length : orderedActivities.length
  const vPerPage = isMemRows ? MEM_PER_PAGE : ACT_PER_PAGE
  const vPage    = isMemRows ? memPage : actPage
  const setVPage = isMemRows ? setMemPage : setActPage

  const currentView = VIEWS.find(v => v.id === orientation)!

  if (activities.length === 0) {
    return (
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-14 flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-text-primary">No activities yet</p>
        <p className="text-xs text-text-muted max-w-xs">Add activities to the trip — then come back to see how the group compares.</p>
      </div>
    )
  }

  if (ratings.length === 0) {
    return (
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-14 flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-text-primary">No ratings yet</p>
        <p className="text-xs text-text-muted max-w-xs">Rate activities as MUST, WANT, or MEH — the matrix will show who's excited about what.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* View selector + description + horizontal paginator */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="flex flex-col gap-1.5 min-w-0 w-full sm:w-auto">
          {/* 5-way segmented control — scrollable on mobile */}
          <div className="w-full overflow-x-auto scrollbar-hide pb-px">
            <div className="inline-flex items-center border border-border rounded-[var(--radius-btn)] overflow-hidden min-w-max">
              {VIEWS.map(({ id, label, shortLabel }) => (
                <button
                  key={id}
                  onClick={() => { setOrientation(id); setActPage(0); setMemPage(0) }}
                  className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border-l first:border-l-0 border-border ${
                    orientation === id
                      ? 'bg-accent text-white'
                      : 'bg-bg-card text-text-muted hover:text-text-primary'
                  }`}
                >
                  <span className="sm:hidden">{shortLabel}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Per-view description */}
          <p className="text-[11px] text-text-subtle leading-snug max-w-sm hidden sm:block">{currentView.description}</p>
        </div>

        {/* Horizontal axis paginator */}
        {showHPaginator && hTotal > hPerPage && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5 shrink-0">
            <span className="opacity-60">{hLabel}</span>
            <Paginator page={hPage} total={hTotal} perPage={hPerPage} onChange={setHPage} />
          </div>
        )}
      </div>

      {/* Matrix — crew gets card layout, all others get table-in-box */}
      {isCrew ? (
        <CrewCards rows={crewSlice} maxScore={maxScore} colorMap={colorMap} />
      ) : (
        <div className="overflow-x-auto scrollbar-hide rounded-[var(--radius-card)] border border-border bg-bg-card">
          {isActRows && (
            <ActivitiesRowsTable activities={actSlice} scores={scoreSlice} members={memSlice} maxScore={maxScore} />
          )}
          {isMemRows && (
            <MembersRowsTable members={memSlice} activities={actSlice} scores={scoreSlice} maxScore={maxScore} />
          )}
          {isRoster && (
            <RosterTable activities={actSlice} scores={scoreSlice} members={members} maxScore={maxScore} colorMap={colorMap} />
          )}
          {isTwin && (
            <TwinGrid members={members} jaccardMatrix={jaccardMatrix} colorMap={colorMap} />
          )}
        </div>
      )}

      {/* Vertical paginator + legend */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {showVPaginator && vTotal > vPerPage ? (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="opacity-60">{vLabel}</span>
            <Paginator page={vPage} total={vTotal} perPage={vPerPage} onChange={setVPage} />
          </div>
        ) : <div />}

        {/* Legend: adapts to view */}
        {(isActRows || isMemRows) && (
          <div className="flex items-center gap-3">
            {(['MUST', 'WANT', 'MEH'] as Rating[]).map(r => (
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

        {(isRoster || isCrew) && members.length <= 10 && (
          <div className="flex items-center gap-2 flex-wrap">
            {members.map((m, idx) => {
              const c = paletteFor(idx)
              return (
                <div key={m.id} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.bg }} />
                  <span className="text-[10px] text-text-muted">{m.name.split(' ')[0]}</span>
                </div>
              )
            })}
          </div>
        )}

        {isTwin && (
          <div className="flex items-center gap-2">
            <div
              className="w-16 h-3 rounded"
              style={{ background: 'linear-gradient(to right, var(--bg-card), color-mix(in srgb, var(--accent) 80%, var(--bg-card)))' }}
            />
            <span className="text-[10px] text-text-muted">0% → 100% shared excitement</span>
          </div>
        )}
      </div>

    </div>
  )
}
