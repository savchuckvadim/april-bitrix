import { describe, expect, it } from 'vitest';
import {
    acceptLiveFieldPatch,
    adoptLiveOptionTitlePatch,
    adoptLiveTitlePatch,
    buildLiveFieldView,
    readFieldMirror,
} from './field-mirror';
import type {
    QuestionnaireFieldMirrorOption,
    QuestionnaireFieldMirrorState,
} from './field-mirror';
import {
    addLiveOptionToItem,
    applyFieldToItem,
    buildItemFromField,
    syncFieldInItem,
} from './build-item-from-field';
import { toQuestionnaireDraft } from './questionnaire-draft';
import { questionnaire, questionnaireItem } from './questionnaire.fixture';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';
import type { PortalQuestionnaireItemSave, QuestionnaireField } from '../model';

/**
 * Слепки живого поля: главная проверка раздела — «переименовали в
 * Битриксе» обязано отличаться от «владелец назвал вопрос по-своему».
 * Второе — норма, и именно на нём раньше загоралась строка расхождения у
 * каждого второго вопроса.
 */

/** Состояние поля Битрикса на один момент. */
const state = (
    patch: Partial<QuestionnaireFieldMirrorState> = {},
): QuestionnaireFieldMirrorState => ({
    title: 'Тип сотрудничества',
    type: 'enumeration',
    options: [],
    at: '2026-08-28T10:00:00.000Z',
    ...patch,
});

/** Значение справочника в слепке. */
const mirrorOption = (
    patch: Partial<QuestionnaireFieldMirrorOption> = {},
): QuestionnaireFieldMirrorOption => ({
    bitrixId: 301,
    xmlId: 'DIRECT',
    title: 'Прямая',
    ...patch,
});

/** Вопрос черновика: собирается ровно так, как его открывает редактор. */
const savedItem = (
    patch: Parameters<typeof questionnaireItem>[0] = {},
): PortalQuestionnaireItemSave =>
    toQuestionnaireDraft(questionnaire({ items: [questionnaireItem(patch)] }))
        .items[0] as PortalQuestionnaireItemSave;

/** Вопрос-список с одним нашим вариантом и слепками поля. */
const listItem = (options: {
    live: QuestionnaireFieldMirrorState;
    accepted?: QuestionnaireFieldMirrorState | null;
    ours?: {
        code: string;
        title: string;
        bitrixId: number | null;
        xmlId: string | null;
    }[];
    title?: string;
    meta?: Record<string, unknown>;
}): PortalQuestionnaireItemSave =>
    savedItem({
        title: options.title ?? 'Как работаем',
        control: 'enumeration',
        fieldType: 'enumeration',
        options: (options.ours ?? []).map((option, index) => ({
            id: `opt-${index + 1}`,
            code: option.code,
            title: option.title,
            bitrixId: option.bitrixId,
            xmlId: option.xmlId,
            sort: (index + 1) * 10,
            isDefault: false,
            isActive: true,
        })),
        meta: {
            ...(options.meta ?? {}),
            bitrixField: {
                live: options.live,
                accepted:
                    options.accepted === undefined
                        ? options.live
                        : options.accepted,
            },
        },
    });

const field = (
    patch: Partial<QuestionnaireField> = {},
): QuestionnaireField => ({
    fieldName: 'UF_CRM_DECISION_DATE',
    title: 'Дата решения',
    type: 'date',
    multiple: false,
    mandatory: false,
    bitrixId: 1234,
    xmlId: 'DECISION_DATE',
    items: [],
    inPortalDb: false,
    ...patch,
});

