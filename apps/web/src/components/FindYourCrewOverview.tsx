"use client";

import { useState, useMemo, useRef } from "react";
import { useModalEscape } from "@/hooks/useModalEscape";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTripStore } from "@pulse/store";
import { useCompatibilityMatrix } from "@pulse/hooks";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { Activity, Member, Rating } from "@pulse/types";
import { RATING_PILL } from "@pulse/types";
import { MemberEnthusiasmRing, EnthusiasmRingLegend } from "@/components/MemberEnthusiasmRing";
import { GroupiesMemberCard, type MemberCategoryChip } from "./GroupiesMemberCard";
import { TravelTwinCard } from "./TravelTwinCard";
type MainView = "groupies" | "travelTwin";

// ─────────────────────────────────────────────────────────────────────────────
// Pairwise Jaccard helpers
// ─────────────────────────────────────────────────────────────────────────────

interface MemberSummary {
  member: Member
  colorIndex: number
  musts: number
  wants: number
  mustActivityIds: Set<string>
  excitedIds: Set<string>
  mustActivities: Activity[]
}

interface TwinResult {
  member: Member
  colorIndex: number
  musts: number
  wants: number
  score: number
  sharedMusts: Activity[]
}

function computeMemberSummaries(
  members: Member[],
  ratings: { activity_id: string; user_id: string; rating: Rating }[],
  activities: Activity[],
): MemberSummary[] {
  return members.map((member, idx) => {
    const mr = ratings.filter(r => r.user_id === member.id)
    const mustIds = new Set(mr.filter(r => r.rating === 'MUST').map(r => r.activity_id))
    const maybeIds = new Set(mr.filter(r => r.rating === 'MAYBE').map(r => r.activity_id))
    const excitedIds = new Set([...mustIds, ...maybeIds])
    const mustActivities = activities.filter(a => mustIds.has(a.id))
    return {
      member,
      colorIndex: idx,
      musts: mustIds.size,
      wants: maybeIds.size,
      mustActivityIds: mustIds,
      excitedIds,
      mustActivities,
    }
  })
}

