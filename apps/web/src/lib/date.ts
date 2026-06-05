export function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// Relative expiry label for an ISO timestamp (e.g. invite_code_expires_at).
// Unlike fmtDate, this accepts a full timestamptz, not a date-only string.
export function fmtExpiry(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'Expired'
  const days = Math.ceil(ms / 86_400_000)
  if (days === 1) return 'Expires in 1 day'
  if (days <= 60) return `Expires in ${days} days`
  return `Expires ${new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export function fmtDateRange(from?: string | null, to?: string | null): string | null {
  if (from && to) return `${fmtDate(from)} – ${fmtDate(to)}`
  if (from) return `From ${fmtDate(from)}`
  if (to) return `Until ${fmtDate(to)}`
  return null
}
