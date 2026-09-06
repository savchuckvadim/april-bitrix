import { describe, expect, it } from 'vitest';
import { parseMarkdownInline, parseMarkdownLite } from './markdown-lite.util';

/** Фрагмент в форме, которой бэк рендерит отчёт аудита. */
const REPORT = [
    '# Аудит данных AI-аналитики ОП — april.bitrix24.ru — 2026-09-06',
    '',
    'Окно: 2026-04 … 2026-09 (6 мес.), часовой пояс Europe/Moscow.',
    'Выборка: transcriptions со status = done и dedup_key, месяц по call_started_at, иначе created_at.',
    '',
    '- Загружено строк: 10, вне окна: 1, в окне: 9.',
    '- Порог ячейки n ≥ 8; короткий звонок < 300 с.',
    '',
    '## 1. Покрытие user_id в transcriptions по месяцам',
    '',
    '| Месяц | Звонков | Доля |',
    '| --- | --- | --- |',
    '| 2026-08 | 5 | 80 % |',
    '| 2026-09 | 4 | — |',
    '',
    '#### 2026-09',
    '',
    '| Менеджер | cold | Всего |',
    '| --- | --- | --- |',
    '| 17 | **9** | 9 |',
    '',
    '_Разборов в окне нет._',
    '',
].join('\n');

describe('parseMarkdownLite: блоки отчёта аудита', () => {
    const blocks = parseMarkdownLite(REPORT);

    it('заголовки любого уровня становятся heading с уровнем', () => {
        expect(blocks[0]).toEqual({
            kind: 'heading',
            level: 1,
            text: 'Аудит данных AI-аналитики ОП — april.bitrix24.ru — 2026-09-06',
        });
        expect(blocks).toContainEqual({
            kind: 'heading',
            level: 4,
            text: '2026-09',
        });
    });

    it('подряд идущие строки — один абзац, подчёркивания в словах не трогаются', () => {
        expect(blocks[1]).toEqual({
            kind: 'paragraph',
            italic: false,
            lines: [
                'Окно: 2026-04 … 2026-09 (6 мес.), часовой пояс Europe/Moscow.',
                'Выборка: transcriptions со status = done и dedup_key, месяц по call_started_at, иначе created_at.',
            ],
        });
    });

    it('маркированный список собирается в list', () => {
        expect(blocks[2]).toEqual({
            kind: 'list',
            items: [
                'Загружено строк: 10, вне окна: 1, в окне: 9.',
                'Порог ячейки n ≥ 8; короткий звонок < 300 с.',
            ],
        });
    });

    it('таблица: шапка, разделитель отброшен, ячейки обрезаны', () => {
        expect(blocks[4]).toEqual({
            kind: 'table',
            headers: ['Месяц', 'Звонков', 'Доля'],
            rows: [
                ['2026-08', '5', '80 %'],
                ['2026-09', '4', '—'],
            ],
        });
    });

    it('курсив распознаётся только строкой целиком', () => {
        expect(blocks[blocks.length - 1]).toEqual({
            kind: 'paragraph',
            italic: true,
            lines: ['Разборов в окне нет.'],
        });
    });

    it('пустой текст — пустой список блоков', () => {
        expect(parseMarkdownLite('')).toEqual([]);
        expect(parseMarkdownLite('\n\n')).toEqual([]);
    });
});

describe('parseMarkdownInline: жирный и код', () => {
    it('жирная ячейка пивота выделяется, остальное — текст', () => {
        expect(parseMarkdownInline('n = **9** из `cold`')).toEqual([
            { kind: 'text', text: 'n = ' },
            { kind: 'bold', text: '9' },
            { kind: 'text', text: ' из ' },
            { kind: 'code', text: 'cold' },
        ]);
    });

    it('строка без разметки — один текстовый токен', () => {
        expect(parseMarkdownInline('user_id и call_started_at')).toEqual([
            { kind: 'text', text: 'user_id и call_started_at' },
        ]);
    });
});
