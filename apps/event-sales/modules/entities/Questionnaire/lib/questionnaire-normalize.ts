import { isDomainConfigKey } from '@/modules/app/consts/domain-config';
import type {
    QuestionnaireCatalogEntryWire,
    QuestionnaireCatalogItemWire,
    QuestionnaireCatalogOptionWire,
    QuestionnaireCatalogWire,
} from '../model/questionnaire-dto.type';
import {
    QUESTIONNAIRE_CONTRACT,
    QUESTIONNAIRE_DTO_PATHS,
    type QuestionnaireChannel,
    type QuestionnaireCondition,
    type QuestionnaireConditionKind,
    type QuestionnaireControl,
    type QuestionnaireDef,
    type QuestionnaireDtoPath,
    type QuestionnaireItem,
    type QuestionnaireOption,
    type QuestionnairePersist,
    type QuestionnairePlace,
    type QuestionnairePresentation,
    type QuestionnairePurpose,
    type QuestionnaireSmart,
    type QuestionnaireTarget,
    type QuestionnaireTargetEntity,
    type QuestionnaireTargetMode,
} from '../model/questionnaire.type';

/**
 * Разбор ответа `GET /api/questionnaires` в доменный каталог.
 *
 * Единственное правило: НЕРАСПОЗНАННОЕ НЕ ПОКАЗЫВАЕМ. Реестр бэка
 * расширяется раньше движка фрейма (правило «сначала фронт научился»), и
 * вопрос с контролом, которого движок не умеет рисовать, — это пустое место
 * на экране, а если он ещё и обязательный — заблокированная отправка,
 * которую менеджеру нечем разблокировать.
 *
 * Отсев здесь ДУБЛИРУЕТ часть проверок бэка сознательно: каталог приходит по
 * сети от чужой версии сервиса, и compile-time union на границе её не
 * остановит. Поэтому разбирается `*Wire`, а не сгенерированный DTO: спека
 * обещает узкие перечисления, но состав анкет лежит в БД портала, и ветки
 * отсева обязаны оставаться живыми (см. model/questionnaire-dto.type).
 *
 * Что бэк уже отсеял сам (и здесь проверяется только на всякий случай):
 * выключенные анкеты/вопросы/варианты, сломанные привязки к полям
 * (`fieldStatus !== 'ok'`), множественные поля, несовместимость контрола с
 * типом поля.
 */

const CONTROLS: ReadonlySet<string> = new Set<QuestionnaireControl>([
    'string',
    'text',
    'date',
    'datetime',
    'money',
    'enumeration',
    'boolean',
]);

const CHANNELS: ReadonlySet<string> = new Set<QuestionnaireChannel>([
    'crm',
    'dto',
    'smart',
    'text',
]);

const CONDITION_KINDS: ReadonlySet<string> =
    new Set<QuestionnaireConditionKind>([
        'planType',
        'reportType',
        'targetStage',
        'workStatus',
        'presentationDone',
        'always',
    ]);

/**
 * Виды условий, которые значений НЕ принимают: их смысл целиком в самом
 * факте. `presentationDone` («презентация проведена, в том числе
 * спонтанная») стоит рядом с `always` именно поэтому — спрашивать «какая
 * презентация» не о чем.
 */
const VALUELESS_CONDITION_KINDS: ReadonlySet<string> =
    new Set<QuestionnaireConditionKind>(['always', 'presentationDone']);

const PURPOSES: ReadonlySet<string> = new Set<QuestionnairePurpose>([
    'plan',
    'report',
]);

const PRESENTATIONS: ReadonlySet<string> = new Set<QuestionnairePresentation>([
    'inline',
    'modal',
]);

const PERSISTS: ReadonlySet<string> = new Set<QuestionnairePersist>([
    'onChange',
    'onConfirm',
]);

const PLACES: ReadonlySet<string> = new Set<QuestionnairePlace>([
    'plan',
    'report',
]);

const TARGET_MODES: ReadonlySet<string> = new Set<QuestionnaireTargetMode>([
    'auto',
    'entity',
]);

/**
 * Носители, которые движок умеет исполнить: три строки CRM, куда он пишет
 * сам, плюс `smart` — элемент, который заполнит поток на бэке. `contact`
 * реестром бэка разрешён, но записи в контакт во фрейме нет — такой вопрос
 * выбрасываем.
 */
const TARGET_ENTITIES: ReadonlySet<string> = new Set<QuestionnaireTargetEntity>(
    ['company', 'deal', 'lead', 'smart'],
);

const DTO_PATHS: ReadonlySet<string> = new Set<string>(QUESTIONNAIRE_DTO_PATHS);

/** Типы, у которых значение само себе отметка времени (срок годности). */
const DATE_CONTROLS: ReadonlySet<string> = new Set<QuestionnaireControl>([
    'date',
    'datetime',
]);

