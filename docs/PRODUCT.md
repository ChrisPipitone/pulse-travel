# Pulse — Product Model & Strategy

> Single source of truth for rating vocabulary, crew model, positioning, and product decisions.
> Implementation details: `docs/RATING_MATRIX.md` (scoring/data flow), `docs/CREW_VIEW_DESIGN.md` (UI design).
> Brand voice and origin story: `docs/BRANDING.md`. Competitive detail: `docs/COMPETITIVE.md`.

---

## The Problem

Group vacations are hard to coordinate. Different arrival/departure dates, overlapping interests, shared fixed events (a wedding, a reunion). No tool answers the only question that matters: *who should do what, and with whom?*

---

## Rating Vocabulary

Three values, deliberately chosen. Not stars, not thumbs — each captures a commitment level that matters for crew formation.

| Rating | Meaning | Crew membership |
|---|---|---|
| **MUST** | Non-negotiable — I'll be disappointed if we skip this | Definite crew — always in |
| **MAYBE** | Flexible — I'll join if timing works, no loss if not | Available capacity — not driving |
| **SKIP** | Not interested | Out — excluded from crew |
| *(unrated)* | No signal yet | Not counted |

**Why MAYBE ≠ weak MUST:** MAYBE is a socially safe non-commitment. It avoids the politeness barrier of Yes/No polls — people can signal "I'm not against it" without defining their trip around it. MAYBE is available capacity, not diluted enthusiasm.

**Why 3 values, not 4:** The original 4-value model (MUST/WANT/MAYBE/SKIP) had WANT and MAYBE too close in meaning for non-technical users. Dropped WANT in JAB-82. MUST/MAYBE/SKIP maps cleanly to: "I need it" / "I'll come along" / "I'm out."

---

## Crew Model

**The crew for an activity = everyone who rated it MUST.**

MAYBE members are available capacity — if timing works, great; if not, no friction. They were never defining the activity. This is not a simplification; it's the correct model for group trip planning where the goal is to find *who you can count on*, not who might possibly show up.

### Potential crew vs actual crew

> **Find Your Crew shows the *potential* crew — everyone who'd go under ideal conditions. The itinerary is where the *actual* crew per scheduled instance gets resolved.**

These are two separate problems solved by two separate features:
- **Find Your Crew** → who would go (potential)
- **Itinerary** → who goes when (actual, after timing conflicts resolved)

A group of 4 who all MUST an activity may split into 2+2 at scheduling time if other MUSTs conflict. That is expected and correct behaviour — the potential crew was accurate, the actual instances just had to account for constraints. See `docs/ITINERARY_DESIGN.md` for the full four-layer model.

---

## Compatibility Model

**Jaccard similarity** measures how much two members' MUST sets overlap:

`similarity = |shared MUST activities| / |union of MUST activities|`

Example: Sara MUSTs 5 activities, Marco MUSTs 5, they share 3 → `3/7 = 43%`

MAYBE is excluded from Jaccard — it's flexible capacity, not a signal of what someone needs. Including it would dilute compatibility scores with noise.

**Group score per activity:** `MUST×3 + MAYBE×1` (SKIP=0). Used for sort order in activity views. MAYBE gets weight 1 because it contributes available capacity even if not crew-defining.

---

## The Five Views

All five answered a different question about the same data. The matrix tab was retired — views now live in dedicated UI surfaces.

| View | Question answered |
|---|---|
| **Activity list** | What's in the trip? Who rated what? |
| **Find your crew** | For each activity, who's my crew? |
| **Travel Twin** | Which members have the most overlapping MUSTs? |
| **Timeline** | When are we doing what, and with whom? |
| *(By activity / By member / Who's in)* | Retired to prototypes — `apps/web/src/prototypes/` |

---

## Defensible Lane

- **Frienzy / Wanderlog = logistics coordination** — after decisions are made
- **Pulse = decision intelligence** — before logistics start
- The gap nobody owns: "who should do what together?" Stay in it.

One-sentence positioning: *Pulse answers "who should do what together" before you plan anything — no other tool does that.*

TripRelay tells you *where* to go. Pulse tells you *who to go with*. These are not the same product.

---

## What Makes Us Distinct

- **MUST/MAYBE/SKIP vocabulary** — captures commitment level, not just preference
- **Find Your Crew** — potential crew per activity, MUST = definite crew, MAYBE = available capacity; nobody else has this
- **Travel Twin** — pairwise Jaccard compatibility, immediately legible
- **Per-member date ranges** — crew is real (overlapping presence), not theoretical
- **Potential crew → actual crew pipeline** — Find Your Crew surfaces who would go; itinerary resolves who actually goes given timing

---

## What NOT To Build (stay out of these lanes)

- Expense tracking → Splitwise owns it
- Real-time chat → WhatsApp group already open
- Booking engine → premature; ***REMOVED*** play is post-traction
- AI itinerary generation from docs/photos → Frienzy's lane, feature not differentiator

---

## Planned Features That Deepen the Core (prioritised)

1. **Overlap calendar** — days × members grid, activity crew dots overlaid on days everyone is present. Turns potential crew into real crew without manual scheduling. Highest leverage, nothing like it exists.
2. **Gap detector** — surface conflicts early: "Sara's Rome MUSTs need 3 days but her crew only overlaps for 2."
3. **Crew card (shareable)** — per-activity card with MUST/MAYBE avatars + overlap dates, one-tap share to WhatsApp. Every share is an ad.
4. **Sub-trip clustering** — given ratings + dates, suggest "these 4 activities cluster in Rome on days 3–5 with 80% crew overlap." MVP = manual; v2 = smart.

---

## Launch Identity Checklist

Every v1 release must ship all of these. If any are missing, the identity is not established:

- [ ] MUST/MAYBE/SKIP rating on all activities
- [ ] Find Your Crew view (with MUST crew + MAYBE capacity visible)
- [ ] Travel Twin view
- [ ] Per-member arrival/departure dates
- [ ] Share-link onboarding under 60 seconds
- [ ] Overlap calendar

---

## Out of Scope (MVP)
- No booking integration, no payments, no maps, no real-time chat

## Monetization (Ranked by effort/return)
1. *****REMOVED*** links** — zero friction, natural fit, commission on clicks/bookings
2. **Freemium** — free: 1 trip, 5 members. Paid: unlimited, export, advanced views
3. **One-time trip purchase** — ~$5–15 per trip, no subscription fatigue
4. **Subscription** — better for travel agencies than consumers
5. **Ads** — avoid unless massive traffic

## Future Expansion
- ***REMOVED*** links (***REMOVED***, ***REMOVED***, Booking.com) — primary passive revenue path
- Budget tracking per person
- Map view with region clustering
- AI itinerary suggestions
- Calendar export (Google, Apple, Proton)
- Travel agency white-label
- React Native / Expo port