describe('buildLiveFieldView: подпись поля', () => {
    it('своя формулировка вопроса переименованием не считается', () => {
        // «Дата решения» в карточке против «Когда решение» в анкете —
        // это норма, а не правка в портале.
        const item = savedItem({
            title: 'Когда решение',
            meta: {
                bitrixField: {
                    live: state({ title: 'Дата решения' }),
                    accepted: state({ title: 'Дата решения' }),
                },
            },
        });

        const view = buildLiveFieldView(item);
        expect(view?.renamedTitle).toBeNull();
        expect(view?.isTitleOurs).toBe(true);
        expect(view?.isAccepted).toBe(true);
    });

    it('переименование в Битриксе видно как переименование', () => {
        const item = savedItem({
            title: 'Когда решение',
            meta: {
                bitrixField: {
                    live: state({ title: 'Дата принятия решения' }),
                    accepted: state({ title: 'Дата решения' }),
                },
            },
        });

        expect(buildLiveFieldView(item)?.renamedTitle).toEqual({
            accepted: 'Дата решения',
            live: 'Дата принятия решения',
        });
    });

    it('слепка нет — правды портала мы не показываем', () => {
        expect(buildLiveFieldView(savedItem())).toBeNull();
    });

    it('сменившийся тип поля виден рядом с записанным у вопроса', () => {
        const item = savedItem({
            fieldType: 'date',
            meta: {
                bitrixField: {
                    live: state({ title: 'Дата решения', type: 'string' }),
                    accepted: state({ title: 'Дата решения', type: 'date' }),
                },
            },
        });

        expect(buildLiveFieldView(item)?.changedType).toEqual({
            our: 'date',
            live: 'string',
        });
    });
});

describe('buildLiveFieldView: значения справочника', () => {
    it('новое значение Битрикса видно сразу, без нажатия кнопок', () => {
        const item = listItem({
            live: state({
                options: [
                    mirrorOption(),
                    mirrorOption({
                        bitrixId: 302,
                        xmlId: 'TENDER',
                        title: 'Тендер',
                    }),
                ],
            }),
            ours: [
                {
                    code: 'direct',
                    title: 'Прямая',
                    bitrixId: 301,
                    xmlId: 'DIRECT',
                },
            ],
        });

        const view = buildLiveFieldView(item);
        // Показан весь живой справочник: без него «нет в анкете» не с чем
        // сравнить.
        expect(view?.options).toHaveLength(2);
        expect(view?.newOptions.map(option => option.title)).toEqual([
            'Тендер',
        ]);
        expect(view?.isAccepted).toBe(false);
    });

    it('исчезнувшее значение помечено', () => {
        const item = listItem({
            live: state({ options: [mirrorOption()] }),
            ours: [
                {
                    code: 'direct',
                    title: 'Прямая',
                    bitrixId: 301,
                    xmlId: 'DIRECT',
                },
                {
                    code: 'tender',
                    title: 'Тендер',
                    bitrixId: 302,
                    xmlId: 'TENDER',
                },
            ],
        });

        expect(buildLiveFieldView(item)?.lostOptions).toEqual([
            { code: 'tender', title: 'Тендер' },
        ]);
    });

    it('переименование значения видно, а своя подпись — нет', () => {
        const item = listItem({
            live: state({
                options: [
                    mirrorOption({ title: 'Прямые продажи' }),
                    mirrorOption({
                        bitrixId: 302,
                        xmlId: 'TENDER',
                        title: 'Тендер (44-ФЗ)',
                    }),
                ],
            }),
            // Принято: «Прямые продажи» владелец уже видел — свою подпись
            // «Прямая» он поставил сам. «Тендер» с тех пор переименовали.
            accepted: state({
                options: [
                    mirrorOption({ title: 'Прямые продажи' }),
                    mirrorOption({
                        bitrixId: 302,
                        xmlId: 'TENDER',
                        title: 'Тендер',
                    }),
                ],
            }),
            ours: [
                {
                    code: 'direct',
                    title: 'Прямая',
                    bitrixId: 301,
                    xmlId: 'DIRECT',
                },
                {
                    code: 'tender',
                    title: 'Тендер',
                    bitrixId: 302,
                    xmlId: 'TENDER',
                },
            ],
        });

        const view = buildLiveFieldView(item);
        expect(view?.renamedCount).toBe(1);
        expect(
            view?.options.map(option => [
                option.title,
                option.isRenamed,
                option.isTitleOurs,
            ]),
        ).toEqual([
            ['Прямые продажи', false, true],
            ['Тендер (44-ФЗ)', true, true],
        ]);
    });

    it('чужой справочник не приписывается вопросу, который не список', () => {
        // У «Даты» вариантов в анкете нет вовсе — весь живой список
        // выглядел бы «отсутствующим», то есть испугом на ровном месте.
        const item = savedItem({
            meta: {
                bitrixField: {
                    live: state({
                        title: 'Дата решения',
                        options: [mirrorOption()],
                    }),
                    accepted: state({ title: 'Дата решения' }),
                },
            },
        });

        const view = buildLiveFieldView(item);
        expect(view?.options).toEqual([]);
        expect(view?.lostOptions).toEqual([]);
    });
});

