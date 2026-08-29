import type {
    PortalQuestionnaireConditionDto,
    PortalQuestionnaireDto,
    PortalQuestionnaireFieldSyncDto,
    PortalQuestionnaireFieldSyncResultDto,
    PortalQuestionnaireItemDto,
    PortalQuestionnaireItemSaveDto,
    PortalQuestionnaireItemSyncDto,
    PortalQuestionnaireListItemDto,
    PortalQuestionnaireOptionAddDto,
    PortalQuestionnaireOptionDto,
    PortalQuestionnaireOptionRenameDto,
    PortalQuestionnaireOptionSaveDto,
    PortalQuestionnaireSaveDto,
    PortalQuestionnaireSchemaDto,
    QuestionnaireCheckDiffDto,
    QuestionnaireCheckItemDto,
    QuestionnaireCheckResponseDto,
    QuestionnaireConditionKindDto,
    QuestionnaireDtoPathDto,
    QuestionnaireFieldDto,
    QuestionnaireFieldItemDto,
    QuestionnaireFieldSourceDto,
    QuestionnaireFieldSourcesResponseDto,
    QuestionnaireFieldTypeControlsDto,
    QuestionnaireFieldUsageDto,
    QuestionnaireFieldsListFieldsParams,
    QuestionnaireFieldsResponseDto,
    QuestionnaireLostOptionDto,
    QuestionnaireNewOptionDto,
    QuestionnaireOptionDescriptorDto,
    QuestionnaireRenamedOptionDto,
    QuestionnaireTitleDiffDto,
} from '@workspace/nest-admin-api';
import {
    PortalQuestionnaireConditionDtoKind,
    PortalQuestionnaireItemSaveDtoChannel,
    PortalQuestionnaireItemSaveDtoControl,
    PortalQuestionnaireItemSaveDtoFieldSource,
    PortalQuestionnaireItemSaveDtoFieldStatus,
    PortalQuestionnaireItemSaveDtoTargetEntity,
    PortalQuestionnaireItemSaveDtoTargetMode,
    PortalQuestionnaireSaveDtoAppCode,
    PortalQuestionnaireSaveDtoPersist,
    PortalQuestionnaireSaveDtoPlace,
    PortalQuestionnaireSaveDtoPresentation,
    PortalQuestionnaireSaveDtoPurpose,
} from '@workspace/nest-admin-api';

/**
 * Доменные типы портального каталога анкет — алиасы над сгенерированными
 * DTO (`@workspace/nest-admin-api`).
 *
 * Имя алиаса = имя класса бэка без суффикса `Dto`, поэтому переименование
 * на бэке правит только этот файл: хелперы, хуки и UI работают с
 * доменными именами.
 *
 * Даты на границе HTTP — ISO-строки (в DTO бэка стоит `Date`, но JSON
 * отдаёт строку); числа — обычные `number`, BigInt до ответа не доезжает.
 */

// ------------------------------------------------------------------
// Реестр допустимых значений (GET /questionnaires/schema)
// ------------------------------------------------------------------

/** Значение справочника: код + человеческое название для админки. */
export type QuestionnaireOptionDescriptor = QuestionnaireOptionDescriptorDto;

/** Вид условия показа со своим справочником значений. */
export type QuestionnaireConditionKind = QuestionnaireConditionKindDto;

/** Поле отчёта, доступное каналу «Поле отчёта». */
export type QuestionnaireDtoPath = QuestionnaireDtoPathDto;

/** Строка матрицы «тип поля Битрикса → допустимые типы отображения». */
export type QuestionnaireFieldTypeControls = QuestionnaireFieldTypeControlsDto;

/** Реестр целиком: редактор строится только по нему. */
export type PortalQuestionnaireSchema = PortalQuestionnaireSchemaDto;

// ------------------------------------------------------------------
// Тело сохранения (POST/PUT — одно и то же DTO)
// ------------------------------------------------------------------

/** Условие показа анкеты (внутри одного условия значения по ИЛИ). */
export type PortalQuestionnaireCondition = PortalQuestionnaireConditionDto;

/** Вариант справочника для типа отображения «Список». */
export type PortalQuestionnaireOptionSave = PortalQuestionnaireOptionSaveDto;

/** Вопрос анкеты в теле сохранения. */
export type PortalQuestionnaireItemSave = PortalQuestionnaireItemSaveDto;

/** Тело сохранения анкеты: состав задаётся ЦЕЛИКОМ, лишнее гасится. */
export type PortalQuestionnaireSave = PortalQuestionnaireSaveDto;

// ------------------------------------------------------------------
// Ответы чтения
// ------------------------------------------------------------------

/** Вариант справочника как он лежит в БД. */
export type PortalQuestionnaireOption = PortalQuestionnaireOptionDto;

