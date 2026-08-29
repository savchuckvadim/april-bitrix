import { describe, expect, it } from 'vitest';
import {
    buildFieldSyncReport,
    canAdoptCheckedQuestionnaire,
    countDiffLines,
    describeFieldSyncResult,
    getFieldSyncBlockReason,
} from './field-sync-view';
import {
    questionnaire,
    questionnaireCheckDiff,
    questionnaireCheckItem as checkItem,
    questionnaireCheckResponse as response,
} from './questionnaire.fixture';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';

/** Вопрос-список: варианты разбираются только у него. */
const enumItem = (diff = questionnaireCheckDiff()) =>
    checkItem({
        itemId: 'item-2',
        itemCode: 'decision',
        fieldName: 'UF_CRM_DECISION',
        diff,
    });

/**
 * Расхождение всех трёх видов сразу — на нём и проверяется выбор: подпись
 * поля, подпись существующего варианта и новый вариант списка.
 */
const mixedDiff = questionnaireCheckDiff({
    title: { our: 'Что решили', live: 'Решение' },
    renamedOptions: [
        {
            optionId: 'opt-1',
            code: 'tender',
            our: 'Тендер',
            live: 'Тендер (44-ФЗ)',
            bitrixId: 300,
        },
    ],
    newOptions: [{ bitrixId: 301, title: 'Субподряд', xmlId: 'SUB' }],
});

