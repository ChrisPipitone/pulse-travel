# Pulse — UI Design System

## Theming Architecture

- CSS custom properties per theme (all colors as vars)
- `next-themes` for runtime switching
- Tailwind configured to consume CSS vars
- Swap = one class change, zero component rewrites

## Active Theme: `modern` (Option 3 — Vibrant & Modern)

## Defined Themes

### `modern` — Vibrant & Modern (DEFAULT)

```css
--bg:           #F5F4F0
--bg-card:      #FFFFFF
--text-primary: #1A1916
--text-muted:   #8B8779
--text-subtle:  #A8A49A
--accent:       #FF5C35  /* coral */
--accent-2:     #00C9A7  /* mint */
--border:       #F0EFE9

/* Rating badges */
--must-bg:      #FF5C35  --must-text: #FFFFFF
--maybe-bg:     #FFF8D6  --maybe-text: #8a6e00
--skip-bg:      #E8E6E0  --skip-text:  #888888

/* Matrix cells */
--cell-must:    #FF5C35
--cell-maybe:   #FFF8D6
--cell-skip:    #D9D6CE
--cell-empty:   #ECEAE4

/* Radius */
--radius-card:  16px
--radius-badge: 20px  /* pill */
--radius-btn:   20px
--radius-cell:  8px
```

Typography: `DM Sans` (all weights). Body size 15px. Generous line-height.

---

### `editorial` — Warm & Editorial (Option 1)

```css
--bg:           #FAFAF8
--bg-card:      #FFFFFF
--text-primary: #2C1810
--text-muted:   #8B7355
--text-subtle:  #A89178
--accent:       #C4603A  /* terracotta */
--accent-2:     #D4A96A  /* sandy */
--border:       #F2EDE8

/* Rating badges */
--must-bg:      #C4603A  --must-text: #FFFFFF
--maybe-bg:     #FFF3C4  --maybe-text: #7A5C00
--skip-bg:      #E8E2D9  --skip-text:  #8B7355

/* Matrix cells */
--cell-must:    #C4603A
--cell-maybe:   #EFC98A
--cell-skip:    #F0EBE3
--cell-empty:   #F7F4F0

/* Radius */
--radius-card:  8px
--radius-badge: 4px
--radius-btn:   8px
--radius-cell:  4px
```

Typography: `Playfair Display` (headings) + `Inter` (body). Body size 14px.

---

## Design Principles

- Non-technical users first: clear labels, big tap targets, no jargon
- Matrix/visualizer is the hero — give it space and contrast
- MUST/MAYBE/SKIP always color-coded consistently within theme
- Mobile-first layout, responsive breakpoints
- Animations: subtle only — no distracting motion
- Avoid: purple gradients, generic card grids, AI-sloppy defaults

## Component Library: Custom + NativeWind

No third-party component library. Custom primitives with dual-file pattern.

**Why not Gluestack UI v2:** Requires react-native-web patch for React 19 — fragile on our stack.
**Why not shadcn/ui:** HTML-only, full component rewrite for RN.

Each primitive ships as:

- `Component.tsx` — web (Tailwind, HTML elements)
- `Component.native.tsx` — RN (NativeWind, RN primitives)

Same props, same class names, same import path. Only HTML elements differ.

## Styling Stack

- Web: Tailwind CSS v4 (CSS vars for theming)
- RN (future): NativeWind (same Tailwind class names)
- Theme switching: `next-themes` (web) — CSS custom properties per theme

## Color Mode

Light-only for now. CSS var architecture makes dark variants trivial to add later.
