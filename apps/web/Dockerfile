FROM node:22-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production
ENV DB_PATH=/data/locki.db

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
# Next's standalone file-tracer can miss native addons like better-sqlite3's
# .node binary, so copy it explicitly to be safe.
COPY --from=deps /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

VOLUME ["/data"]
EXPOSE 3000
CMD ["node", "server.js"]
