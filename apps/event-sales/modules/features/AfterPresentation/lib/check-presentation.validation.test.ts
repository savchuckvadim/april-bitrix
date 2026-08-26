import { describe, expect, it } from 'vitest';
import {
    CheckPresentationFieldType,
    type CheckPresentationItem,
} from '../type/check-presentation-type';
import {
    getMissingRequiredIds,
    isAnswerFilled,
} from './check-presentation.validation';

const item = (
    over: Partial<CheckPresentationItem> & { id: string },
): CheckPresentationItem => ({
    type: CheckPresentationFieldType.STRING,
    code: over.id,
    title: over.id,
    placeholder: '',
    required: true,
    ...over,
});

const BOOL = item({
    id: 'op_xvost_is_offer',
    type: CheckPresentationFieldType.BOOLEAN,
});

/**
 * «Да/Нет» — три состояния. Контрол-тумблер по умолчанию показывал «Нет», и
 * незаполненный вопрос выглядел отвеченным; правило «ответ — только явные
 * true/false» должно оставаться закреплённым тестом.
 */
describe('опросник: обязательные «да/нет»', () => {
    it('вопрос не тронут — ответа нет', () => {
        expect(isAnswerFilled(BOOL, undefined)).toBe(false);
        expect(getMissingRequiredIds([BOOL], {})).toEqual([
            'op_xvost_is_offer',
        ]);
    });

    it('«Нет» — такой же полноценный ответ, как «Да»', () => {
        expect(isAnswerFilled(BOOL, false)).toBe(true);
        expect(isAnswerFilled(BOOL, true)).toBe(true);
        expect(
            getMissingRequiredIds([BOOL], { op_xvost_is_offer: false }),
        ).toEqual([]);
    });

    it('строка вместо выбора ответом не считается', () => {
        expect(isAnswerFilled(BOOL, '')).toBe(false);
        expect(isAnswerFilled(BOOL, 'да')).toBe(false);
    });

    it('необязательный вопрос без ответа не блокирует', () => {
        const optional = { ...BOOL, id: 'optional', required: false };
        expect(getMissingRequiredIds([optional], {})).toEqual([]);
    });
});

describe('опросник: остальные типы', () => {
    it('текст из пробелов не заполнен', () => {
        const text = item({ id: 'xo_impression' });
        expect(isAnswerFilled(text, '   ')).toBe(false);
        expect(isAnswerFilled(text, 'нормально')).toBe(true);
    });

    it('дата обязательна, пока пуста', () => {
        const date = item({
            id: 'op_manager_approach_date',
            type: CheckPresentationFieldType.DATE,
        });
        expect(getMissingRequiredIds([date], {})).toEqual([
            'op_manager_approach_date',
        ]);
        expect(
            getMissingRequiredIds([date], {
                op_manager_approach_date: '2026-08-26',
            }),
        ).toEqual([]);
    });
});
