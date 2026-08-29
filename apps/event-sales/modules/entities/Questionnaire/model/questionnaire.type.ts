/**
 * Доменный тип портального каталога анкет.
 *
 * Каталог задаётся в админке из полей, которые пользователь завёл в Битриксе
 * руками, и приезжает во фрейм с бэка (`GET /api/questionnaires`). Здесь
 * лежит РАЗОБРАННАЯ форма: всё, что движок исполнить не может, нормализатор
 * уже выбросил (`lib/questionnaire-normalize.ts`), поэтому union'ы тут
 * узкие — в отличие от сырого DTO, где перечисления объявлены строками.
 *
 * Смысл разделения: реестр бэка может опередить движок фрейма (правило
 * расширения — «сначала фронт научился»), и защищать от этого обязан
 * нормализатор, а не compile-time тип на границе сети.
 */

/** Версия ФОРМЫ ответа, которую умеет разбирать этот фрейм. */
export const QUESTIONNAIRE_CONTRACT = 1;

/** Дословное деление владельца: анкета планирования или отчётности. */
export type QuestionnairePurpose = 'plan' | 'report';

/**
 * `inline` — блок в колонке (какой — говорит `place`);
 * `modal` — шаг-модалка в цепочке send().
 */
export type QuestionnairePresentation = 'inline' | 'modal';

/** Колонка, в которой живёт инлайн-анкета. У модалки — null. */
export type QuestionnairePlace = 'plan' | 'report';

/**
 * Когда ответ уезжает: `onChange` — пессимистичной записью сразу (нынешнее
 * поведение чек-листов), `onConfirm` — по подтверждению анкеты целиком.
 */
export type QuestionnairePersist = 'onChange' | 'onConfirm';

/**
 * Контролы. `text` (многострочный) и `boolean` (трёхсостоянием) — часть
 * контракта: движок дописывает их вместе с переездом на каталог.
 */
export type QuestionnaireControl =
    | 'string'
    | 'text'
    | 'date'
    | 'datetime'
    | 'money'
    | 'enumeration'
    | 'boolean';

/**
 * Куда уходит ответ:
 * - `crm` — пессимистичная запись в поле сущности;
 * - `dto` — только в payload отправки (сделку может создавать сам flow);
 * - `smart` — в поле ЭЛЕМЕНТА смарта, который создаёт или закрывает поток
 *   ЭТОГО отчёта (презентация, ЗПР, в том числе спонтанные). Элемента на
 *   момент ответа не существует — он рождается самой отправкой, — поэтому
 *   писать некуда: ответ копится в стейте и уезжает конвертом вместе с
 *   отчётом, а по полям элемента его раскладывает бэк;
 * - `text` — в комментарий события, поля у вопроса нет.
 */
export type QuestionnaireChannel = 'crm' | 'dto' | 'smart' | 'text';

/** `auto` — компания→сделка→лид (нынешний приоритет), `entity` — явный носитель. */
export type QuestionnaireTargetMode = 'auto' | 'entity';

/**
 * Носитель ответа. `company`/`deal`/`lead` — строки CRM, в которые движок
 * умеет писать сам. `smart` — элемент смарта: носитель назван, но адресует
 * его не фрейм, а поток на бэке (см. канал `smart`), поэтому строку под
 * него резолв носителя не ищет вовсе, и живёт этот носитель только в паре
 * со своим каналом.
 *
 * В реестре бэка есть ещё `contact` — пункт с ним нормализатор выбрасывает:
 * показать вопрос, ответ на который некуда записать, хуже, чем не показать
 * его вовсе.
 */
export type QuestionnaireTargetEntity = 'company' | 'deal' | 'lead' | 'smart';

/**
 * Вид условия показа. Список условий анкеты соединяется И, значения внутри
 * одного условия — ИЛИ (семантика бэка, повторяется движком один в один).
 */
export type QuestionnaireConditionKind =
    | 'planType'
    | 'reportType'
    | 'targetStage'
    | 'workStatus'
    | 'presentationDone'
    | 'always';

/**
 * Пути dto-канала, которые фрейм умеет исполнять. Реестр закрытый и
 * совпадает с реестром бэка: путь без исполнителя во фронте — выброшенный
 * пункт, а не тихо потерянный ответ.
 *
 * Цели в payload отправки — `sale.opportunity` (сумма продажи) и
 * `sale.firstPayDate` (дата первой оплаты), см. build-flow-payload.
 */
export const QUESTIONNAIRE_DTO_PATHS = [
    'sale.opportunity',
    'sale.firstPayDate',
] as const;

export type QuestionnaireDtoPath = (typeof QUESTIONNAIRE_DTO_PATHS)[number];

/** Вариант справочника: `bitrixId` — ровно то, что уходит в `crm.*.update`. */
export interface QuestionnaireOption {
    code: string;
    title: string;
    /**
     * У СПРАВОЧНИКА на канале `crm` всегда число: там записывается именно
     * bitrixId, и вариант без него записать нечем — нормализатор такие
     * выбрасывает ещё на границе (а справочник, у которого после этого не
     * осталось вариантов, выбрасывает целиком: иначе он заблокировал бы
     * отправку обязательностью, которую нечем закрыть).
     *
     * Null — у вариантов, которые объявил сам вопрос (строка со своим
     * набором формулировок): справочника в Битриксе за ними нет, в поле
     * уходит текст варианта.
     */
    bitrixId: number | null;
}

