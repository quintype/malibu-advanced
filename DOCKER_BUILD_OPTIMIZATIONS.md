# Docker Build Optimizations

## Current State

| Metric | Value |
|---|---|
| Total build time | ~20 minutes |
| `node_modules` size | 868MB |
| `.git/` size | 62MB |
| `public/` size | 127MB |
| Total packages in lockfile | 2893 |
| Direct dependencies | 22 |
| Direct devDependencies | 37 |

---

## Fix 1 — Separate prod-only node_modules in final stage

### What is the problem?

Your Dockerfile uses a multi-stage build — a `build` stage that compiles everything, and a final stage that runs the app. The final stage does this:

```dockerfile
COPY --from=build --chown=app:app /app /app
```

This copies the **entire `/app` directory** including all 868MB of `node_modules` into the final image. That `node_modules` contains all 37 devDependencies (webpack, babel, eslint, jest, sass, nodemon, etc.) which are only needed to **compile** the app. Once webpack has run, none of those tools are needed at runtime.

### The fix

In the final stage, run `npm ci --omit=dev` separately (installs only the 22 `dependencies`) and selectively copy only the runtime files:

```dockerfile
# ✗ Before — copies everything including 868MB of node_modules
COPY --from=build --chown=app:app /app /app

# ✓ After — only prod deps + built artifacts
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-optional

COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/app ./app
COPY --from=build --chown=app:app /app/views ./views
COPY --from=build --chown=app:app /app/config ./config
COPY --from=build --chown=app:app /app/start.js ./start.js
```

### How to test

```bash
# Build with the new Dockerfile
docker build -t malibu-fix1-test .

# Compare image sizes
docker images | grep malibu

# Inspect what's inside node_modules of the final image
docker run --rm malibu-fix1-test ls /app/node_modules | wc -l
# Should be significantly fewer folders than 2893

# Verify the app still starts correctly
docker run --rm -e NODE_ENV=production -p 3000:3000 malibu-fix1-test node start.js
# Should boot without missing module errors

# Check devDeps are absent (these should throw "not found")
docker run --rm malibu-fix1-test ls /app/node_modules/webpack
docker run --rm malibu-fix1-test ls /app/node_modules/jest
```

### Time impact

| Step | Before | After |
|---|---|---|
| Final stage `COPY /app` | ~2 min | ~10 sec |
| Docker push to quay.io | ~2-3 min | ~30 sec |
| Deploy pull on server | ~2-3 min | ~30 sec |
| **Final image size** | **~950MB** | **~150-200MB** |

---

## Fix 2 — Replace `git log` with build args + fix `.dockerignore`

### Part A — `git log` forces `.git/` into the build context

When you run `docker build .`, Docker packs everything not in `.dockerignore` and sends it to the Docker daemon as the **build context**. Your `.git/` folder (62MB) is sent on every single build. The only reason it needs to be there is this one line:

```dockerfile
RUN git log -n1 --pretty="Commit Date: %aD%nBuild Date: ..." > public/round-table.txt
```

CircleCI already knows the commit SHA and build info via environment variables. Pass them as Docker build arguments instead:

```dockerfile
# ✗ Before
RUN git log -n1 --pretty="Commit Date: %aD%nBuild Date: `date --rfc-2822`%n%h %an%n%s%n" > public/round-table.txt

# ✓ After
ARG GIT_COMMIT
ARG GIT_AUTHOR
ARG GIT_SUBJECT
ARG BUILD_DATE
RUN echo "Build Date: ${BUILD_DATE}\nCommit Date: ${BUILD_DATE}\n${GIT_COMMIT} ${GIT_AUTHOR}\n${GIT_SUBJECT}\n" > public/round-table.txt
```

In `.circleci/config.yml`:

```yaml
- run: |
    docker build \
      --build-arg GIT_COMMIT=$CIRCLE_SHA1 \
      --build-arg GIT_AUTHOR="$(git log -1 --pretty='%an')" \
      --build-arg GIT_SUBJECT="$(git log -1 --pretty='%s')" \
      --build-arg BUILD_DATE="$(date --rfc-2822)" \
      -t quay.io/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME:$(cat /tmp/workspace/docker-tag.txt) .
```

### Part B — `.dockerignore` is missing large directories

Current `.dockerignore`:
```
/Dockerfile
/node_modules
/run
*.log
/test
```

