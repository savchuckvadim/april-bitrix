import { describe, expect, it } from 'vitest';
import {
    applyLetterTag,
    normalizeLetterText,
    parseStyledLetter,
    plainIndexOfRaw,
    selectionLetterTag,
    serializeStyledLetter,
} from './offer-letter-markup.util';

/** Выделение по подстроке: удобнее, чем считать индексы руками */
const select = (raw: string, fragment: string): [number, number] => {
    const start = raw.indexOf(fragment);
    return [start, start + fragment.length];
};

describe('разбор и запись разметки письма', () => {
    it('текст без тегов получает стиль на каждый символ', () => {
        const { plain, styles } = parseStyledLetter('Раз <color>два</color> <bold>три</bold>');
        expect(plain).toBe('Раз два три');
        expect(styles.slice(0, 4)).toEqual([null, null, null, null]);
        expect(styles.slice(4, 7)).toEqual(['color', 'color', 'color']);
        expect(styles.slice(8)).toEqual(['bold', 'bold', 'bold']);
    });

    it('вложенные теги сводятся к одному: красный сильнее акцента, акцент сильнее жирного', () => {
        expect(parseStyledLetter('<bold><red>а</red></bold>').styles).toEqual(['red']);
        expect(parseStyledLetter('<bold><color>а</color></bold>').styles).toEqual(['color']);
    });

    it('незакрытый тег действует до конца текста, как в PDF', () => {
        expect(parseStyledLetter('до <red>после').styles.slice(3)).toEqual(
            Array.from({ length: 5 }, () => 'red'),
        );
    });

    it('запись возвращает те же теги плоско и отдаёт начало каждого символа', () => {
        const letter = parseStyledLetter('Раз <color>два</color>!');
        const { text, charStart } = serializeStyledLetter(letter);
        expect(text).toBe('Раз <color>два</color>!');
        expect(text.slice(charStart[4])).toBe('два</color>!');
        expect(charStart[letter.plain.length]).toBe(text.length);
    });

    it('позиция в тексте с тегами переводится в позицию без тегов', () => {
        const raw = 'a<bold>bc</bold>d';
        expect(plainIndexOfRaw(raw, 0)).toBe(0);
        expect(plainIndexOfRaw(raw, 1)).toBe(1);
        expect(plainIndexOfRaw(raw, 7)).toBe(1);
        expect(plainIndexOfRaw(raw, 9)).toBe(3);
        expect(plainIndexOfRaw(raw, raw.length)).toBe(4);
        // внутри тега — начало этого тега
        expect(plainIndexOfRaw(raw, 3)).toBe(1);
    });

    it('литерал «\\n» из легаси и CRLF становятся переводом строки', () => {
        expect(normalizeLetterText('Раз\\nДва\r\nТри')).toBe('Раз\nДва\nТри');
    });
});

describe('применение тега к выделению', () => {
    it('оборачивает выделенный фрагмент и оставляет выделение на нём', () => {
        const raw = 'Добрый день, коллеги';
        const [start, end] = select(raw, 'день');
        const edit = applyLetterTag(raw, start, end, 'bold');
        expect(edit.text).toBe('Добрый <bold>день</bold>, коллеги');
        expect(edit.text.slice(edit.selectionStart, edit.selectionEnd)).toBe('день');
    });

    it('повторное применение того же тега снимает его', () => {
        const raw = 'Добрый <bold>день</bold>, коллеги';
        const [start, end] = select(raw, 'день');
        const edit = applyLetterTag(raw, start, end, 'bold');
        expect(edit.text).toBe('Добрый день, коллеги');
        expect(edit.text.slice(edit.selectionStart, edit.selectionEnd)).toBe('день');
    });

    it('другой тег заменяет прежний, вложенности не возникает', () => {
        const raw = 'Добрый <bold>день</bold>';
        const [start, end] = select(raw, 'день');
        expect(applyLetterTag(raw, start, end, 'red').text).toBe('Добрый <red>день</red>');
    });

    it('выделение, зацепившее часть стилизованного текста, не ломает теги', () => {
        const raw = 'Раз <red>два три</red> четыре';
        const [start, end] = select(raw, 'три</red> чет');
        const edit = applyLetterTag(raw, start, end, 'bold');
        expect(edit.text).toBe('Раз <red>два </red><bold>три чет</bold>ыре');
    });

    it('выделение с границей внутри тега привязывается к тексту, а не к символам тега', () => {
        const raw = 'Раз <color>два</color>';
        const start = raw.indexOf('<color>') + 3;
        const edit = applyLetterTag(raw, start, raw.length, 'bold');
        expect(edit.text).toBe('Раз <bold>два</bold>');
    });

    it('пробелы и переводы строк по краям выделения не стилизуются', () => {
        const raw = 'слово следующее';
        const edit = applyLetterTag(raw, 0, 'слово '.length, 'color');
        expect(edit.text).toBe('<color>слово</color> следующее');
    });

    it('выделение через несколько абзацев остаётся одним фрагментом', () => {
        const raw = 'Первый\nВторой';
        const edit = applyLetterTag(raw, 0, raw.length, 'bold');
        expect(edit.text).toBe('<bold>Первый\nВторой</bold>');
    });

    it('сброс снимает любой стиль с фрагмента', () => {
        const raw = '<red>всё красное</red>';
        const [start, end] = select(raw, 'красное');
        expect(applyLetterTag(raw, start, end, null).text).toBe('<red>всё </red>красное');
    });

    it('пустое выделение и сброс обычного текста ничего не меняют', () => {
        const raw = 'Добрый день';
        expect(applyLetterTag(raw, 3, 3, 'bold').text).toBe(raw);
        expect(applyLetterTag(raw, 0, raw.length, null).text).toBe(raw);
    });

    it('выделение справа налево работает так же', () => {
        const raw = 'Добрый день';
        const [start, end] = select(raw, 'день');
        expect(applyLetterTag(raw, end, start, 'bold').text).toBe('Добрый <bold>день</bold>');
    });

    it('результат всегда плоский: вложенная запись при правке выпрямляется', () => {
        const raw = '<bold>жирный <red>красный</red></bold> конец';
        const [start, end] = select(raw, 'конец');
        const edit = applyLetterTag(raw, start, end, 'color');
        expect(edit.text).toBe('<bold>жирный </bold><red>красный</red> <color>конец</color>');
    });
});

describe('стиль выделения', () => {
    it('один стиль на весь фрагмент — он и есть стиль выделения', () => {
        const raw = 'Раз <color>два</color> три';
        expect(selectionLetterTag(raw, ...select(raw, 'два'))).toBe('color');
    });

    it('смешанный фрагмент и пустое выделение — без стиля', () => {
        const raw = 'Раз <color>два</color> три';
        expect(selectionLetterTag(raw, ...select(raw, 'Раз два'))).toBeNull();
        expect(selectionLetterTag(raw, 2, 2)).toBeNull();
    });
});
