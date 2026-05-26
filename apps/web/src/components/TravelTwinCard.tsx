"use client"

import type { Member, Activity } from '@pulse/types'
import { MemberAvatar } from '@/components/MemberAvatar'

export interface TwinDetail {
  member: Member
  colorIndex: number
  musts: number
  wants: number
  score: number
  sharedMusts: Activity[]
}

export interface TravelTwinCardProps {
  member: Member
  memberColorIndex: number
  memberMusts: number
  memberWants: number
  activityCount: number
  topTwin: TwinDetail | null
  alsoCloseTwins: { member: Member; colorIndex: number }[]
  onClick?: () => void
}

function firstName(m: Member) {
  return m.name.split(' ')[0]
}

function compatLabel(score: number) {
  if (score >= 0.6) return 'Strong match'
  if (score >= 0.4) return 'Good match'
  if (score >= 0.2) return 'Some overlap'
  return 'Explore together'
}

export function TravelTwinCard({
  member, memberColorIndex: _memberColorIndex, memberMusts: _memberMusts, memberWants: _memberWants, activityCount: _activityCount,
  topTwin, alsoCloseTwins, onClick
}: TravelTwinCardProps) {
  if (!topTwin) {
    return (
      <div className="bg-bg-card rounded-[14px] border border-border overflow-hidden">
        <div className="flex items-center gap-[11px] px-[14px] py-[13px]">
          <MemberAvatar name={member.name} avatarUrl={member.avatar_url} size="2xl" className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold">{member.name}</div>
            <div className="text-[11px] text-text-subtle mt-0.5 italic">Rate more activities to find your twin</div>
          </div>
        </div>
      </div>
    )
  }

  const showPicks = topTwin.sharedMusts.slice(0, 3)
  const morePicks = topTwin.sharedMusts.length - showPicks.length

  return (
    <div
      onClick={onClick}
      className="bg-bg-card rounded-[14px] border border-border overflow-hidden cursor-pointer active:bg-[#FAFAF8] transition-colors"
    >
      <div className="flex items-center px-4 pt-[14px] pb-[10px]">
        <MemberAvatar name={member.name} avatarUrl={member.avatar_url} size="2xl" className="flex-shrink-0" />

        <div className="flex-1 flex flex-col items-center gap-[3px] px-2 min-w-0">
          <div className="flex items-center gap-[5px] text-[11px] font-bold">
            <span className="truncate max-w-[60px]">{firstName(member)}</span>
            <span className="font-normal text-text-muted text-[10px] flex-shrink-0">↔</span>
            <span className="truncate max-w-[60px]">{firstName(topTwin.member)}</span>
          </div>
          <div className="text-[10px] font-bold text-accent-2 bg-[rgba(0,201,167,0.1)] rounded-[8px] px-[6px] py-px whitespace-nowrap">
            {compatLabel(topTwin.score)}
          </div>
          <div
            className="w-full h-[1.5px] rounded-[1px] mt-[3px] opacity-35"
            style={{ background: 'linear-gradient(90deg, #FF5C35, #00C9A7)' }}
          />
        </div>

        <MemberAvatar name={topTwin.member.name} avatarUrl={topTwin.member.avatar_url} size="2xl" className="flex-shrink-0" />
      </div>

      <div className="px-[14px] pb-[10px]">
        <div className="text-[9px] font-bold uppercase tracking-[0.07em] text-text-subtle mb-[5px]">
          Both going to
        </div>
        <div className="flex flex-wrap gap-1">
          {showPicks.length > 0 ? (
            <>
              {showPicks.map(a => (
                <div key={a.id} className="text-[11px] font-semibold text-must bg-[rgba(255,92,53,0.08)] border border-[rgba(255,92,53,0.15)] rounded-[20px] px-[9px] py-[3px] flex items-center gap-[3px]">
                  <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,8 7,12 13,4" />
                  </svg>
                  {a.name}
                </div>
              ))}
              {morePicks > 0 && (
                <div className="text-[11px] text-text-subtle bg-bg border border-border rounded-[20px] px-[9px] py-[3px]">
                  +{morePicks} more
                </div>
              )}
            </>
          ) : (
            <span className="text-[11px] text-text-subtle italic">No shared must-haves yet</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-[7px] px-[14px] pb-3 pt-[7px] border-t border-border bg-[#FAFAF8]">
        <span className="text-[10px] text-text-subtle flex-shrink-0">Also close with</span>
        <div className="flex items-center flex-shrink-0">
          {alsoCloseTwins.slice(0, 3).map((t, i) => (
            <MemberAvatar key={t.member.id} name={t.member.name} avatarUrl={t.member.avatar_url} size="sm" overlap={i > 0} />
          ))}
        </div>
        {alsoCloseTwins.length > 0 && (
          <span className="text-[10px] text-text-subtle truncate">
            {alsoCloseTwins.slice(0, 2).map(t => firstName(t.member)).join(', ')}
          </span>
        )}
      </div>
    </div>
  )
}
