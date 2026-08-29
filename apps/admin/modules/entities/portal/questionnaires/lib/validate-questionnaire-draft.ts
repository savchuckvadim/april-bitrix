import type {
    PortalQuestionnaireItemSave,
    PortalQuestionnaireSchema,
    QuestionnaireOptionDescriptor,
    QuestionnairePortalSmart,
} from '../model';
import {
    QUESTIONNAIRE_AUTO_FIELD_SOURCES,
    QUESTIONNAIRE_CODE,
    QUESTIONNAIRE_FIELD_BOUND_CHANNELS,
} from '../model';
import type { QuestionnaireDraft } from './questionnaire-draft';
import { describeSmartTarget } from './smart-target-view';

/** Где нашлась проблема — по этому полю UI подсвечивает нужный блок. */
export type QuestionnaireIssueScope = 'header' | 'conditions' | 'item';

/** Одно нарушение правила: тем же текстом ответил бы бэк на сохранении. */
export interface QuestionnaireDraftIssue {
    scope: QuestionnaireIssueScope;
    /** Код вопроса, если проблема в составе анкеты. */
    itemCode?: string;
    message: string;
}

const codesOf = (options: QuestionnaireOptionDescriptor[]): string[] =>
    options.map(option => option.code);

const text = (value: string | null | undefined): string => (value ?? '').trim();

/** Первая буква строчной: замечание идёт после «Вопрос «код»: ». */
const lowerFirst = (value: string): string =>
    value.charAt(0).toLowerCase() + value.slice(1);

/**
 * Виды условий, которые значений НЕ принимают.
 *
 * Зеркало `QUESTIONNAIRE_VALUELESS_CONDITION_KINDS` бэка. Реестр сам про
 * это не говорит (пустой `values` у вида условия читается и как «значений
 * нет», и как «справочник не приехал»), а разница дорогая: условие
 * «Презентация проведена» с пустым списком бэк принимает, и запрет на него
 * запер бы сохранение анкеты, которую он готов сохранить.
 */
const VALUELESS_CONDITION_KINDS: readonly string[] = [
    QUESTIONNAIRE_CODE.conditionKind.always,
    QUESTIONNAIRE_CODE.conditionKind.presentationDone,
];

/** Что ещё нужно проверке, кроме реестра. */
export interface ValidateQuestionnaireDraftOptions {
    /**
     * Смарты портала. Без них достижимость элемента смарта здесь не
     * проверяется — это единственное правило бэка, которое фронт не может
     * повторить по одному реестру, и молчать о нём честнее, чем гадать.
     */
    smarts?: QuestionnairePortalSmart[];
}

/**
 * Проверка черновика ПЕРЕД сохранением.
 *
 * Зеркало валидации `PortalQuestionnairesService`: те же правила и те же
 * формулировки — владелец должен видеть причину до нажатия «Сохранить», а
 * не ловить 400. Правда по-прежнему на бэке: список допустимых значений
 * берётся из `GET /schema`, а не из констант фронта, поэтому расширение
 * реестра релизом бэка ничего здесь не ломает.
 *
 * Отличие от бэка одно: тот падает на первом нарушении, а редактору нужен
 * весь список сразу — иначе исправление превратится в переписку с сервером.
 */
