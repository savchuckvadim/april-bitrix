import type {
    PortalQuestionnaire,
    PortalQuestionnaireItem,
    PortalQuestionnaireItemSave,
    PortalQuestionnaireSave,
    PortalQuestionnaireSchema,
    QuestionnaireAppCode,
    QuestionnairePlace,
    QuestionnairePurpose,
} from '../model';
import { QUESTIONNAIRE_CODE, pickQuestionnaireCode } from '../model';
import type { QuestionnairePreset } from './questionnaire-preset';

/**
 * Черновик анкеты — это тело сохранения: редактор правит ровно то, что
 * уедет в `POST`/`PUT`. Отдельной «формы» нет намеренно, иначе появилась бы
 * вторая правда о составе анкеты.
 */
export type QuestionnaireDraft = PortalQuestionnaireSave;

/** Шаг порядка: держим `sort` кратным, чтобы вставка не пересчитывала всё. */
const SORT_STEP = 10;

/**
 * Порядок вопросов = порядок в массиве. Бэк сортирует состав по `sort`, а
 * не по индексу, поэтому при любой перестановке `sort` пересчитывается —
 * иначе сохранённая анкета показалась бы менеджеру в другом порядке.
 */
export const withItemOrder = (
    items: PortalQuestionnaireItemSave[],
): PortalQuestionnaireItemSave[] =>
    items.map((item, index) => ({ ...item, sort: (index + 1) * SORT_STEP }));

/**
 * Колонка, которую бэк подставит сам, если её не прислать.
 *
 * Правило бэка: назначение `report` кладёт анкету в колонку отчёта, всё
 * остальное — в колонку планирования. Кодов здесь нет: колонка ищется по
 * совпадению кода с назначением, а это ровно то же правило, записанное
 * через реестр. Редактор подставляет её явно, чтобы предпросмотр не врал
 * про «колонка не выбрана».
 */
export const defaultPlaceForPurpose = (
    purpose: QuestionnairePurpose | undefined,
    schema?: PortalQuestionnaireSchema,
): QuestionnairePlace | null => {
    const places = schema?.places ?? [];
    const code =
        places.find(place => place.code === purpose)?.code ?? places[0]?.code;

    return pickQuestionnaireCode(QUESTIONNAIRE_CODE.place, code) ?? null;
};

/**
 * Условия показа из предустановки адреса.
 *
 * Ровно одно условие: предустановка приходит из клетки матрицы, а клетка —
 * это одна пара «назначение + тип события». Вид без значения оставляем
 * пустым списком, а не выдумываем значение: проверка черновика скажет
 * «значения не выбраны», и владелец выберет сам — это честнее подставленной
 * наугад строки, которую он не заметит.
 */
const presetConditions = (
    preset: QuestionnairePreset | null | undefined,
): QuestionnaireDraft['conditions'] =>
    preset?.conditionKind
        ? [
              {
                  kind: preset.conditionKind,
                  values: preset.conditionValue ? [preset.conditionValue] : [],
              },
          ]
        : [];

/**
 * Пустой черновик новой анкеты.
 *
 * Дефолты берутся из реестра (первое значение справочника), а не из кодов
 * фронта: реестр — единственная правда о том, что предлагать. Коды
 * контракта нужны как страховка, пока реестр ещё грузится: поля тела
 * сохранения обязательные, и пустой строкой их не заполнить.
 *
 * `preset` — координаты клетки матрицы, из которой владелец пришёл
 * («Спросим при отчёте» × «Решение»). Она перебивает дефолт реестра именно
 * потому, что это уже сделанный выбор: владелец кликнул по пустой клетке, и
 * заново набирать её назначение и условие — работа, которую он только что
 * проделал мышью. Колонка при этом пересчитывается по назначению, как и
 * при выборе руками.
 *
 * `isActive: false` — дефолт бэка: анкета включается осознанно, а не
 * фактом создания.
 */
export const createQuestionnaireDraft = (
    appCode: QuestionnaireAppCode,
    schema?: PortalQuestionnaireSchema,
    preset?: QuestionnairePreset | null,
): QuestionnaireDraft => {
    const purpose =
        preset?.purpose ??
        pickQuestionnaireCode(
            QUESTIONNAIRE_CODE.purpose,
            schema?.purposes[0]?.code,
        ) ??
        QUESTIONNAIRE_CODE.purpose.plan;

    return {
        id: null,
        appCode,
        code: '',
        title: '',
        hint: null,
        purpose,
        presentation:
            pickQuestionnaireCode(
                QUESTIONNAIRE_CODE.presentation,
                schema?.presentations[0]?.code,
            ) ?? QUESTIONNAIRE_CODE.presentation.inline,
        place: defaultPlaceForPurpose(purpose, schema),
        // Момент записи бэк подставляет сам: пустое поле честнее выдуманного.
        persist: pickQuestionnaireCode(
            QUESTIONNAIRE_CODE.persist,
            schema?.persists[0]?.code,
        ),
        conditions: presetConditions(preset),
        configKey: null,
        legacyChecklistId: null,
        isActive: false,
        sort: 500,
        updatedBy: null,
        items: [],
    };
};

