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

export function memberPalette(index: number) {
  return PALETTE[index % PALETTE.length]
}

export function buildColorMap(members: { id: string }[]): Map<string, number> {
  return new Map(members.map((m, i) => [m.id, i]))
}
