# Dockerfile

FROM node:20-slim AS builder

WORKDIR /app
# Копируем lock-файл и package.json (ускоряет layer caching)
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY apps ./apps
COPY packages ./packages 
COPY . .

RUN npm install -g pnpm@10.4.1

RUN pnpm install 
# --frozen-lockfile
RUN pnpm exec turbo run build --filter=apps/kpi-sales
# RUN pnpm run build 
# --filter=apps/kpi-sales

# --- Runtime stage ---
FROM node:20-slim AS runner

ENV NODE_ENV=production

WORKDIR /app

# Копируем standalone билд
COPY --from=builder /app/apps/kpi-sales/.next/standalone ./
COPY --from=builder /app/apps/kpi-sales/public ./public
COPY --from=builder /app/apps/kpi-sales/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
