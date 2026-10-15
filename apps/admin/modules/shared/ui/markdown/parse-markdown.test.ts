import { describe, expect, it } from 'vitest';
import {
    isSafeMarkdownHref,
    parseMarkdown,
    parseMarkdownInline,
    type MarkdownBlock,
    type MarkdownInline,
} from './parse-markdown';

/**
 * Парсер markdown для текстов бэка (теория хуков, категории настроек):
 * ровно то подмножество, которым они написаны, и ничего небезопасного.
 */

const text = (value: string): MarkdownInline => ({ type: 'text', value });

describe('parseMarkdown: заголовки и абзацы', () => {
    it('заголовки получают уровень, абзацы склеиваются из строк', () => {
        const blocks = parseMarkdown(
            '## Три режима\n\nПервая строка\nвторая строка\n\n### Подраздел',
        );
        expect(blocks).toEqual<MarkdownBlock[]>([
            { type: 'heading', level: 2, children: [text('Три режима')] },
            {
                type: 'paragraph',
                children: [text('Первая строка вторая строка')],
            },
            { type: 'heading', level: 3, children: [text('Подраздел')] },
        ]);
    });

    it('решётка без пробела — не заголовок, уровень выше шестого не бывает', () => {
        expect(parseMarkdown('#hashtag')[0]?.type).toBe('paragraph');
        expect(parseMarkdown('####### семь')[0]?.type).toBe('paragraph');
    });

    it('windows-переводы строк и пустые строки не ломают разбор', () => {
        expect(parseMarkdown('a\r\n\r\nb')).toHaveLength(2);
        expect(parseMarkdown('\n\n')).toEqual([]);
    });
});

describe('parseMarkdown: списки', () => {
    it('маркированный список из «-» и «*»', () => {
        const blocks = parseMarkdown('- один\n- два\n* три');
        expect(blocks).toEqual<MarkdownBlock[]>([
            {
                type: 'list',
                ordered: false,
                items: [[text('один')], [text('два')], [text('три')]],
            },
        ]);
    });

    it('нумерованный список: пустая строка между пунктами не рвёт его, продолжение склеивается', () => {
        const blocks = parseMarkdown(
            '1. **Стадии лида**: кнопка\nпродолжение пункта\n\n2. Поля\n\nАбзац после списка',
        );
        expect(blocks).toHaveLength(2);
        expect(blocks[0]).toEqual<MarkdownBlock>({
            type: 'list',
            ordered: true,
            items: [
                [
                    { type: 'bold', children: [text('Стадии лида')] },
                    text(': кнопка продолжение пункта'),
                ],
                [text('Поля')],
            ],
        });
        expect(blocks[1]?.type).toBe('paragraph');
    });

    it('список другого вида начинает новый блок', () => {
        const blocks = parseMarkdown('- a\n1. b');
        expect(blocks.map(block => block.type)).toEqual(['list', 'list']);
    });
});

describe('parseMarkdown: таблицы GFM', () => {
    it('шапка, разделитель и строки; инлайн внутри ячеек', () => {
        const blocks = parseMarkdown(
            [
                '| Режим | Флаги |',
                '|---|---|',
                '| **Конвертация** | `stageMode=from_lead`, `isXo=N` |',
                '| Заявка | коротко',
            ].join('\n'),
        );
        expect(blocks).toEqual<MarkdownBlock[]>([
            {
                type: 'table',
                header: [[text('Режим')], [text('Флаги')]],
                rows: [
                    [
                        [{ type: 'bold', children: [text('Конвертация')] }],
                        [
                            { type: 'code', value: 'stageMode=from_lead' },
                            text(', '),
                            { type: 'code', value: 'isXo=N' },
                        ],
                    ],
                    [[text('Заявка')], [text('коротко')]],
                ],
            },
        ]);
    });

    it('строка с чертой без разделителя — обычный абзац', () => {
        expect(parseMarkdown('| a | b |\nтекст')[0]?.type).toBe('paragraph');
    });

    it('экранированная черта остаётся в ячейке, ряд подгоняется под шапку', () => {
        const [table] = parseMarkdown('| a | b |\n|---|---|\n| x \\| y |');
        expect(table).toMatchObject({
            type: 'table',
            rows: [[[text('x | y')], []]],
        });
    });
});

