import { describe, expect, it } from 'vitest';
import { prepareQuestionnaireSave } from './prepare-save-payload';
import { toQuestionnaireDraft } from './questionnaire-draft';
import type { QuestionnaireDraft } from './questionnaire-draft';
import { questionnaire, questionnaireItem } from './questionnaire.fixture';

/** Черновик, открытый из сохранённой анкеты. */
const openSaved = (
    patch: Parameters<typeof questionnaire>[0] = {},
): { saved: ReturnType<typeof questionnaire>; draft: QuestionnaireDraft } => {
    const saved = questionnaire(patch);
    return { saved, draft: toQuestionnaireDraft(saved) };
};

describe('prepareQuestionnaireSave: носитель поля', () => {
    it('нетронутому вопросу режима «Автоматически» возвращает носителя', () => {
        // Бэк `fieldSource` не хранит и в ответе не отдаёт, но на
        // сохранении требует: без подстановки ни одну существующую анкету
        // нельзя было бы пересохранить.
        const { saved, draft } = openSaved();

        expect(draft.items[0]?.fieldSource).toBeUndefined();
        expect(
            prepareQuestionnaireSave(draft, saved).items[0]?.fieldSource,
        ).toBe('company');
    });

    it('вопросу с изменённым полем носителя не подставляет', () => {
        // Поле перевыбрано — прежняя проверка достижимости к нему не
        // относится: носитель обязан приехать из пикера.
        const { saved, draft } = openSaved();
        const changed: QuestionnaireDraft = {
            ...draft,
            items: [{ ...draft.items[0]!, fieldName: 'UF_CRM_OTHER_FIELD' }],
        };

        expect(
            prepareQuestionnaireSave(changed, saved).items[0]?.fieldSource,
        ).toBeUndefined();
    });

    it('вопросу со сменённым режимом носителя не подставляет', () => {
        const { saved, draft } = openSaved();
        const changed: QuestionnaireDraft = {
            ...draft,
            items: [
                {
                    ...draft.items[0]!,
                    targetMode: 'entity',
                    targetEntity: 'deal',
                },
            ],
        };

        expect(
            prepareQuestionnaireSave(changed, saved).items[0]?.fieldSource,
        ).toBeUndefined();
    });

    it('жёсткому носителю оставляет его собственную сущность', () => {
        const { saved, draft } = openSaved({
            items: [
                questionnaireItem({
                    targetMode: 'entity',
                    targetEntity: 'contact',
                }),
            ],
        });

        expect(
            prepareQuestionnaireSave(draft, saved).items[0]?.fieldSource,
        ).toBe('contact');
    });

    it('штатному полю носитель не нужен', () => {
        const { saved, draft } = openSaved({
            items: [
                questionnaireItem({
                    isNative: true,
                    fieldName: 'OPPORTUNITY',
                    fieldType: null,
                }),
            ],
        });

        expect(
            prepareQuestionnaireSave(draft, saved).items[0]?.fieldSource,
        ).toBeUndefined();
    });

    it('новой анкете подставлять нечего', () => {
        const { draft } = openSaved();

        expect(
            prepareQuestionnaireSave(draft, null).items[0]?.fieldSource,
        ).toBeUndefined();
    });
});

describe('prepareQuestionnaireSave: слепок живого поля', () => {
    it('слепок доезжает до тела сохранения', () => {
        // Без него «переименовали в Битриксе» снова стало бы неотличимо от
        // «владелец назвал вопрос по-своему»: сравнивать живую подпись
        // было бы не с чем, и строка загоралась бы у каждого вопроса.
        const meta = {
            rows: 3,
            bitrixField: {
                live: {
                    title: 'Дата решения',
                    type: 'date',
                    options: [],
                    at: '2026-08-28T10:00:00.000Z',
                },
                accepted: {
                    title: 'Дата решения',
                    type: 'date',
                    options: [],
                    at: '2026-08-28T10:00:00.000Z',
                },
            },
        };
        const { saved, draft } = openSaved({
            items: [questionnaireItem({ meta })],
        });

        expect(prepareQuestionnaireSave(draft, saved).items[0]?.meta).toEqual(
            meta,
        );
    });
});