describe('buildFieldSyncReport', () => {
    it('без ответа разбора нет — сверку ещё не запускали', () => {
        expect(buildFieldSyncReport(undefined, schema)).toBeNull();
    });

    it('пустой разбор панель не рисует', () => {
        const report = buildFieldSyncReport(
            response({
                items: [checkItem({ diff: questionnaireCheckDiff() })],
            }),
            schema,
        );

        expect(report?.changeCount).toBe(0);
        expect(report?.items).toEqual([]);
        expect(report?.payload).toBeNull();
        expect(report?.headline).toBe('Расхождений с Битриксом нет');
    });

    it('вопрос без разбора в панель не попадает', () => {
        const report = buildFieldSyncReport(
            response({ items: [checkItem({ diff: null })] }),
            schema,
        );

        expect(report?.items).toEqual([]);
        expect(report?.changeCount).toBe(0);
    });

    it('переименование поля показывает списком «сейчас → в Битриксе»', () => {
        const report = buildFieldSyncReport(
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
                ],
            }),
            schema,
        );

        const item = report?.items[0];
        expect(item?.itemTitle).toBe('Когда решение');
        expect(item?.fieldName).toBe('UF_CRM_DECISION_DATE');
        expect(item?.lines).toEqual([
            {
                kind: 'title',
                key: 'title',
                pickKey: 'item-1:title',
                label: 'Поле переименовали в Битриксе',
                our: 'Когда решение',
                live: 'Дата решения',
                canApply: true,
                // Формулировка вопроса авторская: заранее не отмечена.
                isPicked: false,
                note: null,
            },
        ]);
        expect(report?.headline).toContain('Расхождений с Битриксом: 1');
    });

    it('по умолчанию берёт только то, что ничего не затирает', () => {
        const report = buildFieldSyncReport(
            response({ items: [enumItem(mixedDiff)] }),
            schema,
        );

        // Подпись поля и подпись варианта переписали бы авторский текст —
        // в тело они без отметки владельца не попадают.
        expect(report?.payload).toEqual({
            items: [
                {
                    itemId: 'item-2',
                    addOptions: [
                        { bitrixId: 301, title: 'Субподряд', xmlId: 'SUB' },
                    ],
                },
            ],
        });
        expect(report?.items[0]?.payload).toEqual(report?.payload?.items[0]);
        expect(report?.changeCount).toBe(3);
        expect(report?.applicableCount).toBe(3);
        expect(report?.pickedCount).toBe(1);
    });

    it('отмеченная подпись поля уезжает, снятый вариант — нет', () => {
        const report = buildFieldSyncReport(
            response({ items: [enumItem(mixedDiff)] }),
            schema,
            { 'item-2:title': true, 'item-2:new:301': false },
        );

        expect(report?.payload).toEqual({
            items: [{ itemId: 'item-2', title: 'Решение' }],
        });
        expect(report?.pickedCount).toBe(1);
        expect(
            report?.items[0]?.lines.map(line => [line.key, line.isPicked]),
        ).toEqual([
            ['title', true],
            ['renamed:opt-1', false],
            ['new:301', false],
        ]);
    });

    it('без единой отметки подтягивать нечего', () => {
        const report = buildFieldSyncReport(
            response({ items: [enumItem(mixedDiff)] }),
            schema,
            { 'item-2:new:301': false },
        );

        expect(report?.payload).toBeNull();
        expect(report?.items[0]?.payload).toBeNull();
        expect(report?.pickedCount).toBe(0);
        // Показать расхождения панель всё равно обязана.
        expect(report?.changeCount).toBe(3);
    });

    it('отметки одного вопроса не задевают такую же строку другого', () => {
        const report = buildFieldSyncReport(
            response({
                items: [
                    checkItem({
                        diff: questionnaireCheckDiff({
                            title: { our: 'Когда решение', live: 'Решение' },
                        }),
                    }),
                    enumItem(
                        questionnaireCheckDiff({
                            title: { our: 'Что решили', live: 'Решение' },
                        }),
                    ),
                ],
            }),
            schema,
            { 'item-2:title': true },
        );

        expect(report?.payload).toEqual({
            items: [{ itemId: 'item-2', title: 'Решение' }],
        });
        expect(report?.items[0]?.lines[0]?.pickKey).toBe('item-1:title');
        expect(report?.items[0]?.lines[0]?.isPicked).toBe(false);
    });

    it('собирает тело применения ровно из того, что отмечено', () => {
        const report = buildFieldSyncReport(
            response({ items: [enumItem(mixedDiff)] }),
            schema,
            { 'item-2:title': true, 'item-2:renamed:opt-1': true },
        );

        expect(report?.payload).toEqual({
            items: [
                {
                    itemId: 'item-2',
                    title: 'Решение',
                    renameOptions: [
                        { optionId: 'opt-1', title: 'Тендер (44-ФЗ)' },
                    ],
                    addOptions: [
                        { bitrixId: 301, title: 'Субподряд', xmlId: 'SUB' },
                    ],
                },
            ],
        });
        expect(report?.pickedCount).toBe(3);
    });

    it('исчезнувший вариант показывает, но применять его не предлагает', () => {
        const report = buildFieldSyncReport(
            response({
                items: [
                    enumItem(
                        questionnaireCheckDiff({
                            lostOptions: [
                                {
                                    optionId: 'opt-9',
                                    code: 'old',
                                    title: 'Старое значение',
                                },
                            ],
                        }),
                    ),
                ],
            }),
            schema,
        );

        const line = report?.items[0]?.lines[0];
        expect(line?.kind).toBe('optionLost');
        expect(line?.our).toBe('Старое значение');
        expect(line?.live).toBeNull();
        expect(line?.canApply).toBe(false);
        expect(line?.note).toContain('погашен');
        // Применять нечего — ни тела вопроса, ни тела «подтянуть всё».
        expect(report?.items[0]?.payload).toBeNull();
        expect(report?.applicableCount).toBe(0);
        expect(report?.payload).toBeNull();
        expect(report?.headline).toContain('Подтягивать нечего');
    });

    it('сломанную привязку подписывает статусом из реестра', () => {
        const report = buildFieldSyncReport(
            response({
                items: [
                    checkItem({
                        status: 'type_changed',
                        changed: true,
                        diff: questionnaireCheckDiff({
                            title: { our: 'Когда решение', live: 'Решение' },
                        }),
                    }),
                ],
            }),
            schema,
        );

        expect(report?.items[0]?.isProblem).toBe(true);
        expect(report?.items[0]?.statusLabel).toBe('Тип поля изменился');
    });

    it('здоровая привязка статусом не подписывается', () => {
        const report = buildFieldSyncReport(
            response({
                items: [
                    checkItem({
                        diff: questionnaireCheckDiff({
                            title: { our: 'Когда решение', live: 'Решение' },
                        }),
                    }),
                ],
            }),
            schema,
        );

        expect(report?.items[0]?.isProblem).toBe(false);
        expect(report?.items[0]?.statusLabel).toBeNull();
    });

    it('в неполном режиме называет честную причину', () => {
        const report = buildFieldSyncReport(
            response({
                degraded: true,
                error: 'У REST-ключа портала нет прав администратора CRM',
                items: [checkItem({ diff: null })],
            }),
            schema,
        );

        expect(report?.degradedReason).toBe(
            'У REST-ключа портала нет прав администратора CRM',
        );
        expect(report?.changeCount).toBe(0);
        expect(report?.headline).toContain('поля читались урезанным способом');
    });

    it('в неполном режиме без текста бэка объясняет причину сам', () => {
        const report = buildFieldSyncReport(
            response({ degraded: true, items: [checkItem({ diff: null })] }),
            schema,
        );

        expect(report?.degradedReason).toContain('без прав администратора CRM');
    });

    it('вопрос без формулировки в анкете показывает своим кодом', () => {
        const report = buildFieldSyncReport(
            response({
                questionnaire: questionnaire({ items: [] }),
                items: [
                    checkItem({
                        diff: questionnaireCheckDiff({
                            title: { our: 'Когда решение', live: 'Решение' },
                        }),
                    }),
                ],
            }),
            schema,
        );

        expect(report?.items[0]?.itemTitle).toBe('decision_date');
    });
});

