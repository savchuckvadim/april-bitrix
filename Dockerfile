# 🐳 Multi-stage build
FROM node:20 AS base

WORKDIR /app

# Установка PNPM
RUN npm install -g npm@11.3.0 && npm install -g pnpm

# Копируем все файлы сразу
COPY . .

RUN pnpm approve-builds
# Установка зависимостей и генерация Prisma Client
RUN pnpm config set fetch-retries 5 && \
    pnpm config set fetch-timeout 60000 && \
    pnpm install --no-frozen-lockfile 
    # && \
    # cd packages/prisma && \
    # pnpm prisma generate

# Сборка NextJS API и проверка
RUN pnpm --filter kpi-sales run build 
# && \
    # ls -la apps/kpi-sales/.next/build || (echo "Build failed - dist directory not found" && exit 1)

# ==== PRODUCTION ====
FROM node:20-slim AS prod

WORKDIR /app

# Копируем только необходимые файлы


# COPY --from=base /app/apps/kpi-sales/.next ./.next
# COPY --from=base /app/apps/kpi-sales/package.json ./package.json
# COPY --from=base /app/package.json ./root-package.json
# COPY --from=base /app/pnpm-workspace.yaml ./
# COPY --from=base /app/packages ./packages
# COPY --from=base /app/apps/kpi-sales/.env ./.env

COPY --from=base /app/apps/kpi-sales/.next ./.next
COPY --from=base /app/apps/kpi-sales/package.json ./package.json
COPY --from=base /app/package.json ./root-package.json
COPY --from=base /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=base /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/kpi-sales/public ./public
COPY --from=base /app/apps/kpi-sales/next.config.js ./next.config.js
COPY --from=base /app/apps/kpi-sales/.env ./.env

RUN pnpm approve-builds
# Установка PNPM и зависимостей
RUN npm i -g pnpm && \
    pnpm install --prod --no-frozen-lockfile && \
    pnpm --filter kpi-sales install --prod --no-frozen-lockfile

# Запуск NextJS
CMD ["pnpm", "start"]
