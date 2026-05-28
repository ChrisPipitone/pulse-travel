export function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function fmtDateRange(from?: string | null, to?: string | null): string | null {
  if (from && to) return `${fmtDate(from)} – ${fmtDate(to)}`
  if (from) return `From ${fmtDate(from)}`
  if (to) return `Until ${fmtDate(to)}`
  return null
}
