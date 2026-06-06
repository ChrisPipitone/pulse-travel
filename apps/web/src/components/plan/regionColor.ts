// Stable color per region for calendar chips/bands. Regions are free-text per trip,
// so assign palette slots by first-seen order (passed in) rather than a fixed map.
const PALETTE = [
  "#d97757", // terracotta
  "#5b8a72", // sage
  "#6b7fb3", // slate blue
  "#b3776b", // clay
  "#7a8b5a", // olive
  "#8a6ba8", // plum
];

export function buildRegionColors(regions: (string | null)[]): Map<string, string> {
  const map = new Map<string, string>();
  let i = 0;
  for (const r of regions) {
    if (!r || map.has(r)) continue;
    map.set(r, PALETTE[i % PALETTE.length]);
    i += 1;
  }
  return map;
}