describe('слепок в момент привязки', () => {
    it('поле из пикера запоминается сразу: и живое, и принятое', () => {
        const item = buildItemFromField(field(), schema, { source: 'company' });

        const mirror = readFieldMirror(item.meta);
        expect(mirror.live?.title).toBe('Дата решения');
        expect(mirror.accepted?.title).toBe('Дата решения');
    });

    it('своя формулировка после привязки переименованием не становится', () => {
        const bound = buildItemFromField(field(), schema, {
            source: 'company',
        });
        const item: PortalQuestionnaireItemSave = {
            ...bound,
            title: 'Когда клиент примет решение?',
        };

        expect(buildLiveFieldView(item)?.renamedTitle).toBeNull();
        expect(buildLiveFieldView(item)?.isTitleOurs).toBe(true);
    });

    it('перепривязка пересобирает слепок по новому полю', () => {
        // Сравнивать новое поле со слепком старого нельзя: «переименовали»
        // показалось бы на ровном месте.
        const item = savedItem({
            meta: {
                bitrixField: {
                    live: state({ title: 'Дата решения' }),
                    accepted: state({ title: 'Дата решения' }),
                },
            },
        });

        const next = applyFieldToItem(
            item,
            field({ fieldName: 'UF_CRM_PAY_DATE', title: 'Дата оплаты' }),
            schema,
            { source: 'company' },
        );

        expect(readFieldMirror(next.meta).accepted?.title).toBe('Дата оплаты');
        expect(buildLiveFieldView(next)?.renamedTitle).toBeNull();
    });
});

describe('слепок обновляется действиями владельца', () => {
    const renamed = () =>
        savedItem({
            title: 'Когда решение',
            meta: {
                rows: 3,
                bitrixField: {
                    live: state({ title: 'Дата принятия решения' }),
                    accepted: state({ title: 'Дата решения' }),
                },
            },
        });

    it('«оставить свою» гасит переименование и не трогает формулировку', () => {
        const item = renamed();
        const next: PortalQuestionnaireItemSave = {
            ...item,
            ...acceptLiveFieldPatch(item),
        };

        expect(next.title).toBe('Когда решение');
        expect(buildLiveFieldView(next)?.renamedTitle).toBeNull();
        // Соседние ключи `meta` — не наши: расширения вопроса живут там же.
        expect(next.meta?.rows).toBe(3);
    });

    it('«взять подпись» переносит подпись поля в вопрос и принимает её', () => {
        const item = renamed();
        const patch = adoptLiveTitlePatch(item);
        const next: PortalQuestionnaireItemSave = { ...item, ...patch };

        expect(next.title).toBe('Дата принятия решения');
        expect(buildLiveFieldView(next)?.renamedTitle).toBeNull();
    });

    it('добавленное значение перестаёт быть «новым»', () => {
        const item = listItem({
            live: state({
                options: [
                    mirrorOption(),
                    mirrorOption({
                        bitrixId: 302,
                        xmlId: 'TENDER',
                        title: 'Тендер',
                    }),
                ],
            }),
            ours: [
                {
                    code: 'direct',
                    title: 'Прямая',
                    bitrixId: 301,
                    xmlId: 'DIRECT',
                },
            ],
        });
        const view = buildLiveFieldView(item);
        const fresh = view?.newOptions[0];
        if (!fresh) throw new Error('новое значение не найдено');

        const next: PortalQuestionnaireItemSave = {
            ...item,
            ...addLiveOptionToItem(item, fresh),
        };

        // Код варианта берётся из внешнего кода элемента — ровно как при
        // первой привязке поля.
        expect(
            next.options?.map(option => [option.code, option.bitrixId]),
        ).toEqual([
            ['direct', 301],
            ['tender', 302],
        ]);
        expect(buildLiveFieldView(next)?.newOptions).toEqual([]);
    });

    it('подтянутая подпись значения становится принятой', () => {
        const item = listItem({
            live: state({
                options: [mirrorOption({ title: 'Прямые продажи' })],
            }),
            accepted: state({ options: [mirrorOption({ title: 'Прямая' })] }),
            ours: [
                {
                    code: 'direct',
                    title: 'Прямая',
                    bitrixId: 301,
                    xmlId: 'DIRECT',
                },
            ],
        });
        const view = buildLiveFieldView(item);
        const option = view?.options[0];
        if (!option) throw new Error('значение не найдено');
        expect(option.isRenamed).toBe(true);

        const next: PortalQuestionnaireItemSave = {
            ...item,
            ...adoptLiveOptionTitlePatch(item, option),
        };

        expect(next.options?.[0]?.title).toBe('Прямые продажи');
        const after = buildLiveFieldView(next);
        expect(after?.renamedCount).toBe(0);
        expect(after?.isAccepted).toBe(true);
    });
});

