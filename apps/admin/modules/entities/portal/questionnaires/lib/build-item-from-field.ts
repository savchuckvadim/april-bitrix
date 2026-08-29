import type {
    PortalQuestionnaireItemSave,
    PortalQuestionnaireOptionSave,
    PortalQuestionnaireSchema,
    QuestionnaireControl,
    QuestionnaireField,
    QuestionnaireFieldItem,
    QuestionnaireFieldSourceCode,
} from '../model';
import {
    QUESTIONNAIRE_AUTO_FIELD_SOURCES,
    QUESTIONNAIRE_CODE,
    pickQuestionnaireCode,
} from '../model';
import {
    acceptLiveOptionMeta,
    bindFieldMirror,
    readFieldMirror,
    toFieldMirrorState,
    writeFieldMirror,
} from './field-mirror';
import type { QuestionnaireLiveOption } from './field-mirror';

/** Шаг порядка вариантов справочника. */
const OPTION_SORT_STEP = 10;

/**
 * Типы отображения, которыми можно заполнить поле такого типа.
 *
 * Матрица приходит из `GET /schema`: тип, которого в ней нет, и тип с
 * пустым списком одинаково означают «поле в анкету брать нельзя». Фронт
 * матрицу не дублирует — иначе реестр бэка и редактор разъехались бы, и
 * владелец узнал бы об этом только по 400 на сохранении.
 */
export const getFieldControls = (
    schema: PortalQuestionnaireSchema | undefined,
    fieldType: string,
): QuestionnaireControl[] =>
    schema?.fieldTypeControls.find(row => row.fieldType === fieldType)
        ?.controls ?? [];

/**
 * Почему поле нельзя взять в анкету; `null` — поле годится.
 *
 * Ровно эти причины бэк проверяет на сохранении, поэтому пикер обязан
 * гасить такие поля заранее: собранный из них вопрос вернулся бы ошибкой.
 * Прятать поле при этом нельзя — владелец сам завёл его в CRM и искал бы
 * пропажу; поле показывается с причиной.
 *
 * Сам по себе носитель поле больше не отклоняет: поле смарта в анкету
 * берётся, у него свой канал записи. Отклоняет НОСИТЕЛЬ ЦЕЛИКОМ, когда
 * ответу до него не добраться (смарт без потока события, анкета без
 * условия по типу события этого смарта) — эта причина считается один раз
 * на носителя и приходит сюда готовой строкой.
 */
export const getFieldRejectReason = (
    field: QuestionnaireField,
    schema: PortalQuestionnaireSchema | undefined,
    sourceBlockReason?: string | null,
): string | null => {
    if (sourceBlockReason) return sourceBlockReason;
    if (field.multiple) {
        return (
            'Множественное поле: ответ записался бы в первый элемент и ' +
            'исчез — в анкету такие поля не берём'
        );
    }

    const controls = getFieldControls(schema, field.type);
    if (controls.length === 0) {
        return `Поле типа «${field.type}» анкета заполнить не умеет`;
    }

    // Поле-список отвечает не подписью, а идентификатором элемента: именно
    // он уходит в `crm.*.update`. Без элементов спрашивать нечего, а без их
    // идентификаторов (так бывает при чтении без прав администратора CRM)
    // вариант справочника не сохранить — бэк отклонит вопрос целиком.
    if (controls.includes(QUESTIONNAIRE_CODE.control.enumeration)) {
        if (field.items.length === 0) {
            return (
                'У поля-списка нет ни одного элемента: выбирать менеджеру ' +
                'не из чего — добавьте значения в Битриксе'
            );
        }
        if (field.items.some(item => item.id === null)) {
            return (
                'Идентификаторы элементов списка не прочитались — в CRM ' +
                'уезжает именно id элемента, а не подпись. Нужны права ' +
                'администратора CRM у ключа портала'
            );
        }
    }

    return null;
};

/** Произвольная строка → безопасный код: латиница, цифры, подчёркивание. */
const slugCode = (raw: string): string =>
    raw
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

/** UF-имя → код вопроса: срезаем префикс носителя и нормализуем. */
export const buildItemCodeFromFieldName = (fieldName: string): string => {
    // `UF_CRM_7_SALE_DATE` → `sale_date`, `UF_CRM_1712345678` → `1712345678`.
    const stripped = slugCode(
        fieldName.trim().replace(/^UF_[A-Z]+(?:_\d+)?_/i, ''),
    );

    if (!stripped) return 'field';
    // Код — ключ ответа во фрейме: цифрой не начинаем, чтобы его можно
    // было читать глазами рядом с кодами анкет.
    return /^\d/.test(stripped) ? `uf_${stripped}` : stripped;
};

