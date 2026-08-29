import { describe, expect, it } from 'vitest';
import {
    parseQuestionnairePreset,
    questionnairePresetSearch,
} from './questionnaire-preset';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';

/** Разбор всегда идёт из настоящего адреса — так его и собирает матрица. */
const search = (query: string) => new URLSearchParams(query);

describe('questionnairePresetSearch', () => {
    it('собирает адрес клетки матрицы: назначение, вид условия и его значение', () => {
        expect(
            questionnairePresetSearch({
                purpose: 'report',
                conditionKind: 'reportType',
                conditionValue: 'hot',
            }),
        ).toBe('purpose=report&conditionKind=reportType&conditionValue=hot');
    });

    it('без значения условия параметр не пишется вовсе', () => {
        expect(
            questionnairePresetSearch({
                purpose: 'plan',
                conditionKind: 'planType',
                conditionValue: null,
            }),
        ).toBe('purpose=plan&conditionKind=planType');
    });

    it('без вида условия остаётся одно назначение', () => {
        expect(
            questionnairePresetSearch({
                purpose: 'plan',
                conditionKind: null,
                conditionValue: null,
            }),
        ).toBe('purpose=plan');
    });
});

describe('parseQuestionnairePreset', () => {
    it('читает то, что записала матрица — разбор обратен сборке', () => {
        const preset = {
            purpose: 'report',
            conditionKind: 'reportType',
            conditionValue: 'hot',
        } as const;

        expect(
            parseQuestionnairePreset(
                search(questionnairePresetSearch(preset)),
                schema,
            ),
        ).toEqual(preset);
    });

    it('без адреса предустановки нет', () => {
        expect(parseQuestionnairePreset(null, schema)).toBeNull();
    });

    it('без назначения предустановки нет: условие без колонки бессмысленно', () => {
        expect(
            parseQuestionnairePreset(
                search('conditionKind=reportType&conditionValue=hot'),
                schema,
            ),
        ).toBeNull();
    });

    it('назначение вне контракта предустановку отменяет целиком', () => {
        expect(
            parseQuestionnairePreset(search('purpose=retro'), schema),
        ).toBeNull();
    });

    it('вид условия вне контракта отбрасывается, назначение остаётся', () => {
        expect(
            parseQuestionnairePreset(
                search('purpose=plan&conditionKind=phaseOfMoon&value=full'),
                schema,
            ),
        ).toEqual({
            purpose: 'plan',
            conditionKind: null,
            conditionValue: null,
        });
    });

    it('значение вне реестра отбрасывается, вид условия остаётся', () => {
        expect(
            parseQuestionnairePreset(
                search(
                    'purpose=report&conditionKind=reportType&conditionValue=billing',
                ),
                schema,
            ),
        ).toEqual({
            purpose: 'report',
            conditionKind: 'reportType',
            conditionValue: null,
        });
    });

    it('значение чужого вида условия не проходит: справочники у видов разные', () => {
        // `xo` есть у типа отчётного события и НЕТ у планируемого.
        expect(
            parseQuestionnairePreset(
                search('purpose=plan&conditionKind=planType&conditionValue=xo'),
                schema,
            ),
        ).toEqual({
            purpose: 'plan',
            conditionKind: 'planType',
            conditionValue: null,
        });
    });

    it('пока реестр не прочитан, значение берётся как есть — сверять не с чем', () => {
        expect(
            parseQuestionnairePreset(
                search(
                    'purpose=report&conditionKind=reportType&conditionValue=hot',
                ),
                undefined,
            ),
        ).toEqual({
            purpose: 'report',
            conditionKind: 'reportType',
            conditionValue: 'hot',
        });
    });
});
