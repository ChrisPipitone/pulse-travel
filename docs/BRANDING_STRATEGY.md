# Pulse — Human-Led Branding & Product Strategy

This document consolidates the "Anti-AI / Human-Led" strategic pivot. It serves as the bridge between high-level brand philosophy and actionable product development.

---

## 🏛️ The Four Branding Pillars

### 1. Positioning (The Wedge)
**Core Message:** *"Pulse is the real travel app for real people — because AI doesn't go on vacation, your friends do."*

*   **The Problem:** AI "wrappers" (TripRelay, etc.) solve for *logistics* but ignore *desire*. They create generic, soulless plans that nobody in the group actually cares about.
*   **The Solution:** Pulse is the **Human Validation Layer**. We don't care where your ideas come from; we care what your friends think of them.
*   **The Wedge:** Positioned as the **mandatory first step** in trip planning. You don't build an itinerary until you've "Checked the Pulse."

### 2. Voice (The Personality)
**Attributes:** Warm, Gritty, Anti-AI, Authentic.

*   **The Persona:** "The Brutally Honest Friend."
*   **The Tone:** Direct and protective of the human experience. We call out the "AI fluff."
*   **Sample Copy:**
    *   *Success:* "Human connection detected. You and 4 others actually want this."
    *   *Conflict:* "You guys are split. Don't fight—just take two different taxis."
    *   *Anti-AI:* "AI didn't pick this. Real people did."

### 3. Visual Identity (The Feel)
**Theme:** `human` (Human/Tactile)

*   **Palette:** Terracotta (earth/passion), Indigo (ink/depth), and Bone (heavy-weight paper).
*   **Texture:** Subtle grain, ink-bleed borders, and tactile rounding. 
*   **Philosophy:** Diametrically opposed to "AI Purple" and "Glassmorphism." It should feel like a high-end travel journal or a *Monocle* magazine spread.

### 4. Story (The "Why")
**Narrative:** "The Trip That Almost Didn't Happen."

*   **The Conflict:** The endless group chat, the "politeness barrier," and the spreadsheet that grandma can't read.
*   **The Resolution:** Pulse didn't just plan a trip; it saved the friendships. It turned a monolith of "I'm fine with whatever" into distinct crews of shared enthusiasm.
*   **Focus:** The **Group's Harmony**.

---

## 📋 Product Task Backlog (Drafted for Linear)

### [A] Refine "Find Your Crew" UI (Human Validation)
*   **Summary:** Update the Crew View to feel like a "reward" for human validation.
*   **Details:** 
    *   Implement "Human-Verified" badges for activities with 3+ MUSTs.
    *   Use the new `human` theme colors (Terracotta/Indigo).
    *   Add micro-copy: "This is your crew for [Activity]."
*   **Priority:** High

### [B] "Human-Lead" Onboarding (The 60-Second Hook)
*   **Summary:** Re-engineer the first 60 seconds to scream "Real People, No Bots."
*   **Details:** 
    *   Audit all join-flow text for "Anti-AI" voice.
    *   Add a "No Robots Allowed" welcome message.
    *   Ensure the transition from "Join Link" to "First Rating" is frictionless and tactile.
*   **Priority:** Urgent

### [C] "Activity Source" Strategy (Input vs. Grouping)
*   **Summary:** Define the UI/UX for importing ideas from external sources (Instagram, AI, etc.) while stripping the "wrapper" feel.
*   **Details:** 
    *   Create a "Paste an Idea" input that accepts URLs or text.
    *   Implement a "Strip the Fluff" transition that turns external text into a clean Pulse activity.
    *   Messaging: "Pulse makes these ideas real by getting your group's take."
*   **Priority:** Medium

---

## 🚀 Execution Checklist
- [ ] Implement `human` theme in `UI_DESIGN.md` and codebase.
- [ ] Audit `apps/web/src/locales/` (or wherever strings live) for "Anti-AI" voice.
- [ ] Create Linear tickets once authenticated.
