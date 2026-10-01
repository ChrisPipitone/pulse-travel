# Pulse — HTML Prototyping

You are running a UI prototyping session for the Pulse app. Prototypes are standalone HTML files — no build step, no framework — used to explore component designs before implementing them in React.

---

## How this works

**Prototypes live at:** `docs/private/prototypes/` (gitignored, local only)

**Naming convention:** `{component}-v{N}.html`
- Find the highest existing version for the component, increment by 1
- Example: if `crew-v10.html` exists, next is `crew-v11.html`
- If brand new component, start at `v1`

Each file is self-contained: inline CSS, vanilla JS, no external deps except system fonts.

---

## Design tokens to match the app

Always use these CSS custom properties so prototypes feel like the real app:

```css
:root {
  --bg:     #F5F4F0;
  --card:   #FFFFFF;
  --text:   #1A1916;
  --muted:  #8B8779;
  --subtle: #A8A49A;
  --accent: #FF5C35;
  --border: #F0EFE9;
  --must:   #FF5C35;   /* Can't miss */
  --want:   #00C9A7;   /* Want to */
  /* maybe: rgba(255,229,102,.7) / #7A6200 text */
  /* skip:  #EDECEA / #6B6864 text */
  --r:    16px;   /* card radius */
  --rbtn: 20px;   /* button radius */
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg); color: var(--text);
  padding: 40px 24px 100px;
  -webkit-font-smoothing: antialiased;
}
```

---

## Established component patterns

These patterns are already settled — use them consistently, don't redesign them:

### Avatars
```css
.avb { border-radius:50%; border:1.5px solid var(--card); display:flex; align-items:center; justify-content:center; font-weight:800; flex-shrink:0; color:#fff; }
.cav { width:24px; height:24px; font-size:9px; }   /* in cards */
.mav { width:22px; height:22px; font-size:8px; }   /* in modals */
.avr > .cav { margin-left:-6px; }
.avr > .cav:first-child { margin-left:0; }
.you { border:2px solid var(--accent) !important; box-shadow:0 0 0 1.5px var(--card); }
@media (max-width:440px) { .cav { width:20px; height:20px; } }
```

### Rating buttons (reusable component)
```css
.rc { flex:1; padding:10px 4px; border-radius:11px; border:1.5px solid var(--border); background:transparent; font-size:11px; font-weight:600; color:var(--muted); cursor:pointer; text-align:center; transition:background .12s, border-color .12s, color .12s; }
.rc.must-r.active  { background:rgba(255,92,53,.13);   border-color:var(--must); color:var(--must);  font-weight:700; }
.rc.want-r.active  { background:rgba(0,201,167,.13);   border-color:var(--want); color:var(--want);  font-weight:700; }
.rc.maybe-r.active { background:rgba(255,229,102,.45); border-color:#B8960A;     color:#7A6200;      font-weight:700; }
.rc.skip-r.active  { background:#EDECEA;               border-color:#9B9792;     color:#6B6864;      font-weight:700; }
```

### Status pills (per-user rating state)
```css
.sp-going  { background:var(--must); color:#fff; }         /* MUST */
.sp-likely { background:var(--want); color:#fff; }         /* WANT */
.sp-maybe  { background:rgba(255,229,102,.7); color:#7A6200; } /* MAYBE */
.sp-rate   { background:transparent; color:var(--accent); border:1.5px solid var(--accent); } /* unrated */
```

### Card left stripe
```css
.stripe { width:4px; flex-shrink:0; }
.s-must  { background:var(--must); }
.s-want  { background:var(--want); }
.s-maybe { background:#FFE566; }
.s-none  { background:#E8E6E0; }
```

### Modal structure
```css
.overlay { display:none; position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.42); backdrop-filter:blur(3px); align-items:flex-end; justify-content:center; }
.overlay.open { display:flex; }
@media (min-width:640px) { .overlay { align-items:center; padding:20px; } }
.modal { background:var(--card); border-radius:var(--r) var(--r) 0 0; width:100%; max-width:520px; max-height:92vh; overflow-y:auto; display:flex; flex-direction:column; }
@media (min-width:640px) { .modal { border-radius:var(--r); max-height:86vh; } }
.mhdr { padding:20px 22px 16px; border-bottom:1px solid var(--border); position:sticky; top:0; background:var(--card); z-index:1; }
.mbody { padding:20px 22px 8px; display:flex; flex-direction:column; gap:14px; flex:1; }
.mactions { border-top:1px solid var(--border); padding:16px 22px 24px; display:flex; flex-direction:column; gap:10px; }
```

### Location display — always use pin icon
```html
<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:.6;flex-shrink:0">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
  <circle cx="12" cy="9" r="2.5"/>
</svg>
```

### No score bars / enthusiasm bars
Do not use score bars or enthusiasm bars in crew cards or crew modals. They've been explicitly removed.

### Modal JS boilerplate
```js
function openModal(id)  { document.getElementById(id).classList.add('open');    document.body.style.overflow='hidden' }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow='' }
function overlayClick(e,id) { if(e.target===e.currentTarget) closeModal(id) }
function selectRating(btn) {
  const g = btn.closest('.rate-group')
  const was = btn.classList.contains('active')
  g.querySelectorAll('.rc').forEach(b => b.classList.remove('active'))
  if (!was) btn.classList.add('active')
}
document.addEventListener('keydown', e => {
  if (e.key==='Escape') document.querySelectorAll('.overlay.open').forEach(el => {
    el.classList.remove('open'); document.body.style.overflow=''
  })
})
```

---

## Process

### Step 1 — Understand the brief
- What component or feature is being prototyped?
- What variants or states need to be shown?
- Are there reference files to read? (prior version, existing component, figma description)
- Read prior prototype versions if they exist.

### Step 2 — Build the prototype
- Create `docs/private/prototypes/{component}-v{N}.html`
- Show all relevant states (e.g. MUST / WANT / MAYBE / Unrated for crew cards)
- Label each variant clearly with a `.var-badge` or section label
- Make modals openable by clicking cards
- Mobile-first: test at ≤440px mental model

### Step 3 — Show it, get feedback
- Tell the user the file path and which states/variants are shown
- Ask specific questions if a decision point is unclear
- Do not implement in React until the user explicitly says to

### Step 4 — Iterate
- Each feedback round = new version file (v{N+1})
- Carry forward settled patterns, only change what was called out
- When user says "done" or "implement this" → move to Step 5

### Step 5 — Implement
- The chosen variant becomes the React component
- Files go in `apps/web/src/components/`
- Use real store data (`useTripStore`, `useSession`, `useRateActivity`)
- Match Tailwind classes to the prototype's inline CSS
- Dev-only tabs (`process.env.NODE_ENV === 'development'`) for alt variants

---

## What the user means when they say...

- **"show me variants"** — build 2–4 labeled versions of the same thing in one file
- **"polish it"** — same design, tighten spacing/type/color, nothing structural
- **"make it more intuitive"** — reduce reading required, increase visual signal
- **"remove the bar thing"** — score bars / enthusiasm bars / any horizontal fill bar
- **"implement both"** — D2 (or whatever primary) goes on main tab, alt goes on dev-only tab
- **"commit everything conceptually"** — group commits by logical unit: prototypes, feat, docs

---

## Input: $ARGUMENTS

If the user passes arguments (e.g. `/prototype crew card MUST state`), use them as the component + focus for Step 1. If no arguments, ask: what component and what states/variants to show?
