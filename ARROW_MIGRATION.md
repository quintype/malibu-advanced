# Arrow Package Migration

## Overview

Replaced the vendored local arrow code (`app/isomorphic/arrow/`, `app/assets/arrow/`) with the `@quintype/arrow` npm package sourced from the local `quintype-node-arrow` repository.

---

## What Was Done

### 1. `quintype-node-arrow` — changes to the package

- **Added `AdPlaceholder` export** to `src/index.js` and `src/entry-points.js`.
  It existed in source but was not exported, so `import { AdPlaceholder } from "@quintype/arrow"` would have failed.
- **Built the package**: `npm run build` → generated `dist/` (CJS + ESM bundles + per-component CSS files + `app.scss`).

---

### 2. `malibu-advanced` — all files changed

#### `package.json`
- Added `"@quintype/arrow": "file:../quintype-node-arrow/dist"` to dependencies.
- Added `"lodash.kebabcase": "^4.1.1"` (peer dep of arrow that was missing).
- Added `--preserve-symlinks` flag to `dev-server` and `start` scripts so Node.js resolves `react`, `prop-types`, etc. from malibu-advanced's `node_modules` instead of following the symlink into `dist/`.

#### `webpack.config.js`
- Added `resolve: { symlinks: false }` so webpack resolves arrow's peer deps from malibu-advanced's `node_modules` (same reason as `--preserve-symlinks` but for the browser/webpack build).

#### `quintype-build.config.js`
- Updated all 13 CSS chunk entry paths from `./app/isomorphic/arrow/components/...` to `@quintype/arrow/<ComponentName>/styles.arrow.css`.

#### `app/assets/stylesheets/app.scss`
- Changed `@import "../arrow/stylesheets/app.scss"` → `@import "~@quintype/arrow/app.scss"`.

#### JS imports — 18 files updated

All imports from local relative arrow paths changed to named imports from `@quintype/arrow`:

| File | Old import | New import |
|------|-----------|------------|
| `story-templates/story-wrapper.js` | `../../arrow/components/Atoms/AdPlaceholder` | `@quintype/arrow` |
| `story-templates/text-story/index.js` | `../../../arrow/.../TextStoryTemplates` | `@quintype/arrow` |
| `story-templates/video-story/index.js` | `../../../arrow/.../VideoStoryTemplates` | `@quintype/arrow` |
| `story-templates/live-blog/index.js` | `../../../arrow/.../LiveBlogStoryTemplates` | `@quintype/arrow` |
| `story-templates/photo-story/index.js` | `../../../arrow/.../PhotoStoryTemplates` | `@quintype/arrow` (aliased as `PhotoStoryTemplate`) |
| `story-templates/listicle-story/index.js` | `../../../arrow/.../ListicleStoryTemplates` | `@quintype/arrow` |
| `pages/section.js` | `../../arrow/.../OneColStoryList` | `@quintype/arrow` |
| `pages/tag.js` | `../../arrow/.../OneColStoryList` | `@quintype/arrow` |
| `pages/search.js` | `../../arrow/.../OneColStoryList` | `@quintype/arrow` |
| `pages/author-page/index.js` | `../../../arrow/.../AuthorIntroductionCard` + `ThreeColGrid` | `@quintype/arrow` (combined) |
| `arrow-rows/one-col-story-list/index.js` | `../../../../arrow/.../OneColStoryList` | `@quintype/arrow` |
| `arrow-rows/two-col-four-stories/index.js` | `../../../../arrow/.../TwoColFourStory` | `@quintype/arrow` |
| `arrow-rows/four-col-12-stories/index.js` | `../../../../arrow/.../FourColTwelveStory` | `@quintype/arrow` |
| `arrow-rows/four-col-grid/index.js` | `../../../../arrow/.../FourColGrid` | `@quintype/arrow` |
| `arrow-rows/full-screen-slider/index.js` | `../../../../arrow/.../FullScreenSlider` | `@quintype/arrow` |
| `arrow-rows/eleven-stories/index.js` | `../../../../arrow/.../ElevenStories` | `@quintype/arrow` |
| `arrow-rows/three-col-grid/index.js` | `../../../../arrow/.../ThreeColGrid` | `@quintype/arrow` |
| `arrow-rows/three-col-seven-stories/index.js` | `../../../../arrow/.../ThreeColSevenStory` | `@quintype/arrow` |

#### `pages/author-page/author.m.css`
- Removed `@import "../../../arrow/.../author-intro.m.css"` from `:global {}` block — `postcss-advanced-variables` can't resolve node_modules paths inside CSS `@import`.
- Added `import "@quintype/arrow/AuthorIntroductionCard/styles.arrow.css"` in `author-page/index.js` instead (webpack handles this correctly).

#### `story-templates/story-wrapper.js` — story rendering bug fixed
- Added `noOfVisibleCards: -1` to `templateConfig`.
  The arrow template defaults `noOfVisibleCards` to `0`, which caused `story.cards.slice(0, 0)` → empty array → **no story content rendered at all** (broken before and after migration).
