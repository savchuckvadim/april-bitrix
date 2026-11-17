/**
 * Главы про разбор звонка обязаны совпадать с конвейером (17.11.2026):
 * распознавание BitrixGPT Transcribe и Yandex, быстрое резюме по умолчанию
 * выключено, в сделку приходит «Глубокий AI-анализ звонка» со ссылкой на
 * страницу разбора, риск-флагов три, типов десять, версии — словами, без
 * внутренних кодов. Тест ловит откат к прежним формулировкам.
 */

import { describe, expect, it } from 'vitest';
import { AI_THEORY_ANCHORS } from './constants/anchors';
import { AI_PAGES } from './constants/pages';

const pageText = (slug: string): string => {
    const page = AI_PAGES.find(candidate => candidate.slug === slug);
    if (!page) throw new Error(`нет главы ${slug}`);
    return JSON.stringify(page);
};

/** Главы первого этапа актуализации — про разбор одного звонка. */
const CALL_CHAPTERS = [
    'theory/call-analysis',
    'theory/call-types',
    'smart',
    'push',
    'settings',
    'bitrix',
    'glossary',
] as const;

const callChaptersText = (): string =>
    CALL_CHAPTERS.map(slug => pageText(slug)).join(' ');

describe('главы про разбор звонка совпадают с конвейером', () => {
    it('короткие звонки распознаёт BitrixGPT Transcribe, Whisper не упоминается', () => {
        expect(pageText('theory/call-analysis')).toContain(
            'BitrixGPT Transcribe',
        );
        expect(pageText('settings')).toContain('BitrixGPT Transcribe');
        expect(callChaptersText()).not.toContain('Whisper');
    });

    it('быстрое резюме выключено, в сделку приходит глубокий разбор со ссылкой', () => {
        const text = pageText('theory/call-analysis');
        expect(text).toContain('Глубокий AI-анализ звонка');
        expect(text).toContain('Открыть разбор звонка');
        expect(pageText('settings')).not.toContain('по умолчанию GigaChat');
    });

    it('риск-флагов три: обещание и негатив клиента не флаги', () => {
        const text = callChaptersText();
        expect(text).not.toContain('необоснованное обещание');
        expect(text).not.toContain('сильный негатив клиента');
        expect(text).not.toContain('риск-флаги (четыре)');
    });

    it('типов звонка десять, якорь nine-types сохранён', () => {
        const page = AI_PAGES.find(
            candidate => candidate.slug === 'theory/call-types',
        );
        const heading = page?.blocks.find(
            block => block.kind === 'heading' && block.id === 'nine-types',
        );
        expect(heading).toMatchObject({ text: 'Десять типов' });
        expect(pageText('theory/call-types')).toContain(
            'Приглашение на мероприятие',
        );
        expect(callChaptersText()).not.toMatch(
            /[Дд]евять типов|девяти встроенных/,
        );
    });

    it('версии разбора — словами, без внутренних кодов', () => {
        const text = callChaptersText();
        expect(text).not.toMatch(/focus-v\d|sections-7-v\d|internal-focus/);
        expect(text).not.toContain('call-report-analyzer');
        expect(pageText('theory/call-analysis')).toContain(
            'редакция 3.3 от 17.11.2026',
        );
    });

    it('у страницы разбора звонка есть свой якорь в главе и в реестре', () => {
        const page = AI_PAGES.find(
            candidate => candidate.slug === 'theory/call-analysis',
        );
        const ids = page?.blocks.flatMap(block =>
            block.kind === 'heading' && block.id ? [block.id] : [],
        );
        expect(ids).toContain('call-page');
        expect(AI_THEORY_ANCHORS['/ai/theory/call-analysis']).toContain(
            'call-page',
        );
    });
});