describe('getFieldSyncBlockReason', () => {
    it('грязный черновик блокирует применение', () => {
        const reason = getFieldSyncBlockReason({
            isDirty: true,
            isApplying: false,
        });

        expect(reason).not.toBeNull();
        expect(reason).toContain('Сначала сохраните анкету');
    });

    it('на чистом черновике применение доступно', () => {
        expect(
            getFieldSyncBlockReason({ isDirty: false, isApplying: false }),
        ).toBeNull();
    });

    it('пока применение идёт, второе не запускается', () => {
        expect(
            getFieldSyncBlockReason({ isDirty: false, isApplying: true }),
        ).not.toBeNull();
    });
});

describe('canAdoptCheckedQuestionnaire', () => {
    it('на грязном черновике ответ сверки состав НЕ переписывает', () => {
        const decision = canAdoptCheckedQuestionnaire({ isDirty: true });

        expect(decision.adopt).toBe(false);
        expect(decision.reason).toContain('несохранённые правки');
    });

    it('на чистом черновике ответ сверки берётся целиком', () => {
        const decision = canAdoptCheckedQuestionnaire({ isDirty: false });

        expect(decision.adopt).toBe(true);
        expect(decision.reason).toBeNull();
    });
});

describe('countDiffLines', () => {
    it('без разбора расхождений нет', () => {
        expect(countDiffLines(null)).toBe(0);
        expect(countDiffLines(undefined)).toBe(0);
        expect(countDiffLines(questionnaireCheckDiff())).toBe(0);
    });

    it('считает подпись, переименования, новые и исчезнувшие варианты', () => {
        expect(
            countDiffLines(
                questionnaireCheckDiff({
                    title: { our: 'a', live: 'b' },
                    renamedOptions: [
                        {
                            optionId: 'opt-1',
                            code: 'c',
                            our: 'a',
                            live: 'b',
                            bitrixId: 1,
                        },
                    ],
                    newOptions: [{ bitrixId: 2, title: 'n', xmlId: null }],
                    lostOptions: [{ optionId: 'opt-2', code: 'd', title: 'l' }],
                }),
            ),
        ).toBe(4);
    });
});

describe('describeFieldSyncResult', () => {
    it('перечисляет только то, что действительно подтянулось', () => {
        expect(
            describeFieldSyncResult({
                questionnaire: questionnaire(),
                appliedTitles: 1,
                renamedOptions: 0,
                addedOptions: 2,
            }),
        ).toBe(
            'Подтянуто из Битрикса: подписей вопросов — 1, новых вариантов — 2',
        );
    });

    it('пустой результат называет пустым', () => {
        expect(
            describeFieldSyncResult({
                questionnaire: questionnaire(),
                appliedTitles: 0,
                renamedOptions: 0,
                addedOptions: 0,
            }),
        ).toBe('Подтягивать было нечего');
    });
});
