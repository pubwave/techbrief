FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci
RUN npm run build

FROM nginx:alpine

# Serve the built SPA and proxy /v1 + /health to the api service (see web.conf).
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY infra/nginx/web.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