/**
 * Вопрос из БД → вопрос черновика.
 *
 * `fieldSource` бэк не хранит и в ответе не отдаёт, а на сохранении требует.
 * Восстановить его без догадок можно в двух случаях: при жёстком носителе
 * он равен `targetEntity`, а у канала «Поле элемента смарта» он всегда
 * `smart` — другого носителя у этого канала не бывает. В режиме
 * «Автоматически» источник остаётся пустым — UI обязан показать это
 * вопросом «выберите поле заново» (сопоставив `fieldName` с полями
 * носителей из пикера), а не подставлять правдоподобный код: угаданный
 * носитель отключил бы ровно ту проверку, ради которой поле и заводилось.
 *
 * `smartId` бэк ХРАНИТ и отдаёт — это постоянный адрес носителя, и он
 * обязан доехать до тела сохранения: без него смарт-вопрос пересохранить
 * нельзя (бэк ответит «не указан смарт, из которого выбрано поле»).
 */
const toItemDraft = (
    item: PortalQuestionnaireItem,
): PortalQuestionnaireItemSave => ({
    code: item.code,
    title: item.title,
    placeholder: item.placeholder,
    hint: item.hint,
    groupTitle: item.groupTitle,
    sort: item.sort,
    control: item.control,
    isMultiple: item.isMultiple,
    isRequired: item.isRequired,
    requireChange: item.requireChange,
    staleAfterDays: item.staleAfterDays,
    channel: item.channel,
    targetMode: item.targetMode,
    targetEntity: item.targetEntity,
    dtoPath: item.dtoPath,
    isNative: item.isNative,
    fieldName: item.fieldName,
    fieldBitrixId: item.fieldBitrixId,
    fieldXmlId: item.fieldXmlId,
    fieldCode: item.fieldCode,
    fieldType: item.fieldType,
    fieldSource:
        item.channel === QUESTIONNAIRE_CODE.channel.smart
            ? QUESTIONNAIRE_CODE.fieldSource.smart
            : item.targetMode === QUESTIONNAIRE_CODE.targetMode.entity &&
                item.targetEntity
              ? item.targetEntity
              : undefined,
    smartId: item.smartId,
    fieldStatus: item.fieldStatus,
    meta: item.meta,
    isActive: item.isActive,
    options: item.options.map(option => ({
        code: option.code,
        title: option.title,
        bitrixId: option.bitrixId,
        xmlId: option.xmlId,
        sort: option.sort,
        isDefault: option.isDefault,
        isActive: option.isActive,
    })),
});

/** Сохранённая анкета → черновик редактора. */
export const toQuestionnaireDraft = (
    questionnaire: PortalQuestionnaire,
): QuestionnaireDraft => ({
    id: questionnaire.id,
    appCode: questionnaire.appCode,
    code: questionnaire.code,
    title: questionnaire.title,
    hint: questionnaire.hint,
    purpose: questionnaire.purpose,
    presentation: questionnaire.presentation,
    place: questionnaire.place,
    persist: questionnaire.persist,
    conditions: questionnaire.conditions.map(condition => ({
        kind: condition.kind,
        values: [...(condition.values ?? [])],
    })),
    configKey: questionnaire.configKey,
    legacyChecklistId: questionnaire.legacyChecklistId,
    isActive: questionnaire.isActive,
    sort: questionnaire.sort,
    updatedBy: questionnaire.updatedBy,
    items: questionnaire.items.map(toItemDraft),
});

/** Дословное сравнение черновиков — источник флага «есть несохранённое». */
export const isSameQuestionnaireDraft = (
    a: QuestionnaireDraft,
    b: QuestionnaireDraft,
): boolean => JSON.stringify(a) === JSON.stringify(b);

/**
 * Заменять ли черновик составом, который приехал с бэка.
 *
 * С бэка анкета приезжает по двум РАЗНЫМ поводам, и обходиться с ними
 * одинаково нельзя:
 *
 *  - сменилась анкета или её версия — это ответ на действие владельца
 *    (сохранение, переход по адресу): состав из ответа авторитетнее, и
 *    черновик обязан стать им, иначе «Есть несохранённые изменения»
 *    осталось бы висеть сразу после сохранения;
 *  - сдвинулась только отметка сверки — это приходит САМО: фоновая сверка
 *    при открытии, рефетч по возвращению в окно. Такой ответ не имеет
 *    права трогать набранное владельцем: он потерял бы работу молча,
 *    без подтверждения и без возможности вернуть.
 *
 * Парное правило на уровне кэша — `canAdoptCheckedQuestionnaire`.
 */
export const shouldReplaceDraft = (options: {
    /** Сменилась анкета или её версия. */
    isIdentityChanged: boolean;
    /** Черновик расходится с тем составом, из которого был собран. */
    hasEdits: boolean;
}): boolean => options.isIdentityChanged || !options.hasEdits;
