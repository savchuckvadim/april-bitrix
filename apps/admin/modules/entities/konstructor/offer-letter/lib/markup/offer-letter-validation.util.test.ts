import { describe, expect, it } from 'vitest';
import { findLetterMarkupError } from './offer-letter-validation.util';

describe('проверка разметки письма до отправки', () => {
    it('верная разметка, в том числе вложенная, ошибок не даёт', () => {
        expect(findLetterMarkupError('Раз <color>два</color> <bold>три <red>четыре</red></bold>')).toBeNull();
        expect(findLetterMarkupError('Без тегов')).toBeNull();
    });

    it('незакрытый тег называется', () => {
        expect(findLetterMarkupError('Раз <color>два')).toBe('Не закрыт тег <color>.');
    });

    it('лишний закрывающий тег называется', () => {
        expect(findLetterMarkupError('Раз</red> два')).toContain('Лишний закрывающий тег </red>');
    });

    it('пересекающиеся теги отклоняются', () => {
        expect(findLetterMarkupError('<bold>раз <red>два</bold> три</red>')).toContain(
            'не должны пересекаться',
        );
    });

    it('чужие и написанные с другим регистром теги отклоняются с перечнем допустимых', () => {
        const expected = 'Доступны: <color>, <bold>, <red>.';
        expect(findLetterMarkupError('Раз <b>два</b>')).toContain(expected);
        expect(findLetterMarkupError('Раз <Bold>два</Bold>')).toContain(expected);
        expect(findLetterMarkupError('Раз<br/>два')).toContain(expected);
    });

    it('знаки «меньше/больше» в обычном тексте тегами не считаются', () => {
        expect(findLetterMarkupError('Скидка при заказе > 5 лицензий, срок < 3 дней')).toBeNull();
    });
});