Updated `.dockerignore` — add the following:
```
.git/
public/
stats.json
dev-docker/
log/
supervisord.log
supervisord.pid
coverage/
.cache/
*.md
```

`public/` (127MB) is regenerated from scratch by `quintype-build` during every Docker build. Sending the old one is pure waste.

### How to test

```bash
# Measure build context size before and after
# Run from project root — this shows what would be sent to the daemon
du -sh --exclude=.git . 2>/dev/null

# After updating .dockerignore, time the context creation
time docker build --no-cache -t malibu-context-test . 2>&1 | head -5
# Watch the "Sending build context" line — should shrink significantly

# Verify round-table.txt still gets created correctly
docker run --rm malibu-fix2-test cat /app/public/round-table.txt

# Verify git is no longer needed in build stage
# (can remove `apk add git` entirely after this fix)
```

### Time impact

| Step | Before | After |
|---|---|---|
| Build context sent to daemon | ~2-3 min | ~20-30 sec |
| `apk add git` (can be removed) | ~30 sec | 0 sec |
| **Context size** | **~190MB+ sent** | **~3-4MB sent** |

---

## Fix 3 — BuildKit cache mount for npm

### What is the problem?

When npm installs packages, it downloads them from the registry and stores them in a local cache (`~/.npm`). On your laptop this cache persists across installs. But **inside Docker, every build starts with an empty cache** — npm re-downloads all 2893 packages from scratch every time `package-lock.json` changes.

### The fix

Docker BuildKit's `--mount=type=cache` lets you persist a directory between builds on the same CI runner:

```dockerfile
# ✗ Before
RUN npm install --no-optional

# ✓ After — add the syntax comment at the top of the Dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-optional
```

The first build downloads everything normally. Every subsequent build — even if `package-lock.json` changed — reuses cached downloads for packages that haven't changed. Only new or updated packages are re-downloaded.

Enable BuildKit in CircleCI:

```yaml
# In .circleci/config.yml
- run: DOCKER_BUILDKIT=1 docker build ...
```

### How to test

```bash
# First build — will be slow (populates cache)
DOCKER_BUILDKIT=1 docker build -t malibu-buildkit-test .

# Second build with no code changes — should be near-instant for npm step
DOCKER_BUILDKIT=1 docker build -t malibu-buildkit-test .

# Simulate a package change: add a package to package.json, regenerate lockfile
# Then build again — only the new package should download
npm install some-small-package
DOCKER_BUILDKIT=1 docker build -t malibu-buildkit-test .
# Watch the npm ci step — should complete in 1-2 min instead of 6-10 min
```

### Time impact

| Scenario | Before | After |
|---|---|---|
| Cold build (no cache) | 6-10 min | 4-6 min |
| Warm build (cache hit, no lockfile change) | 6-10 min | ~30 sec |
| Warm build (one new package added) | 6-10 min | 1-2 min |

> **Note**: The cache persists per CircleCI runner machine. If CircleCI spins up a new machine (which it does on every job by default with `docker` executor), the cache won't be there. To get full benefit, use a `machine` executor instead of `docker` executor for the build job, or combine with Fix 4 below.

---

## Fix 4 — `npm install` → `npm ci`

### What is the problem?

`npm install` and `npm ci` are different commands:

| | `npm install` | `npm ci` |
|---|---|---|
| Reads | `package.json` + `package-lock.json` | `package-lock.json` only |
| Resolves deps | Yes — checks for compatible versions | No — uses exact lockfile versions |
| Updates lockfile | Can update it | Never — errors if out of sync |
| Deletes node_modules first | No | Yes, always |
| Speed | Slower | 20-30% faster |
| Designed for | Local development | CI/CD, Docker builds |

In a Docker build you always have a `package-lock.json` and never want npm modifying it mid-build. `npm ci` is purpose-built for this — it skips resolution overhead and installs the exact locked tree.

### The fix

```dockerfile
# ✗ Before
RUN npm install --no-optional

# ✓ After
RUN npm ci --no-optional
```

### How to test

```bash
# Time both approaches on the same machine with a cold node_modules
time npm install --no-optional
rm -rf node_modules
time npm ci --no-optional
# npm ci should be 20-30% faster
```

### Time impact

| Step | Before | After |
|---|---|---|
| npm install (cold) | 6-10 min | 4-7 min |

---

## Fix 5 — Combine apk RUN commands

### What is the problem?

Each `RUN` instruction in a Dockerfile creates a new image layer. Your current Dockerfile has two separate apk runs:

```dockerfile
# ✗ Before — 2 layers, 2 separate operations
RUN apk update && \
    apk add git

RUN apk --no-cache --virtual build-dependencies add \
    python3 \
    make \
    g++
```

### The fix

```dockerfile
# ✓ After — 1 layer, 1 apk index fetch
RUN apk update && apk add git python3 make g++
```

Additionally, after applying Fix 2 (removing the `git log` dependency), you can remove `git` entirely:

```dockerfile
# ✓ After Fix 2 is applied — git is no longer needed
RUN apk update && apk add python3 make g++
```

### How to test

```bash
# Count layers before and after
docker history malibu-before --no-trunc | grep apk
docker history malibu-after --no-trunc | grep apk

# Time the apk step in isolation (hard to isolate — use build output timestamps)
DOCKER_BUILDKIT=1 docker build --progress=plain . 2>&1 | grep -A2 "apk"
```

### Time impact

| Step | Before | After |
|---|---|---|
| apk steps | ~60-90 sec | ~30-45 sec |

---

## Final Dockerfile (all fixes applied)

```dockerfile
# syntax=docker/dockerfile:1
FROM quay.io/quintype/public-base:node-20.x.x-alpine3.x AS build

ARG GIT_COMMIT
ARG GIT_AUTHOR
ARG GIT_SUBJECT
ARG BUILD_DATE

RUN apk update && apk add python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-optional

ENV MINIFY_CSS_CLASSNAMES=true

COPY . ./

RUN echo "Build Date: ${BUILD_DATE}\n${GIT_COMMIT} ${GIT_AUTHOR}\n${GIT_SUBJECT}" > public/round-table.txt && \
    npm config set unsafe-perm true && \
    ./node_modules/.bin/quintype-build


FROM quay.io/quintype/public-base:node-20.x.x-alpine3.x

RUN apk update && apk add curl tini && \
    addgroup -S app && \
    adduser -S -g app app

ENV NODE_ENV=production
WORKDIR /app

COPY --chown=app:app package.json package-lock.json ./
RUN npm ci --omit=dev --no-optional

USER app

COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/app ./app
COPY --from=build --chown=app:app /app/views ./views
COPY --from=build --chown=app:app /app/config ./config
COPY --from=build --chown=app:app /app/start.js ./start.js

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "start.js"]
```

---

## Updated `.dockerignore`

```
# Docker
/Dockerfile

# Dependencies (never copy into build context)
/node_modules

# Git history (replaced by build args)
.git/

# Previously built assets (regenerated during build)
public/

# Dev/local only files
/run
dev-docker/
log/
supervisord.log
supervisord.pid

# Noise
*.log
stats.json
/test
coverage/
.cache/
*.md
```

---

## Updated `.circleci/config.yml` build step

```yaml
- run: |
    DOCKER_BUILDKIT=1 docker build \
      --build-arg GIT_COMMIT=$CIRCLE_SHA1 \
      --build-arg GIT_AUTHOR="$(git log -1 --pretty='%an')" \
      --build-arg GIT_SUBJECT="$(git log -1 --pretty='%s')" \
      --build-arg BUILD_DATE="$(date --rfc-2822)" \
      -t quay.io/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME:$(cat /tmp/workspace/docker-tag.txt) .
```

---

## End-to-end timing comparison

| Step | Before | After | Savings |
|---|---|---|---|
| Build context sent to daemon | ~2-3 min | ~20 sec | ~2 min |
| `apk` installs | ~90 sec | ~45 sec | ~45 sec |
| `npm install/ci` (warm build) | ~6-10 min | ~1-2 min | ~7 min |
| `npm install/ci` (cold build) | ~6-10 min | ~4-5 min | ~3 min |
| `quintype-build` (webpack) | ~5-8 min | ~5-8 min | none |
| Final stage copy + prod deps | ~2 min | ~30 sec | ~90 sec |
| Docker push | ~2-3 min | ~30 sec | ~2 min |
| **Total (warm build)** | **~20 min** | **~6-8 min** | **~12 min** |
| **Total (cold build)** | **~20 min** | **~10-12 min** | **~8 min** |

> **webpack is the remaining bottleneck.** The `quintype-build` step (webpack compilation with 14 entry points) is not addressed by these fixes. If further reduction is needed after applying all the above, the next step would be investigating webpack parallelization or reducing the number of entry points in `quintype-build.config.js`.