describe('prepareQuestionnaireSave: чистка под выбранный канал и тип', () => {
    it('ответу в комментарий события стирает поле и путь в отчёте', () => {
        const { saved, draft } = openSaved();
        const changed: QuestionnaireDraft = {
            ...draft,
            items: [
                {
                    ...draft.items[0]!,
                    channel: 'text',
                    requireChange: true,
                    dtoPath: 'sale.opportunity',
                },
            ],
        };

        const item = prepareQuestionnaireSave(changed, saved).items[0];

        expect(item?.fieldName).toBeNull();
        expect(item?.fieldType).toBeNull();
        expect(item?.dtoPath).toBeNull();
        expect(item?.requireChange).toBe(false);
    });

    it('ответу в поле CRM стирает путь в отчёте', () => {
        const { saved, draft } = openSaved();
        const changed: QuestionnaireDraft = {
            ...draft,
            items: [{ ...draft.items[0]!, dtoPath: 'sale.firstPayDate' }],
        };

        expect(
            prepareQuestionnaireSave(changed, saved).items[0]?.dtoPath,
        ).toBeNull();
    });

    it('не-списку стирает варианты справочника', () => {
        // Черновик их хранит: переключение типа туда-обратно не должно
        // терять разметку, а на бэк уезжает уже чистое тело.
        const { saved, draft } = openSaved();
        const changed: QuestionnaireDraft = {
            ...draft,
            items: [
                {
                    ...draft.items[0]!,
                    control: 'string',
                    options: [{ code: 'yes', title: 'Да', bitrixId: 1 }],
                },
            ],
        };

        expect(
            prepareQuestionnaireSave(changed, saved).items[0]?.options,
        ).toEqual([]);
    });

    it('не-дате стирает срок годности', () => {
        const { saved, draft } = openSaved();
        const changed: QuestionnaireDraft = {
            ...draft,
            items: [
                { ...draft.items[0]!, control: 'string', staleAfterDays: 30 },
            ],
        };

        expect(
            prepareQuestionnaireSave(changed, saved).items[0]?.staleAfterDays,
        ).toBeNull();
    });

    it('режиму «Автоматически» стирает сущность-носителя', () => {
        const { saved, draft } = openSaved();
        const changed: QuestionnaireDraft = {
            ...draft,
            items: [
                {
                    ...draft.items[0]!,
                    targetMode: 'auto',
                    targetEntity: 'deal',
                },
            ],
        };

        expect(
            prepareQuestionnaireSave(changed, saved).items[0]?.targetEntity,
        ).toBeNull();
    });
});

describe('prepareQuestionnaireSave: шапка', () => {
    it('анкете-модалке стирает колонку', () => {
        const { saved, draft } = openSaved();

        const payload = prepareQuestionnaireSave(
            { ...draft, presentation: 'modal' },
            saved,
        );

        expect(payload.place).toBeNull();
    });

    it('обрезает пробелы у кода и названия', () => {
        const { saved, draft } = openSaved();

        const payload = prepareQuestionnaireSave(
            { ...draft, code: '  plan_basics  ', title: '  Название  ' },
            saved,
        );

        expect(payload.code).toBe('plan_basics');
        expect(payload.title).toBe('Название');
    });
});

describe('prepareQuestionnaireSave: ответ в элемент смарта', () => {
    /** Сохранённый смарт-вопрос: так он приезжает из базы. */
    const smartSaved = () =>
        openSaved({
            items: [
                questionnaireItem({
                    code: 'pres_result',
                    channel: 'smart',
                    targetMode: 'entity',
                    targetEntity: 'smart',
                    control: 'string',
                    fieldName: 'UF_CRM_7_PRES_RESULT',
                    fieldType: 'string',
                    smartId: 7,
                    smartEntityTypeId: 177,
                }),
            ],
        });

    it('довозит до тела сохранения адрес смарта и привязку к полю', () => {
        // Без smartId бэк отвечает «не указан смарт, из которого выбрано
        // поле»: пересохранить такую анкету было бы нельзя.
        const { saved, draft } = smartSaved();
        const item = prepareQuestionnaireSave(draft, saved).items[0];

        expect(item?.smartId).toBe(7);
        expect(item?.fieldName).toBe('UF_CRM_7_PRES_RESULT');
        expect(item?.fieldType).toBe('string');
        expect(item?.fieldSource).toBe('smart');
    });

    it('проставляет носителя, который бэк всё равно поставит сам', () => {
        const { saved, draft } = smartSaved();
        const item = prepareQuestionnaireSave(draft, saved).items[0];

        expect(item?.targetMode).toBe('entity');
        expect(item?.targetEntity).toBe('smart');
    });

    it('смена канала уносит адрес смарта вместе с привязкой', () => {
        // Иначе вопрос уехал бы с адресом смарта, в который он больше не
        // пишет, — и бэк отклонил бы тело целиком.
        const { saved, draft } = smartSaved();
        const changed: QuestionnaireDraft = {
            ...draft,
            items: [{ ...draft.items[0]!, channel: 'text' }],
        };
        const item = prepareQuestionnaireSave(changed, saved).items[0];

        expect(item?.smartId).toBeNull();
        expect(item?.fieldName).toBeNull();
        expect(item?.fieldSource).toBeUndefined();
    });
});
