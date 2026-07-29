// Пересобирает src/generated/index.ts (корневой barrel тег-клиентов).
//
// Orval в режиме tags-split НЕ создаёт корневой index — он генерит папку на
// тег (`<tag>/<tag>.ts`) и `model/index.ts`. Пакетный `index.ts` делает
// `export * from './src/generated'`, поэтому корневой barrel обязателен.
// Раньше он был ручным и терялся/отставал при регенерации (кейс: новый тег
// konstructor-deal). Скрипт вызывается ПОСЛЕ orval (npm-скрипт `generate`)
// и полностью восстанавливает barrel из фактических тег-папок.
import { readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const generatedDir = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    'src',
    'generated',
);

const tags = readdirSync(generatedDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== 'model')
    .map(entry => entry.name)
    .sort();

const lines = [
    '// АВТОГЕНЕРАЦИЯ (scripts/build-generated-index.mjs). Не редактировать руками —',
    '// перезаписывается на каждом `pnpm generate`. Barrel тег-клиентов + схемы.',
    '',
    "export * from './model';",
    ...tags.map(tag => `export * from './${tag}/${tag}';`),
    '',
];

writeFileSync(join(generatedDir, 'index.ts'), lines.join('\n'), 'utf8');
console.log(`generated/index.ts: ${tags.length} tag exports + model`);