export const validateQuestionnaireDraft = (
    draft: QuestionnaireDraft,
    schema: PortalQuestionnaireSchema | undefined,
    options: ValidateQuestionnaireDraftOptions = {},
): QuestionnaireDraftIssue[] => {
    const issues: QuestionnaireDraftIssue[] = [];
    const add = (
        scope: QuestionnaireIssueScope,
        message: string,
        itemCode?: string,
    ) => issues.push({ scope, message, itemCode });

    if (!schema) {
        add(
            'header',
            'Реестр значений ещё не загружен — проверить анкету нечем',
        );
        return issues;
    }

    const requireOneOf = (
        scope: QuestionnaireIssueScope,
        value: string | null | undefined,
        allowed: string[],
        label: string,
        itemCode?: string,
    ): boolean => {
        if (value && allowed.includes(value)) return true;
        add(
            scope,
            `${label}: значение «${value ?? ''}» не из реестра. ` +
                `Допустимо: ${allowed.join(', ')}`,
            itemCode,
        );
        return false;
    };

    const requireText = (
        scope: QuestionnaireIssueScope,
        value: string | null | undefined,
        label: string,
        itemCode?: string,
    ): boolean => {
        if (text(value)) return true;
        add(scope, `${label}: значение обязательно`, itemCode);
        return false;
    };

    // ---------------- шапка анкеты ----------------
    requireText('header', draft.code, 'Код анкеты');
    requireText('header', draft.title, 'Название анкеты');
    requireText('header', draft.appCode, 'Код приложения');
    requireOneOf(
        'header',
        draft.purpose,
        codesOf(schema.purposes),
        'Назначение анкеты',
    );

    const presentation =
        draft.presentation ?? QUESTIONNAIRE_CODE.presentation.inline;
    requireOneOf(
        'header',
        presentation,
        codesOf(schema.presentations),
        'Способ показа анкеты',
    );
    requireOneOf(
        'header',
        draft.persist ?? schema.persists[0]?.code,
        codesOf(schema.persists),
        'Момент записи ответа',
    );

    // Колонка есть только у карточки: у модалки она ничего не значит.
    if (presentation === QUESTIONNAIRE_CODE.presentation.inline) {
        if (draft.place) {
            requireOneOf(
                'header',
                draft.place,
                codesOf(schema.places),
                'Колонка анкеты',
            );
        }
    } else if (draft.place) {
        add(
            'header',
            'Колонка задаётся только для анкеты-карточки ' +
                '(presentation: inline)',
        );
    }

    // ---------------- условия показа ----------------
    validateConditions(draft, schema, add);

    // ---------------- состав ----------------
    const seenCodes = new Set<string>();
    draft.items.forEach((item, index) => {
        validateItem(item, index, {
            schema,
            conditions: draft.conditions,
            smarts: options.smarts,
            add,
            requireOneOf,
            requireText,
        });

        const code = text(item.code);
        if (!code) return;
        if (seenCodes.has(code)) {
            add(
                'item',
                `Код вопроса «${code}» повторяется: код — ключ ответа во ` +
                    'фрейме, дубль обнулит один из вопросов',
                code,
            );
        }
        seenCodes.add(code);
    });

    return issues;
};

type AddIssue = (
    scope: QuestionnaireIssueScope,
    message: string,
    itemCode?: string,
) => void;

type RequireOneOf = (
    scope: QuestionnaireIssueScope,
    value: string | null | undefined,
    allowed: string[],
    label: string,
    itemCode?: string,
) => boolean;

type RequireText = (
    scope: QuestionnaireIssueScope,
    value: string | null | undefined,
    label: string,
    itemCode?: string,
) => boolean;

/** Всё, чем проверяется один вопрос. */
interface ItemRules {
    schema: PortalQuestionnaireSchema;
    /** Условия показа анкеты: по ним считается достижимость смарта. */
    conditions: QuestionnaireDraft['conditions'];
    smarts?: QuestionnairePortalSmart[];
    add: AddIssue;
    requireOneOf: RequireOneOf;
    requireText: RequireText;
}

/** Условия показа: И-семантика, поэтому вид условия не повторяется. */
const validateConditions = (
    draft: QuestionnaireDraft,
    schema: PortalQuestionnaireSchema,
    add: AddIssue,
): void => {
    if (!Array.isArray(draft.conditions) || draft.conditions.length === 0) {
        add(
            'conditions',
            'Нужно хотя бы одно условие показа. Анкета без условий никогда ' +
                'не появится — для «показывать всегда» есть условие «Всегда».',
        );
        return;
    }

    const seen = new Set<string>();
    for (const condition of draft.conditions) {
        const descriptor = schema.conditions.find(
            kind => kind.kind === condition.kind,
        );
        if (!descriptor) {
            add(
                'conditions',
                `Вид условия показа: значение «${condition.kind ?? ''}» не ` +
                    'из реестра. Допустимо: ' +
                    schema.conditions.map(kind => kind.kind).join(', '),
            );
            continue;
        }

        if (seen.has(descriptor.kind)) {
            add(
                'conditions',
                `Условие «${descriptor.kind}» указано дважды: условия ` +
                    'объединяются по И, второе такое же выполнить нельзя',
            );
            continue;
        }
        seen.add(descriptor.kind);

        const values = condition.values ?? [];
        // Значений не принимают «Всегда» и «Презентация проведена»: у
        // второго тип задачи обычный звонок, а презентация случилась —
        // выбирать там нечего.
        if (VALUELESS_CONDITION_KINDS.includes(descriptor.kind)) {
            if (values.length > 0) {
                add(
                    'conditions',
                    `Условие «${descriptor.name}» значений не принимает`,
                );
            }
            continue;
        }

        if (values.length === 0) {
            add(
                'conditions',
                `Условие «${descriptor.kind}»: не выбрано ни одного значения`,
            );
            continue;
        }

        const allowed = codesOf(descriptor.values);
        for (const value of values) {
            if (allowed.includes(value)) continue;
            add(
                'conditions',
                `Условие «${descriptor.kind}»: значение «${value}» не из ` +
                    `реестра. Допустимо: ${allowed.join(', ')}`,
            );
        }
    }

    if (seen.size > 1 && seen.has(QUESTIONNAIRE_CODE.conditionKind.always)) {
        add(
            'conditions',
            'Условие «Всегда» не совмещается с другими условиями',
        );
    }
};