- Added `if (isATGlobal && initAccessType)` guard around the `initAccessType` call to prevent a crash when AccessType is not configured or hasn't initialised yet.

#### Deleted
- `app/isomorphic/arrow/` — entire vendored arrow component folder
- `app/assets/arrow/` — vendored arrow SCSS folder

---

## Known Open Issues

### ✅ Issue 3 — FIXED — Visual stories not loading at `/ampstories/*`

**File:** `app/server/app.js`

**Root cause:** The framework's `ampStoryPageHandler` checks `req.path.startsWith(getAmpPageBasePath(opts, config) + '/')`. The default `ampPageBasePath` is `/amp/story`, which does NOT match `/ampstories/...` paths → handler calls `next()` and falls through.

**Fix:** Added `ampPageBasePath: "/ampstories"` to `featureConfig` in `ampRoutes(app, {...})`.

Also added null-safe destructuring to `authorizationUrl` and `pingbackUrl` so they don't crash when `accesstypeConfig` is undefined.

---

### ✅ Issue 4 — FIXED — Metype comments widget not loading in stories

**Files:** `story-wrapper.js`, all 5 story template components

**Root cause:** `widgetComp` in all story templates was hardcoded to `adWidget` (the ad placeholder). `MetypeCommentsWidget` existed but was never wired into story templates.

**Fix:**
- `story-wrapper.js`: imported `MetypeCommentsWidget` and `useSelector`; reads `publisher-attributes.metypeConfig.metypeHost` and `metypeConfig.metypeAccountId` from Redux; created `metypeWidget` function that renders `MetypeCommentsWidget` (returns `null` if config is missing); passes it as `widgetComp` to all story template components.
- All 5 story templates (`text-story`, `video-story`, `photo-story`, `listicle-story`, `live-blog`): accept `widgetComp` prop and pass `widgetComp || adWidget` to the arrow template.

**Note:** Metype config must be present in `publisher-attributes.metypeConfig` with keys `metypeHost` and `metypeAccountId`. If absent, the widget silently returns null (no crash).

---

### ✅ Issue 1 — FIXED — Sidebar (AsideCollection) is broken

**File:** `app/isomorphic/components/story-templates/story-wrapper.js`

**Root cause:** `templateConfig.asideCollection` uses `slotData` as the key for slot configuration, but the `AsideCollection` component in `@quintype/arrow` expects the key to be `slots`.

```js
// story-wrapper.js — current (WRONG)
const templateConfig = {
  asideCollection: {
    data: relatedStories,
    slotData: [          // ← wrong key
      { type: "ad" },
      { type: "collection" },
      { type: "ad" },
    ],
    config: { ... }
  }
};
```

```js
// How AsideCollection expects it (CORRECT)
asideCollection: {
  data: relatedStories,
  slots: [              // ← correct key
    { type: "ad" },
    { type: "collection" },
    { type: "ad" },
  ],
  config: { ... }
}
```

**What happens:** The arrow `TextStoryTemplate` spreads `asideCollection` onto `<AsideCollection />`. Since `slots` is undefined, no slot content (ads, widgets) is rendered in the sidebar.

**Fix:** Rename `slotData` → `slots` in `templateConfig.asideCollection` in `story-wrapper.js`. Apply the same fix to all other story template configs that use `asideCollection` (video, photo, listicle, live-blog).

---

### ✅ Issue 2 — FIXED — Infinite scroll is broken

**File:** `app/isomorphic/components/pages/story.js`

**Root cause:** `InfiniteStoryBase` is used with `storyPageLoadItems` which hits `/api/v1/stories`. There are two problems:

**Problem A — `app` global is not guaranteed:**
```js
onInitialItemFocus={(item) =>
  app.registerPageView(...)   // `app` is a framework global — can throw if not available
}
```

**Problem B — Story items from the API are not passed through `StoryWrapper`/`StoryPageBase` correctly.**
`StoryPageBase` calls `StoryPageBaseWithAccesstype` with `story` and `config`, but `story` and `config` come from `props` which for subsequent infinite scroll items come from the array returned by `storyPageLoadItems`:

```js
response.stories.map((story) => ({ story, currentPath: `/${story.slug}`, otherProp: "value" }))
```

The items are shaped as `{ story, currentPath, otherProp }`. `InfiniteStoryBase` passes each item's properties as props to the `render` component (`StoryPageBase`). So `StoryPageBase` receives `story` correctly, but `config` would be undefined for subsequent stories (config is only in the initial page props, not in the fetched items).

**Fix needed:**
1. Guard the `app.registerPageView` call: `if (typeof app !== "undefined") app.registerPageView(...)`
2. Include `config` in each item returned from `storyPageLoadItems`, or derive it from the Redux store inside `StoryPageBase` rather than relying on props.

---

## How to Rebuild After Changes to `quintype-node-arrow`

Since `@quintype/arrow` is a `file:` reference to the built `dist/` folder, any change to `quintype-node-arrow/src/` requires a rebuild:

```bash
cd ../quintype-node-arrow
npm run build

# Back in malibu-advanced, re-link:
cd ../malibu-advanced
npm install --legacy-peer-deps
```