/** Код, свободный среди уже занятых: `decision_date`, `decision_date_2`, … */
export const uniqueItemCode = (
    base: string,
    taken: Iterable<string> = [],
): string => {
    const used = new Set(taken);
    if (!used.has(base)) return base;

    let index = 2;
    while (used.has(`${base}_${index}`)) index += 1;
    return `${base}_${index}`;
};

/** Элемент списка Битрикса → вариант справочника вопроса. */
export const buildOptionFromFieldItem = (
    item: QuestionnaireFieldItem,
    index: number,
    taken: Set<string>,
): PortalQuestionnaireOptionSave => {
    // Код варианта должен пережить переименование значения в Битриксе,
    // поэтому берём xmlId, затем id элемента и только в последнюю очередь
    // порядковый номер.
    const base =
        slugCode(item.xmlId ?? '') ||
        (item.id !== null ? `opt_${item.id}` : `opt_${index + 1}`);
    const code = uniqueItemCode(base, taken);
    taken.add(code);

    return {
        code,
        title: item.value,
        // Именно `bitrixId` уходит в `crm.*.update`; в degraded-режиме его
        // нет — вопрос сохранить не выйдет, и это правильно.
        bitrixId: item.id,
        xmlId: item.xmlId,
        sort: (index + 1) * OPTION_SORT_STEP,
        isDefault: false,
        isActive: true,
    };
};

/**
 * Откуда поле взято.
 *
 * У смарта носителя мало: строк `smarts` на портале много, и в какую из
 * них уедет ответ, говорит только `smartId`. Он же — единственная часть
 * привязки, которую бэк ХРАНИТ (`fieldSource` проверяется на сохранении и
 * в БД не попадает).
 */
export interface QuestionnaireFieldOrigin {
    /** Носитель, из которого поле выбрано в пикере. */
    source: QuestionnaireFieldSourceCode;
    /** Строка `smarts` портала — только у поля смарта. */
    smartId?: number | null;
}

/** Что нужно знать, чтобы собрать вопрос из поля. */
export interface BuildItemFromFieldOptions extends QuestionnaireFieldOrigin {
    /** Коды вопросов, уже занятые в черновике. */
    takenCodes?: Iterable<string>;
}

/**
 * UF-поле Битрикса → вопрос анкеты с разумными дефолтами.
 *
 * Что откуда:
 * - `control` — первый допустимый тип отображения из матрицы схемы (у
 *   `datetime`, например, это «Дата и время», а «Дата» остаётся вторым
 *   вариантом в селекте);
 * - `isMultiple` — как есть у поля: врать тут нельзя, вопрос с
 *   множественным полем бэк отклонит с внятным текстом;
 * - `isRequired` — ПРЕДЛОЖЕНИЕ по обязательности поля в Битриксе: поле
 *   обязательно в карточке, значит вопрос скорее всего тоже, но владелец
 *   волен снять;
 * - варианты справочника — с `bitrixId` элемента списка, потому что
 *   записывается в CRM именно он, а не подпись;
 * - носитель: поле контакта цепочкой «компания → сделка → лид» не достать,
 *   поэтому для него сразу ставится жёсткий носитель;
 * - поле смарта собирается своим каналом: ответ пишет не фрейм, а бэк
 *   отчёта — в элемент, который заводит поток события. Носитель у такого
 *   вопроса самоописывающий (`entity` + `smart`), и бэк проставил бы его
 *   сам; ставим явно, чтобы карточка вопроса не показывала пустоту.
 */
