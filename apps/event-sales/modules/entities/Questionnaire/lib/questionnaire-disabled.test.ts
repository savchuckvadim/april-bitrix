import { describe, expect, it } from 'vitest';
import type { QuestionnaireCondition } from '../model/questionnaire.type';
import {
    isQuestionnaireDisabledByEventTypes,
    parseQuestionnaireDisabledEventTypes,
} from './questionnaire-disabled';

/**
 * Рубильник «анкеты выключены для типов события». Правило обязано совпадать
 * с бэковым один в один (`isQuestionnaireDisabledByEventTypes` в
 * portal-questionnaires.schema.ts): фрейм по нему прячет анкету, бэк — по
 * нему же выбрасывает ответы. Разойдутся — либо анкета висит на экране,
 * ответы на которую молча пропадают, либо отправка заперта вопросом, на
 * который отвечать уже не должны.
 */

const condition = (
    kind: QuestionnaireCondition['kind'],
    values: string[] = [],
): QuestionnaireCondition => ({ kind, values });

describe('parseQuestionnaireDisabledEventTypes', () => {
    it('CSV с пробелами и дублями → список кодов', () => {
        expect(
            parseQuestionnaireDisabledEventTypes(' presentation, hot ,hot'),
        ).toEqual(['presentation', 'hot']);
    });

    it('пусто и «ключа нет» — это выключенный рубильник, а не сбой', () => {
        expect(parseQuestionnaireDisabledEventTypes('')).toEqual([]);
        expect(parseQuestionnaireDisabledEventTypes(',, ,')).toEqual([]);
        expect(parseQuestionnaireDisabledEventTypes(undefined)).toEqual([]);
        expect(parseQuestionnaireDisabledEventTypes(null)).toEqual([]);
    });
});

describe('isQuestionnaireDisabledByEventTypes', () => {
    it('пустой рубильник не гасит ничего', () => {
        expect(
            isQuestionnaireDisabledByEventTypes(
                [condition('planType', ['refine'])],
                [],
            ),
        ).toBe(false);
    });

    it('шлагбаум целиком из выключенных типов — анкета погашена', () => {
        expect(
            isQuestionnaireDisabledByEventTypes(
                [condition('reportType', ['hot'])],
                ['hot'],
            ),
        ).toBe(true);
    });

    /**
     * Значения условия — ИЛИ: пока в списке остался невыключенный тип,
     * шлагбаум проходим, и гасить анкету нечем.
     */
    it('в условии остался рабочий тип — анкета живёт', () => {
        expect(
            isQuestionnaireDisabledByEventTypes(
                [condition('planType', ['refine', 'moneyAwait'])],
                ['refine'],
            ),
        ).toBe(false);
    });

    /** Спонтанная презентация: тип задачи — звонок, а элемент презентации. */
    it('«презентация проведена» гасится кодом presentation', () => {
        expect(
            isQuestionnaireDisabledByEventTypes(
                [condition('presentationDone')],
                ['presentation'],
            ),
        ).toBe(true);
        expect(
            isQuestionnaireDisabledByEventTypes(
                [condition('presentationDone')],
                ['hot'],
            ),
        ).toBe(false);
    });

    it('условия не по типу события рубильником не трогаются', () => {
        const conditions = [
            condition('always'),
            condition('workStatus', ['work']),
            condition('targetStage', ['sales_success']),
        ];
        expect(
            isQuestionnaireDisabledByEventTypes(conditions, [
                'refine',
                'hot',
                'presentation',
            ]),
        ).toBe(false);
    });

    /** Условие без значений — сломанные данные, а не «все типы». */
    it('пустой список значений анкету не гасит', () => {
        expect(
            isQuestionnaireDisabledByEventTypes(
                [condition('planType', [])],
                ['refine'],
            ),
        ).toBe(false);
    });

    /** Между условиями И: хватает одного непроходимого шлагбаума. */
    it('погашен один шлагбаум из нескольких — погашена вся анкета', () => {
        expect(
            isQuestionnaireDisabledByEventTypes(
                [condition('planType', ['refine']), condition('always')],
                ['refine'],
            ),
        ).toBe(true);
    });
});
