FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json yarn.lock ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/user-portal/package.json ./apps/user-portal/
RUN yarn install --frozen-lockfile

FROM deps AS build
COPY packages/shared/ ./packages/shared/
RUN cd packages/shared && yarn build
COPY apps/user-portal/ ./apps/user-portal/
RUN cd apps/user-portal && yarn build

FROM nginx:alpine AS production
COPY --from=build /app/apps/user-portal/dist /usr/share/nginx/html
COPY apps/user-portal/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3002
CMD ["nginx", "-g", "daemon off;"]
