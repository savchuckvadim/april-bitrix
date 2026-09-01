import { describe, expect, it } from 'vitest';
import type { CheckPresentationItem } from '../type/check-presentation-type';
import {
    getDisplayTitle,
    getFiveKGroup,
    isFiveKCode,
} from './check-presentation.groups';

/**
 * Раскладка опросника после переделки 01.09.2026.
 *
 * Девять вопросов «5К» схлопнулись в пять блоков по теме, и заголовок блока
 * («КЛИЕНТ») сам называет категорию. Поэтому отдельного имени группы больше
 * нет, а из заголовка нечего срезать. Осталась одна работа — делить вопросы
 * на колонки: слева «Хвост», справа «5К».
 */

const item = (code: string, title: string): CheckPresentationItem =>
    ({ id: code, code, title }) as CheckPresentationItem;

describe('isFiveKCode', () => {
    it('op_5k_* — да, остальное — нет', () => {
        expect(isFiveKCode('op_5k_client')).toBe(true);
        expect(isFiveKCode('op_5k_criteria')).toBe(true);
        expect(isFiveKCode('op_presentation_xvost')).toBe(false);
        expect(isFiveKCode('op_xvost_desire')).toBe(false);
    });
});

describe('getFiveKGroup', () => {
    it('групп внутри блока больше нет — категорию называет заголовок', () => {
        expect(getFiveKGroup('op_5k_client')).toBeNull();
        expect(getFiveKGroup('op_presentation_xvost')).toBeNull();
    });
});

describe('getDisplayTitle', () => {
    it('заголовок показывается как есть — резать нечего', () => {
        // Прежний срез «до двоеточия» оставил бы от «КЛИЕНТ» пустую строку.
        expect(getDisplayTitle(item('op_5k_client', 'КЛИЕНТ'))).toBe('КЛИЕНТ');
        expect(
            getDisplayTitle(item('op_5k_criteria', 'КРИТЕРИИ ВЫБОРА')),
        ).toBe('КРИТЕРИИ ВЫБОРА');
    });

    it('обычные вопросы не трогает, даже с двоеточием в тексте', () => {
        expect(getDisplayTitle(item('op_presentation_xvost', 'Хвост'))).toBe(
            'Хвост',
        );
        expect(
            getDisplayTitle(item('op_xvost_desire', 'Итог: впечатление')),
        ).toBe('Итог: впечатление');
    });
});
