# Automation Testing Plan — malibu-advanced

## Current State Audit

**Tests that exist (partial):**
- ~25 component tests (Enzyme) — only for Arrow Atoms/Rows
- 2 server tests (`helpers`, `render-layout`)
- 1 utility test (`utils`)

**Tests that don't exist yet:**
- All 7 data loaders (`home`, `section`, `story`, `search`, `tag`, `author`, `collection`)
- `app/api/utils.js` (client-side fetchers)
- ~30+ Row components (no tests)
- ~9 Molecule components (no tests)
- ~15 Atom components (no tests)
- All page components (`HomePage`, `SectionPage`, `StoryPage`, `SearchPage`, `AuthorPage`, etc.)
- Layout components (`Header`, `Footer`, `TopBar`)
- Login, Subscription, Profile flows
- E2E (nothing)
- Visual regression (nothing)
- Performance (nothing, though `@lhci/cli` is installed)

---

## The Plan — 6 Phases

---

## Phase 1 — Infrastructure Setup

> Do this once, before any tests.

### 1.1 Fix Jest configuration

Create `jest.config.js` at root:
- Set `testEnvironment: jsdom`
- Set `setupFilesAfterFramework` for Enzyme adapter
- Exclude `node_modules`
- Add `moduleNameMapper` for CSS modules (`.m.css` imports crash Jest without this)
- Add coverage thresholds so CI can enforce them

### 1.2 Add Playwright

Playwright over Cypress because:
- Cleaner built-in network interception
- Better SSR page testing (checks actual HTML served)
- No iFrame restrictions (useful for Metype/ads stubs)

Create `playwright.config.js` at root:
- `baseURL` pointing to local dev server
- Two projects: `desktop` + `mobile` viewport
- `testDir: tests/e2e/`

Folder structure to create:
```
tests/
  e2e/
    pages/       ← one file per page type
    flows/       ← user journey tests
    fixtures/    ← mock API response JSON files
```

### 1.3 Set up Storybook

The project already has ~60+ `stories.js` files but no Storybook config. Add:
```
.storybook/
  main.js
  preview.js
```

This unlocks Chromatic for visual regression at zero extra effort.

### 1.4 Set up Chromatic

Connect Storybook to Chromatic. Every existing `stories.js` file immediately gets visual regression coverage on first baseline approval.

### 1.5 Update CI pipeline & husky

Currently husky only runs linting. Extend:

| Trigger | Runs |
|---|---|
| pre-commit | lint + Jest unit tests (fast, <30s) |
| PR gate | all Jest + Playwright smoke tests + Chromatic |
| nightly | full Playwright suite + Lighthouse |

---

## Phase 2 — Unit Tests: Server-side

> Priority: HIGH. These catch the most critical bugs.

### 2.1 Data loader tests (7 files to create)

For each data loader, test these exact scenarios:

| Data loader | Happy path | Not found | API failure |
|---|---|---|---|
| `story-page-data` | returns story + cacheKeys | calls `next()` | needs `.catch()` added |
| `home-page-data` | returns collection | — | needs `.catch()` added |
| `section-page-data` | returns collection | empty section fallback | needs `.catch()` added |
| `author-page-data` | returns author + stories | no `author.id` → calls `next()` | needs `.catch()` added |
| `tag-page-data` | returns stories + tag | tag not found → uses slug fallback | needs `.catch()` added |
| `search-page-data` | returns stories + total | 0 results → empty array | needs `.catch()` added |
| `collection-page-data` | returns collection | — | needs `.catch()` added |

> Writing these tests will expose that every data loader is missing `.catch()`.
> The tests become the bug report and the fix spec simultaneously.

### 2.2 API utils tests (`app/api/utils.js`)

Test all client-side fetchers using `jest.fn()` on `global.fetch`:
- `getSearchPageItems`
- `getStories`
- `getCollectionitems`
- `getAuthorStories`
- `loadRelatedStories`