export interface QuestionnaireNormalizeResult {
    defs: QuestionnaireDef[];
    /**
     * Что выброшено и почему. Уходит в консоль фрейма предупреждением:
     * «анкета не показалась» без объяснения неотличимо от «анкету не
     * завели», и разбирать такое на проде нечем.
     */
    warnings: string[];
}

const isFilledString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

/** Значение из реестра или null — единственный способ сузить строку с сети. */
const pick = <T extends string>(
    value: unknown,
    allowed: ReadonlySet<string>,
): T | null =>
    typeof value === 'string' && allowed.has(value) ? (value as T) : null;

/** Множественное значение фрейм не пишет (`toPortalValue(['a']) === null`). */
const isMultiple = (item: QuestionnaireCatalogItemWire): boolean =>
    (item as { isMultiple?: unknown }).isMultiple === true;

/**
 * Смарт-носитель из ответа. Читается КАСТОМ — тем же приёмом, что и
 * `isMultiple`: поле бэк уже отдаёт, но в сгенерированном пакете его пока
 * нет (orval прогоняет владелец), и описывать сетевую форму раньше
 * генерации в общем типе значило бы завести вторую правду о контракте.
 *
 * Форма проверяется целиком: половина адреса (`kind` без `entityTypeId`
 * или наоборот) — это не носитель, а мусор, и вопрос с таким адресом
 * показывать нельзя.
 */
const readSmart = (
    item: QuestionnaireCatalogItemWire,
): QuestionnaireSmart | null => {
    const raw: unknown = (item as { smart?: unknown }).smart;
    if (!raw || typeof raw !== 'object') return null;
    const { kind, entityTypeId } = raw as {
        kind?: unknown;
        entityTypeId?: unknown;
    };
    if (!isFilledString(kind)) return null;
    if (typeof entityTypeId !== 'number' || entityTypeId <= 0) return null;
    return { kind, entityTypeId };
};

const normalizeOptions = (
    raw: QuestionnaireCatalogOptionWire[] | undefined,
    control: QuestionnaireControl,
    channel: QuestionnaireChannel,
): QuestionnaireOption[] => {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter(option => option && isFilledString(option.code))
        .filter(
            // В справочник CRM записывается bitrixId — вариант без него
            // записать нечем. У остальных контролов список объявляет сам
            // вопрос (строка со своим набором формулировок), справочника в
            // Битриксе за ним нет вовсе, и bitrixId ему не нужен.
            option =>
                control !== 'enumeration' ||
                channel !== 'crm' ||
                typeof option.bitrixId === 'number',
        )
        .map(option => ({
            code: option.code,
            title: isFilledString(option.title) ? option.title : option.code,
            bitrixId:
                typeof option.bitrixId === 'number' ? option.bitrixId : null,
        }));
};

