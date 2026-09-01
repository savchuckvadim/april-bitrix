import {
    findPortalField,
    findUfKey,
    type PBXField,
    type Portal,
} from '@workspace/pbx';
import {
    toDateInputValue,
    toDateTimeInputValue,
    toHumanDate,
    toHumanDateTime,
} from '@/modules/shared/lib/crm-date';
// Прямые пути, а не барель слайса каталога: барель тянет транспорт.
import { answerKey } from '@/modules/entities/Questionnaire/lib/answer-key';
import type {
    QuestionnaireControl,
    QuestionnaireOption,
} from '@/modules/entities/Questionnaire/model/questionnaire.type';
import {
    CHECKLIST_BOOLEAN_NO,
    checklistBooleanTitle,
    toChecklistBooleanValue,
} from './checklist-boolean';
import type {
    ChecklistDef,
    ChecklistFieldDef,
    ChecklistFieldRef,
} from '../type/call-checklist.type';

/**
 * Резолв вопроса анкеты в конкретного носителя и чтение текущего значения.
 *
 * АДРЕС ПОЛЯ. Портальная анкета несёт готовое имя поля (`field.name` — ровно
 * та строка, что вернул Битрикс), оно и есть адрес: ни слепка портала, ни
 * сборки ключа конкатенацией. Так видны поля, заведённые на портале руками,
 * и суточный клиентский кэш слепка перестаёт их прятать. Слепок остался
 * только для ВСТРОЕННЫХ вопросов (`legacyFieldCode`), где имя заранее
 * неизвестно и ключ по-прежнему ищется по коду pbx-реестра.
 *
 * НОСИТЕЛЬ. `target.mode: 'entity'` — носитель назван анкетой;
 * `auto` — прежний приоритет ИНН: компания → сделка → лид. У канала
 * `smart` носителя нет вовсе: ответ адресован ЭЛЕМЕНТУ смарта, которого на
 * момент вопроса ещё не существует, и строку под него искать негде — такой
 * вопрос резолвится без сущности и без текущего значения.
 *
 * Ничего не резолвится (носителя нет, поля нет в слепке, справочник без
 * вариантов) — вопрос не показывается и отправку не блокирует: самогейт,
 * никакого релиза под установку поля не нужно.
 */

export type ChecklistEntityKind = 'company' | 'deal' | 'lead';

export interface ChecklistEntityRows {
    company: Record<string, unknown> | null;
    deal: Record<string, unknown> | null;
    lead: Record<string, unknown> | null;
}

/** Один носитель поля: куда писать и откуда читать. */
export interface ChecklistFieldCarrier {
    entity: ChecklistEntityKind;
    entityId: number;
    /** UF-ключ у ЭТОЙ сущности: у встроенных вопросов он свой на носителя. */
    ufKey: string;
}

export interface ResolvedChecklistField extends ChecklistFieldRef {
    entity: ChecklistEntityKind;
    /**
     * 0 — носителя нет: `dto` (сделку создаст сам flow) и `smart` (элемент
     * смарта родится отправкой). `entity` у таких вопросов формальный.
     */
    entityId: number;
    /** Имя поля Битрикса; '' — вопрос без поля в CRM (dto/text/smart). */
    ufKey: string;
    /**
     * ВСЕ носители поля (первый — тот же, что `entity`/`entityId`).
     * Значение-истина живёт на сделке И компании разом (доктрина
     * EntityFieldsDialog), поэтому запись crm-канала идёт во всех — см.
     * {@link checklistWriteCarriers}. Пусто у вопросов без поля в CRM.
     */
    carriers: ChecklistFieldCarrier[];
    /**
     * Варианты справочника ОДНИМ списком — и для контрола, и для записи: у
     * портальной анкеты из `options` каталога (там уже `bitrixId`), у
     * встроенного вопроса — из items поля в слепке.
     */
    options: QuestionnaireOption[];
    /** Нормализованное значение для контрола ('' — пусто). */
    currentValue: string;
    /** Человекочитаемое значение (название варианта, дата) для «сейчас». */
    currentLabel: string;
}

/**
 * Значение контрола по типу вопроса: `date` — `YYYY-MM-DD`, `datetime` —
 * `YYYY-MM-DDTHH:mm` (контрол `datetime-local`). Разбор обоих диалектов
 * портала — в общем нормализаторе (`modules/shared/lib/crm-date`).
 *
 * До этого datetime-поля («Дата последнего счёта», «Направлено КП») читались
 * и показывались как чистая дата: время из портала терялось молча, а обратная
 * запись обнуляла его.
 */