export const buildItemFromField = (
    field: QuestionnaireField,
    schema: PortalQuestionnaireSchema | undefined,
    options: BuildItemFromFieldOptions,
): PortalQuestionnaireItemSave => {
    const { source, smartId = null, takenCodes = [] } = options;
    const controls = getFieldControls(schema, field.type);
    const isSmart = source === QUESTIONNAIRE_CODE.fieldSource.smart;
    const isAutoReachable = QUESTIONNAIRE_AUTO_FIELD_SOURCES.includes(source);
    // Пустая матрица означает «поле такого типа в анкету брать нельзя» —
    // пикер такое поле и не отдаёт. Если оно всё же дошло, проверка
    // черновика скажет «тип отображения несовместим с полем типа X»:
    // это точнее, чем вопрос с пустым типом отображения.
    const control = controls[0] ?? QUESTIONNAIRE_CODE.control.string;
    // Коды вариантов уникальны внутри одного вопроса — набор общий на всё
    // поле, а не на каждый элемент списка.
    const optionCodes = new Set<string>();

    return {
        code: uniqueItemCode(
            buildItemCodeFromFieldName(field.fieldName),
            takenCodes,
        ),
        title: field.title || field.fieldName,
        placeholder: null,
        hint: null,
        groupTitle: null,
        control,
        isMultiple: field.multiple,
        isRequired: field.mandatory,
        requireChange: false,
        staleAfterDays: null,
        channel: isSmart
            ? QUESTIONNAIRE_CODE.channel.smart
            : QUESTIONNAIRE_CODE.channel.crm,
        targetMode:
            isAutoReachable && !isSmart
                ? QUESTIONNAIRE_CODE.targetMode.auto
                : QUESTIONNAIRE_CODE.targetMode.entity,
        targetEntity:
            isAutoReachable && !isSmart
                ? null
                : (pickQuestionnaireCode(
                      QUESTIONNAIRE_CODE.targetEntity,
                      source,
                  ) ?? null),
        dtoPath: null,
        isNative: false,
        fieldName: field.fieldName,
        fieldBitrixId: field.bitrixId,
        fieldXmlId: field.xmlId ?? null,
        fieldCode: field.portalCode ?? null,
        fieldType: field.type,
        fieldSource: source,
        // Постоянный адрес носителя: у остальных каналов его нет, и пустое
        // значение здесь честнее унаследованного от прошлой привязки.
        smartId: isSmart ? smartId : null,
        fieldStatus: QUESTIONNAIRE_CODE.fieldStatus.ok,
        // Слепок поля в момент привязки: владелец только что видел это
        // состояние в пикере и согласился с ним. Всё, что разойдётся
        // позже, — правка В ПОРТАЛЕ, а не авторская формулировка вопроса.
        meta: bindFieldMirror({}, field),
        isActive: true,
        options:
            control === QUESTIONNAIRE_CODE.control.enumeration
                ? field.items.map((item, index) =>
                      buildOptionFromFieldItem(item, index, optionCodes),
                  )
                : [],
    };
};

/**
 * Перепривязать существующий вопрос к другому полю.
 *
 * Формулировка вопроса, его код и место в анкете остаются: код — ключ уже
 * собранных ответов, и менять его при выборе другого поля нельзя. Меняется
 * ровно привязка — имя поля, его идентификаторы, тип, носитель и варианты
 * справочника (они приходят из самого поля).
 *
 * Канал тоже приходит из привязки: поле смарта пишется каналом смарта, а
 * поле CRM — каналом CRM. Оставить прежний канал значило бы собрать вопрос,
 * который бэк отклонит («поле смарта в CRM не пишется»).
 *
 * Тип отображения сохраняется, если он исполним и для нового поля; иначе
 * берётся первый допустимый — оставить неисполнимый значит собрать вопрос,
 * ответ которого не запишется.
 *
 * Это ПЕРЕПРИВЯЗКА, поле другое: варианты справочника старого поля новому
 * не принадлежат и собираются заново, слепок пересобирается целиком.
 * Перечитывание ТОГО ЖЕ поля — `syncFieldInItem` ниже: там авторские
 * подписи вариантов и погашенные варианты остаются на месте.
 */
export const applyFieldToItem = (
    item: PortalQuestionnaireItemSave,
    field: QuestionnaireField,
    schema: PortalQuestionnaireSchema | undefined,
    origin: QuestionnaireFieldOrigin,
): PortalQuestionnaireItemSave => {
    const bound = buildItemFromField(field, schema, origin);
    const controls = getFieldControls(schema, field.type);

    return {
        ...item,
        channel: bound.channel,
        isNative: false,
        dtoPath: null,
        title: item.title.trim() ? item.title : bound.title,
        control: controls.includes(item.control) ? item.control : bound.control,
        isMultiple: bound.isMultiple,
        targetMode: bound.targetMode,
        targetEntity: bound.targetEntity,
        fieldName: bound.fieldName,
        fieldBitrixId: bound.fieldBitrixId,
        fieldXmlId: bound.fieldXmlId,
        fieldCode: bound.fieldCode,
        fieldType: bound.fieldType,
        fieldSource: bound.fieldSource,
        smartId: bound.smartId,
        // Требование нового значения живёт только у канала CRM: при
        // переезде на смарт его пришлось бы снимать бэку отказом.
        requireChange:
            bound.channel === QUESTIONNAIRE_CODE.channel.crm
                ? (item.requireChange ?? false)
                : false,
        // Привязка новая: прежнее состояние проверки к ней не относится.
        fieldStatus: QUESTIONNAIRE_CODE.fieldStatus.ok,
        // Слепок пересобирается по только что увиденному полю: и живое, и
        // принятое. Оставить прежний значило бы сравнивать новое поле со
        // старым — «переименовали» показалось бы на ровном месте.
        meta: bindFieldMirror(item.meta, field),
        options: bound.options,
    };
};