/** Один вопрос: правила бэка в том же порядке и с теми же текстами. */
const validateItem = (
    item: PortalQuestionnaireItemSave,
    index: number,
    rules: ItemRules,
): void => {
    const { schema, add, requireOneOf, requireText } = rules;
    const code = text(item.code);
    const where = code ? `Вопрос «${code}»` : `Вопрос #${index + 1}`;

    requireText('item', item.code, `Код вопроса #${index + 1}`, code);
    requireText('item', item.title, `${where}: название`, code);

    const control = item.control;
    requireOneOf(
        'item',
        control,
        codesOf(schema.controls),
        `${where}: тип отображения`,
        code,
    );

    const channel = item.channel ?? QUESTIONNAIRE_CODE.channel.crm;
    requireOneOf(
        'item',
        channel,
        codesOf(schema.channels),
        `${where}: канал записи`,
        code,
    );

    const targetMode = item.targetMode ?? QUESTIONNAIRE_CODE.targetMode.auto;
    requireOneOf(
        'item',
        targetMode,
        codesOf(schema.targetModes),
        `${where}: выбор носителя`,
        code,
    );
    requireOneOf(
        'item',
        item.fieldStatus ?? QUESTIONNAIRE_CODE.fieldStatus.ok,
        codesOf(schema.fieldStatuses),
        `${where}: состояние привязки`,
        code,
    );

    // Массивы фрейм не пишет: разрешить множественное поле значит собирать
    // ответы, которые исчезают бесследно.
    if (item.isMultiple === true) {
        add(
            'item',
            `${where}: множественные поля в этой версии не поддержаны — ` +
                'ответ не был бы записан',
            code,
        );
    }

    let targetEntity: string | null = null;
    if (targetMode === QUESTIONNAIRE_CODE.targetMode.entity) {
        targetEntity = item.targetEntity ?? null;
        requireOneOf(
            'item',
            targetEntity,
            codesOf(schema.targetEntities),
            `${where}: сущность-носитель`,
            code,
        );
        // Элемент смарта наполняет поток, а не фрейм: без своего канала
        // такой носитель был бы обещанием записи, которой не случится.
        if (
            targetEntity === QUESTIONNAIRE_CODE.targetEntity.smart &&
            channel !== QUESTIONNAIRE_CODE.channel.smart
        ) {
            add(
                'item',
                `${where}: носитель «элемент смарта» работает только с ` +
                    'каналом «Поле элемента смарта»',
                code,
            );
        }
    } else if (item.targetEntity) {
        add(
            'item',
            `${where}: сущность-носитель задаётся только при жёстком выборе ` +
                'носителя (targetMode: entity)',
            code,
        );
    }

    if (item.requireChange && channel !== QUESTIONNAIRE_CODE.channel.crm) {
        add(
            'item',
            `${where}: «требовать новое значение» работает только для ` +
                'канала «Поле CRM»',
            code,
        );
    }

    const staleAfterDays = item.staleAfterDays ?? null;
    if (staleAfterDays !== null) {
        const isDateControl =
            control === QUESTIONNAIRE_CODE.control.date ||
            control === QUESTIONNAIRE_CODE.control.datetime;
        if (!isDateControl) {
            add(
                'item',
                `${where}: срок годности ответа считается только по дате — ` +
                    'он доступен типам «Дата» и «Дата и время»',
                code,
            );
        } else if (!Number.isInteger(staleAfterDays) || staleAfterDays <= 0) {
            add(
                'item',
                `${where}: срок годности — целое число дней больше нуля`,
                code,
            );
        }
    }

    const fieldName = text(item.fieldName);
    const fieldType = text(item.fieldType);
    const dtoPath = text(item.dtoPath);

    if (channel === QUESTIONNAIRE_CODE.channel.crm) {
        if (!fieldName) {
            add('item', `${where}: для записи в CRM нужно выбрать поле`, code);
        }
        if (dtoPath) {
            add(
                'item',
                `${where}: путь в отчёте задаётся только для канала «Поле ` +
                    'отчёта»',
                code,
            );
        }
        validateFieldReachability(item, where, targetMode, targetEntity, add);

        const allowedControls =
            schema.fieldTypeControls.find(row => row.fieldType === fieldType)
                ?.controls ?? [];
        if (fieldType && !allowedControls.includes(control)) {
            add(
                'item',
                `${where}: тип отображения «${control}» несовместим с полем ` +
                    `типа «${fieldType}» — ответ не записался бы`,
                code,
            );
        }
        if (!fieldType && item.isNative !== true) {
            add(
                'item',
                `${where}: не указан тип поля — без него проверить ` +
                    'исполнимость типа отображения нечем',
                code,
            );
        }
    }

    if (channel === QUESTIONNAIRE_CODE.channel.smart) {
        validateSmartChannel(item, where, code, rules);
    }

    if (channel === QUESTIONNAIRE_CODE.channel.dto) {
        const descriptor = schema.dtoPaths.find(path => path.path === dtoPath);
        if (!descriptor) {
            add(
                'item',
                `${where}: путь в отчёте «${dtoPath}» не из реестра — бэк ` +
                    'отчёта такого поля не примет',
                code,
            );
        } else if (descriptor.control !== control) {
            add(
                'item',
                `${where}: поле отчёта «${descriptor.path}» заполняется ` +
                    `типом «${descriptor.control}»`,
                code,
            );
        }
    }

    if (channel === QUESTIONNAIRE_CODE.channel.text && (fieldName || dtoPath)) {
        add(
            'item',
            `${where}: ответ в комментарий события никуда больше не ` +
                'пишется — поле и путь в отчёте нужно очистить',
            code,
        );
    }

    validateOptions(item, where, code, control, channel, add);
};

