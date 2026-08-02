/** @type {import('next').NextConfig} */
// ВНИМАНИЕ: рядом лежит next.config.ts. Next резолвит конфиги в порядке
// .js → .mjs → .ts, поэтому используется ЭТОТ файл, а next.config.ts мёртв
// (вместе с его проверкой обязательных env-переменных). Нужно оставить один.
const nextConfig = {
  transpilePackages: ["@workspace/api", "@workspace/ui", "@workspace/april-ui"],
}

export default nextConfig