/** Вопрос анкеты как он лежит в БД. */
export type PortalQuestionnaireItem = PortalQuestionnaireItemDto;

/** Анкета целиком (ответ админского API). */
export type PortalQuestionnaire = PortalQuestionnaireDto;

/** Строка списка анкет портала — без состава. */
export type PortalQuestionnaireListItem = PortalQuestionnaireListItemDto;

// ------------------------------------------------------------------
// Источник полей (GET /questionnaire-fields)
// ------------------------------------------------------------------

/** Носитель, у которого можно выбрать поле. */
export type QuestionnaireFieldSource = QuestionnaireFieldSourceDto;

/** Ответ `GET /questionnaire-fields/sources`. */
export type QuestionnaireFieldSourcesResponse =
    QuestionnaireFieldSourcesResponseDto;

/** Элемент списка UF-поля. */
export type QuestionnaireFieldItem = QuestionnaireFieldItemDto;

/** Где поле уже используется в анкетах портала. */
export type QuestionnaireFieldUsage = QuestionnaireFieldUsageDto;

/** UF-поле носителя, пригодное (или нет) для привязки к вопросу. */
export type QuestionnaireField = QuestionnaireFieldDto;

/** Ответ `GET /questionnaire-fields?entity=…`. */
export type QuestionnaireFieldsResponse = QuestionnaireFieldsResponseDto;

/**
 * Параметры запроса полей носителя.
 *
 * `smartId` здесь НЕ nullable, в отличие от `QuestionnaireFieldSource.smartId`
 * из `/sources`: у штатной сущности идентификатора смарта нет, и в query он
 * не уходит вовсе. Вызывающий обязан отдать `undefined`, а не `null`.
 */
export type QuestionnaireFieldsQuery = QuestionnaireFieldsListFieldsParams;

// ------------------------------------------------------------------
// Создание поля в носителе (POST /questionnaire-fields)
// ------------------------------------------------------------------

/**
 * Тело и ответ создания поля описаны РУКАМИ, а не алиасами generated-типов.
 *
 * Причина одна и временная: маршрут появился после последнего прогона
 * orval, а перегенерировать пакет сейчас нельзя. Формы повторяют DTO бэка
 * один в один (`QuestionnaireFieldCreateDto` и
 * `QuestionnaireFieldCreateResponseDto`) — когда orval прогонят, оба типа
 * заменяются алиасами, и ни одно поле не поедет.
 */
export interface QuestionnaireFieldCreateItem {
    /** Подпись значения — её и выбирает менеджер. */
    title: string;
    /** Внешний код (xmlId); пусто — бэк пронумерует сам. */
    code?: string;
    sort?: number;
}

/** Что завести в носителе. */
export interface QuestionnaireFieldCreate {
    entity: QuestionnaireFieldSourceCode;
    /** Только для смарта: строка `smarts` нашей БД из `/sources`. */
    smartId?: number;
    /** Постфикс UF-имени и xmlId поля; он же ключ повтора. */
    code: string;
    title: string;
    /** `userTypeId` Битрикса из матрицы реестра. */
    type: string;
    isRequired?: boolean;
    /**
     * Множественность бэк отклоняет с внятным текстом. Редактор её не
     * предлагает вовсе — поле оставлено, чтобы отказ читался в одном месте
     * с остальными правилами, а не появлялся сюрпризом.
     */
    isMultiple?: boolean;
    items?: QuestionnaireFieldCreateItem[];
}

/**
 * Ответ создания: поле приезжает В ТОМ ЖЕ ВИДЕ, что и строка списка
 * выбора, поэтому вопрос собирается из него сразу. `created: false` —
 * поле с таким кодом уже было, и бэк вернул его как есть.
 */
export interface QuestionnaireFieldCreateResponse {
    source: QuestionnaireFieldSource;
    field: QuestionnaireField;
    created: boolean;
    /** Чем результат отличается от заказанного; пусто — ничем. */
    warning?: string;
}

// ------------------------------------------------------------------
// Проверка привязок (POST /questionnaires/:id/check)
// ------------------------------------------------------------------

/**
 * Поле переименовали в портале: `our` — формулировка вопроса, которую
 * заменит подтягивание, `live` — живая подпись. Расхождение считается со
 * СЛЕПКОМ принятого (`meta.bitrixField`), а не с формулировкой вопроса:
 * иначе строка загоралась бы у каждого вопроса, названного по-своему.
 */
export type QuestionnaireTitleDiff = QuestionnaireTitleDiffDto;

/** Вариант списка, который есть в Битриксе, а у нас его нет. */
export type QuestionnaireNewOption = QuestionnaireNewOptionDto;

/** Наш вариант, у которого в Битриксе теперь другая подпись. */
export type QuestionnaireRenamedOption = QuestionnaireRenamedOptionDto;

