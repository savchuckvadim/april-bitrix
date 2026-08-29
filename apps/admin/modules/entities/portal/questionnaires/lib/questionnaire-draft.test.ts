import { describe, expect, it } from 'vitest';
import {
    createQuestionnaireDraft,
    shouldReplaceDraft,
    toQuestionnaireDraft,
} from './questionnaire-draft';
import { questionnaire, questionnaireItem } from './questionnaire.fixture';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';
import { QUESTIONNAIRE_CODE } from '../model';

/**
 * Правило пересборки черновика. Проверяем ровно одно: ответ, пришедший
 * сам (фоновая сверка, рефетч по возвращению в окно), не имеет права
 * стереть набранное владельцем.
 */
describe('shouldReplaceDraft', () => {
    it('сверка НЕ затирает несохранённые правки', () => {
        expect(
            shouldReplaceDraft({ isIdentityChanged: false, hasEdits: true }),
        ).toBe(false);
    });

    it('на чистом черновике состав из ответа сверки подхватывается', () => {
        expect(
            shouldReplaceDraft({ isIdentityChanged: false, hasEdits: false }),
        ).toBe(true);
    });

    it('после сохранения черновик равняется на ответ, даже если правки были', () => {
        // Иначе бэйдж «Есть несохранённые изменения» остался бы висеть
        // сразу после успешного сохранения.
        expect(
            shouldReplaceDraft({ isIdentityChanged: true, hasEdits: true }),
        ).toBe(true);
    });

    it('смена анкеты в адресе открывает её состав, а не прежний черновик', () => {
        expect(
            shouldReplaceDraft({ isIdentityChanged: true, hasEdits: false }),
        ).toBe(true);
    });
});

/**
 * Предустановка из адреса — вторая половина пустой клетки матрицы: клик по
 * ней обязан открыть редактор УЖЕ на её координатах, иначе владелец
 * пересобирает руками то, по чему только что кликнул.
 */
describe('createQuestionnaireDraft: предустановка клетки матрицы', () => {
    it('проставляет назначение, условие и его значение', () => {
        const draft = createQuestionnaireDraft(
            QUESTIONNAIRE_CODE.appCode['event-sales'],
            schema,
            {
                purpose: 'report',
                conditionKind: 'reportType',
                conditionValue: 'hot',
            },
        );

        expect(draft.purpose).toBe('report');
        expect(draft.conditions).toEqual([
            { kind: 'reportType', values: ['hot'] },
        ]);
    });

    it('колонка пересчитывается по назначению — как при выборе руками', () => {
        const draft = createQuestionnaireDraft(
            QUESTIONNAIRE_CODE.appCode['event-sales'],
            schema,
            {
                purpose: 'report',
                conditionKind: 'reportType',
                conditionValue: 'hot',
            },
        );

        expect(draft.place).toBe('report');
    });

    it('предустановка перебивает дефолт реестра: это уже сделанный выбор', () => {
        // Первое назначение реестра — планирование; владелец пришёл из
        // колонки отчёта, и она должна победить.
        expect(schema.purposes[0]!.code).toBe('plan');

        const draft = createQuestionnaireDraft(
            QUESTIONNAIRE_CODE.appCode['event-sales'],
            schema,
            {
                purpose: 'report',
                conditionKind: null,
                conditionValue: null,
            },
        );

        expect(draft.purpose).toBe('report');
    });

    it('вид условия без значения даёт пустой список, а не выдуманное значение', () => {
        const draft = createQuestionnaireDraft(
            QUESTIONNAIRE_CODE.appCode['event-sales'],
            schema,
            {
                purpose: 'plan',
                conditionKind: 'planType',
                conditionValue: null,
            },
        );

        expect(draft.conditions).toEqual([{ kind: 'planType', values: [] }]);
    });

    it('без предустановки условий нет — поведение прежнее', () => {
        const draft = createQuestionnaireDraft(
            QUESTIONNAIRE_CODE.appCode['event-sales'],
            schema,
        );

        expect(draft.purpose).toBe('plan');
        expect(draft.conditions).toEqual([]);
    });

    it('анкета создаётся выключенной и с предустановкой тоже', () => {
        // Включение — осознанное действие: клетка матрицы задаёт, ГДЕ
        // спрашивать, а не «спрашивать прямо сейчас».
        const draft = createQuestionnaireDraft(
            QUESTIONNAIRE_CODE.appCode['event-sales'],
            schema,
            {
                purpose: 'report',
                conditionKind: 'reportType',
                conditionValue: 'hot',
            },
        );

        expect(draft.isActive).toBe(false);
        expect(draft.items).toEqual([]);
    });
});

/**
 * Адрес смарта — единственная часть привязки, которую бэк хранит: без него
 * смарт-вопрос не пересохранить, и восстановить его надо ровно из ответа
 * чтения, а не догадкой.
 */
describe('toQuestionnaireDraft: вопрос канала «Поле элемента смарта»', () => {
    const smartItem = questionnaireItem({
        code: 'pres_result',
        channel: 'smart',
        targetMode: 'entity',
        targetEntity: 'smart',
        fieldName: 'UF_CRM_7_PRES_RESULT',
        fieldType: 'string',
        control: 'string',
        smartId: 7,
        smartEntityTypeId: 177,
    });

    it('переносит smartId в черновик', () => {
        const draft = toQuestionnaireDraft(
            questionnaire({ items: [smartItem] }),
        );

        expect(draft.items[0]?.smartId).toBe(7);
    });

    it('восстанавливает носителя поля: у этого канала он всегда смарт', () => {
        const draft = toQuestionnaireDraft(
            questionnaire({ items: [smartItem] }),
        );

        expect(draft.items[0]?.fieldSource).toBe(
            QUESTIONNAIRE_CODE.fieldSource.smart,
        );
    });

    it('у вопроса канала CRM адреса смарта не появляется', () => {
        const draft = toQuestionnaireDraft(questionnaire());

        expect(draft.items[0]?.smartId).toBeNull();
        expect(draft.items[0]?.fieldSource).toBeUndefined();
    });
});