describe('parseMarkdown: цитаты, код, разделители', () => {
    it('огороженный блок кода сохраняет строки как есть и язык', () => {
        const blocks = parseMarkdown(
            '```json\n{ "a": **1** }\n  indented\n```\nпосле',
        );
        expect(blocks).toEqual<MarkdownBlock[]>([
            {
                type: 'code',
                language: 'json',
                value: '{ "a": **1** }\n  indented',
            },
            { type: 'paragraph', children: [text('после')] },
        ]);
    });

    it('незакрытый блок кода тянется до конца текста', () => {
        expect(parseMarkdown('```\nx\ny')).toEqual<MarkdownBlock[]>([
            { type: 'code', language: null, value: 'x\ny' },
        ]);
    });

    it('цитата разбирается рекурсивно', () => {
        expect(parseMarkdown('> ## Важно\n> текст')).toEqual<MarkdownBlock[]>([
            {
                type: 'blockquote',
                children: [
                    { type: 'heading', level: 2, children: [text('Важно')] },
                    { type: 'paragraph', children: [text('текст')] },
                ],
            },
        ]);
    });

    it('горизонтальная линия', () => {
        expect(parseMarkdown('a\n\n---\n\nb').map(block => block.type)).toEqual([
            'paragraph',
            'rule',
            'paragraph',
        ]);
    });
});

describe('parseMarkdownInline: смесь разметки', () => {
    it('код, жирный, курсив и ссылка в одной строке', () => {
        expect(
            parseMarkdownInline(
                'Робот шлёт `POST …/webhook` — **ответ** *сразу*, см. [доку](https://example.com/a).',
            ),
        ).toEqual([
            text('Робот шлёт '),
            { type: 'code', value: 'POST …/webhook' },
            text(' — '),
            { type: 'bold', children: [text('ответ')] },
            text(' '),
            { type: 'italic', children: [text('сразу')] },
            text(', см. '),
            {
                type: 'link',
                href: 'https://example.com/a',
                children: [text('доку')],
            },
            text('.'),
        ]);
    });

    it('жирный внутри может содержать код, ссылка — жирный', () => {
        expect(parseMarkdownInline('**поле `to_base_sales`** [**x**](/a)')).toEqual([
            {
                type: 'bold',
                children: [text('поле '), { type: 'code', value: 'to_base_sales' }],
            },
            text(' '),
            {
                type: 'link',
                href: '/a',
                children: [{ type: 'bold', children: [text('x')] }],
            },
        ]);
    });

    it('подчёркивания в идентификаторах и одинокие звёздочки — просто текст', () => {
        expect(parseMarkdownInline('op_lead_status и 2 * 3 * 4')).toEqual([
            text('op_lead_status и 2 * 3 * 4'),
        ]);
        expect(parseMarkdownInline('**не закрыто')).toEqual([text('**не закрыто')]);
    });

    it('внутри кода разметка не действует, двойные кавычки — для кода с кавычкой', () => {
        expect(parseMarkdownInline('`**a** [b](c)` и `` x`y ``')).toEqual([
            { type: 'code', value: '**a** [b](c)' },
            text(' и '),
            { type: 'code', value: 'x`y' },
        ]);
    });

    it('обратный слэш экранирует разметку', () => {
        expect(parseMarkdownInline('\\*не курсив\\* и \\`не код\\`')).toEqual([
            text('*не курсив* и `не код`'),
        ]);
    });
});

describe('parseMarkdown: безопасность', () => {
    it('HTML остаётся буквами: <script> — обычный текст абзаца', () => {
        const blocks = parseMarkdown('<script>alert(1)</script> и <b>жирный</b>');
        expect(blocks).toEqual<MarkdownBlock[]>([
            {
                type: 'paragraph',
                children: [text('<script>alert(1)</script> и <b>жирный</b>')],
            },
        ]);
    });

    it('ссылка с небезопасным адресом ссылкой не становится', () => {
        expect(parseMarkdownInline('[x](javascript:alert(1))')).toEqual([
            text('[x](javascript:alert(1))'),
        ]);
        expect(parseMarkdownInline('[x](data:text/html,1)')).toEqual([
            text('[x](data:text/html,1)'),
        ]);
    });

    it('isSafeMarkdownHref: http(s), почта, относительные и якоря', () => {
        expect(isSafeMarkdownHref('https://a.b')).toBe(true);
        expect(isSafeMarkdownHref('HTTP://a.b')).toBe(true);
        expect(isSafeMarkdownHref('mailto:x@y.z')).toBe(true);
        expect(isSafeMarkdownHref('/portal/7/hooks')).toBe(true);
        expect(isSafeMarkdownHref('#anchor')).toBe(true);
        expect(isSafeMarkdownHref('javascript:void(0)')).toBe(false);
        expect(isSafeMarkdownHref('vbscript:x')).toBe(false);
    });
});
