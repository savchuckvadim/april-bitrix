/**
 * Собирает SHOTS.md — задание владельцу на съёмку — из реестра кадров.
 * Файл не правится руками: тест сверяет его с реестром и пересобирает
 * при UPDATE_SHOTS=1.
 */

import type {
    PlatformShotId,
    PlatformShotPriority,
    PlatformShotSpec,
} from '../../model/shots';

const PRIORITY_TITLES: Record<PlatformShotPriority, string> = {
    1: 'В первую очередь — первые экраны и ролики',
    2: 'Во вторую — шаги «как это работает»',
    3: 'Если будет время — галереи',
};

const HEADER = `# Задание на съёмку: раздел /platform

Файл собирается из реестра кадров (\`packages/site-media/src/platform-shots.ts\`) тестом
\`__tests__/shots.test.ts\` — руками не править.
Пересобрать: из \`apps/bitrix\` запустить этот тест с переменной окружения \`UPDATE_SHOTS=1\`.

Пока у кадра нет файла, на сайте его нет вовсе (при разработке на его месте рамка с описанием),
поэтому раздел можно выкладывать до съёмки и дополнять по мере готовности.

## Как снимать

- Только демо-портал с тестовыми данными: никаких настоящих клиентов, телефонов, ИНН и фамилий сотрудников.
- Окно браузера 1600×1000, масштаб 100 %. В кадр — область приложения, без панели браузера.
- Скрины — PNG, JPG или WebP, до 10 МБ. На сайте кадр показывается в пропорции 16:10 и обрезается снизу:
  главное держите вверху.
- Видео — MP4 (H.264), 1600×1000 или 1920×1080, до 80 МБ (для быстрой загрузки лучше до 20 МБ);
  ролики сервисов 60–90 секунд, обзор — 2–3 минуты. Для видео нужен постер — картинка первого кадра.

## Куда загружать — код и выкладка не нужны

- Админка → «Сайт» → «Картинки и видео»: места кадров по страницам, у каждого — что снять (как в таблицах ниже).
- «Загрузить» на нужном месте, у видео — ещё и постер. Замена — той же кнопкой, прежний файл удалится сам.
- На сайте файл появится в течение пары минут: страницы сверяют список раз в минуту. Не видно — обновите
  страницу ещё раз.
- Файлы хранятся на сервере, в git их не кладём.

## Что уже есть

Скрины и ролики ноября 2025 года лежат в \`public/demo\` и \`public/video\`. Интерфейс с тех пор
менялся, поэтому в раздел они не поставлены. Если нужно выложить раздел раньше съёмки,
их можно загрузить в админке на места нужных кадров.

Кадры с пометкой «/ai» нужны и разделу «AI для отдела продаж» — снимите один раз на оба.
`;

const TABLE_HEAD = [
    '| Кадр | Тип | Где снять | Что в кадре | Где на сайте |',
    '|---|---|---|---|---|',
];

const cell = (text: string): string => text.replace(/\|/g, '\\|');

const describeWhat = (shot: PlatformShotSpec): string =>
    shot.aiScreenIds
        ? `${cell(shot.what)} (/ai: ${shot.aiScreenIds.join(', ')})`
        : cell(shot.what);

const renderRow = (
    id: PlatformShotId,
    shot: PlatformShotSpec,
    pages: readonly string[],
): string =>
    [
        '',
        `\`${id}\``,
        shot.kind === 'video' ? 'видео' : 'скрин',
        cell(shot.where),
        describeWhat(shot),
        pages.join(', '),
        '',
    ]
        .join(' | ')
        .trim();

export function renderShotList(
    shots: Record<PlatformShotId, PlatformShotSpec>,
    usage: ReadonlyMap<PlatformShotId, readonly string[]>,
): string {
    const ids = Object.keys(shots) as PlatformShotId[];
    const sections = ([1, 2, 3] as const).map(priority => {
        const inPriority = ids.filter(id => shots[id].priority === priority);
        return [
            `## ${PRIORITY_TITLES[priority]} — ${inPriority.length}`,
            '',
            ...TABLE_HEAD,
            ...inPriority.map(id => renderRow(id, shots[id], usage.get(id) ?? [])),
        ].join('\n');
    });
    return `${HEADER}\n${sections.join('\n\n')}\n`;
}