export const toChecklistInputValue = (
    control: QuestionnaireControl,
    raw: unknown,
): string =>
    control === 'datetime' ? toDateTimeInputValue(raw) : toDateInputValue(raw);

/** Подпись «сейчас: …» — дата или дата со временем, в локали портала. */
export const toChecklistDisplayValue = (
    control: QuestionnaireControl,
    raw: unknown,
): string => (control === 'datetime' ? toHumanDateTime(raw) : toHumanDate(raw));

const fieldsFor = (
    portal: Portal | null | undefined,
    kind: ChecklistEntityKind,
): PBXField[] | null | undefined => {
    if (!portal) return null;
    if (kind === 'company') return portal.company?.bitrixfields;
    // Историческое имя узла сделки в слепке — bitrixDeal.
    if (kind === 'deal') return portal.bitrixDeal?.bitrixfields;
    return portal.lead?.bitrixfields;
};

const ENTITY_PRIORITY: ChecklistEntityKind[] = ['company', 'deal', 'lead'];

/** Строка CRM, в которую движок умеет писать сам. */
const isCrmEntityKind = (entity: string): entity is ChecklistEntityKind =>
    (ENTITY_PRIORITY as readonly string[]).includes(entity);

/**
 * Носители, среди которых ищем поле: названный анкетой — один, `auto` —
 * прежний приоритет компания → сделка → лид.
 */
const targetKinds = (def: ChecklistFieldDef): ChecklistEntityKind[] => {
    const entity = def.target.mode === 'entity' ? def.target.entity : null;
    if (!entity) return ENTITY_PRIORITY;
    // Носитель назван, но он не строка CRM (`smart`) — искать поле негде.
    // Канал `smart` сюда не доходит вовсе, у него своя ветка в резолве;
    // пустой список остаётся страховкой на случай чужой формы каталога.
    return isCrmEntityKind(entity) ? [entity] : [];
};

/** Сумма Bitrix ('150000.00'): нули и мусор считаются «пусто». */
const toMoneyValue = (raw: unknown): string => {
    const value = Number(String(raw ?? '').replace(',', '.'));
    return Number.isFinite(value) && value > 0 ? String(value) : '';
};

/** Варианты поля из слепка — для встроенных вопросов (дедуп по коду). */
const optionsFromPortalField = (
    field: PBXField | null,
): QuestionnaireOption[] => {
    const seen = new Set<string>();
    const options: QuestionnaireOption[] = [];
    for (const item of field?.items ?? []) {
        if (!item.code || seen.has(item.code)) continue;
        seen.add(item.code);
        options.push({
            code: item.code,
            title: item.name,
            bitrixId: item.bitrixId,
        });
    }
    return options;
};

/** Вариант справочника по значению из CRM (в строке лежит bitrixId). */
export const findChecklistOptionByBitrixId = (
    options: QuestionnaireOption[],
    raw: unknown,
): QuestionnaireOption | null => {
    if (raw === null || raw === undefined || raw === '') return null;
    return (
        options.find(
            option =>
                option.bitrixId !== null &&
                String(option.bitrixId) === String(raw),
        ) ?? null
    );
};

/**
 * У вопроса свой список ответов, объявленный САМИМ ПУНКТОМ анкеты, а не
 * справочником Битрикса: поле обычное строковое, но отвечать на него нужно
 * из готового набора формулировок. Без этого админу пришлось бы заводить
 * справочное поле в CRM ради трёх вариантов ответа.
 *
 * Только `string`: у дат и сумм список ответов бессмыслен, а `enumeration`
 * ходит своей веткой (там варианты пишутся `bitrixId`).
 */
export const hasChecklistChoice = (def: ChecklistFieldDef): boolean =>
    def.control === 'string' && def.options.length > 0;

/** Вариант по коду — код и есть значение контрола. */
export const findChecklistOptionByCode = (
    options: QuestionnaireOption[],
    code: string,
): QuestionnaireOption | null =>
    options.find(option => option.code === code) ?? null;

/**
 * Вариант «из пункта» по значению строкового поля.
 *
 * В поле лежит ТЕКСТ варианта: строковое поле читают в карточке Битрикса
 * руководитель и следующий менеджер, и код вида `pay_now` там был бы
 * шумом. Код принимается тоже — на случай значений, записанных до того,
 * как у вопроса появился список.
 */
