/**
 * LEGACY_CSS=1 — дописать фоллбэки цветов для старых браузеров
 * (Chrome 99–110; на Windows 7 доступен максимум 109).
 * Без переменной сборка идёт как раньше, байт в байт.
 *
 * Плагины — ОБЪЕКТОМ «имя → опции», а не массивом. Это единственная форма,
 * которую понимают оба потребителя конфига:
 *  - Next.js резолвит ключи через require сам (строки в массиве он тоже
 *    умеет, но это его частный случай);
 *  - Vite/vitest (тесты приложений, импортирующие CSS) массив строк
 *    отвергает: "Invalid PostCSS Plugin found at: plugins[0]".
 * Порядок ключей сохраняется: сначала Tailwind собирает CSS, затем
 * legacy-colors дописывает фоллбэки готовому выхлопу.
 */
const legacy = process.env.LEGACY_CSS === "1";

/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: legacy
        ? {
              "@tailwindcss/postcss": {},
              "@workspace/ui/postcss-legacy-colors": {},
          }
        : { "@tailwindcss/postcss": {} },
};

export default config;
