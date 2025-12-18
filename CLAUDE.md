# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Malibu is a sample Progressive Web Application (PWA) built with the Quintype Node framework (`@quintype/framework`). **Important**: This app implements minimal functionality directly - the majority of functionality is in the [toddy-libs](https://github.com/quintype/quintype-node-framework) repository (published as `@quintype/framework`).

## Development Commands

### Running the Application

**Primary method** (macOS with supervisord):
```bash
./run
```
This uses supervisord to run both the asset server and dev server in parallel.

**Individual processes** (useful for debugging):
```bash
npm run asset-server      # webpack dev server (localhost:8080)
npm run dev-server        # node server with hot reload (localhost:3000)
```

**Production-like mode**:
```bash
npm run compile && npm start
```

**Windows**: Use Docker
```bash
./dev-docker/start
./dev-docker/port-forward  # if localhost:3000 shows connection refused
./dev-docker/force-reload  # force reload of web server and webpack
```

### Testing & Linting

```bash
npm test                   # run Jest tests
npm run lint:js            # eslint on all JS/JSX
npm run lint:css           # stylelint on all SCSS/CSS
npm run lint:js:ci         # eslint on changed files only
npm run lint:css:ci        # stylelint on changed files only
```

### Build & Analysis

```bash
npm run compile            # webpack build for browser
npm run analyze-stats      # webpack bundle analyzer (production mode)
```

## Architecture

### Server-Side Architecture

**Entry Point**: `start.js` → `app/server/app.js`

The server uses Express.js via `@quintype/framework`:
- `app/server/app.js` - Main application configuration with middleware setup
- `app/server/routes.js` - Route definitions (STATIC_ROUTES and ISOMORPHIC_ROUTES)
- `app/server/load-data.js` - Central data loading logic that routes page types to specific data loaders
- `app/server/data-loaders/` - Page-specific data loaders (home, story, section, collection, author, etc.)

**Route Types**:
1. **STATIC_ROUTES**: Not part of PWA or JS bundle (e.g., `/about-us`, `/preview/*`)
2. **ISOMORPHIC_ROUTES**: Client + Server rendered routes (e.g., `/search`, `/author/:authorSlug`, `/collection/:collectionSlug`)
3. Common routes from framework via `generateCommonRoutes()` (story pages, section pages)

### Client-Side Architecture

**Entry Point**: `app/client/app.js` → `app/client/render.js`

- Uses React 16 with Redux for state management
- Code splitting via `@loadable/component` with three main chunks:
  - **home** - HomePage components
  - **list** - List pages (collection, tag, search, author, etc.)
  - **story** - Story pages
- Service worker enabled in production for PWA functionality
- Hot Module Replacement (HMR) in development

### Isomorphic Code

**Component Selection**: `app/isomorphic/pick-component.js`

Maps PAGE_TYPE constants to React components and webpack chunks. This file is critical for understanding how routes map to components.

**Key directories**:
- `app/isomorphic/components/` - React components organized by type (pages, layouts, atoms, molecules, story-templates)
- `app/isomorphic/arrow/` - Collection rendering components (grid layouts, story templates)
- `app/isomorphic/component-bundles/` - Entry points for code-split chunks (home.js, list.js, story.js)
- `app/isomorphic/constants.js` - PAGE_TYPE constants used throughout app

### Configuration

- `config/publisher.yml` - Publisher-specific configuration (CDN, SSO, analytics, breaking news, etc.)
- `quintype-build.config.js` - Webpack loadable configuration for code splitting CSS chunks
- `.eslintrc.js` - ESLint with standard, prettier, react, and jest plugins
- `babel.config.js` - Babel configuration

### Data Flow

1. Request comes to server
2. `routes.js` matches URL to PAGE_TYPE
3. `load-data.js` routes PAGE_TYPE to appropriate data loader
4. Data loader fetches from Quintype API via client
5. `pick-component.js` selects React component for PAGE_TYPE
6. Server renders and returns HTML + initial state
7. Client hydrates and takes over

### Key Features

- **AMP Support**: AMP routes configured in `app/server/app.js` with subscription support
- **SEO**: Uses `@quintype/seo` with structured data, OpenGraph, Twitter cards
- **Breaking News**: Configured in publisher.yml with interval and display settings
- **Collections**: Configurable depth and story limits per template type
- **Multi-domain**: Supports domain mapping and subdomain routing
- **Access Control**: Integration with AccessType for subscription/paywall
- **SSO**: Configurable Single Sign-On with redirect URLs

### Important Patterns

**Adding a new page type**:
1. Add PAGE_TYPE constant to `app/isomorphic/constants.js`
2. Add route to `app/server/routes.js`
3. Create data loader in `app/server/data-loaders/`
4. Add case to `loadData()` switch in `app/server/load-data.js`
5. Create page component in `app/isomorphic/components/pages/`
6. Map PAGE_TYPE to component in `app/isomorphic/pick-component.js`
7. Import component in appropriate bundle (home/list/story) in `app/isomorphic/component-bundles/`

**Service Worker Development**:
Service workers are disabled in development. To work on them:
1. Edit `app/client/app.js` - remove `process.env.NODE_ENV === 'production'` check
2. Edit `config/publisher.yml` - remove asset_host
3. Run `npm run compile && npm start`
4. Restart when changing service worker code

## Coding Standards

