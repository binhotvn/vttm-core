FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/admin/package.json ./apps/admin/
RUN yarn install --frozen-lockfile

FROM deps AS build
COPY packages/shared/ ./packages/shared/
RUN cd packages/shared && yarn build
COPY apps/admin/ ./apps/admin/
RUN cd apps/admin && yarn build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/admin/.next/standalone ./
COPY --from=build /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build /app/apps/admin/public ./apps/admin/public

EXPOSE 3001
CMD ["node", "apps/admin/server.js"]
