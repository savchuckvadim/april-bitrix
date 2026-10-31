/** @type {import('next').NextConfig} */
// ВНИМАНИЕ: рядом лежит next.config.ts. Next резолвит конфиги в порядке
// .js → .mjs → .ts, поэтому используется ЭТОТ файл, а next.config.ts мёртв
// (вместе с его проверкой обязательных env-переменных). Нужно оставить один.

// В проде приложение живёт под префиксом на next.april-app.ru/kpi-service
// (см. deploy/nginx/next.april-app.ru.conf): в корне того же домена стоит
// kpi-sales, поэтому отрезать префикс на прокси нельзя — Next должен сам
// знать про basePath и отдавать /kpi-service/_next/*.
//
// В dev (`next dev`) basePath пустой — localhost работает как раньше,
// без префикса. Сменить префикс можно через NEXT_PUBLIC_BASE_PATH на сборке;
// чтобы убрать его совсем (переезд на свой поддомен) — правится DEFAULT_BASE_PATH.
const DEFAULT_BASE_PATH = process.env.NODE_ENV === 'production' ? '/kpi-service' : '';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || DEFAULT_BASE_PATH;

const nextConfig = {
  basePath: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  transpilePackages: ["@workspace/api", "@workspace/ui", "@workspace/april-ui"],
}

export default nextConfig