---

## Phase 3 — Unit Tests: Component Layer

> Work bottom-up: Atoms → Molecules → Rows → Pages.

### 3.1 Atoms with no tests (~15 components)

Components: `Author`, `AuthorImage`, `AuthorWithTimestamp`, `BulletPoint`, `CollectionName`, `FallbackImage`, `Headline`, `HeroImage`, `Hyperlink`, `MagazineCoverImage`, `PremiumStoryIcon`, `SectionTag`, `StoryHeadline`, `StoryTags`, `ScrollSnap`

Pattern per component (use existing `AuthorCard` test as the template):
- Renders with required props → smoke test
- Renders with optional props toggled off → conditional rendering
- Snapshot → lock the output

> Use `generateStory()` and `generateStore` from `Fixture/index.js`.

### 3.2 Molecules with no tests (~9 components)

Components: `StoryCard`, `StorycardContent`, `PortraitStoryCard`, `StoryCardWithBulletPoint`, `StoryElementCard`, `KeyEvents`, `PageIntroductionCard`, `SliderHorizontalCard`, `FullScreenImages`

Pattern:
- Renders with story from `generateStory()`
- Renders with collection from `generateCollection()`
- Snapshot
- Key user interaction if any (click handlers)

### 3.3 Rows with no tests (~30 components)

**Priority 1** (used most on listing pages):
`FourColGrid`, `ThreeColGrid`, `TwoColFourStory`, `OneColStoryList`, `ThreeColSevenStory`, `ElevenStories`, `FullScreenSlider`

**Priority 2** (story page):
`Paywall`, `OpinionCollection`

**Priority 3** (magazine):
`MagazineWidget`, `MagazineHeaderCard`

Pattern per Row:
- Renders with `generateCollection({ stories: 4 })`
- Renders with empty collection → does not crash
- Snapshot

### 3.4 Page component tests

| Page | What to test |
|---|---|
| `HomePage` | Renders with `collection` prop → `LazyCollection` present |
| `SectionPage` | Renders with stories → shows list; 0 stories → "No Section Stories Found" |
| `StoryPage` | Renders with `dummyStory` → headline present |
| `SearchPage` | Renders with results; 0 results → shows 0 total |
| `AuthorPage` | Renders with author + stories; 0 stories → "No stories found!" |
| `NotFoundPage` | Renders "NotFound" div |

### 3.5 Layout component tests

- `Footer` — renders with menu items from Redux store
- `Header` — renders `TopBar`

---

## Phase 4 — E2E Tests: Playwright

### 4.1 Smoke tests (one per route) — run on every PR

```
tests/e2e/pages/home.spec.js
tests/e2e/pages/story.spec.js
tests/e2e/pages/section.spec.js
tests/e2e/pages/search.spec.js
tests/e2e/pages/tag.spec.js
tests/e2e/pages/author.spec.js
tests/e2e/pages/collection.spec.js
tests/e2e/pages/not-found.spec.js
```

Each file asserts:
- Page returns HTTP 200
- Page title is set (SEO)
- No console errors
- Key `data-testid` element is present
- Renders correctly on mobile viewport

### 4.2 Network intercept tests (error scenarios)

Store mock API responses as JSON in `tests/e2e/fixtures/`.

| Scenario | Mock | Assert |
|---|---|---|
| Story not found | Story API returns `null` | 404 page renders |
| Home collection empty | `collection.items = []` | Home renders without crash |
| Story API down | Network error forced | Server doesn't crash, shows error page |
| Search 0 results | `stories = [], total = 0` | "0 results" shown, no crash |
| Author not found | Author has no `id` | 404 page renders |
| Premium story, no access | `story.access = "subscription-only"` | Paywall component renders |
| Premium story, has access | `access.granted = true` | Full story content renders |

### 4.3 User flow tests — run nightly

