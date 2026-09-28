# syntax=docker/dockerfile:1
# Multi-stage build for the Next.js 14 frontend, served with `next start`.
#
# Deliberately NOT `output: "standalone"`: that would need a change in next.config.js,
# and the app repo stays byte-identical to what Vercel builds. The price is a larger
# image (full production node_modules instead of Next's pruned copy) — accepted.
#
# NOTE on env vars:
#   - NEXT_PUBLIC_* are INLINED at build time -> must be present now, so images
#     are per-environment (like the backend's fastapi-graphql-dev/staging/prod).
#     They are public values (not secrets), so passing them as build args is fine.
#   - Server-only secrets (CLERK_SECRET_KEY, GOOGLE_CLOUD_LOGGING_KEY_BASE64, ...)
#     are RUNTIME concerns -> inject via ECS `secrets:` from SSM. Do NOT bake them.
#   The dummy defaults below only exist to keep local builds short. The Clerk
#   publishable key is the one exception — see below — so the minimum local build is
#   `docker build --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<any valid key> .`
#
# CLERK_SECRET_KEY is REQUIRED at runtime, deliberately with no default: middleware.ts
# wraps every request in clerkMiddleware, which throws "Missing secretKey" and answers
# 500 to EVERY request when it is absent. So the ECS task definition must carry it
# before any ALB health check can pass, and a CI smoke test must run the container
# with `-e CLERK_SECRET_KEY=...`.

########## deps: install node_modules ##########
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

########## builder: next build ##########
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public config (dummy defaults for local builds; overridden per env in CI)
ARG NEXT_PUBLIC_ENV=Production
ARG NEXT_PUBLIC_GRAPHQL_URL=https://example.invalid/graphql
# No default, deliberately. clerkMiddleware parses this on every request and needs a
# FORMAT-valid key ("pk_test_" + base64("<frontend-api-host>$")); a merely non-empty
# placeholder builds fine but makes the container answer 500 to everything
# ("Publishable key not valid."), which no health check or smoke test can pass.
# CI passes a throwaway key from the DUMMY_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY secret
# for build validation, and the real per-env key for images that get deployed.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.dummy
ARG NEXT_PUBLIC_MAPBOX_STYLE_URL=mapbox://styles/mapbox/streets-v12
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=dummy
# Empty on purpose, not a dummy: hooks/campaign/useQR.tsx falls back to
# window.location.origin when this is blank, which is the right behaviour for
# local builds. A dummy host would silently break QR links instead.
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV \
    NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL \
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=$NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN \
    NEXT_PUBLIC_MAPBOX_STYLE_URL=$NEXT_PUBLIC_MAPBOX_STYLE_URL \
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# lib/log/logger-config.ts JSON.parses this at module load; give it valid base64
# of "{}" so the build doesn't crash. Real key is injected at runtime, not here.
ENV GOOGLE_CLOUD_PROJECT_ID=build-placeholder \
    GOOGLE_CLOUD_LOGGING_KEY_BASE64=e30=

ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* are inlined here and cannot be fixed later by the task definition, so a
# blank one ships a quietly broken image: no publishable key means 500 on every request,
# no Mapbox/Maps token means dead maps. `next build` reports none of this. Worse, CI
# passes these as `--build-arg NAME=${{ ... }}`, and an undefined GitHub secret renders
# as an empty string that OVERRIDES the defaults above rather than falling back to them.
# So require them explicitly. Optional by design: NEXT_PUBLIC_API_URL (falls back to
# window.location.origin) and NEXT_PUBLIC_MAPBOX_STYLE_URL (real default above).
RUN for v in NEXT_PUBLIC_ENV \
             NEXT_PUBLIC_GRAPHQL_URL \
             NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
             NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN \
             NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; do \
      eval ": \"\${$v:?required build-arg is unset or empty}\""; \
    done \
 && npm run build \
 && rm -rf .next/cache

########## prod-deps: runtime node_modules only ##########
FROM node:20-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

########## runner ##########
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Unlike standalone's server.js, `next start` evaluates next.config.js at RUNTIME.
# That file reads NEXT_PUBLIC_ENV to decide the `experimental.serverActions` block,
# so the runtime value must match the build; everything else NEXT_PUBLIC_* is already
# inlined into the bundles by `next build` and does not need to be present here.
ARG NEXT_PUBLIC_ENV=Production
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
# .next is chowned because next start writes its image-optimisation cache there.
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
# next.config.js pulls in next-intl/plugin, which locates i18n/request.ts on load.
COPY package.json next.config.js ./
COPY i18n ./i18n

USER nextjs
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
