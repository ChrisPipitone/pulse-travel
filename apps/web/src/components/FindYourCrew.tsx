'use client'

import { useState, useMemo } from 'react'
import { useTripStore } from '@pulse/store'
import { useSession } from '@pulse/hooks'
import { useRateActivity } from '@pulse/hooks'
import type { Activity, Member, Rating } from '@pulse/types'
import { memberPalette, buildColorMap } from '@/lib/memberColors'

// ── Shared types ──────────────────────────────────────────────────────────────

interface CrewRowData {
  activity: Activity
  mustMembers: Member[]
  wantMembers: Member[]
  maybeMembers: Member[]
  skipMembers: Member[]
  unratedMembers: Member[]
  myRating: Rating | null
  mustCount: number
  wantCount: number
  maybeCount: number
}

// ── Pin icon ──────────────────────────────────────────────────────────────────

function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-60">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}

// ── Avatar chip (with name label) ─────────────────────────────────────────────

function AvatarChip({
  member, colorIdx, isYou = false, soft = false,
}: {
  member: Member; colorIdx: number; isYou?: boolean; soft?: boolean
}) {
  const c = memberPalette(colorIdx)
  return (
    <div className={`flex items-center gap-1.5 bg-bg-card border border-border rounded-full pl-1 pr-2.5 py-1 text-xs font-medium text-text-primary ${soft ? 'opacity-65' : ''}`}>
      <div
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 text-white"
        style={{
          backgroundColor: c.bg,
          color: c.fg,
          boxShadow: isYou ? `0 0 0 2px var(--accent), 0 0 0 3.5px var(--bg-card)` : undefined,
        }}
      >
        {member.name.charAt(0).toUpperCase()}
      </div>
      <span>{isYou ? 'You' : member.name.split(' ')[0]}</span>
    </div>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────────

function StatusPill({ rating }: { rating: Rating | null }) {
  if (rating === 'MUST')  return <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-must text-must-text whitespace-nowrap">✓ Going</span>
  if (rating === 'WANT')  return <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-want text-want-text whitespace-nowrap">Likely going</span>
  if (rating === 'MAYBE') return <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: 'rgba(255,229,102,.7)', color: '#7A6200' }}>Maybe</span>
  return (
    <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap border border-accent text-accent bg-transparent">
      Rate this →
    </span>
  )
}

// ── Inline overlapping avatar row (for MUST state cards) ─────────────────────

function AvatarRow({
  mustMembers, wantMembers, colorMap, userId,
}: {
  mustMembers: Member[]; wantMembers: Member[]; colorMap: Map<string, number>; userId?: string
}) {
  const allShown = [...mustMembers, ...wantMembers].slice(0, 5)
  const overflow = (mustMembers.length + wantMembers.length) - allShown.length
  const mustSet = new Set(mustMembers.map(m => m.id))
  return (
    <div className="flex items-center">
      <div className="flex">
        {allShown.map((m, i) => {
          const c = memberPalette(colorMap.get(m.id) ?? 0)
          const isWant = !mustSet.has(m.id)
          const isYou = m.id === userId
          return (
            <div
              key={m.id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{
                backgroundColor: c.bg,
                color: c.fg,
                marginLeft: i > 0 ? '-6px' : 0,
                border: '1.5px solid var(--bg-card)',
                opacity: isWant ? 0.6 : 1,
                boxShadow: isYou ? '0 0 0 2px var(--accent)' : undefined,
              }}
              title={m.name}
            >
              {m.name.charAt(0).toUpperCase()}
            </div>
          )
        })}
      </div>
      {overflow > 0 && (
        <span className="ml-2 text-[10px] font-semibold text-text-muted bg-border rounded-full px-2 py-0.5 whitespace-nowrap">
          +{overflow} more
        </span>
      )}
    </div>
  )
}

// ── Two-tier crew block (WANT/MAYBE/Unrated states) ───────────────────────────

