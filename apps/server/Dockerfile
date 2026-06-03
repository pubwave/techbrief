FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci
RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=9541

COPY --from=build /app /app

EXPOSE 9541

CMD ["node", "apps/server/dist/index.js"]