/** Вопрос или null, если движок его исполнить не может. */
const normalizeItem = (
    raw: QuestionnaireCatalogItemWire,
    entryCode: string,
    warnings: string[],
): QuestionnaireItem | null => {
    const drop = (reason: string): null => {
        warnings.push(
            `вопрос «${raw?.code ?? '—'}» анкеты «${entryCode}» пропущен: ${reason}`,
        );
        return null;
    };

    if (!raw || !isFilledString(raw.code)) return drop('пустой код');
    if (isMultiple(raw)) return drop('множественное значение не пишется');

    const control = pick<QuestionnaireControl>(raw.control, CONTROLS);
    if (!control) return drop(`неизвестный контрол «${raw.control}»`);

    const channel = pick<QuestionnaireChannel>(raw.channel, CHANNELS);
    if (!channel) return drop(`неизвестный канал «${raw.channel}»`);

    const mode = pick<QuestionnaireTargetMode>(raw.target?.mode, TARGET_MODES);
    if (!mode) return drop(`неизвестный носитель «${raw.target?.mode}»`);

    // При `auto` носитель не значим (компания→сделка→лид), при `entity` —
    // обязателен и должен быть из тех, куда движок умеет писать.
    let entity: QuestionnaireTargetEntity | null = null;
    if (mode === 'entity') {
        entity = pick<QuestionnaireTargetEntity>(
            raw.target?.entity,
            TARGET_ENTITIES,
        );
        if (!entity) {
            return drop(`носитель «${raw.target?.entity}» недостижим`);
        }
    }

    // Носитель `smart` описывает не строку CRM, а элемент смарта, и смысл
    // ему даёт только одноимённый канал: он решает, КТО пишет ответ. Без
    // канала это носитель, в который никто не пишет.
    if (entity === 'smart' && channel !== 'smart') {
        return drop('носитель «smart» без канала «smart»');
    }

    // Канал crm без имени поля писать некуда: бэк такое отсеивает, но каталог
    // приходит по сети — проверяем сами.
    const field =
        raw.field && isFilledString(raw.field.name)
            ? {
                  name: raw.field.name,
                  type: isFilledString(raw.field.type) ? raw.field.type : null,
              }
            : null;
    if (channel === 'crm' && !field) return drop('нет привязки к полю CRM');

    // Канал `smart`: адрес ответа — ПАРА «поле элемента + чей это элемент».
    // Нет хоть одной половины — ответ везти некуда, и вопрос не показываем.
    // Так же выглядит и деградация «смарт не установлен на портале»: бэк
    // выбрасывает такие пункты при компиляции каталога, а фрейм повторяет
    // проверку сам — каталог приходит по сети от чужой версии сервиса.
    let smart: QuestionnaireSmart | null = null;
    if (channel === 'smart') {
        if (!field) return drop('нет привязки к полю смарта');
        smart = readSmart(raw);
        if (!smart) return drop('смарта-носителя нет в каталоге');
    }

    // У канала `smart` носитель ОДИН и он не из CRM. Записываем его явно,
    // чтобы резолв не наткнулся на company/deal/lead, оставшийся в строке
    // от прежней привязки: одноимённое поле компании прочиталось бы как
    // «текущее значение», а ответ уехал бы чужой записью.
    const target: QuestionnaireTarget =
        channel === 'smart'
            ? { mode: 'entity', entity: 'smart' }
            : { mode, entity };

    // Путь dto исполняется реестром ФРОНТА: путь без исполнителя — молча
    // потерянный ответ, поэтому вопрос выбрасывается целиком.
    let dtoPath: QuestionnaireDtoPath | null = null;
    if (channel === 'dto') {
        dtoPath = pick<QuestionnaireDtoPath>(raw.dtoPath, DTO_PATHS);
        if (!dtoPath) return drop(`путь «${raw.dtoPath}» фрейм не исполняет`);
    }

    const options = normalizeOptions(raw.options, control, channel);
    if (control === 'enumeration' && options.length === 0) {
        // Пустой селект нечем закрыть: обязательный вопрос запер бы отправку.
        return drop('справочник без вариантов');
    }

    return {
        code: raw.code,
        title: isFilledString(raw.title) ? raw.title : raw.code,
        placeholder: isFilledString(raw.placeholder) ? raw.placeholder : null,
        hint: isFilledString(raw.hint) ? raw.hint : null,
        groupTitle: isFilledString(raw.groupTitle) ? raw.groupTitle : null,
        sort: typeof raw.sort === 'number' ? raw.sort : 0,
        control,
        isRequired: raw.isRequired === true,
        // «Требовать новое значение» имеет смысл только там, где есть старое.
        requireChange: channel === 'crm' && raw.requireChange === true,
        staleAfterDays:
            DATE_CONTROLS.has(control) && typeof raw.staleAfterDays === 'number'
                ? raw.staleAfterDays
                : null,
        channel,
        dtoPath,
        target,
        smart,
        isNative: raw.isNative === true,
        field,
        // Портальный каталог отдаёт готовое UF-имя; резолв по коду
        // pbx-реестра остаётся только у встроенного FALLBACK_CATALOG.
        legacyFieldCode: null,
        options,
    };
};

/**
 * Условия показа или null — тогда анкета не показывается ВОВСЕ.
 *
 * Безопасный отказ: неизвестный вид условия означает, что фрейм не понимает,
 * когда анкету показывать. Показать «на всякий случай» опаснее — вопрос
 * вылезет не в том звонке, а обязательный ещё и заблокирует отправку.
 */
const normalizeConditions = (
    raw: QuestionnaireCatalogEntryWire['conditions'],
    entryCode: string,
    warnings: string[],
): QuestionnaireCondition[] | null => {
    if (!Array.isArray(raw) || raw.length === 0) {
        warnings.push(`анкета «${entryCode}» пропущена: нет условий показа`);
        return null;
    }

    const conditions: QuestionnaireCondition[] = [];
    for (const condition of raw) {
        const kind = pick<QuestionnaireConditionKind>(
            condition?.kind,
            CONDITION_KINDS,
        );
        if (!kind) {
            warnings.push(
                `анкета «${entryCode}» пропущена: неизвестное условие «${condition?.kind}»`,
            );
            return null;
        }
        if (VALUELESS_CONDITION_KINDS.has(kind)) {
            conditions.push({ kind, values: [] });
            continue;
        }
        // Значения НЕ сверяются со словарями фронта: незнакомый код просто
        // никогда не совпадёт, а сузить условие до пустого — значит
        // превратить «показать при доработке» в «показывать всегда».
        const values = Array.isArray(condition.values)
            ? condition.values.filter(isFilledString)
            : [];
        if (values.length === 0) {
            warnings.push(
                `анкета «${entryCode}» пропущена: условие «${kind}» без значений`,
            );
            return null;
        }
        conditions.push({ kind, values });
    }
    return conditions;
};