describe('перечитывание поля кнопкой «Синхронизировать»', () => {
    /** Поле-список Битрикса под слепки `listItem`. */
    const kindField = (
        items: { id: number | null; value: string; xmlId: string | null }[],
    ): QuestionnaireField =>
        field({
            fieldName: 'UF_CRM_DEAL_KIND',
            title: 'Тип сотрудничества',
            type: 'enumeration',
            items,
        });

    it('пишет живой слепок, а принятое оставляет владельцу', () => {
        // Кнопка означает «прочитай портал», а не «я согласен»: приняв
        // переименование за владельца, она стёрла бы единственное место,
        // где он о нём узнаёт.
        const item = listItem({
            live: state({ options: [mirrorOption()] }),
            ours: [
                {
                    code: 'direct',
                    title: 'Прямая',
                    bitrixId: 301,
                    xmlId: 'DIRECT',
                },
            ],
        });

        const next = syncFieldInItem(
            item,
            kindField([{ id: 301, value: 'Прямые продажи', xmlId: 'DIRECT' }]),
            schema,
            { source: 'deal' },
        );

        const mirror = readFieldMirror(next.meta);
        expect(mirror.live?.options[0]?.title).toBe('Прямые продажи');
        expect(mirror.accepted?.options[0]?.title).toBe('Прямая');

        const view = buildLiveFieldView(next);
        expect(view?.renamedCount).toBe(1);
        expect(view?.options[0]?.our).toBe('Прямая');
    });

    it('переименование поля в портале остаётся видимым', () => {
        const item = listItem({
            live: state({ title: 'Тип сотрудничества' }),
            ours: [],
            title: 'Как работаем?',
        });

        const same = syncFieldInItem(item, kindField([]), schema, {
            source: 'deal',
        });

        // Подпись поля та же — тревожить нечем.
        expect(buildLiveFieldView(same)?.renamedTitle).toBeNull();

        const renamed = syncFieldInItem(
            item,
            field({
                fieldName: 'UF_CRM_DEAL_KIND',
                title: 'Тип сделки',
                type: 'enumeration',
            }),
            schema,
            { source: 'deal' },
        );

        expect(buildLiveFieldView(renamed)?.renamedTitle).toEqual({
            accepted: 'Тип сотрудничества',
            live: 'Тип сделки',
        });
        // Формулировку вопроса кнопка не трогает — её владелец писал сам.
        expect(renamed.title).toBe('Как работаем?');
    });
});