function TierBlock({
  mustMembers, wantMembers, maybeMembers, colorMap, userId, myRating,
}: {
  mustMembers: Member[]; wantMembers: Member[]; maybeMembers: Member[]
  colorMap: Map<string, number>; userId?: string; myRating: Rating | null
}) {
  return (
    <div className="flex flex-col">
      {mustMembers.length > 0 && (
        <div className="flex items-center gap-2 py-0.5">
          <div className="flex">
            {mustMembers.map((m, i) => {
              const c = memberPalette(colorMap.get(m.id) ?? 0)
              return (
                <div key={m.id} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ backgroundColor: c.bg, color: c.fg, marginLeft: i > 0 ? '-6px' : 0, border: '1.5px solid var(--bg-card)' }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
              )
            })}
          </div>
          <span className="text-xs text-text-muted truncate">{mustMembers.map(m => m.name.split(' ')[0]).join(', ')}</span>
        </div>
      )}

      {mustMembers.length > 0 && wantMembers.length > 0 && (
        <div className="h-px bg-border my-1" />
      )}

      {wantMembers.length > 0 && (
        <div className="flex items-center gap-2 py-0.5 opacity-60">
          <div className="flex">
            {wantMembers.map((m, i) => {
              const c = memberPalette(colorMap.get(m.id) ?? 0)
              return (
                <div key={m.id} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ backgroundColor: c.bg, color: c.fg, marginLeft: i > 0 ? '-6px' : 0, border: '1.5px solid var(--bg-card)' }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
              )
            })}
          </div>
          <span className="text-xs text-text-muted truncate">{wantMembers.map(m => m.name.split(' ')[0]).join(', ')}</span>
        </div>
      )}

      {/* Maybe row — only if user is in maybe, de-emphasized */}
      {maybeMembers.length > 0 && (myRating === 'MAYBE' || myRating === null) && (
        <div className="flex items-center gap-2 py-0.5 mt-0.5 opacity-35">
          <div className="w-1.5 h-1.5 rounded-full bg-maybe-text shrink-0" />
          <div className="flex">
            {maybeMembers.slice(0, 3).map((m, i) => {
              const c = memberPalette(colorMap.get(m.id) ?? 0)
              return (
                <div key={m.id} className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0" style={{ backgroundColor: c.bg, color: c.fg, marginLeft: i > 0 ? '-5px' : 0, border: '1.5px solid var(--bg-card)' }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
              )
            })}
          </div>
          <span className="text-[10px] text-text-subtle truncate">
            {maybeMembers.slice(0, 2).map(m => m.id === userId ? 'You' : m.name.split(' ')[0]).join(', ')} maybe
          </span>
        </div>
      )}
    </div>
  )
}

// ── Crew count pills ──────────────────────────────────────────────────────────