/**
 * Ответ в элемент смарта: правила бэка (`buildItem` + `requireEventSmart`)
 * в том же порядке и с теми же текстами.
 *
 * Ответ такого вопроса пишет не фрейм, а бэк отчёта — в элемент, который
 * заводит поток события. Поэтому здесь всё про адрес: поле выбрано именно
 * у смарта, смарт назван строкой `smarts`, у смарта есть поток, а анкета
 * привязана к типу события этого потока.
 */
const validateSmartChannel = (
    item: PortalQuestionnaireItemSave,
    where: string,
    code: string,
    rules: ItemRules,
): void => {
    const { schema, conditions, smarts, add } = rules;
    const fieldName = text(item.fieldName);
    const fieldType = text(item.fieldType);

    if (!fieldName) {
        add(
            'item',
            `${where}: для записи в элемент смарта нужно выбрать поле`,
            code,
        );
    }
    if (text(item.dtoPath)) {
        add(
            'item',
            `${where}: путь в отчёте задаётся только для канала «Поле ` +
                'отчёта»',
            code,
        );
    }
    // Штатное поле — это OPPORTUNITY сделки: у элемента смарта штатных
    // полей нет, и матрица типов к ним неприменима.
    if (item.isNative === true) {
        add(
            'item',
            `${where}: штатных полей у элемента смарта нет — выберите ` +
                'пользовательское поле смарта',
            code,
        );
    }

    const source = item.fieldSource;
    if (!source) {
        add(
            'item',
            `${where}: не указан носитель, из которого выбрано поле — без ` +
                'него нечем проверить, что ответ доедет до элемента',
            code,
        );
    } else if (source !== QUESTIONNAIRE_CODE.fieldSource.smart) {
        add(
            'item',
            `${where}: канал «Поле элемента смарта» принимает только поле ` +
                `смарта, а поле выбрано у носителя «${source}»`,
            code,
        );
    }

    // Достижимость элемента считается по смартам портала: их список едет
    // отдельным запросом, и без него это правило остаётся за бэком. Адрес
    // смарта при этом обязателен всегда — его отсутствие видно и без
    // списка.
    const smartId = item.smartId ?? null;
    if (smartId === null || !Number.isInteger(smartId) || smartId <= 0) {
        add(
            'item',
            `${where}: не указан смарт, из которого выбрано поле (smartId ` +
                'из GET /questionnaire-fields/sources) — без него ' +
                'неизвестно, в элемент какого смарта писать ответ',
            code,
        );
    } else if (smarts) {
        const target = describeSmartTarget(smartId, smarts, conditions, schema);
        if (target.blockReason) {
            // Разбор — самостоятельная фраза (её читают плашкой в пикере),
            // а здесь она идёт после «Вопрос «код»: », как у бэка.
            add('item', `${where}: ${lowerFirst(target.blockReason)}`, code);
        }
    }

    if (!fieldType) {
        add(
            'item',
            `${where}: не указан тип поля — без него проверить исполнимость ` +
                'типа отображения нечем',
            code,
        );
        return;
    }

    const allowedControls =
        schema.fieldTypeControls.find(row => row.fieldType === fieldType)
            ?.controls ?? [];
    if (!allowedControls.includes(item.control)) {
        add(
            'item',
            `${where}: тип отображения «${item.control}» несовместим с ` +
                `полем типа «${fieldType}» — ответ не записался бы`,
            code,
        );
    }
};