/** Наш вариант, которого в Битриксе больше нет: этой сверкой погашен. */
export type QuestionnaireLostOption = QuestionnaireLostOptionDto;

/**
 * Разбор расхождений одного вопроса — ДАННЫЕ, а не действие.
 *
 * Сверка ничего из этого не применяет: подписи вопроса и вариантов
 * владелец правит под себя, и затирать их живым текстом Битрикса молча
 * нельзя. Применяется выбранное отдельной ручкой `apply-field-sync`.
 * Исключение, которое сверка правит всегда сама, — `bitrixId` варианта и
 * гашение исчезнувшего: это адрес записи, а не текст.
 */
export type QuestionnaireCheckDiff = QuestionnaireCheckDiffDto;

/** Результат проверки привязки одного вопроса. */
export type QuestionnaireCheckItem = QuestionnaireCheckItemDto;

/** Ответ «Проверить привязки». */
export type QuestionnaireCheckResponse = QuestionnaireCheckResponseDto;

// ------------------------------------------------------------------
// Применение расхождений (POST /questionnaires/:id/apply-field-sync)
// ------------------------------------------------------------------

/** Подпись существующего варианта, которую владелец решил подтянуть. */
export type PortalQuestionnaireOptionRename =
    PortalQuestionnaireOptionRenameDto;

/**
 * Вариант Битрикса, которого у нас ещё нет. `bitrixId` обязателен: именно
 * он уходит в `crm.*.update`, и вариант без него бесполезен — ответ на
 * него молча потерялся бы.
 */
export type PortalQuestionnaireOptionAdd = PortalQuestionnaireOptionAddDto;

/** Что владелец согласился применить по одному вопросу. */
export type PortalQuestionnaireItemSync = PortalQuestionnaireItemSyncDto;

/** Тело «Подтянуть из Битрикса»: ровно то, что владелец отметил. */
export type PortalQuestionnaireFieldSync = PortalQuestionnaireFieldSyncDto;

/** Ответ применения: анкета после него и что именно применили. */
export type PortalQuestionnaireFieldSyncResult =
    PortalQuestionnaireFieldSyncResultDto;

// ------------------------------------------------------------------
// Перечисления контракта
// ------------------------------------------------------------------

/**
 * Одно доменное имя на каждое перечисление.
 *
 * Формы чтения и сохранения описывают одни и те же коды разными
 * generated-типами (`PortalQuestionnaireDtoPurpose` против
 * `PortalQuestionnaireSaveDtoPurpose`): структурно они совпадают, но
 * `Record<Purpose, X>` уже не примет ключ «из другой половины». Поэтому
 * наружу торчит ровно один алиас на перечисление — за основу взята форма
 * СОХРАНЕНИЯ: именно её набивает редактор, и именно её проверяет бэк.
 */
export type QuestionnaireAppCode = PortalQuestionnaireSaveDtoAppCode;
export type QuestionnairePurpose = PortalQuestionnaireSaveDtoPurpose;
export type QuestionnairePresentation = PortalQuestionnaireSaveDtoPresentation;
/** Колонка карточки. В теле сохранения поле nullable — `null` пишем явно. */
export type QuestionnairePlace = NonNullable<PortalQuestionnaireSaveDtoPlace>;
export type QuestionnairePersist = PortalQuestionnaireSaveDtoPersist;
export type QuestionnaireControl = PortalQuestionnaireItemSaveDtoControl;
export type QuestionnaireChannel = PortalQuestionnaireItemSaveDtoChannel;
export type QuestionnaireTargetMode = PortalQuestionnaireItemSaveDtoTargetMode;
/**
 * Сущность-носитель ответа. Смарт здесь ЕСТЬ, но носителем становится сам:
 * у канала «Поле элемента смарта» конкретный элемент не выбирается — его
 * заводит поток события.
 */
export type QuestionnaireTargetEntity =
    NonNullable<PortalQuestionnaireItemSaveDtoTargetEntity>;
/** Носитель, ИЗ КОТОРОГО поле выбрано в пикере. */
export type QuestionnaireFieldSourceCode =
    PortalQuestionnaireItemSaveDtoFieldSource;
export type QuestionnaireFieldStatus =
    PortalQuestionnaireItemSaveDtoFieldStatus;
export type QuestionnaireConditionKindCode =
    PortalQuestionnaireConditionDtoKind;