/** Анкета или null, если её нельзя показать. */
const normalizeEntry = (
    raw: QuestionnaireCatalogEntryWire,
    warnings: string[],
): QuestionnaireDef | null => {
    const code = isFilledString(raw?.code) ? raw.code : null;
    if (!code) {
        warnings.push('анкета без кода пропущена');
        return null;
    }

    const drop = (reason: string): null => {
        warnings.push(`анкета «${code}» пропущена: ${reason}`);
        return null;
    };

    const purpose = pick<QuestionnairePurpose>(raw.purpose, PURPOSES);
    if (!purpose) return drop(`неизвестное назначение «${raw.purpose}»`);

    const presentation = pick<QuestionnairePresentation>(
        raw.presentation,
        PRESENTATIONS,
    );
    if (!presentation) {
        return drop(`неизвестный тип показа «${raw.presentation}»`);
    }

    const persist = pick<QuestionnairePersist>(raw.persist, PERSISTS);
    if (!persist) return drop(`неизвестный режим записи «${raw.persist}»`);

    const conditions = normalizeConditions(raw.conditions, code, warnings);
    if (!conditions) return null;

    // Флаг портала: ключ вписывают руками, реестра допустимых у портала нет.
    // Незнакомую фрейму настройку проверить нечем — анкета работает без
    // флага (по условиям), но молчать об этом нельзя: иначе «анкета показана
    // не так, как задумал админ» ничем не объясняется.
    const configKey = isFilledString(raw.configKey) ? raw.configKey : null;
    if (configKey && !isDomainConfigKey(configKey)) {
        warnings.push(
            `анкета «${code}»: настройки «${configKey}» во фрейме нет — анкета показывается без флага, по условиям`,
        );
    }

    const seen = new Set<string>();
    const items: QuestionnaireItem[] = [];
    for (const rawItem of Array.isArray(raw.items) ? raw.items : []) {
        const item = normalizeItem(rawItem, code, warnings);
        if (!item) continue;
        // Ключ ответа — `qCode:itemCode`: дубль кода означал бы два вопроса
        // с одним значением и одним статусом «сохранено».
        if (seen.has(item.code)) {
            warnings.push(
                `вопрос «${item.code}» анкеты «${code}» пропущен: код повторяется`,
            );
            continue;
        }
        seen.add(item.code);
        items.push(item);
    }
    if (items.length === 0) return drop('не осталось исполнимых вопросов');

    return {
        code,
        title: isFilledString(raw.title) ? raw.title : code,
        hint: isFilledString(raw.hint) ? raw.hint : null,
        purpose,
        presentation,
        // У модалки колонки нет; у инлайна мусор заменяется назначением.
        place:
            presentation === 'modal'
                ? null
                : (pick<QuestionnairePlace>(raw.place, PLACES) ??
                  (purpose === 'report' ? 'report' : 'plan')),
        persist,
        conditions,
        configKey,
        legacyChecklistId: isFilledString(raw.legacyChecklistId)
            ? raw.legacyChecklistId
            : null,
        sort: typeof raw.sort === 'number' ? raw.sort : 0,
        items: items.sort(
            (a, b) => a.sort - b.sort || a.code.localeCompare(b.code),
        ),
    };
};

/**
 * Каталог с бэка → доменный каталог фрейма.
 *
 * Пустой результат — законный ответ (портал анкет не завёл) и он же
 * результат полного отсева; различать их незачем: и там, и там работает
 * встроенный набор. Различие видно по `warnings`.
 */
export const normalizeQuestionnaireCatalog = (
    dto: QuestionnaireCatalogWire,
): QuestionnaireNormalizeResult => {
    const warnings: string[] = [];

    if (!dto || !Array.isArray(dto.questionnaires)) {
        warnings.push('ответ каталога не разобран');
        return { defs: [], warnings };
    }

    // Чужая форма ответа: разбирать её наполовину опаснее, чем отказаться.
    if (dto.contract !== QUESTIONNAIRE_CONTRACT) {
        warnings.push(
            `контракт каталога ${dto.contract} ≠ ${QUESTIONNAIRE_CONTRACT} — каталог не применяется целиком`,
        );
        return { defs: [], warnings };
    }

    const seen = new Set<string>();
    const defs: QuestionnaireDef[] = [];
    for (const rawEntry of dto.questionnaires) {
        const def = normalizeEntry(rawEntry, warnings);
        if (!def) continue;
        if (seen.has(def.code)) {
            warnings.push(`анкета «${def.code}» пропущена: код повторяется`);
            continue;
        }
        seen.add(def.code);
        defs.push(def);
    }

    return {
        defs: defs.sort(
            (a, b) => a.sort - b.sort || a.code.localeCompare(b.code),
        ),
        warnings,
    };
};