### CSS/SCSS Standards

**CSS Modules**: All component styles must use CSS Modules (`.m.css` files) for scoped styling.

**CSS Variables**: Always use CSS custom properties (variables) instead of hardcoded values:
- Use existing variables from `app/assets/arrow/stylesheets/app.scss` and `app/assets/stylesheets/base/colors.scss`
- Variable naming convention: `--arrow-{category}-{name}` (e.g., `--arrow-c-brand1`, `--arrow-spacing-m`, `--arrow-fs-l`)
- Categories:
  - `c-*` for colors (e.g., `--arrow-c-brand1`, `--arrow-c-mono1`)
  - `spacing-*` for spacing (e.g., `--arrow-spacing-xs`, `--arrow-spacing-m`)
  - `fs-*` for font sizes (e.g., `--arrow-fs-xs`, `--arrow-fs-l`)
  - `fw-*` for font weights
  - `lh-*` for line heights
  - `typeface-*` for font families

**Example**:
```css
/* ✅ Good - Using variables */
.component {
  color: var(--arrow-c-brand1);
  padding: var(--arrow-spacing-m);
  font-size: var(--arrow-fs-l);
  font-family: var(--arrow-typeface-primary);
}

/* ❌ Bad - Hardcoded values */
.component {
  color: #ff214b;
  padding: 16px;
  font-size: 24px;
  font-family: sans-serif;
}
```

**Style Names**: Use descriptive, semantic class names that reflect the component's purpose:
- Use kebab-case for class names (e.g., `collection-name`, `border-bottom`)
- Avoid generic names like `container`, `wrapper` unless they're truly generic
- Use BEM-like naming when appropriate (e.g., `collection-borderLeft`, `collection-borderBottom`)

**File Organization**:
- Each component should have its own `.m.css` file in the same directory
- Global styles go in `app/assets/stylesheets/`
- Arrow component styles go in `app/assets/arrow/stylesheets/`

**Media Queries**: Use custom media queries when available:
```css
@media (--viewport-medium) {
  /* styles */
}
```

**RTL Support**: Include RTL styles when needed:
```css
html[dir="rtl"] {
  .component {
    margin-right: 0;
    margin-left: var(--arrow-spacing-m);
  }
}
```

### JavaScript/React Standards

**StyleName vs ClassName**: Always use `styleName` for CSS Modules, not `className`:
- `styleName` is used for CSS Modules (scoped styles)
- `className` should only be used for global classes or third-party library classes

**Example**:
```jsx
// ✅ Good - Using styleName for CSS Modules
import "./component.m.css";

function Component() {
  return (
    <div styleName="container">
      <h1 styleName="title">Hello</h1>
    </div>
  );
}

// ❌ Bad - Using className for CSS Modules
import styles from "./component.m.css";

function Component() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hello</h1>
    </div>
  );
}

// ✅ Acceptable - className for global/third-party classes
<div styleName="component-wrapper" className="container">
  <ThirdPartyComponent className="external-library-class" />
</div>
```

**Reusable Components**: Create and use reusable components following these principles:
- **Component Organization**: Follow atomic design principles:
  - `atoms/` - Smallest, indivisible components (buttons, inputs, labels)
  - `molecules/` - Simple combinations of atoms (form fields, cards)
  - `organisms/` - Complex components (headers, navigation, story cards)
  - `pages/` - Full page components
- **Component Structure**: Each component should:
  - Be in its own directory with `index.js` and `component-name.m.css`
  - Export both base component and connected component (if using Redux)
  - Include PropTypes for all props
  - Have default props where appropriate
- **Component Reusability**:
  - Extract common patterns into shared components
  - Use composition over configuration
  - Accept props for customization rather than hardcoding values
  - Create wrapper components for common patterns

**Example**:
```jsx
// ✅ Good - Reusable component with proper structure
import React from "react";
import PropTypes from "prop-types";
import "./button.m.css";

export const Button = ({ children, variant, onClick, disabled }) => {
  return (
    <button
      styleName={`button ${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "outline"]),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  variant: "primary",
  disabled: false,
};

// Usage
<Button variant="secondary" onClick={handleClick}>
  Click Me
</Button>
```

**Best Practices**:
- Use functional components with hooks (avoid class components for new code)
- Use PropTypes for type checking
- Keep components small and focused on a single responsibility
- Extract complex logic into custom hooks or utility functions
- Use Redux connect() for components that need state
- Export components from index files for cleaner imports
- Use destructuring for props
- Prefer named exports over default exports for better refactoring

**Import Organization**:
```jsx
// 1. External dependencies
import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

// 2. Internal framework/utilities
import { Link } from "@quintype/components";
import get from "lodash/get";

// 3. Local utilities/hooks
import { getTextColor } from "../../utils/utils";

// 4. Styles (CSS Modules)
import "./component.m.css";
```

**State Management**:
- Use Redux for global state
- Use React hooks (useState, useEffect) for local component state
- Use custom hooks for shared stateful logic
- Connect components to Redux only when they need global state

## Node/NPM Version

- Node: ^16.14.2
- NPM: ^8.5.0

Check with: `npm run check-node-npm`

## Git Workflow

**Merging upstream malibu**:
```bash
git pull git@github.com:quintype/malibu.git master
# If you want to keep your custom components:
git checkout --ours app/isomorphic/components
git add app/isomorphic/components
```