/**
 * КОДЫ контракта — те самые перечисления, из которых orval собрал
 * union-ы выше. Это не копия реестра: списки значений (что показать, в
 * каком порядке, какими подписями) по-прежнему приходят из `GET /schema`,
 * а здесь лежит ровно то, что бэк примет в теле сохранения.
 *
 * Зачем таблица нужна отдельно от типов: на ней держатся правила
 * редактора — «требовать новое значение» работает только у канала
 * `channel.crm`, срок годности только у `control.date`/`control.datetime`,
 * поле `fieldSource.smart` требует канала `channel.smart`, колонка
 * задаётся только у `presentation.inline`. Редактор обязан знать эти коды,
 * иначе не предупредит до сохранения — и владелец получит 400 вместо
 * подсказки.
 */
export const QUESTIONNAIRE_CODE = {
    appCode: PortalQuestionnaireSaveDtoAppCode,
    purpose: PortalQuestionnaireSaveDtoPurpose,
    presentation: PortalQuestionnaireSaveDtoPresentation,
    place: PortalQuestionnaireSaveDtoPlace,
    persist: PortalQuestionnaireSaveDtoPersist,
    control: PortalQuestionnaireItemSaveDtoControl,
    channel: PortalQuestionnaireItemSaveDtoChannel,
    targetMode: PortalQuestionnaireItemSaveDtoTargetMode,
    targetEntity: PortalQuestionnaireItemSaveDtoTargetEntity,
    fieldSource: PortalQuestionnaireItemSaveDtoFieldSource,
    fieldStatus: PortalQuestionnaireItemSaveDtoFieldStatus,
    conditionKind: PortalQuestionnaireConditionDtoKind,
} as const;

/**
 * Цепочка носителей режима «Автоматически» — компания → сделка → лид.
 * Ровно её знает фрейм: поле контакта или смарта этой цепочкой не достать,
 * поэтому бэк такую привязку отклоняет.
 */
export const QUESTIONNAIRE_AUTO_FIELD_SOURCES: readonly QuestionnaireFieldSourceCode[] =
    [
        QUESTIONNAIRE_CODE.fieldSource.company,
        QUESTIONNAIRE_CODE.fieldSource.deal,
        QUESTIONNAIRE_CODE.fieldSource.lead,
    ];

/**
 * Каналы, у которых ответ пишется В ПОЛЕ: им нужна привязка и им же
 * сверка проставляет состояние привязки.
 *
 * Зеркало `QUESTIONNAIRE_FIELD_BOUND_CHANNELS` бэка: ответ в отчёт
 * адресует путь, ответ в комментарий события не адресует ничего — ломаться
 * в них нечему.
 */
export const QUESTIONNAIRE_FIELD_BOUND_CHANNELS: readonly QuestionnaireChannel[] =
    [QUESTIONNAIRE_CODE.channel.crm, QUESTIONNAIRE_CODE.channel.smart];

/**
 * Строка `smarts` портала — минимум, которым опознаётся поток события.
 *
 * Приезжает из `GET /api/admin/pbx/smarts` (слайс смартов портала), а не из
 * `/questionnaire-fields/sources`: там у смарта есть идентификатор и
 * название, но нет пары `type`/`group`, по которой и определяется, какой
 * поток события ведёт его элементы.
 */
export interface QuestionnairePortalSmart {
    /** `smarts.id` — тот же идентификатор, что `smartId` вопроса. */
    id: number;
    type: string;
    group: string;
    /** Название смарта: им бэк называет его в отказах. */
    title: string;
}

/**
 * Код реестра → значение перечисления контракта; `undefined` — код, о
 * котором контракт не знает.
 *
 * Реестр (`GET /schema`) остаётся единственным источником СПИСКОВ, но в
 * теле сохранения его коды типизированы union-ами, а `descriptor.code` —
 * обычная строка. Сужение живёт ровно на этой границе: «выбор владельца →
 * черновик». Код, которого контракт не знает, не уедет на бэк не потому,
 * что мы его прячем, — фронт физически не умеет его отправить, и 400 на
 * сохранении был бы единственной альтернативой.
 */
export const pickQuestionnaireCode = <T extends string>(
    allowed: Record<string, T>,
    code: string | null | undefined,
): T | undefined => Object.values(allowed).find(value => value === code);

/** Значение реестра, код которого контракт принимает. */
export interface QuestionnaireCodeOption<T extends string>
    extends QuestionnaireOptionDescriptor {
    code: T;
}

/**
 * Справочник реестра для селекта: подписи и порядок — бэковские, коды —
 * сужены до контракта.
 *
 * Значение, которого контракт не знает, в список не попадает: показать его
 * значило бы предложить выбор, который редактор не сможет сохранить.
 */
export const questionnaireCodeOptions = <T extends string>(
    allowed: Record<string, T>,
    options: QuestionnaireOptionDescriptor[] | undefined,
): QuestionnaireCodeOption<T>[] =>
    (options ?? []).flatMap(option => {
        const code = pickQuestionnaireCode(allowed, option.code);
        return code ? [{ ...option, code }] : [];
    });