const findChecklistChoiceOption = (
    options: QuestionnaireOption[],
    raw: string,
): QuestionnaireOption | null =>
    options.find(option => option.title === raw) ??
    findChecklistOptionByCode(options, raw);

/**
 * Вопросы анкеты вместе с ключами ответов, в порядке показа.
 *
 * Единственное место, где ключ собирается из анкеты и вопроса: у портальной
 * анкеты код вопроса и код поля — разные вещи, и разбирать эту разницу
 * должен один файл, а не каждый потребитель.
 *
 * Здесь же единственная сортировка вопросов: `sort` анкеты, при равенстве —
 * код (иначе порядок задавал бы порядок ключей в JSON, и два портала с
 * одинаковым составом показывали бы вопросы по-разному). Порядок нужен
 * одинаковый и карточке, и модалке, и сборке ответов, поэтому он живёт в
 * общем перечислителе, а не в UI.
 */
const byDisplayOrder = (a: ChecklistFieldDef, b: ChecklistFieldDef): number =>
    a.sort - b.sort || a.code.localeCompare(b.code);

export const checklistFieldRefs = (def: ChecklistDef): ChecklistFieldRef[] =>
    [...def.items].sort(byDisplayOrder).map(item => ({
        answerKey: answerKey(def.code, item.code),
        def: item,
    }));

/** Значение из строки сущности + подпись «сейчас» по типу вопроса. */
const readCurrent = (
    def: ChecklistFieldDef,
    raw: unknown,
    options: QuestionnaireOption[],
): { currentValue: string; currentLabel: string } => {
    if (def.control === 'enumeration') {
        const option = findChecklistOptionByBitrixId(options, raw);
        return {
            currentValue: option?.code ?? '',
            currentLabel: option?.title ?? '',
        };
    }
    if (def.control === 'date' || def.control === 'datetime') {
        return {
            currentValue: toChecklistInputValue(def.control, raw),
            currentLabel: toChecklistDisplayValue(def.control, raw),
        };
    }
    if (def.control === 'money') {
        const value = toMoneyValue(raw);
        return {
            currentValue: value,
            currentLabel: value
                ? `${Number(value).toLocaleString('ru-RU')} ₽`
                : '',
        };
    }
    if (def.control === 'boolean') {
        // «Не выбрано» — не ответ, и «Нет» из поля им тоже не становится:
        // UF-поле типа boolean хранит 0 и у вопроса, которого никто не
        // касался (ноль пишет любое сохранение карточки Битрикса с
        // выключенной галкой), поэтому отличить в нём ответ «нет» от
        // молчания менеджера нечем — ровно та причина, по которой контрол
        // сделан трёхсостоянийным. Значение из CRM видно подписью «сейчас»,
        // но обязательный вопрос закрывает только ответ этой сессии, иначе
        // отчёт уехал бы с ответом, которого менеджер не давал. «Да» ответ
        // закрывает: единица дефолтом не появляется.
        const value = toChecklistBooleanValue(raw);
        return {
            currentValue: value === CHECKLIST_BOOLEAN_NO ? '' : value,
            currentLabel: checklistBooleanTitle(value),
        };
    }
    const value = typeof raw === 'string' ? raw : String(raw ?? '');
    if (hasChecklistChoice(def)) {
        // В поле лежит текст варианта — показываем его вариантом, а не
        // свободной строкой, иначе селект не нашёл бы, что выбрано.
        const option = findChecklistChoiceOption(def.options, value);
        return {
            currentValue: option?.code ?? value,
            currentLabel: option?.title ?? value,
        };
    }
    return { currentValue: value, currentLabel: value };
};

const entityIdOf = (row: Record<string, unknown> | null): number => {
    const id = Number(row?.['ID']);
    return Number.isFinite(id) && id > 0 ? id : 0;
};

/**
 * Порядок добора «сейчас» при нескольких носителях: сделка точнее
 * (доктрина полей-истин — чтение EntityFieldsDialog идёт в том же порядке).
 */
const CARRIER_VALUE_PRIORITY: ChecklistEntityKind[] = [
    'deal',
    'company',
    'lead',
];