function CrewFooter({ mustCount, wantCount, maybeCount }: { mustCount: number; wantCount: number; maybeCount: number }) {
  return (
    <div className="flex items-center gap-1.5 pt-2.5 border-t border-border flex-wrap">
      {mustCount > 0 && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,92,53,.1)', color: 'var(--must-bg)' }}>{mustCount} going</span>}
      {wantCount > 0 && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,201,167,.1)', color: 'var(--want-bg)' }}>{wantCount} likely</span>}
      {maybeCount > 0 && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-border text-text-subtle">{maybeCount} maybe</span>}
    </div>
  )
}

// ── D2 Modal ──────────────────────────────────────────────────────────────────

function CrewModalD2({
  row, colorMap, userId, onClose, onRate, ratingLoading,
}: {
  row: CrewRowData; colorMap: Map<string, number>; userId?: string
  onClose: () => void; onRate: (r: Rating) => void; ratingLoading: boolean
}) {
  const { activity, mustMembers, wantMembers, maybeMembers, skipMembers, unratedMembers, myRating } = row

  const [pendingRating, setPendingRating] = useState<Rating | null>(myRating)

  function handleRate(r: Rating) {
    const next = pendingRating === r ? null : r
    setPendingRating(next)
    onRate(r)
  }

  // What's-next content by rating
  const nextCallout = myRating === 'MUST'
    ? { icon: '🤝', head: `You're in — ${mustMembers.length} people confirmed.`, sub: 'Plan it to lock in dates and finalize your crew.' }
    : myRating === 'WANT'
    ? { icon: '⏳', head: "You're in — pending timing.", sub: 'Plan it to see who makes the final cut.' }
    : myRating === 'MAYBE'
    ? { icon: '🤔', head: "You're on the sidelines.", sub: "Join the crew if you want in — change your rating to commit." }
    : { icon: '👋', head: `${mustMembers.length + wantMembers.length} people have opinions — what's yours?`, sub: 'Rate it and see where you land in the crew.' }

  // Members in likely section — mark "you" distinctly
  const likelyLabel = myRating === 'WANT' ? 'Likely — including you' : 'Likely — in unless timing conflicts'

  const showOthers = maybeMembers.length > 0 || skipMembers.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-5"
      style={{ background: 'rgba(0,0,0,.42)', backdropFilter: 'blur(3px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-bg-card w-full max-w-[520px] max-h-[92vh] sm:max-h-[86vh] overflow-y-auto flex flex-col"
        style={{ borderRadius: 'var(--radius-card) var(--radius-card) 0 0' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-border sticky top-0 bg-bg-card z-10">
          <div className="min-w-0">
            <p className="text-[17px] font-bold text-text-primary leading-snug">{activity.name}</p>
            {activity.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                <PinIcon />
                <span>{activity.location}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="shrink-0 text-text-subtle hover:text-text-primary p-1 rounded-lg transition-colors mt-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3.5 px-5 py-4 flex-1">

          {/* Definite crew */}
          {mustMembers.length > 0 && (
            <div className="rounded-xl p-3 flex flex-col gap-2.5" style={{ background: 'rgba(255,92,53,.05)', border: '1px solid rgba(255,92,53,.15)' }}>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-text-subtle">
                <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: 'var(--must-bg)' }} />
                Definite crew
              </div>
              <div className="flex flex-wrap gap-1.5">
                {mustMembers.map(m => (
                  <AvatarChip key={m.id} member={m} colorIdx={colorMap.get(m.id) ?? 0} isYou={m.id === userId} />
                ))}
              </div>
            </div>
          )}

          {/* Likely crew */}
          {wantMembers.length > 0 && (
            <div className="rounded-xl p-3 flex flex-col gap-2.5" style={{ background: 'rgba(0,0,0,.025)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-text-subtle">
                <span className="w-[7px] h-[7px] rounded-full shrink-0 border-[1.5px]" style={{ borderColor: 'var(--want-bg)', background: 'transparent' }} />
                {likelyLabel}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {wantMembers.map(m => (
                  <AvatarChip key={m.id} member={m} colorIdx={colorMap.get(m.id) ?? 0} isYou={m.id === userId} soft={m.id !== userId} />
                ))}
              </div>
            </div>
          )}

          {/* D2 others — maybe + skip in one bg card */}
          {showOthers && (
            <div className="rounded-[10px] flex flex-col divide-y divide-black/5" style={{ background: 'var(--bg)' }}>
              {maybeMembers.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap px-3.5 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[.06em] w-12 shrink-0" style={{ color: '#A08000' }}>Maybe</span>
                  {maybeMembers.map(m => {
                    const c = memberPalette(colorMap.get(m.id) ?? 0)
                    const isYou = m.id === userId
                    return (
                      <div
                        key={m.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-text-muted"
                        style={{
                          background: 'rgba(255,229,102,.22)',
                          border: isYou ? '1.5px solid rgba(255,92,53,.25)' : undefined,
                        }}
                      >
                        <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[7px] font-bold" style={{ backgroundColor: c.bg, color: c.fg }}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{isYou ? 'You' : m.name.split(' ')[0]}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              {skipMembers.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap px-3.5 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[.06em] w-12 shrink-0 text-text-subtle">Skipping</span>
                  {skipMembers.map(m => {
                    const c = memberPalette(colorMap.get(m.id) ?? 0)
                    return (
                      <div key={m.id} className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-text-muted opacity-55" style={{ background: 'rgba(0,0,0,.03)' }}>
                        <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[7px] font-bold" style={{ backgroundColor: c.bg, color: c.fg }}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{m.name.split(' ')[0]}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Unrated note */}
          {unratedMembers.length > 0 && myRating === null && (
            <p className="text-xs text-text-subtle bg-bg rounded-lg px-3 py-2.5 leading-relaxed">
              <strong className="text-text-muted">{unratedMembers.map(m => m.id === userId ? 'You' : m.name.split(' ')[0]).join(', ')}</strong> {unratedMembers.length === 1 ? "hasn't" : "haven't"} weighed in yet.
            </p>
          )}

          {/* What's next callout */}
          <div className="flex items-center gap-3 bg-bg rounded-xl px-4 py-3">
            <span className="text-[22px] shrink-0">{nextCallout.icon}</span>
            <div>
              <p className="text-[13px] font-semibold text-text-primary leading-snug">{nextCallout.head}</p>
              <p className="text-[11px] text-text-muted mt-0.5 leading-snug">{nextCallout.sub}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border px-5 py-4 flex flex-col gap-2.5 shrink-0">
          {myRating === 'MAYBE' ? (
            <button
              onClick={() => handleRate('WANT')}
              disabled={ratingLoading}
              className="w-full flex items-center justify-center py-3 px-5 text-[13px] font-semibold rounded-[var(--radius-btn)] border border-accent text-accent bg-transparent hover:bg-accent/5 transition-colors disabled:opacity-50"
            >
              Join the crew →
            </button>
          ) : myRating === null ? (
            <div className="grid grid-cols-4 gap-1.5">
              {(['MUST', 'WANT', 'MAYBE', 'SKIP'] as Rating[]).map(r => {
                const labels: Record<Rating, string> = { MUST: "Can't miss", WANT: 'Want to', MAYBE: 'Maybe', SKIP: 'Skip' }
                const active = pendingRating === r
                const activeStyles: Record<Rating, string> = {
                  MUST:  'bg-must/[.13] border-must text-must',
                  WANT:  'bg-want/[.13] border-want text-want',
                  MAYBE: 'border-[#B8960A] text-[#7A6200]',
                  SKIP:  'bg-skip border-skip-text/50 text-skip-text',
                }
                return (
                  <button
                    key={r}
                    onClick={() => handleRate(r)}
                    disabled={ratingLoading}
                    className={`py-2.5 rounded-xl border text-[11px] font-semibold transition-all disabled:opacity-50 ${
                      active
                        ? `${activeStyles[r]} font-bold`
                        : 'border-border text-text-muted hover:border-accent/40 hover:text-text-primary'
                    } ${r === 'MAYBE' && active ? 'bg-[rgba(255,229,102,.45)]' : ''}`}
                  >
                    {labels[r]}
                  </button>
                )
              })}
            </div>
          ) : (
            <>
              <button className="w-full flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold rounded-[var(--radius-btn)] bg-accent text-white hover:opacity-90 transition-opacity">
                Plan with your crew
                <span className="text-[9px] font-bold uppercase bg-white/25 text-white px-1.5 py-0.5 rounded-full">Soon</span>
              </button>
              {myRating === 'MUST' && (
                <button className="w-full flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-medium rounded-[var(--radius-btn)] border border-border text-text-muted hover:border-accent/40 hover:text-accent transition-colors">
                  Nudge unvoted members
                  <span className="text-[9px] font-bold uppercase bg-border text-text-subtle px-1.5 py-0.5 rounded-full">Soon</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Crew card ─────────────────────────────────────────────────────────────────

function CrewCard({
  row, colorMap, userId, onOpen,
}: {
  row: CrewRowData; colorMap: Map<string, number>; userId?: string; onOpen: () => void
}) {
  const { activity, mustMembers, wantMembers, maybeMembers, myRating, mustCount, wantCount, maybeCount } = row

  const stripeColor = myRating === 'MUST' ? 'var(--must-bg)' : myRating === 'WANT' ? 'var(--want-bg)' : myRating === 'MAYBE' ? '#FFE566' : '#E8E6E0'
  const cardBg = myRating === 'MUST'
    ? 'linear-gradient(135deg,rgba(255,92,53,.04) 0%,var(--bg-card) 55%)'
    : myRating === 'WANT'
    ? 'linear-gradient(135deg,rgba(0,201,167,.04) 0%,var(--bg-card) 55%)'
    : 'var(--bg-card)'

  const isEmpty = mustCount === 0 && wantCount === 0

  return (
    <div
      onClick={onOpen}
      className={`rounded-[var(--radius-card)] border border-border overflow-hidden cursor-pointer flex transition-all hover:shadow-md hover:-translate-y-px active:scale-[.998] ${isEmpty ? 'opacity-40' : ''}`}
      style={{ background: cardBg }}
    >
      {/* Left stripe */}
      <div className="w-1 shrink-0" style={{ background: stripeColor }} />

      <div className="flex-1 min-w-0 px-4 py-3.5 flex flex-col gap-2.5">
        {/* Top row: name + pill */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary leading-snug">{activity.name}</p>
            {activity.location && (
              <div className="flex items-center gap-1 mt-0.5 text-[11px] text-text-muted">
                <PinIcon />
                <span className="truncate">{activity.location}</span>
              </div>
            )}
          </div>
          <StatusPill rating={myRating} />
        </div>

        {/* Crew display */}
        {isEmpty ? (
          <p className="text-xs text-text-subtle">Nobody's excited yet.</p>
        ) : myRating === 'MUST' ? (
          <AvatarRow mustMembers={mustMembers} wantMembers={wantMembers} colorMap={colorMap} userId={userId} />
        ) : (
          <TierBlock mustMembers={mustMembers} wantMembers={wantMembers} maybeMembers={maybeMembers} colorMap={colorMap} userId={userId} myRating={myRating} />
        )}

        {/* Footer */}
        {!isEmpty && <CrewFooter mustCount={mustCount} wantCount={wantCount} maybeCount={maybeCount} />}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function FindYourCrew() {
  const activities   = useTripStore(s => s.activities)
  const members      = useTripStore(s => s.members)
  const ratings      = useTripStore(s => s.ratings)
  const { session }  = useSession()
  const { rateActivity, loading: ratingLoading } = useRateActivity()

  const userId  = session?.user.id
  const colorMap = useMemo(() => buildColorMap(members), [members])

  const [openId, setOpenId] = useState<string | null>(null)

  const rows = useMemo((): CrewRowData[] => {
    return activities
      .map(activity => {
        const actRatings = ratings.filter(r => r.activity_id === activity.id)
        const ratingMap = new Map(actRatings.map(r => [r.user_id, r.rating]))
        const mustMembers    = members.filter(m => ratingMap.get(m.id) === 'MUST')
        const wantMembers    = members.filter(m => ratingMap.get(m.id) === 'WANT')
        const maybeMembers   = members.filter(m => ratingMap.get(m.id) === 'MAYBE')
        const skipMembers    = members.filter(m => ratingMap.get(m.id) === 'SKIP')
        const ratedIds       = new Set(actRatings.map(r => r.user_id))
        const unratedMembers = members.filter(m => !ratedIds.has(m.id))
        const myRating       = userId ? (ratingMap.get(userId) ?? null) : null
        return {
          activity,
          mustMembers, wantMembers, maybeMembers, skipMembers, unratedMembers,
          myRating,
          mustCount:  mustMembers.length,
          wantCount:  wantMembers.length,
          maybeCount: maybeMembers.length,
        }
      })
      .sort((a, b) => {
        const aEx = a.mustCount + a.wantCount
        const bEx = b.mustCount + b.wantCount
        return bEx - aEx
      })
  }, [activities, members, ratings, userId])

  const openRow = rows.find(r => r.activity.id === openId) ?? null

  if (activities.length === 0) {
    return (
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-14 flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-text-primary">No activities yet</p>
        <p className="text-xs text-text-muted max-w-xs">Add activities to the trip — then come back to see who's excited about what.</p>
      </div>
    )
  }

  if (ratings.length === 0) {
    return (
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-14 flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-text-primary">No ratings yet</p>
        <p className="text-xs text-text-muted max-w-xs">Rate activities to see who's excited about what.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {rows.map(row => (
          <CrewCard
            key={row.activity.id}
            row={row}
            colorMap={colorMap}
            userId={userId}
            onOpen={() => setOpenId(row.activity.id)}
          />
        ))}
      </div>

      {openRow && (
        <CrewModalD2
          row={openRow}
          colorMap={colorMap}
          userId={userId}
          onClose={() => setOpenId(null)}
          onRate={r => rateActivity(openRow.activity.id, r)}
          ratingLoading={ratingLoading}
        />
      )}
    </>
  )
}
