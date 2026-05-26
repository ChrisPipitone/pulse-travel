"use client"

import type { Member, Activity } from '@pulse/types'
import { MemberAvatar } from '@/components/MemberAvatar'

export interface TwinPreview {
  member: Member
  colorIndex: number
  sharedMust: Activity | null
}

export interface MemberCategoryChip {
  slug: string
  level: 'must' | 'want'
}

export interface GroupiesMemberCardProps {
  member: Member
  colorIndex: number
  musts: number
  wants: number
  activityCount: number
  memberCategoryChips: MemberCategoryChip[]
  topTwins: TwinPreview[]
  onClick: () => void
}

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  culture: {
    bg: 'rgba(123,104,238,.1)', color: '#7B68EE', label: 'Culture',
    icon: (
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="4" y1="13" x2="4" y2="6" /><line x1="8" y1="13" x2="8" y2="6" /><line x1="12" y1="13" x2="12" y2="6" />
        <path d="M2,6 L14,6 M1,4 L8,1 L15,4" /><line x1="2" y1="13" x2="14" y2="13" />
      </svg>
    ),
  },
  food: {
    bg: 'rgba(255,149,0,.1)', color: '#E08800', label: 'Food',
    icon: (
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M5,1 L5,6 Q5,9 8,9 Q11,9 11,6 L11,1" /><line x1="8" y1="9" x2="8" y2="14" /><line x1="3" y1="4" x2="13" y2="4" />
      </svg>
    ),
  },
  coast: {
    bg: 'rgba(52,170,220,.1)', color: '#1A8DC4', label: 'Coast',
    icon: (
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M1,10 Q3,7 5,10 Q7,13 9,10 Q11,7 13,10" />
        <path d="M1,6 Q3,3 5,6 Q7,9 9,6 Q11,3 13,6" />
      </svg>
    ),
  },
  nature: {
    bg: 'rgba(76,217,100,.1)', color: '#28A248', label: 'Nature',
    icon: (
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M8,14 L8,8 M2,10 Q2,3 8,8 Q14,3 14,10 Q12,14 8,14" />
      </svg>
    ),
  },
  thrill: {
    bg: 'rgba(255,92,53,.1)', color: '#E04020', label: 'Thrill',
    icon: (
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9,1 L4,9 L7.5,9 L7,15 L12,7 L8.5,7 Z" />
      </svg>
    ),
  },
  arts: {
    bg: 'rgba(236,72,153,.1)', color: '#D0187A', label: 'Arts',
    icon: (
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M2,14 Q4,8 8,4 Q10,2 13,2 Q14,5 12,7 Q8,10 2,14 Z" />
        <circle cx="11" cy="5" r="1" fill="currentColor" />
      </svg>
    ),
  },
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function GroupiesMemberCard({
  member, colorIndex: _colorIndex, musts: _musts, wants: _wants, activityCount: _activityCount, memberCategoryChips, topTwins, onClick
}: GroupiesMemberCardProps) {
  const [firstName, ...rest] = member.name.trim().split(' ')
  const lastName = rest.join(' ')
  const topTwin = topTwins[0] ?? null

  const showChips = memberCategoryChips.slice(0, 4)
  const moreCount = memberCategoryChips.length - showChips.length
  const hasCategories = memberCategoryChips.length > 0

  return (
    <div
      onClick={onClick}
      className="bg-bg-card rounded-[14px] border border-border overflow-hidden cursor-pointer active:bg-[#FAFAF8] transition-colors"
    >
      <div className="flex items-center gap-[11px] px-[14px] pt-[13px] pb-[11px]">
        <MemberAvatar name={member.name} avatarUrl={member.avatar_url} size="2xl" className="flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold leading-tight">
            {firstName}
            {lastName && <span className="font-normal text-text-muted"> {lastName}</span>}
          </div>

          {/* Category chips — A1-Icons */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {hasCategories ? (
              <>
                {showChips.map(chip => {
                  const cfg = CATEGORY_CONFIG[chip.slug]
                  if (!cfg) return null
                  return (
                    <div
                      key={chip.slug}
                      className={`flex items-center gap-[4px] px-[8px] py-[3px] rounded-[20px] text-[10px] font-semibold whitespace-nowrap flex-shrink-0 ${chip.level === 'want' ? 'opacity-60' : ''}`}
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      {cfg.label}
                    </div>
                  )
                })}
                {moreCount > 0 && (
                  <div className="flex-shrink-0 text-[10px] text-text-subtle bg-bg border border-border rounded-[20px] px-2 py-[3px] whitespace-nowrap">
                    +{moreCount}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-[5px] text-[10px] text-text-subtle border border-dashed border-border rounded-[20px] px-2 py-[3px] whitespace-nowrap">
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="8" cy="8" r="6" /><line x1="8" y1="5" x2="8" y2="8" /><circle cx="8" cy="11" r="0.5" fill="currentColor" />
                </svg>
                No categories yet
              </div>
            )}
          </div>
        </div>

        <svg className="flex-shrink-0 text-text-subtle" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="6,4 10,8 6,12" />
        </svg>
      </div>

      {/* Vibes strip */}
      <div className="flex items-center gap-2 px-[14px] pb-[11px] pt-2 border-t border-border bg-[#FAFAF8] overflow-hidden">
        <span className="text-[10px] text-text-subtle font-medium whitespace-nowrap flex-shrink-0">Vibes with</span>
        <div className="flex items-center flex-shrink-0">
          {topTwins.slice(0, 3).map((t, i) => (
            <MemberAvatar key={t.member.id} name={t.member.name} avatarUrl={t.member.avatar_url} size="sm" overlap={i > 0} />
          ))}
        </div>
        {topTwin?.sharedMust ? (
          <div className="flex items-center gap-1 flex-shrink-0 max-w-[160px] bg-[rgba(255,92,53,0.08)] border border-[rgba(255,92,53,0.14)] rounded-[10px] px-2 py-px overflow-hidden">
            <span className="text-[10px] font-bold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{topTwin.sharedMust.name}</span>
          </div>
        ) : topTwins.length > 0 ? (
          <span className="text-[10px] text-text-subtle flex-shrink-0">Rate more to see</span>
        ) : null}
      </div>
    </div>
  )
}