/**
 * «Сейчас» при нескольких носителях: главный (прежний приоритет
 * компания → сделка → лид) — как раньше, но ПУСТОЙ главный больше не прячет
 * живое значение соседа: добирается первое непустое в порядке
 * {@link CARRIER_VALUE_PRIORITY}. Справочники не добираются: значение
 * enumeration-поля — bitrixId ВАРИАНТА, свой у каждой сущности, и чужой
 * вариант по опциям главного не прочитается.
 */
const readCurrentAcrossCarriers = (
    def: ChecklistFieldDef,
    rows: ChecklistEntityRows,
    carriers: ChecklistFieldCarrier[],
    options: QuestionnaireOption[],
): { currentValue: string; currentLabel: string } => {
    const primary = carriers[0]!;
    const primaryRead = readCurrent(
        def,
        primary.entityId ? rows[primary.entity]?.[primary.ufKey] : undefined,
        options,
    );
    if (primaryRead.currentValue || def.control === 'enumeration') {
        return primaryRead;
    }
    for (const kind of CARRIER_VALUE_PRIORITY) {
        const carrier = carriers.find(
            item => item.entity === kind && item.entityId > 0,
        );
        if (!carrier || carrier === primary) continue;
        const read = readCurrent(
            def,
            rows[carrier.entity]?.[carrier.ufKey],
            options,
        );
        if (read.currentValue) return read;
    }
    return primaryRead;
};

/**
 * Куда ПИСАТЬ ответ crm-канала: во все носители поля разом — значение-истина
 * живёт на сделке И компании, запись в одного их разъезжала бы (доктрина
 * EntityFieldsDialog: «запись — во всех, у кого поле есть»). Исключение —
 * справочник: пишется bitrixId варианта, свой у каждой сущности, поэтому
 * enumeration уходит только главному носителю.
 */
export const checklistWriteCarriers = (
    resolved: ResolvedChecklistField,
): ChecklistFieldCarrier[] => {
    const writable = resolved.carriers.filter(item => item.entityId > 0);
    if (!writable.length) {
        return resolved.entityId
            ? [
                  {
                      entity: resolved.entity,
                      entityId: resolved.entityId,
                      ufKey: resolved.ufKey,
                  },
              ]
            : [];
    }
    if (resolved.def.control === 'enumeration') return [writable[0]!];
    return writable;
};

/**
 * Почему вопрос не показался менеджеру.
 *
 * Отказ резолва до сих пор был МОЛЧАЛИВЫМ: владелец включал вопрос на
 * портале, вопрос не появлялся, и узнать причину было неоткуда — час поисков
 * на пустом месте. Причина известна ровно здесь, в ветке, где резолв сдался,
 * поэтому здесь она и называется.
 *
 * Считать её отсюда нельзя: резолв — ЧИСТАЯ функция, её зовут селекторы на
 * каждый рендер, и сетевой клиент внутри неё означал бы поток запросов с
 * каждой перерисовки. Поэтому резолв причину только ВОЗВРАЩАЕТ, а считает
 * вызывающий — один раз на появление анкеты (см. checklist-hidden.ts).
 */
export type HiddenChecklistReason =
    /** Носителя нет: ни у одной сущности нет строки или ID. */
    | 'no-carrier'
    /** Встроенный вопрос: поля нет в слепке портала. */
    | 'field-not-in-portal'
    /** Справочник без вариантов — отвечать нечем. */
    | 'enum-without-options'
    /** crm-вопрос вообще без адреса поля: писать некуда. */
    | 'no-field-in-crm';

/** Итог резолва: поле либо причина, по которой его не будет. */
export interface ChecklistFieldResolution {
    /** null — вопрос не показывается. */
    field: ResolvedChecklistField | null;
    /** null — показывается; иначе причина отказа. */
    hiddenReason: HiddenChecklistReason | null;
}

const shown = (field: ResolvedChecklistField): ChecklistFieldResolution => ({
    field,
    hiddenReason: null,
});

const hidden = (reason: HiddenChecklistReason): ChecklistFieldResolution => ({
    field: null,
    hiddenReason: reason,
});

/**
 * Резолв вопроса ВМЕСТЕ С ПРИЧИНОЙ отказа.
 *
 * Тело здесь одно на обе формы: {@link resolveChecklistField} — та же
 * функция без причины, ради неизменной сигнатуры у всех прежних
 * потребителей. Отдельной «объясняющей» функции нет намеренно: она
 * повторяла бы условия резолва и разошлась бы с ними на первой же правке —
 * ровно тем способом, каким молчаливые отказы и заводятся.
 */