```
tests/e2e/flows/search-flow.spec.js
  - Type query → results appear
  - Click a story → navigate to story page
  - Clear search → results reset

tests/e2e/flows/load-more.spec.js
  - Click load more on section page
  - Verify new stories appended
  - Verify button disappears when no more stories

tests/e2e/flows/navigation.spec.js
  - Click hamburger → nav opens
  - Click nav link → correct page loads
  - Click logo → home page loads
  - Click footer links → correct pages load

tests/e2e/flows/social-share.spec.js
  - Click share button on story page
  - Popup opens
  - Share links present with correct URLs
  - Close button closes popup

tests/e2e/flows/login-flow.spec.js
  - Visit /user-login
  - Enter email → password form appears
  - Invalid credentials → error message shown
  - Enter phone → OTP screen appears
```

---

## Phase 5 — Visual Regression: Chromatic

### 5.1 Baseline approval (one-time)

Run Chromatic for the first time against all existing `stories.js` files. Approve the baseline. From that point, every PR that changes a component shows a visual diff.

Existing story files that immediately get coverage:
- All Arrow Atoms (`Author`, `AuthorCard`, `Headline`, `HeroImage`, etc.)
- All Arrow Molecules (`StoryCard`, `StorycardContent`, etc.)
- All Arrow Rows (`FourColGrid`, `ThreeColGrid`, `FullScreenSlider`, etc.)
- All Story Templates (`TextStory`, `PhotoStory`, `ListicleStory`, `LiveBlogStory`)

### 5.2 Add Figma links to stories

Install `@storybook/addon-designs`. In each `stories.js`, link the corresponding Figma frame URL via `parameters.design`. Chromatic shows the Figma design alongside the component in the review UI.

### 5.3 Add viewport stories

For responsive components (`NavBar`, `FullScreenSlider`, `HalfScreenSlider`), add mobile/tablet viewport stories so Chromatic catches visual regressions at each breakpoint.

---

## Phase 6 — Performance: Lighthouse CI

`@lhci/cli` is already installed. Configure `lighthouserc.js` (already present in project root):
- Runs against: home, story, section, search pages
- Asserts: `performance ≥ 80`, `accessibility ≥ 90`, `best-practices ≥ 85`
- Upload results to LHCI server or temporary storage

Add to nightly CI run.

---

## Execution Order

| Week | Phase | Work |
|---|---|---|
| 1 | Phase 1 | Jest config, Playwright, Storybook, Chromatic, CI pipeline |
| 2 | Phase 2 | Data loader + API utils unit tests |
| 3 | Phase 3.1–3.2 | Atom + Molecule component tests |
| 4 | Phase 3.3–3.5 | Row + Page + Layout component tests |
| 5 | Phase 4.1–4.2 | E2E smoke tests + network intercept tests |
| 6 | Phase 4.3 | E2E user flow tests |
| 7 | Phase 5 | Chromatic baseline + Figma links |
| 8 | Phase 6 | Lighthouse CI |

---

## What Each Phase Catches

| Phase | What you can catch |
|---|---|
| 1 | Foundation — nothing catches without this |
| 2 | Server crashes, missing error handling, broken data shapes |
| 3 | Component rendering regressions, prop contract violations |
| 4 (smoke) | Broken page routes, HTTP errors, SEO regressions |
| 4 (intercept) | Unhandled API failures, missing empty states |
| 4 (flows) | Broken user journeys, interaction bugs |
| 5 | Unintended visual changes, design drift |
| 6 | Performance regressions from new components |

---

## Rule for New Features

Every PR that adds a feature must include:

| What's in the PR | Test required |
|---|---|
| New utility function | Jest unit test |
| New component | Component test + snapshot |
| New page/route | Playwright smoke test + data loader test |
| Bug fix | Regression test that reproduces the bug first |
| Error handling added | Network intercept test for that error case |
| UI design implemented | Storybook story + Chromatic baseline |
