import { describe, expect, it } from 'vitest';
import type { CheckPresentationItem } from '../type/check-presentation-type';
import {
    getDisplayTitle,
    getFiveKGroup,
    isFiveKCode,
} from './check-presentation.groups';

const item = (code: string, title: string): CheckPresentationItem =>
    ({ id: code, code, title }) as CheckPresentationItem;

describe('isFiveKCode', () => {
    it('op_5k_* — да, остальное — нет', () => {
        expect(isFiveKCode('op_5k_client_what')).toBe(true);
        expect(isFiveKCode('op_presentation_xvost')).toBe(false);
        expect(isFiveKCode('xo_impression')).toBe(false);
    });
});

describe('getFiveKGroup', () => {
    it('раскладывает все пять категорий по сегменту кода', () => {
        expect(getFiveKGroup('op_5k_client_what')).toBe('Клиент');
        expect(getFiveKGroup('op_5k_company_who')).toBe('Компания');
        expect(getFiveKGroup('op_5k_command')).toBe('Коллеги');
        expect(getFiveKGroup('op_5k_concurent')).toBe('Конкурент');
        expect(getFiveKGroup('op_5k_criteri')).toBe('Критерий выбора');
    });

    it('не-5К и неизвестный сегмент — null', () => {
        expect(getFiveKGroup('op_presentation_xvost')).toBeNull();
        expect(getFiveKGroup('op_5k_unknown_thing')).toBeNull();
    });
});

describe('getDisplayTitle', () => {
    it('срезает префикс категории только у 5К', () => {
        expect(
            getDisplayTitle(item('op_5k_client_what', 'КЛИЕНТ: Что хочет?')),
        ).toBe('Что хочет?');
        expect(
            getDisplayTitle(
                item(
                    'op_5k_criteri',
                    'КРИТЕРИЙ ВЫБОРА: Что важно при выборе СПС?',
                ),
            ),
        ).toBe('Что важно при выборе СПС?');
    });

    it('обычные вопросы не трогает, даже с двоеточием в тексте', () => {
        expect(getDisplayTitle(item('op_presentation_xvost', 'Хвост'))).toBe(
            'Хвост',
        );
        expect(
            getDisplayTitle(item('xo_impression', 'Итог: первое впечатление')),
        ).toBe('Итог: первое впечатление');
    });
});