export const resolveChecklistFieldDetailed = (
    ref: ChecklistFieldRef,
    portal: Portal | null | undefined,
    rows: ChecklistEntityRows,
): ChecklistFieldResolution => {
    const def = ref.def;
    // Ответ dto-канала уезжает в payload отправки, а не в CRM: носитель ему
    // не нужен вовсе, и его отсутствие (сделку создаст сам flow) вопрос не
    // прячет — иначе обязательность молча испарялась бы, хотя сервер-гард
    // всё равно вернул бы 400. Строка носителя, если она есть, нужна только
    // для подписи «сейчас».
    const isCrmChannel = def.channel === 'crm';

    // Справочник без вариантов записывать нечем: пустой селект блокировал бы
    // отправку обязательностью, которую менеджеру нечем закрыть.
    const enumGuard = (
        options: QuestionnaireOption[],
    ): QuestionnaireOption[] | null =>
        def.control === 'enumeration' && options.length === 0 ? null : options;

    // Канал `smart`: ответ уедет в ЭЛЕМЕНТ смарта, который создаст или
    // закроет поток этого отчёта. Элемента сейчас нет вовсе, поэтому:
    // носителя нет (entityId 0), «сейчас» показывать неоткуда (значения нет
    // ни у кого), а `ufKey` пуст — имя из каталога адресует поле В ЭЛЕМЕНТЕ,
    // и подставить его в строку компании или сделки нельзя: одноимённое поле
    // прочиталось бы как текущее значение, а запись ушла бы в чужую сущность.
    //
    // Ветка стоит ДО всех остальных именно поэтому: у смарт-вопроса есть
    // готовое `field.name`, и без неё он ушёл бы искать носителя по имени.
    if (def.channel === 'smart') {
        const options = enumGuard(def.options);
        if (!options) return hidden('enum-without-options');
        return shown({
            ...ref,
            // Носителя нет; `entity` здесь формальность типа — ровно как у
            // ответа dto-канала ниже.
            entity: 'deal',
            entityId: 0,
            ufKey: '',
            options,
            carriers: [],
            currentValue: '',
            currentLabel: '',
        });
    }

    // Штатное поле Битрикса (OPPORTUNITY, SOURCE_ID): живёт только на
    // сделке, слепок портала не нужен — имя поля и есть ключ строки.
    //
    // Варианты берутся из каталога наравне с UF-полем и проходят тот же
    // enumGuard: у штатного поля справочник тоже бывает, а пустой список
    // здесь рисовал бы справочный вопрос свободной строкой, отменял запись
    // без ошибки на экране (в резолве нет варианта — писать нечего) и
    // запирал отправку обязательностью, которую нечем закрыть.
    if (def.isNative) {
        const row = rows.deal;
        const entityId = entityIdOf(row);
        if (!entityId && isCrmChannel) return hidden('no-carrier');
        const ufKey = def.field?.name ?? def.code;
        const options = enumGuard(def.options);
        if (!options) return hidden('enum-without-options');
        return shown({
            ...ref,
            entity: 'deal',
            entityId,
            ufKey,
            options,
            carriers: entityId ? [{ entity: 'deal', entityId, ufKey }] : [],
            ...readCurrent(def, entityId ? row?.[ufKey] : undefined, options),
        });
    }

    // Портальная анкета: имя поля пришло готовым — адресуем напрямую.
    if (def.field?.name) {
        const ufKey = def.field.name;
        const options = enumGuard(def.options);
        if (!options) return hidden('enum-without-options');
        const carriers: ChecklistFieldCarrier[] = [];
        for (const kind of targetKinds(def)) {
            const row = rows[kind];
            // Носитель назван анкетой — верим ей; при `auto` носителя
            // выдаёт сама строка: crm.*.get отдаёт все поля СВОЕЙ сущности,
            // поэтому наличие ключа и есть признак владельца (слепок для
            // этого больше не нужен). Собираются ВСЕ носители: писать
            // предстоит в каждого (см. checklistWriteCarriers).
            const isCarrier =
                row !== null &&
                (def.target.mode === 'entity' ||
                    Object.prototype.hasOwnProperty.call(row, ufKey));
            if (!isCarrier) continue;
            const entityId = entityIdOf(row);
            if (!entityId && isCrmChannel) continue;
            carriers.push({ entity: kind, entityId, ufKey });
        }
        const primary = carriers[0];
        if (primary) {
            return shown({
                ...ref,
                entity: primary.entity,
                entityId: primary.entityId,
                ufKey,
                options,
                carriers,
                ...readCurrentAcrossCarriers(def, rows, carriers, options),
            });
        }
        // Носителя не нашли: crm-вопрос прячем (писать некуда), ответ
        // dto/text-канала живёт и без него.
        return isCrmChannel
            ? hidden('no-carrier')
            : shown({
                  ...ref,
                  entity: 'deal',
                  entityId: 0,
                  ufKey,
                  options,
                  carriers: [],
                  currentValue: '',
                  currentLabel: '',
              });
    }

    // Встроенный вопрос: имени нет, ключ ищется по коду pbx-реестра в
    // слепке портала (обратная совместимость с FALLBACK_CATALOG).
    //
    // Причину отказа собираем по ходу перебора носителей: в конце цикла
    // видно только «не вышло», а различить «поля нет в слепке» и «справочник
    // в слепке пуст» можно лишь там, где эти условия проверяются. Сами
    // условия не меняются — это два флага рядом с `continue`.
    let legacyFieldMissing = false;
    let legacyEnumBlocked = false;
    if (def.legacyFieldCode) {
        const code = def.legacyFieldCode;
        const carriers: ChecklistFieldCarrier[] = [];
        let primaryOptions: QuestionnaireOption[] | null = null;
        for (const kind of targetKinds(def)) {
            const row = rows[kind];
            if (!row && isCrmChannel) continue;
            const fields = fieldsFor(portal, kind);
            const field = findPortalField(fields, code);
            const ufKey = findUfKey(fields, code);
            const entityId = entityIdOf(row);
            if (!field || !ufKey) {
                legacyFieldMissing = true;
                continue;
            }
            if (!entityId && isCrmChannel) continue;
            const options = enumGuard(
                def.options.length
                    ? def.options
                    : optionsFromPortalField(field),
            );
            // Справочник без вариантов — пробуем следующего носителя.
            if (!options) {
                legacyEnumBlocked = true;
                continue;
            }
            carriers.push({ entity: kind, entityId, ufKey });
            // Контрол и подпись «сейчас» живут по главному носителю
            // (прежний приоритет); остальные — адресаты записи.
            if (!primaryOptions) primaryOptions = options;
        }
        const primary = carriers[0];
        if (primary && primaryOptions) {
            return shown({
                ...ref,
                entity: primary.entity,
                entityId: primary.entityId,
                ufKey: primary.ufKey,
                options: primaryOptions,
                carriers,
                ...readCurrentAcrossCarriers(
                    def,
                    rows,
                    carriers,
                    primaryOptions,
                ),
            });
        }
        // Поля нет в слепке: crm-вопрос прячем, ответ dto/text-канала
        // («Дата первой оплаты») уходит ниже — он живёт и без носителя.
    }

    // Вопрос без поля вовсе (dto/text-канал): ответ хранится в стейте и
    // уезжает payload'ом отправки — писать в CRM нечего и незачем.
    if (isCrmChannel) {
        // Порядок причин — от самой конкретной: пустой справочник объясняет
        // отказ точнее, чем «поля нет», а встроенный вопрос без поля в
        // слепке — точнее, чем общее «адреса нет вовсе».
        if (legacyEnumBlocked) return hidden('enum-without-options');
        if (def.legacyFieldCode) {
            return hidden(
                legacyFieldMissing ? 'field-not-in-portal' : 'no-carrier',
            );
        }
        return hidden('no-field-in-crm');
    }
    const options = enumGuard(def.options);
    if (!options) return hidden('enum-without-options');
    return shown({
        ...ref,
        entity: 'deal',
        entityId: 0,
        ufKey: '',
        options,
        carriers: [],
        currentValue: '',
        currentLabel: '',
    });
};

/**
 * Резолв без причины — прежняя сигнатура для всех, кому причина не нужна
 * (селекторы, сборка вьюх, запись значения). Ни одного потребителя эта
 * правка не касается: поведение и тип возврата те же, что были.
 */
export const resolveChecklistField = (
    ref: ChecklistFieldRef,
    portal: Portal | null | undefined,
    rows: ChecklistEntityRows,
): ResolvedChecklistField | null =>
    resolveChecklistFieldDetailed(ref, portal, rows).field;