function computeTopTwins(summaries: MemberSummary[], activities: Activity[]): Map<string, TwinResult[]> {
  const result = new Map<string, TwinResult[]>()
  for (const ms of summaries) {
    const twins: TwinResult[] = []
    for (const other of summaries) {
      if (other.member.id === ms.member.id) continue
      let inter = 0
      ms.excitedIds.forEach(id => { if (other.excitedIds.has(id)) inter++ })
      const union = ms.excitedIds.size + other.excitedIds.size - inter
      const score = union === 0 ? 0 : inter / union
      const sharedMusts = activities.filter(a =>
        ms.mustActivityIds.has(a.id) && other.mustActivityIds.has(a.id)
      )
      twins.push({ member: other.member, colorIndex: other.colorIndex, musts: other.musts, wants: other.wants, score, sharedMusts })
    }
    twins.sort((a, b) => b.score - a.score)
    result.set(ms.member.id, twins.slice(0, 4))
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Member detail modal
// ─────────────────────────────────────────────────────────────────────────────

const RATING_ORDER: Rating[] = ['MUST', 'MAYBE', 'SKIP']
const RATING_SECTION_LABEL: Record<Rating, string> = {
  MUST:  'Going',
  MAYBE: 'Maybe',
  SKIP:  'Skipping',
}

function MemberDetailModal({
  member, musts, wants, activities, memberRatings, open, onClose, variant = "modal",
}: {
  member: Member | null
  musts: number
  wants: number
  activities: Activity[]
  memberRatings: Map<string, Rating>
  open: boolean
  onClose: () => void
  variant?: "modal" | "panel"
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, variant === "modal" && open)

  useModalEscape(onClose)

  if (!open || !member) return null

  const [firstName, ...rest] = member.name.trim().split(' ')
  const lastName = rest.join(' ')
  const total = musts + wants

  const byRating = RATING_ORDER
    .map(r => ({ r, acts: activities.filter(a => memberRatings.get(a.id) === r) }))
    .filter(x => x.acts.length > 0)
  const unrated = activities.filter(a => !memberRatings.has(a.id))

  const inner = (
    <>
      {/* Header */}
      <div className="relative flex flex-col items-center px-[18px] pt-4 pb-3 border-b border-border sticky top-0 bg-bg-card z-10 flex-shrink-0">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="3" x2="13" y2="13" />
            <line x1="13" y1="3" x2="3" y2="13" />
          </svg>
        </button>
        <MemberEnthusiasmRing name={member.name} avatarUrl={member.avatar_url} size="3xl" musts={musts} wants={wants} activityCount={activities.length} />
        <div className="text-base font-bold leading-tight text-center mt-2">
          {firstName}{lastName && <span className="font-normal text-text-muted"> {lastName}</span>}
        </div>
        <div className="text-[11px] text-text-subtle mt-0.5">
          {musts > 0 ? `${musts} must · ` : ''}{wants > 0 ? `${wants} maybe · ` : ''}{total} total
        </div>
        <EnthusiasmRingLegend className="mt-2" />
      </div>

      {/* Body */}
      <div className="flex-1">
        {byRating.map(({ r, acts }) => (
          <div key={r}>
            <div className="px-[18px] pt-[10px] pb-1 text-[9px] font-bold uppercase tracking-[0.08em] text-text-subtle">
              {RATING_SECTION_LABEL[r]}
            </div>
            {acts.map(a => (
              <div key={a.id} className="flex items-center gap-[10px] px-[18px] py-[10px] border-b border-border last:border-b-0">
                <span className="flex-1 text-[13px] text-text-primary">{a.name}</span>
                <span className={`flex-shrink-0 px-2 py-[3px] rounded-[8px] text-[10px] font-bold ${RATING_PILL[r]}`}>
                  {r}
                </span>
              </div>
            ))}
          </div>
        ))}
        {unrated.length > 0 && (
          <div>
            <div className="px-[18px] pt-[10px] pb-1 text-[9px] font-bold uppercase tracking-[0.08em] text-text-subtle">
              Not rated
            </div>
            {unrated.map(a => (
              <div key={a.id} className="flex items-center gap-[10px] px-[18px] py-[10px] border-b border-border last:border-b-0">
                <span className="flex-1 text-[13px] text-text-subtle">{a.name}</span>
                <span className="flex-shrink-0 px-2 py-[3px] rounded-[8px] text-[10px] font-bold bg-border text-text-subtle">
                  —
                </span>
              </div>
            ))}
          </div>
        )}
        {byRating.length === 0 && unrated.length === 0 && (
          <div className="py-10 text-center text-sm text-text-subtle">No activities yet</div>
        )}
        <div className="h-6" />
      </div>
    </>
  )

  if (variant === "panel") {
    return (
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border flex flex-col overflow-y-auto max-h-[calc(100vh-8rem)] section-in">
        {inner}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        className="modal-panel relative bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] border border-border w-full sm:max-w-md max-h-[88vh] overflow-y-auto flex flex-col"
      >
        {inner}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Twin comparison panel
// ─────────────────────────────────────────────────────────────────────────────

function TwinComparisonPanel({
  memberSummary,
  twin,
  ratings,
  activities,
  onClose,
  variant = "panel",
}: {
  memberSummary: MemberSummary
  twin: TwinResult | null
  ratings: { activity_id: string; user_id: string; rating: Rating }[]
  activities: Activity[]
  onClose: () => void
  variant?: "modal" | "panel"
}) {
  useModalEscape(onClose)

  const inner = (() => {
    if (!twin) {
      return (
        <>
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border sticky top-0 bg-bg-card z-10 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-text-subtle">Travel Twin</span>
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-text-subtle hover:text-text-primary hover:bg-bg transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
            </button>
          </div>
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-text-muted">No twin yet</p>
            <p className="text-xs text-text-subtle mt-1">Rate more activities to find a match</p>
          </div>
        </>
      )
    }

    const pct = Math.round(twin.score * 100)
    const ratingsA = new Map(ratings.filter(r => r.user_id === memberSummary.member.id).map(r => [r.activity_id, r.rating]))
    const ratingsB = new Map(ratings.filter(r => r.user_id === twin.member.id).map(r => [r.activity_id, r.rating]))
    const sharedMusts = twin.sharedMusts
    const onlyA = activities.filter(a => ratingsA.get(a.id) === 'MUST' && ratingsB.get(a.id) !== 'MUST')
    const onlyB = activities.filter(a => ratingsB.get(a.id) === 'MUST' && ratingsA.get(a.id) !== 'MUST')
    const fnA = memberSummary.member.name.split(' ')[0]
    const fnB = twin.member.name.split(' ')[0]

    return (
      <>
        {/* Header */}
        <div className="px-5 pt-4 pb-4 border-b border-border sticky top-0 bg-bg-card z-10 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-text-subtle">Travel Twin</span>
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-text-subtle hover:text-text-primary hover:bg-bg transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col items-center gap-1 text-center">
              <MemberEnthusiasmRing name={memberSummary.member.name} avatarUrl={memberSummary.member.avatar_url} size="3xl" musts={memberSummary.musts} wants={memberSummary.wants} activityCount={activities.length} />
              <span className="text-xs font-semibold text-text-primary">{fnA}</span>
              <span className="text-[10px] text-text-subtle">{memberSummary.musts} must</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-1 shrink-0">
              <span className="text-xl font-bold text-accent">{pct}%</span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-text-subtle">match</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 text-center">
              <MemberEnthusiasmRing name={twin.member.name} avatarUrl={twin.member.avatar_url} size="3xl" musts={twin.musts} wants={twin.wants} activityCount={activities.length} />
              <span className="text-xs font-semibold text-text-primary">{fnB}</span>
              <span className="text-[10px] text-text-subtle">{twin.musts} must</span>
            </div>
          </div>
          <EnthusiasmRingLegend className="mt-3" />
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col gap-4 px-5 py-4">
          {sharedMusts.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-must mb-2">Both going</p>
              <div className="flex flex-col gap-1.5">
                {sharedMusts.map(a => (
                  <div key={a.id} className="flex items-center gap-2 bg-must/5 border border-must/15 rounded-lg px-3 py-1.5">
                    <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-must">
                      <polyline points="3,8 7,12 13,4" />
                    </svg>
                    <span className="text-[12px] font-semibold text-text-primary">{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(onlyA.length > 0 || onlyB.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-text-subtle mb-2">Only {fnA}</p>
                {onlyA.length === 0 ? (
                  <p className="text-[11px] text-text-subtle italic">None</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {onlyA.slice(0, 5).map(a => <p key={a.id} className="text-[11px] text-text-muted leading-tight">{a.name}</p>)}
                    {onlyA.length > 5 && <p className="text-[10px] text-text-subtle">+{onlyA.length - 5} more</p>}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-text-subtle mb-2">Only {fnB}</p>
                {onlyB.length === 0 ? (
                  <p className="text-[11px] text-text-subtle italic">None</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {onlyB.slice(0, 5).map(a => <p key={a.id} className="text-[11px] text-text-muted leading-tight">{a.name}</p>)}
                    {onlyB.length > 5 && <p className="text-[10px] text-text-subtle">+{onlyB.length - 5} more</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {sharedMusts.length === 0 && onlyA.length === 0 && onlyB.length === 0 && (
            <p className="text-sm text-text-subtle text-center py-6">Rate more activities to compare</p>
          )}
        </div>
      </>
    )
  })()

  if (variant === "panel") {
    return (
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border flex flex-col overflow-y-auto max-h-[calc(100vh-8rem)] section-in">
        {inner}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-panel relative bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] border border-border w-full sm:max-w-md max-h-[88vh] overflow-y-auto flex flex-col">
        {inner}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Trip pulse strip
// ─────────────────────────────────────────────────────────────────────────────

function TripPulseStrip({ activityCount, memberCount, ratedCount, topActivity, topCrewCount }: {
  activityCount: number
  memberCount: number
  ratedCount: number
  topActivity: string | null
  topCrewCount: number
}) {
  const pct = activityCount === 0 ? 0 : Math.round((ratedCount / activityCount) * 100)
  return (
    <div className="bg-bg-card border border-border rounded-[var(--radius-card)] px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">{activityCount} activities · {memberCount} members</span>
        <span className="text-xs font-bold text-text-primary">{pct}%<span className="font-normal text-text-subtle ml-0.5">rated</span></span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
      </div>
      {topActivity && topCrewCount > 0 && (
        <p className="text-[11px] text-text-muted">
          Most popular: <span className="font-semibold text-text-primary">{topActivity}</span>
          <span className="ml-1 text-text-subtle">· {topCrewCount} going</span>
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// View toggle
// ─────────────────────────────────────────────────────────────────────────────

function ViewToggle({ view, setView }: { view: MainView; setView: (v: MainView) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 bg-bg-card border border-border rounded-lg p-0.5 self-start">
      <button
        onClick={() => setView("groupies")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          view === "groupies" ? "bg-accent text-white shadow-sm" : "text-text-muted hover:text-text-primary"
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="5.5" cy="5" r="2.5" />
          <path d="M1 14c0-2.76 2.02-5 4.5-5s4.5 2.24 4.5 5" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 10c1.93 0 3 1.34 3 3" />
        </svg>
        Groupies
      </button>
      <button
        onClick={() => setView("travelTwin")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          view === "travelTwin" ? "bg-accent text-white shadow-sm" : "text-text-muted hover:text-text-primary"
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="4.5" cy="6" r="2.5" />
          <circle cx="11.5" cy="6" r="2.5" />
          <path d="M1 14c0-2.21 1.57-4 3.5-4" />
          <path d="M15 14c0-2.21-1.57-4-3.5-4" />
          <path d="M8 14c0-2.21 1.57-4 3.5-4" />
          <path d="M8 14c0-2.21-1.57-4-3.5-4" />
        </svg>
        Travel Twin
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Search bar
// ─────────────────────────────────────────────────────────────────────────────

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-subtle">
          <circle cx="6.5" cy="6.5" r="4" />
          <path d="M11 11l3 3" />
        </svg>
      </div>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? "Search members…"}
        className="w-full bg-bg-card border border-border rounded-[var(--radius-card)] pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function FindYourCrewOverview() {
  const activities = useTripStore((s) => s.activities)
  const members = useTripStore((s) => s.members)
  const ratings = useTripStore((s) => s.ratings)
  const { matrix } = useCompatibilityMatrix()

  const isMobile = useIsMobile()
  const [mainView, setMainView] = useState<MainView>("groupies")
  const [query, setQuery] = useState("")
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const memberSummaries = useMemo(
    () => computeMemberSummaries(members, ratings, activities),
    [members, ratings, activities]
  )

  const topTwinsMap = useMemo(
    () => computeTopTwins(memberSummaries, activities),
    [memberSummaries, activities]
  )

  const orderedActivities = useMemo(
    () => matrix.map(s => activities.find(a => a.id === s.activity_id)).filter((a): a is Activity => !!a),
    [matrix, activities]
  )

  const ratedCount = matrix.filter(s => s.score > 0).length
  const topActivity = orderedActivities[0] ?? null
  const topCrewCount = topActivity
    ? Object.values(matrix.find(s => s.activity_id === topActivity.id)?.ratings ?? {})
        .filter(r => r === 'MUST' || r === 'MAYBE').length
    : 0

  // Category chips per member — populated once JAB-53 lands (category_id on activities + category lookup)
  const memberCategoryChipsMap = useMemo((): Map<string, MemberCategoryChip[]> => {
    return new Map(memberSummaries.map(ms => {
      // When categories exist: derive slugs from activity.category_id lookup
      // For now all category_id are null → empty array → placeholder rendered
      const chips: MemberCategoryChip[] = []
      return [ms.member.id, chips]
    }))
  }, [memberSummaries])

  // Filter helpers
  const q = query.toLowerCase().trim()
  const filteredMembers = q
    ? memberSummaries.filter(ms =>
        ms.member.name.toLowerCase().includes(q) ||
        (ms.member.email?.toLowerCase().includes(q) ?? false)
      )
    : memberSummaries

  const filteredForGroupies = filteredMembers
  const filteredForTwin = filteredMembers

  // Deduplicate Travel Twin pairs — only show one card per unique {A, B} pair.
  // Within a filtered list, the first member encountered "owns" the pair card.
  // Searching for "Priya" shows her card even if the full list would show Alex's.
  const dedupedForTwin = useMemo(() => {
    const seen = new Set<string>()
    return filteredForTwin.filter(ms => {
      const twin = (topTwinsMap.get(ms.member.id) ?? [])[0]
      if (!twin) return true
      const key = [ms.member.id, twin.member.id].sort().join('|')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [filteredForTwin, topTwinsMap])

  // Modal data
  const selectedSummary = selectedMemberId
    ? memberSummaries.find(ms => ms.member.id === selectedMemberId) ?? null
    : null
  const selectedMemberRatings = useMemo(() => {
    if (!selectedMemberId) return new Map<string, Rating>()
    return new Map(
      ratings
        .filter(r => r.user_id === selectedMemberId)
        .map(r => [r.activity_id, r.rating])
    )
  }, [selectedMemberId, ratings])

  if (activities.length === 0) {
    return (
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-14 flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-text-primary">No activities yet</p>
        <p className="text-xs text-text-muted max-w-xs">Add activities to the trip — then come back to see who's going where.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-5 lg:items-start">
        {/* Left: list */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <SearchBar value={query} onChange={setQuery} />
          <ViewToggle view={mainView} setView={(v) => { setMainView(v); setQuery("") }} />

          {mainView === "groupies" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[7px]">
              {filteredForGroupies.length === 0 ? (
                <p className="text-sm text-text-subtle text-center py-8 sm:col-span-2">No members match.</p>
              ) : (
                filteredForGroupies.map(ms => {
                  const twins = topTwinsMap.get(ms.member.id) ?? []
                  const twinPreviews = twins.slice(0, 3).map(t => ({
                    member: t.member,
                    colorIndex: t.colorIndex,
                    sharedMust: t.sharedMusts[0] ?? null,
                  }))
                  return (
                    <GroupiesMemberCard
                      key={ms.member.id}
                      member={ms.member}
                      colorIndex={ms.colorIndex}
                      musts={ms.musts}
                      wants={ms.wants}
                      activityCount={activities.length}
                      memberCategoryChips={memberCategoryChipsMap.get(ms.member.id) ?? []}
                      topTwins={twinPreviews}
                      onClick={() => setSelectedMemberId(ms.member.id)}
                    />
                  )
                })
              )}
            </div>
          )}

          {mainView === "travelTwin" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[7px]">
              {dedupedForTwin.length === 0 ? (
                <p className="text-sm text-text-subtle text-center py-8 sm:col-span-2">No members match.</p>
              ) : (
                dedupedForTwin.map(ms => {
                  const twins = topTwinsMap.get(ms.member.id) ?? []
                  const topTwin = twins[0] ?? null
                  const alsoClose = twins.slice(1, 4).map(t => ({ member: t.member, colorIndex: t.colorIndex }))
                  return (
                    <TravelTwinCard
                      key={ms.member.id}
                      member={ms.member}
                      memberColorIndex={ms.colorIndex}
                      memberMusts={ms.musts}
                      memberWants={ms.wants}
                      activityCount={activities.length}
                      topTwin={topTwin}
                      alsoCloseTwins={alsoClose}
                      onClick={() => setSelectedMemberId(ms.member.id)}
                    />
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Right: panel (desktop only) */}
        <aside className="hidden lg:block w-[360px] shrink-0 sticky top-20">
          {selectedSummary ? (
            mainView === "travelTwin" ? (
              <TwinComparisonPanel
                key={selectedMemberId}
                variant="panel"
                memberSummary={selectedSummary}
                twin={(topTwinsMap.get(selectedMemberId!) ?? [])[0] ?? null}
                ratings={ratings}
                activities={activities}
                onClose={() => setSelectedMemberId(null)}
              />
            ) : (
              <MemberDetailModal
                key={selectedMemberId}
                variant="panel"
                open={true}
                member={selectedSummary.member}
                musts={selectedSummary.musts}
                wants={selectedSummary.wants}
                activities={activities}
                memberRatings={selectedMemberRatings}
                onClose={() => setSelectedMemberId(null)}
              />
            )
          ) : (
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-10 flex flex-col items-center justify-center text-center gap-1.5">
              <p className="text-sm font-medium text-text-muted">
                {mainView === "travelTwin" ? "Select a pair" : "Select a member"}
              </p>
              <p className="text-xs text-text-subtle">
                {mainView === "travelTwin" ? "See shared picks and divergences" : "See their ratings and travel twin"}
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile modal */}
      {selectedSummary && isMobile && (
        mainView === "travelTwin" ? (
          <TwinComparisonPanel
            variant="modal"
            memberSummary={selectedSummary}
            twin={(topTwinsMap.get(selectedMemberId!) ?? [])[0] ?? null}
            ratings={ratings}
            activities={activities}
            onClose={() => setSelectedMemberId(null)}
          />
        ) : (
          <MemberDetailModal
            variant="modal"
            open={selectedMemberId !== null}
            member={selectedSummary.member}
            musts={selectedSummary.musts}
            wants={selectedSummary.wants}
            activities={activities}
            memberRatings={selectedMemberRatings}
            onClose={() => setSelectedMemberId(null)}
          />
        )
      )}
    </>
  )
}