/** Тот же самый элемент списка: сначала id элемента, затем внешний код. */
const isSameFieldItem = (
    option: PortalQuestionnaireOptionSave,
    item: QuestionnaireFieldItem,
): boolean =>
    (option.bitrixId !== null &&
        option.bitrixId !== undefined &&
        option.bitrixId === item.id) ||
    (!!option.xmlId && !!item.xmlId && option.xmlId === item.xmlId);

/**
 * Варианты вопроса, СВЕРЕННЫЕ с живым полем, а не пересобранные из него.
 *
 * Подписи вариантов владелец пишет под менеджера («Прямая» → «Прямые
 * продажи»), поэтому перечитывание поля их не трогает: переименование в
 * портале показывает карточка живого поля, а подтягивается оно поштучно
 * («Подтянуть подпись»). Здесь обновляется только АДРЕС записи — `bitrixId`
 * и `xmlId` элемента: ради них кнопку и нажимают.
 *
 * Вариант, которого в поле больше нет, остаётся как есть: гасит его сверка,
 * а вычеркнуть его из черновика значило бы оставить уже собранные ответы
 * без варианта.
 *
 * Новое значение справочника добавляется сразу: оно ничего не затирает —
 * ровно поэтому и в разборе сверки такая строка отмечена по умолчанию.
 */
const syncOptionsWithField = (
    options: PortalQuestionnaireOptionSave[],
    field: QuestionnaireField,
): PortalQuestionnaireOptionSave[] => {
    const taken = new Set(options.map(option => option.code));
    const kept = options.map(option => {
        const live = field.items.find(item => isSameFieldItem(option, item));
        if (!live) return option;
        return { ...option, bitrixId: live.id, xmlId: live.xmlId };
    });

    // Новые встают в конец: порядок вариантов владелец правит сам, и
    // пересчитывать его под порядок Битрикса значило бы менять анкету.
    const lastSort = kept.reduce(
        (max, option) => Math.max(max, option.sort ?? 0),
        0,
    );
    const added = field.items
        .filter(item => !kept.some(option => isSameFieldItem(option, item)))
        .map((item, index) => ({
            ...buildOptionFromFieldItem(item, kept.length + index, taken),
            sort: lastSort + (index + 1) * OPTION_SORT_STEP,
        }));

    return [...kept, ...added];
};

/**
 * Перечитать поле вопроса из живого Битрикса, не тронув авторский текст.
 *
 * Поле ТО ЖЕ САМОЕ — этим и отличается от перепривязки
 * (`applyFieldToItem`), где старые варианты чужому полю не принадлежат и
 * собираются заново. Здесь правда о ПОЛЕ приходит из портала, а правда о
 * ВОПРОСЕ остаётся в анкете: формулировка, подписи вариантов, погашенные
 * варианты и их порядок написаны владельцем под менеджера.
 *
 * Слепок обновляется только живой. Принятое двигают действия владельца —
 * «Подтянуть подпись», «Оставить свою», взятие нового значения: иначе
 * кнопка гасила бы расхождение, которого никто не принимал, и о
 * переименовании в портале владелец больше не узнал бы.
 */
export const syncFieldInItem = (
    item: PortalQuestionnaireItemSave,
    field: QuestionnaireField,
    schema: PortalQuestionnaireSchema | undefined,
    origin: QuestionnaireFieldOrigin,
): PortalQuestionnaireItemSave => {
    const bound = applyFieldToItem(item, field, schema, origin);

    return {
        ...bound,
        options: syncOptionsWithField(item.options ?? [], field),
        meta: writeFieldMirror(item.meta, {
            live: toFieldMirrorState(field),
            accepted: readFieldMirror(item.meta).accepted,
        }),
    };
};

/**
 * Добавить в вопрос значение справочника, появившееся в Битриксе.
 *
 * Владелец завёл значение в поле и хочет спросить о нём менеджера — это
 * правка ЧЕРНОВИКА: код варианта, `bitrixId` и подпись приходят из
 * живого поля теми же правилами, что и при первой привязке (иначе одно и
 * то же значение получило бы разные коды в зависимости от того, когда его
 * взяли).
 *
 * Заодно значение становится ПРИНЯТЫМ: владелец его увидел и взял, и
 * показывать «есть в Битриксе, нет в анкете» на следующем открытии больше
 * не за что.
 */
export const addLiveOptionToItem = (
    item: PortalQuestionnaireItemSave,
    option: QuestionnaireLiveOption,
): Partial<PortalQuestionnaireItemSave> => {
    const options = item.options ?? [];
    const taken = new Set(options.map(row => row.code));

    return {
        options: [
            ...options,
            buildOptionFromFieldItem(
                {
                    id: option.bitrixId,
                    value: option.title,
                    xmlId: option.xmlId,
                },
                options.length,
                taken,
            ),
        ],
        meta: acceptLiveOptionMeta(item.meta, option),
    };
};
