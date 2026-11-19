import { describe, expect, it } from 'vitest';
import { buildLetterParagraphs } from './offer-letter-preview.util';

const texts = (raw: string): string[] =>
    buildLetterParagraphs(raw).map(runs => runs.map(run => run.text).join(''));

describe('превью письма', () => {
    it('фрагменты с тегами становятся отдельными кусками со своим стилем', () => {
        expect(buildLetterParagraphs('Раз <color>два</color> <bold>три</bold>')).toEqual([
            [
                { text: 'Раз ', tag: null },
                { text: 'два', tag: 'color' },
                { text: ' ', tag: null },
                { text: 'три', tag: 'bold' },
            ],
        ]);
    });

    it('абзацы идут по переводам строк, пустые строки абзацев не создают', () => {
        expect(texts('Первый\n\nВторой\n \nТретий')).toEqual(['Первый', 'Второй', 'Третий']);
    });

    it('литерал «\\n» из легаси тоже делит на абзацы', () => {
        expect(texts('Первый\\nВторой')).toEqual(['Первый', 'Второй']);
    });

    it('тег, открытый в одном абзаце, продолжается в следующем', () => {
        const paragraphs = buildLetterParagraphs('<bold>раз\nдва</bold>');
        expect(paragraphs.map(runs => runs.map(run => run.tag))).toEqual([['bold'], ['bold']]);
    });

    it('пустой текст — ни одного абзаца', () => {
        expect(buildLetterParagraphs('')).toEqual([]);
        expect(buildLetterParagraphs('\n \n')).toEqual([]);
    });

    it('чужие теги выводятся как обычный текст, как и в PDF', () => {
        expect(texts('Раз <b>два</b>')).toEqual(['Раз <b>два</b>']);
    });
});