/** Привязка к полю Битрикса: имя готово, ключ собирать не нужно. */
export interface QuestionnaireField {
    /** Полное имя ровно как вернул Битрикс (`UF_CRM_1712345678`). */
    name: string;
    /** `userTypeId` поля; у штатных полей — null. */
    type: string | null;
}

/**
 * Смарт, в элемент которого уедет ответ канала `smart`.
 *
 * Фрейм этим адресом НЕ пользуется — он его только везёт: id элемента на
 * момент ответа ещё не существует, а сам элемент создаст или закроет поток
 * отчёта на бэке. `kind` нужен потоку, чтобы узнать свои ответы среди
 * чужих, `entityTypeId` — чтобы сверить каталог с живым смартом портала.
 *
 * Объектом, а не голой строкой `kind`: следующим заходом сюда встанет
 * `bitrixId` смарта (создание поля из админки), и форма при этом не
 * сломается.
 */
export interface QuestionnaireSmart {
    /** `kind` смарта из реестра бэка (`presentation`, `zpr`). */
    kind: string;
    /** `entityTypeId` смарта на момент компиляции каталога. */
    entityTypeId: number;
}

/** Носитель ответа для канала `crm`. */
export interface QuestionnaireTarget {
    mode: QuestionnaireTargetMode;
    /** Значим только при `mode: 'entity'`; при `auto` игнорируется. */
    entity: QuestionnaireTargetEntity | null;
}

/** Вопрос анкеты — уже исполнимый движком. */
export interface QuestionnaireItem {
    /**
     * Код ВОПРОСА, не поля: одно и то же поле осознанно спрашивается в
     * разных анкетах (возражение — и в плане, и в отчёте), и ключ ответа
     * строится как `qCode:itemCode`, иначе два вопроса делили бы одно
     * значение, статус «сохранено» и таймер автосохранения.
     */
    code: string;
    title: string;
    placeholder: string | null;
    hint: string | null;
    /** Заголовок секции внутри анкеты; null — вопрос вне секций. */
    groupTitle: string | null;
    sort: number;
    control: QuestionnaireControl;
    isRequired: boolean;
    /**
     * «Обязательность изменения»: пункт закрывается только ответом в ЭТОЙ
     * сессии — прежнее значение из CRM его не закрывает. Бэк выставляет
     * только для канала `crm`, нормализатор гасит флаг на всех остальных.
     *
     * У канала `smart` прежнего значения не существует ВООБЩЕ (элемента
     * ещё нет), поэтому «требовать новое» там ничем не отличается от
     * обычной обязательности — и лишний флаг только сбивал бы с толку:
     * непонятно, чем закрывать пункт, у которого нет «прежнего».
     */
    requireChange: boolean;
    /**
     * Срок годности значения из CRM (дни) — только `date`/`datetime`, где
     * сама дата и есть отметка времени.
     */
    staleAfterDays: number | null;
    channel: QuestionnaireChannel;
    /** Не null только при `channel: 'dto'`; путь из QUESTIONNAIRE_DTO_PATHS. */
    dtoPath: QuestionnaireDtoPath | null;
    target: QuestionnaireTarget;
    /**
     * Смарт-носитель; не null ТОЛЬКО при `channel: 'smart'`. Пара
     * «`field.name` + `smart`» и есть полный адрес ответа: имя поля — в
     * элементе, смарт — чей это элемент.
     */
    smart: QuestionnaireSmart | null;
    /** Штатное поле Битрикса (OPPORTUNITY), не UF. */
    isNative: boolean;
    /**
     * Привязка к полю; null — вопрос без поля (каналы `dto`/`text`).
     * У канала `smart` имя обязательно, но принадлежит оно ЭЛЕМЕНТУ смарта,
     * а не строке CRM: подставлять его в компанию или сделку нельзя.
     */
    field: QuestionnaireField | null;
    /**
     * Код pbx-поля из реестра (`op_invoice_date`) — ЗАПОЛНЕН ТОЛЬКО У
     * ВСТРОЕННОГО FALLBACK_CATALOG, где UF-имя заранее неизвестно и поле
     * резолвится по слепку портала. У портального каталога всегда null:
     * там имя приезжает готовым в `field.name`.
     */
    legacyFieldCode: string | null;
    options: QuestionnaireOption[];
}

/** Анкета каталога. */
export interface QuestionnaireDef {
    /** Стабильный ключ анкеты на портале; половина ключа ответа. */
    code: string;
    title: string;
    hint: string | null;
    purpose: QuestionnairePurpose;
    presentation: QuestionnairePresentation;
    place: QuestionnairePlace | null;
    persist: QuestionnairePersist;
    /** Всегда хотя бы одно условие; между условиями И. */
    conditions: QuestionnaireCondition[];
    /**
     * Фича-флаг настроек приложения. null — анкета включена всегда:
     * показываем при `пусто || config[configKey]`.
     */
    configKey: string | null;
    /**
     * Код встроенного набора, который эта анкета ЗАМЕЩАЕТ. Портал завёл
     * свою «Доработку» — встроенная того же кода не показывается, иначе
     * менеджер увидел бы два одинаковых блока.
     */
    legacyChecklistId: string | null;
    sort: number;
    items: QuestionnaireItem[];
}

/** Условие показа анкеты: значения внутри — ИЛИ. */
export interface QuestionnaireCondition {
    kind: QuestionnaireConditionKind;
    /** Для `always` — пустой массив. */
    values: string[];
}
