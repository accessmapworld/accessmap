# AccessMap — Judge Cheat Sheet

A one-page guide to what we built, how it works, and how to defend it.

## The 15-second pitch
AccessMap is crowdsourced accessibility intelligence for the 1.3 billion people
with disabilities. Search any place and get a four-dimension accessibility score
(mobility, sensory, hearing, vision), live barrier alerts, step-free routes, and
AI-verified photo reports — and the app itself is built to the accessibility
standard it preaches: screen-reader friendly, voice-driven, works offline.

> **The hook:** *"An accessibility app that isn't accessible is a contradiction.
> We made the product **and** the experience accessible — and we can prove it."*

---

## Standout features (what to demo)

### 1. Text-to-speech, built in
- **What it is:** A "Read aloud" button on every place and alert, plus a
  "Read aloud on focus" mode that speaks buttons, links and headings as you
  move through the page.
- **How it works:** The Web Speech API (`speechSynthesis`). A small controller
  (`src/lib/speech.ts`) manages one shared utterance, tracks which control is
  speaking, and reads the *accessible name* of focused elements.
- **Why it matters:** Low-vision and low-literacy users, and anyone who can't
  look at the screen (e.g. navigating in a wheelchair), get the information by ear.
- **Judge Q — "Don't screen readers already do this?"** Screen readers exist but
  many users don't run one. This gives audio support to *everyone* with zero
  setup, and our content is structured so a real screen reader works too.

### 2. Voice search
- **What it is:** A mic button in the map search bar — speak a place name instead
  of typing. `"/"` also jumps focus to search.
- **How it works:** Web Speech *recognition* (`src/lib/useVoiceSearch.ts`).
  Gracefully hidden when unsupported.
- **Why it matters:** Hands-free input for users with motor/dexterity
  disabilities — typing on a phone can be the single hardest step.

### 3. Live updates (real-time)
- **What it is:** New reviews and barrier alerts ("elevator offline") appear
  instantly — no refresh — with a pulsing **LIVE** indicator and self-updating
  "2m ago" timestamps.
- **How it works:** Firestore `onSnapshot` when a backend is configured; a local
  pub/sub with **cross-tab `storage` sync** otherwise (`src/lib/data.ts`,
  `subscribeAlerts` / `subscribeReviews`). New alerts are announced to screen
  readers via an `aria-live` region.
- **Why it matters:** Accessibility is *dynamic* — a broken lift makes a "10/10"
  place unusable today. Static data lies; live data is the whole point.

### 4. Works offline (PWA)
- **What it is:** Installable app that keeps working with no signal — your saved
  places and visited map tiles stay available, and a banner tells you you're offline.
- **How it works:** A service worker (`public/sw.js`): network-first for pages,
  stale-while-revalidate for assets, cache-first for map tiles. The data layer
  caches the last successful fetch to localStorage (`src/lib/data.ts`).
- **Why it matters:** People check accessibility *on the move* — transit dead
  zones, basements, rural areas. The moment you most need it is often offline.

### 5. The map is accessible (most apps fail here)
- **What it is:** Leaflet pins are invisible to screen readers by default. We add
  a screen-reader-only **list of every place on the map** (name + score + alert
  status, as links), keyboard-focusable labelled markers, and live result-count
  announcements.
- **Why it matters:** This is the #1 silent accessibility failure in mapping apps.
  We fixed the thing everyone else ships broken.

### 6. Adaptive accessibility controls
- **What it is:** A panel for larger text, high contrast, readable font
  (Atkinson Hyperlegible), greyscale, and **reduce motion** — saved per device.
- **How it works:** Toggles classes on `<html>`; our WebGL (Aurora) and GSAP
  animations actually *stop their loops* under reduced motion, not just CSS.
- **Why it matters:** WCAG 2.2 AA compliance with real, user-controlled options —
  vestibular-disorder users won't get sick from our hero animation.

### 7. Resilience / crash protection
- **What it is:** A React **error boundary** — one bad component shows a friendly
  recovery screen, never a white page. Reads as `role="alert"`.
- **Why it matters:** Judges *will* click something weird. We degrade gracefully.

---

## If they grill you — quick answers

- **"What's your moat / why is this hard?"** Accessibility data doesn't exist in a
  usable form. We fuse OpenStreetMap tags, community reviews, and AI photo
  verification into one normalized 0–10 score per dimension — and keep it live.
- **"How do you trust user data?"** Reviews pass a quality/profanity/spam filter
  before publishing; photos are AI-verified before they earn a "verified" badge.
- **"Does it scale?"** Pure client + Firestore; static hosting, CDN tiles, lazy-
  loaded routes, code-split bundles. No server to fall over.
- **"Is the accessibility real or buzzwords?"** Run a screen reader or Lighthouse
  on it live. Skip links, focus rings, ARIA roles, an accessible map list, and a
  public Accessibility Statement at `/accessibility` documenting conformance.
- **"What did you build *today*?"** Text-to-speech, voice search, real-time live
  updates, offline PWA, the accessible map list, and crash protection — the
  difference between a demo and something a disabled person could actually rely on.

## Demo flow (90 seconds)
1. Open `/map` → **speak** a city into voice search.
2. Point out the **LIVE** alert badge; open a place, hit **Read aloud**.
3. Toggle **Reduce motion / High contrast** in the accessibility panel.
4. Turn off Wi-Fi → app still shows places, **offline banner** appears.
5. Tab through with a screen reader → the map reads as a **list of places**.
