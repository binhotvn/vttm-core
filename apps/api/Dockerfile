FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN yarn install --frozen-lockfile

# Build shared
FROM deps AS build-shared
COPY packages/shared/ ./packages/shared/
RUN cd packages/shared && yarn build

# Build API
FROM build-shared AS build
COPY apps/api/ ./apps/api/
RUN cd apps/api && yarn build

# Production
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY package.json ./

EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
