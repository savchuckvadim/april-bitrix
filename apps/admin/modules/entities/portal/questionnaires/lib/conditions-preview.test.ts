import { describe, expect, it } from 'vitest';
import { describeQuestionnairePreview } from './conditions-preview';
import { createQuestionnaireDraft } from './questionnaire-draft';
import type { QuestionnaireDraft } from './questionnaire-draft';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';
import { unknownCode } from './unknown-code.fixture';

const draft = (
    patch: Partial<QuestionnaireDraft> = {},
): QuestionnaireDraft => ({
    ...createQuestionnaireDraft('event-sales', schema),
    title: 'Что узнать до звонка',
    code: 'chto_uznat_do_zvonka',
    ...patch,
});

describe('describeQuestionnairePreview', () => {
    it('читает анкету отчёта фразой, а не кодами', () => {
        const text = describeQuestionnairePreview(
            draft({
                purpose: 'report',
                place: 'report',
                conditions: [{ kind: 'reportType', values: ['hot'] }],
            }),
            schema,
        );

        expect(text).toBe(
            'Показывается карточкой в колонке «Отчёт», когда тип отчётного ' +
                'события — Решение.',
        );
    });

    it('перечисляет значения одного условия через запятую', () => {
        const text = describeQuestionnairePreview(
            draft({
                conditions: [
                    {
                        kind: 'planType',
                        values: ['warm', 'presentation', 'hot'],
                    },
                ],
            }),
            schema,
        );

        expect(text).toBe(
            'Показывается карточкой в колонке «Планируем», когда тип ' +
                'планируемого события — Звонок, Презентация и Решение.',
        );
    });

    it('соединяет условия «и»: они выполняются вместе', () => {
        const text = describeQuestionnairePreview(
            draft({
                conditions: [
                    { kind: 'planType', values: ['hot'] },
                    { kind: 'workStatus', values: ['inJob'] },
                ],
            }),
            schema,
        );

        expect(text).toContain(
            'тип планируемого события — Решение и статус работы — В работе.',
        );
    });

    it('условие «Всегда» читается без «когда»', () => {
        const text = describeQuestionnairePreview(
            draft({ conditions: [{ kind: 'always' }] }),
            schema,
        );

        expect(text).toBe(
            'Показывается карточкой в колонке «Планируем» всегда.',
        );
    });

    it('у анкеты-модалки колонки в фразе нет', () => {
        const text = describeQuestionnairePreview(
            draft({
                presentation: 'modal',
                place: null,
                conditions: [{ kind: 'reportType', values: ['ss'] }],
            }),
            schema,
        );

        expect(text).toBe(
            'Показывается модалкой перед отправкой, когда тип отчётного ' +
                'события — Сопровождение.',
        );
    });

    it('пустой список условий читается как «не показывается нигде»', () => {
        const text = describeQuestionnairePreview(
            draft({ conditions: [] }),
            schema,
        );

        expect(text).toContain('условий показа нет');
        expect(text).toContain('не показывается');
    });

    it('условие без выбранных значений видно в фразе', () => {
        const text = describeQuestionnairePreview(
            draft({ conditions: [{ kind: 'planType', values: [] }] }),
            schema,
        );

        expect(text).toContain('значения не выбраны');
    });

    it('невыбранная колонка карточки названа прямо', () => {
        const text = describeQuestionnairePreview(
            draft({ place: null, conditions: [{ kind: 'always' }] }),
            schema,
        );

        expect(text).toContain('колонка не выбрана');
    });

    it('вид условия вне реестра показывается сырым кодом', () => {
        // Реестр бэка может уехать вперёд админки: молча пропустить условие
        // хуже, чем показать его код.
        const text = describeQuestionnairePreview(
            draft({
                conditions: [
                    unknownCode({ kind: 'phaseOfMoon', values: ['full'] }),
                ],
            }),
            schema,
        );

        expect(text).toContain('phaseOfMoon');
    });

    it('без реестра предпросмотр честно говорит, что собрать его нечем', () => {
        expect(describeQuestionnairePreview(draft(), undefined)).toContain(
            'Реестр значений ещё не загружен',
        );
    });
});
