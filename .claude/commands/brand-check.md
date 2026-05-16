Run a brand viability check for the app name: $ARGUMENTS

Do all of the following using web search:

## 1. USPTO Trademark Search
Search USPTO TESS (https://tmsearch.uspto.gov) for live marks matching the name.
Focus on International Classes:
- Class 39 (travel arrangement, transport)
- Class 42 (software, SaaS, mobile apps)
- Class 41 (entertainment, online communities)

Also search for "[name] travel" and "[name] app" variants.

Report: any live conflicting marks, their owner, filing date, and class. Dead/abandoned marks are fine — note them briefly.

## 2. Google Brand Collision Check
Search for:
- "[name] app"
- "[name] travel"
- "[name] travel planning"

Report: existing companies, apps, or products that share the name. Note category and whether they're in the travel or software space.

## 3. App Store Presence
Search for the name on Apple App Store and Google Play. Note any direct conflicts.

## 4. Domain Availability Signals
Search for:
- [name].com
- [name].app
- [name].travel
- get[name].com
- use[name].com

Report which appear available vs taken and what the taken ones are used for.

## Output Format

**`[NAME]` Brand Check**

| Check | Status | Notes |
|---|---|---|
| USPTO Class 39 | ✅ / ⚠️ / ❌ | details |
| USPTO Class 42 | ✅ / ⚠️ / ❌ | details |
| Google collision | ✅ / ⚠️ / ❌ | details |
| App Store | ✅ / ⚠️ / ❌ | details |
| Domains | ✅ / ⚠️ / ❌ | best available option |

**Verdict:** GO / CAUTION / AVOID — one sentence why.

✅ = clear, ⚠️ = conflict in adjacent space (judge case by case), ❌ = direct conflict, avoid
