"use client"

import { MemberAvatar } from '@/components/MemberAvatar'

// Avatar pixel diameters — must match SIZES in MemberAvatar.tsx
const AVATAR_PX = { xl: 34, "2xl": 38, "3xl": 56 } as const

const GAP = 4      // space between avatar edge and ring
const STROKE = 4   // ring stroke width

export interface MemberEnthusiasmRingProps {
  name: string
  avatarUrl?: string | null
  size: keyof typeof AVATAR_PX
  /** MUST count */
  musts: number
  /** MAYBE count (field historically named `wants`) */
  wants: number
  activityCount: number
  className?: string
}

/**
 * Avatar wrapped in an enthusiasm ring: MUST arc + MAYBE arc as proportions of
 * total activities, gray track for the remainder (unrated + SKIP).
 */
export function MemberEnthusiasmRing({
  name, avatarUrl, size, musts, wants, activityCount, className = "",
}: MemberEnthusiasmRingProps) {
  const avatarPx = AVATAR_PX[size]
  const box = avatarPx + 2 * (GAP + STROKE)
  const center = box / 2
  const r = avatarPx / 2 + GAP + STROKE / 2
  const C = 2 * Math.PI * r

  const mustFrac = activityCount > 0 ? Math.min(musts / activityCount, 1) : 0
  const maybeFrac = activityCount > 0 ? Math.min(wants / activityCount, 1 - mustFrac) : 0
  const mustLen = mustFrac * C
  const maybeLen = maybeFrac * C

  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: box, height: box }}>
      <svg
        className="absolute inset-0 -rotate-90"
        width={box}
        height={box}
        viewBox={`0 0 ${box} ${box}`}
        fill="none"
        aria-hidden="true"
      >
        <circle cx={center} cy={center} r={r} stroke="var(--border)" strokeWidth={STROKE} />
        {maybeLen > 0 && (
          <circle
            cx={center} cy={center} r={r}
            stroke="var(--maybe-bg)" strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={`${maybeLen} ${C}`}
            strokeDashoffset={-mustLen}
          />
        )}
        {mustLen > 0 && (
          <circle
            cx={center} cy={center} r={r}
            stroke="var(--must-bg)" strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={`${mustLen} ${C}`}
          />
        )}
      </svg>
      <MemberAvatar name={name} avatarUrl={avatarUrl} size={size} />
    </span>
  )
}

/** Key explaining the enthusiasm-ring arcs. */
export function EnthusiasmRingLegend({ className = "" }: { className?: string }) {
  const items: [string, string][] = [
    ['var(--must-bg)', 'Must'],
    ['var(--maybe-bg)', 'Maybe'],
    ['var(--border)', 'Not rated'],
  ]
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {items.map(([color, label]) => (
        <span key={label} className="flex items-center gap-1 text-[10px] text-text-subtle">
          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  )
}