/**
 * Достижимость поля: фрейм пишет ответ в ту сущность, которую назвал
 * носитель. Пикер отдаёт поля пяти носителей, а исполнимы только цепочка
 * «компания → сделка → лид» и жёстко указанная сущность.
 */
const validateFieldReachability = (
    item: PortalQuestionnaireItemSave,
    where: string,
    targetMode: string,
    targetEntity: string | null,
    add: AddIssue,
): void => {
    // У штатного поля (OPPORTUNITY) носителя нет так же, как нет типа
    // пользовательского поля.
    if (item.isNative === true) return;

    const source = item.fieldSource;
    if (!source) {
        add(
            'item',
            `${where}: не указан носитель, из которого выбрано поле — без ` +
                'него нечем проверить, что фрейм до поля доберётся',
            text(item.code),
        );
        return;
    }

    // Поле смарта на канале «Поле CRM» — отказ: этот ответ пишет сам
    // фрейм, а элемента смарта в тот момент ещё нет. Для смарта есть свой
    // канал, где ответ раскладывает бэк отчёта.
    if (source === QUESTIONNAIRE_CODE.fieldSource.smart) {
        add(
            'item',
            `${where}: поле смарта в CRM не пишется — фрейм адресует ` +
                'компанию, сделку, лид и контакт. Для ответа в элемент ' +
                'смарта выберите канал «Поле элемента смарта»',
            text(item.code),
        );
        return;
    }

    if (targetMode === QUESTIONNAIRE_CODE.targetMode.auto) {
        if (QUESTIONNAIRE_AUTO_FIELD_SOURCES.includes(source)) return;
        add(
            'item',
            `${where}: поле носителя «${source}» цепочкой компания → ` +
                'сделка → лид не достать — выберите жёсткий носитель ' +
                `(targetMode: entity, targetEntity: ${source})`,
            text(item.code),
        );
        return;
    }

    if (targetEntity !== source) {
        add(
            'item',
            `${where}: поле выбрано у носителя «${source}», а ответ ` +
                `адресован «${targetEntity ?? ''}» — фрейм записал бы его в ` +
                'сущность, где этого поля нет',
            text(item.code),
        );
    }
};

/** Варианты справочника: есть только у «Списка», у поля — с bitrixId. */
const validateOptions = (
    item: PortalQuestionnaireItemSave,
    where: string,
    code: string,
    control: string,
    channel: string,
    add: AddIssue,
): void => {
    const options = item.options ?? [];

    if (control !== QUESTIONNAIRE_CODE.control.enumeration) {
        if (options.length > 0) {
            add(
                'item',
                `${where}: варианты справочника есть только у типа «Список»`,
                code,
            );
        }
        return;
    }

    if (options.length === 0) {
        add(
            'item',
            `${where}: у списка должен быть хотя бы один вариант`,
            code,
        );
        return;
    }

    const seen = new Set<string>();
    options.forEach((option, index) => {
        const optionCode = text(option.code);
        if (!optionCode) {
            add(
                'item',
                `${where}: код варианта #${index + 1}: значение обязательно`,
                code,
            );
            return;
        }
        if (seen.has(optionCode)) {
            add(
                'item',
                `${where}: код варианта «${optionCode}» повторяется`,
                code,
            );
        }
        seen.add(optionCode);

        if (!text(option.title)) {
            add(
                'item',
                `${where}: название варианта «${optionCode}»: значение ` +
                    'обязательно',
                code,
            );
        }

        // В поле уезжает именно id элемента списка: вариант без него молча
        // потерялся бы. Каналу «Поле элемента смарта» требование то же —
        // идентификатор ищет бэк отчёта, но искать ему нужно по чему-то.
        if (
            QUESTIONNAIRE_FIELD_BOUND_CHANNELS.some(
                bound => bound === channel,
            ) &&
            (option.bitrixId ?? null) === null
        ) {
            add(
                'item',
                `${where}: у варианта «${optionCode}» нет bitrixId элемента ` +
                    'списка — такой ответ не записать в поле',
                code,
            );
        }
    });
};
