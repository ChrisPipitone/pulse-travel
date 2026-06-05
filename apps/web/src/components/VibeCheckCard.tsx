'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@pulse/ui'
import { fmtDateRange } from '@/lib/date'
import { destinationEmoji } from '@/lib/destination'
import type { TripPreviewPublic } from '@pulse/services'

// Each dot: [clusteredLeft, clusteredTop, spreadDeltaX, spreadDeltaY, color, opacity, letter]
// Clustered positions define the grouped state. Spread deltas define the ungrouped starting offset.
// Animation: spread → cluster → hold → spread, repeating.
const DOTS = [
  // Group A — accent (beach crew)
  [8,   10,  12,  26, 'var(--accent)', 1.00, 'A'],
  [34,  28,  54, -23, 'var(--accent)', 0.78, 'B'],
  [60,  10,  88,  30, 'var(--accent)', 0.58, 'C'],
  // Group B — green (museum fans)
  [130, 10, -30,  26, '#22c55e', 1.00, 'D'],
  [156, 28,  22, -23, '#22c55e', 0.78, 'E'],
  // Group C — blue (both!)
  [224, 10, -34,  36, '#60a5fa', 1.00, 'F'],
  [250, 28,  14, -23, '#60a5fa', 0.78, 'G'],
] as const

const KEYFRAMES = `
  @keyframes drift1 { 0%,10%{transform:translate(12px,26px)}  45%,70%{transform:translate(0,0)} 90%,100%{transform:translate(12px,26px)} }
  @keyframes drift2 { 0%,10%{transform:translate(54px,-23px)} 45%,70%{transform:translate(0,0)} 90%,100%{transform:translate(54px,-23px)} }
  @keyframes drift3 { 0%,10%{transform:translate(88px,30px)}  45%,70%{transform:translate(0,0)} 90%,100%{transform:translate(88px,30px)} }
  @keyframes drift4 { 0%,10%{transform:translate(-30px,26px)} 45%,70%{transform:translate(0,0)} 90%,100%{transform:translate(-30px,26px)} }
  @keyframes drift5 { 0%,10%{transform:translate(22px,-23px)} 45%,70%{transform:translate(0,0)} 90%,100%{transform:translate(22px,-23px)} }
  @keyframes drift6 { 0%,10%{transform:translate(-34px,36px)} 45%,70%{transform:translate(0,0)} 90%,100%{transform:translate(-34px,36px)} }
  @keyframes drift7 { 0%,10%{transform:translate(14px,-23px)} 45%,70%{transform:translate(0,0)} 90%,100%{transform:translate(14px,-23px)} }
  @keyframes label-fade { 0%,35%,85%,100%{opacity:0} 52%,70%{opacity:1} }
`

const LABELS = [
  { text: 'Beach crew',  left: 8 },
  { text: 'Museum fans', left: 118 },
  { text: 'Both!',       left: 222 },
]

function CrewFormationAnimation() {
  return (
    <div className="flex flex-col gap-2 py-1">
      <style>{KEYFRAMES}</style>
      <div className="relative mx-auto" style={{ width: 296, height: 96 }}>
        {DOTS.map(([cl, ct, , , color, opacity, letter], i) => (
          <div
            key={i}
            className="absolute w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white select-none"
            style={{
              left: cl,
              top: ct,
              backgroundColor: color as string,
              opacity: opacity as number,
              animation: `drift${i + 1} 5s cubic-bezier(0.45,0,0.55,1) infinite`,
            }}
          >
            {letter}
          </div>
        ))}
        {LABELS.map((lbl, i) => (
          <div
            key={i}
            className="absolute text-[9px] font-semibold uppercase tracking-widest text-text-subtle whitespace-nowrap"
            style={{ left: lbl.left, top: 68, animation: 'label-fade 5s cubic-bezier(0.45,0,0.55,1) infinite' }}
          >
            {lbl.text}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-center text-text-muted">
        Pulse finds who wants what — automatically.
      </p>
    </div>
  )
}

type Props = {
  preview: TripPreviewPublic
  code: string
}

export function VibeCheckCard({ preview, code }: Props) {
  const router = useRouter()
  const dates = fmtDateRange(preview.start_date, preview.end_date)
  const emoji = destinationEmoji(preview.destination)

  const memberLabel = preview.member_count === 1 ? '1 person going' : `${preview.member_count} people going`
  const activityLabel =
    preview.activity_count > 0
      ? preview.activity_count === 1 ? '1 activity planned' : `${preview.activity_count} activities planned`
      : null

  return (
    <div className="w-full max-w-sm flex flex-col gap-6">
      <div className="text-center">
        <div className="text-4xl mb-3">{emoji}</div>
        <h1 className="text-2xl font-semibold text-text-primary">You&apos;re invited</h1>
        <p className="text-sm text-text-muted mt-1">See what the group is planning.</p>
      </div>

      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-5 flex flex-col gap-2">
        <p className="text-lg font-bold text-text-primary">{preview.name}</p>
        <p className="text-sm text-text-muted">
          {preview.destination}{dates && <> · {dates}</>}
        </p>
        <div className="flex gap-4 text-xs text-text-subtle pt-1">
          <span>{memberLabel}</span>
          {activityLabel && <span>{activityLabel}</span>}
        </div>
      </div>

      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-5 py-4">
        <CrewFormationAnimation />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs text-center text-text-muted">
          Rate activities and find your crew.
        </p>
        <Button
          onClick={() => router.push(`/login?returnTo=${encodeURIComponent(`/join?code=${code}`)}`)}
          className="w-full"
        >
          Join the Crew
        </Button>
      </div>
    </div>
  )
}
