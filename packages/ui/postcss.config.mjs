/**
 * LEGACY_CSS=1 — дописать фоллбэки цветов для старых браузеров
 * (Chrome 99–110; на Windows 7 доступен максимум 109).
 * Без переменной сборка идёт как раньше, байт в байт.
 *
 * Плагины перечислены МАССИВОМ ИМЁН, а не объектами: Next.js принимает
 * только строку с именем пакета либо пару [имя, опции] — готовый объект
 * плагина он отвергает как "unknown PostCSS plugin".
 *
 * Порядок важен: сначала Tailwind собирает CSS, затем legacy-colors
 * дописывает фоллбэки готовому выхлопу.
 */
const legacy = process.env.LEGACY_CSS === "1";

/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: legacy
        ? ["@tailwindcss/postcss", "@workspace/ui/postcss-legacy-colors"]
        : ["@tailwindcss/postcss"],
};

export default config;
