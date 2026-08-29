import { describe, expect, it } from 'vitest';
import { buildCheckSummary } from './check-result-view';
import {
    questionnaireCheckDiff,
    questionnaireCheckItem as checkItem,
    questionnaireCheckResponse as response,
} from './questionnaire.fixture';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';
import { unknownCode } from './unknown-code.fixture';

describe('buildCheckSummary', () => {
    it('без ответа сводки нет — проверку ещё не запускали', () => {
        expect(buildCheckSummary(undefined, schema)).toBeNull();
    });

    it('говорит «всё на месте», когда чинить нечего', () => {
        const summary = buildCheckSummary(response(), schema);

        expect(summary?.headline).toBe('Все привязки на месте');
        expect(summary?.hasProblems).toBe(false);
        expect(summary?.checkedCount).toBe(1);
    });

    it('берёт формулировку вопроса из анкеты, а название статуса — из реестра', () => {
        const summary = buildCheckSummary(
            response({
                items: [
                    checkItem({
                        status: 'missing',
                        changed: true,
                        comment:
                            'Поля UF_CRM_DECISION_DATE на портале больше нет',
                    }),
                ],
            }),
            schema,
        );

        expect(summary?.rows[0]?.itemTitle).toBe('Когда решение');
        expect(summary?.rows[0]?.statusLabel).toBe('Поле не найдено');
        expect(summary?.rows[0]?.isProblem).toBe(true);
        expect(summary?.rows[0]?.comment).toContain('больше нет');
    });

    it('считает пропавшие поля и смену типа отдельными группами', () => {
        const summary = buildCheckSummary(
            response({
                items: [
                    checkItem({ status: 'missing', changed: true }),
                    checkItem({
                        itemId: 'item-2',
                        itemCode: 'decision',
                        fieldName: 'UF_CRM_DECISION',
                        status: 'type_changed',
                        changed: true,
                        deactivatedOptions: 2,
                    }),
                ],
            }),
            schema,
        );

        expect(summary?.problems).toEqual([
            { status: 'missing', label: 'Поле не найдено', count: 1 },
            { status: 'type_changed', label: 'Тип поля изменился', count: 1 },
        ]);
        expect(summary?.deactivatedOptions).toBe(2);
        expect(summary?.changedCount).toBe(2);
        expect(summary?.headline).toContain('Поле не найдено — 1');
        expect(summary?.headline).toContain('Тип поля изменился — 1');
        expect(summary?.headline).toContain('погашено вариантов — 2');
    });

    it('поднимает сломанные вопросы наверх — чинить нужно их', () => {
        const summary = buildCheckSummary(
            response({
                items: [
                    checkItem(),
                    checkItem({
                        itemId: 'item-2',
                        itemCode: 'decision',
                        status: 'missing',
                        changed: true,
                    }),
                ],
            }),
            schema,
        );

        expect(summary?.rows.map(row => row.itemCode)).toEqual([
            'decision',
            'decision_date',
        ]);
    });

    it('в неполном режиме честно говорит, что статусы не менялись', () => {
        const summary = buildCheckSummary(
            response({
                degraded: true,
                error: 'У REST-ключа портала нет прав администратора CRM',
                items: [
                    checkItem({
                        comment: 'Поля читались без прав администратора CRM',
                    }),
                ],
            }),
            schema,
        );

        expect(summary?.degraded).toBe(true);
        expect(summary?.headline).toContain('статусы вопросов не менялись');
        expect(summary?.description).toBe(
            'У REST-ключа портала нет прав администратора CRM',
        );
    });

    it('пустой отчёт означает, что проверять было нечего', () => {
        const summary = buildCheckSummary(response({ items: [] }), schema);

        expect(summary?.checkedCount).toBe(0);
        expect(summary?.headline).toContain('Проверять нечего');
    });

    it('неизвестный статус показывает кодом, а не пустотой', () => {
        const summary = buildCheckSummary(
            response({
                items: [checkItem(unknownCode({ status: 'renamed' }))],
            }),
            schema,
        );

        expect(summary?.rows[0]?.statusLabel).toBe('renamed');
        expect(summary?.problems[0]?.count).toBe(1);
    });

    it('считает расхождения и называет их в итоге — не только проблемы', () => {
        const summary = buildCheckSummary(
            response({
                items: [
                    checkItem({
                        diff: questionnaireCheckDiff({
                            title: {
                                our: 'Когда решение',
                                live: 'Дата решения',
                            },
                        }),
                    }),
                    checkItem({
                        itemId: 'item-2',
                        itemCode: 'decision',
                        fieldName: 'UF_CRM_DECISION',
                        diff: questionnaireCheckDiff({
                            newOptions: [
                                {
                                    bitrixId: 301,
                                    title: 'Субподряд',
                                    xmlId: null,
                                },
                            ],
                            lostOptions: [
                                {
                                    optionId: 'opt-9',
                                    code: 'old',
                                    title: 'Старое',
                                },
                            ],
                        }),
                    }),
                ],
            }),
            schema,
        );

        expect(summary?.changeCount).toBe(3);
        expect(summary?.rows[0]?.changeCount).toBe(1);
        expect(summary?.headline).toContain('расхождений с Битриксом — 3');
        // Расхождение — не поломка: чинить нечего, подтягивает владелец.
        expect(summary?.hasProblems).toBe(false);
        expect(summary?.problemCount).toBe(0);
    });

    it('без разбора расхождений счётчик нулевой', () => {
        const summary = buildCheckSummary(response(), schema);

        expect(summary?.changeCount).toBe(0);
        expect(summary?.headline).not.toContain('расхождений');
    });
});
