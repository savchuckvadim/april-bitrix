import type {
    PortalQuestionnaire,
    PortalQuestionnaireCondition,
    PortalQuestionnaireListItem,
    PortalQuestionnaireSchema,
    QuestionnaireConditionKind,
    QuestionnaireConditionKindCode,
    QuestionnairePurpose,
} from '../model';
import { QUESTIONNAIRE_CODE, questionnaireCodeOptions } from '../model';
import {
    QUESTIONNAIRE_EVENT_TYPE_KINDS,
    findSmartBindingByEventType,
} from './event-smart-registry';
import { isQuestionnaireSilencedByEventTypes } from './questionnaire-event-switch';
import { describeConditions, optionName } from './questionnaire-list-view';
import type { QuestionnaireConditionChip } from './questionnaire-list-view';
import type { QuestionnairePreset } from './questionnaire-preset';

/**
 * Разрез каталога анкет ПО ТИПАМ СОБЫТИЙ.
 *
 * Плоский список отвечает на вопрос «какие анкеты есть», но не на главный
 * вопрос владельца: «что менеджера спросят, когда он отчитается по
 * Решению?». Чтобы ответить, приходилось открывать каждую анкету и читать
 * её условия. Матрица переворачивает каталог: строки — типы событий,
 * колонки — назначение анкеты, ячейка — что сработает именно здесь.
 *
 * «Именно здесь» — с оговоркой, и она видна на карточке. Условия анкеты
 * выполняются ОДНОВРЕМЕННО (между видами условий И, значения внутри одного
 * вида — ИЛИ), а координата клетки знает только про свой вид. Поэтому
 * остальные условия анкеты едут в клетку вместе с ней: без них клетка
 * обещала бы владельцу больше, чем анкета сделает.
 *
 * Ни одного кода типа события здесь нет: строки собираются из реестра
 * `GET /schema` (значения условий планирования и отчёта), подписи и
 * порядок — тоже его. Из контракта берутся только ВИДЫ условий, которые
 * вообще являются «типом события»: остальные виды к строкам отношения не
 * имеют.
 *
 * Главный инвариант: ни одна анкета не исчезает. Всё, что в разрез не
 * легло (условие только по стадии, по статусу работы или «всегда»;
 * незнакомые коды; ещё не подъехавший состав), попадает в отдельные
 * списки рядом с матрицей — иначе владелец решил бы, что таких анкет нет
 * вовсе.
 */

/** Колонка матрицы — назначение анкеты из реестра. */
export interface QuestionnaireMatrixColumn {
    purpose: QuestionnairePurpose;
    /** Название назначения из реестра. */
    label: string;
    /** Что назначение означает — описание бэка, если он его прислал. */
    description?: string;
}

/** Анкета в ячейке матрицы. */
export interface QuestionnaireMatrixCard {
    id: string;
    code: string;
    title: string;
    isActive: boolean;
    itemsCount: number;
    /** Вопросы со сломанной привязкой: в каталог фрейма они не попадают. */
    issuesCount: number;
    /**
     * Анкета покрывает больше одного типа события ЭТОГО вида условия.
     *
     * Типы одного вида — альтернативы (значения внутри условия идут по
     * ИЛИ), и «сработает и там, и там» про них сказать можно. Про типы
     * разных видов — нельзя: они требуются одновременно.
     */
    isShared: boolean;
    /** Названия типов того же вида, на которых она сработает тоже. */
    sharedWith: string[];
    /**
     * Остальные условия анкеты: пока они не выполнены, здесь она молчит.
     *
     * Анкета «тип отчётного события — Решение И целевая стадия — Успех»
     * стоит в клетке Решения, но сработает только на предикте «Успех», и
     * клетка обязана это сказать.
     */
    alsoRequires: QuestionnaireConditionChip[];
    /**
     * Анкета погашена выключателем анкет по типам события.
     *
     * Считается по анкете целиком, а не по клетке: выключатель гасит
     * анкету, у которой ВСЕ значения хотя бы одного условия по типу
     * события выключены. Анкета «Презентация ИЛИ Решение» при выключенной
     * презентации продолжает работать — и в клетке презентации тоже.
     */
    isSilenced: boolean;
}

/** Ячейка: что сработает на этом типе события в этом назначении. */
export interface QuestionnaireMatrixCell {
    purpose: QuestionnairePurpose;
    cards: QuestionnaireMatrixCard[];
    /** С чем открыть редактор, если спрашивать здесь пока нечего. */
    preset: QuestionnairePreset;
}

/** Строка матрицы — один тип события. */
export interface QuestionnaireMatrixRow {
    /** Вид условия, из справочника которого взят тип. */
    kind: QuestionnaireConditionKindCode;
    /** Код типа события — он же уезжает в условие анкеты. */
    code: string;
    label: string;
    description?: string;
    /**
     * У типа события есть смарт: его поток заводит элемент, и ответы могут
     * уехать туда. Владелец должен видеть это до того, как соберёт анкету:
     * поля смарта доступны ровно строкам с этой пометкой.
     */
    hasSmart: boolean;
    /** Анкеты этого типа события выключены настройкой портала. */
    isDisabled: boolean;
    /** Ячейки строго в порядке колонок. */
    cells: QuestionnaireMatrixCell[];
}

/** Группа строк — один вид условия (планирование либо отчёт). */
export interface QuestionnaireMatrixGroup {
    kind: QuestionnaireConditionKindCode;
    /** Название вида условия из реестра. */
    title: string;
    /** Как условие работает — описание бэка. */
    description: string;
    rows: QuestionnaireMatrixRow[];
}

/** Почему анкета в разрез по типам событий не легла. */
export type QuestionnaireMatrixLooseReason =
    /** Условий по типу события нет: стадия, статус работы либо «всегда». */
    | 'noEventType'
    /**
     * Анкета привязана к спонтанной презентации: тип события у такой
     * задачи обычный звонок, строки в матрице для неё нет — но элемент
     * презентации создаётся, и ответы в него уехать могут.
     */
    | 'presentationDone'
    /** Условие по типу события есть, но его значений реестр не знает. */
    | 'unknownValues'
    /** Назначение анкеты не совпало ни с одной колонкой реестра. */
    | 'unknownPurpose';

/** Анкета вне разреза: показывается отдельным блоком со своими условиями. */
export interface QuestionnaireMatrixLooseCard extends QuestionnaireMatrixCard {
    reason: QuestionnaireMatrixLooseReason;
    /** Название назначения из реестра — колонки у такой анкеты нет. */
    purposeLabel: string;
    /** Условия показа чипсами: почему анкета сработает без типа события. */
    conditions: QuestionnaireConditionChip[];
}

/** Каталог, разложенный по типам событий. */
export interface QuestionnaireMatrix {
    /** Назначения из реестра в его порядке; пусто — реестра нет. */
    columns: QuestionnaireMatrixColumn[];
    groups: QuestionnaireMatrixGroup[];
    /** Анкеты, которые видны независимо от типа события. */
    loose: QuestionnaireMatrixLooseCard[];
    /**
     * Анкеты, которые разложить пока нечем: состав ещё едет отдельным
     * запросом (условий в списке бэка нет) либо реестр не прочитан.
     */
    pending: QuestionnaireMatrixCard[];
}

/** Ключ ячейки: вид условия + тип события + назначение. */
const cellKey = (
    kind: QuestionnaireConditionKindCode,
    code: string,
    purpose: QuestionnairePurpose,
): string => `${kind}|${code}|${purpose}`;

/** Тип события, на который сработала анкета. */
interface QuestionnaireMatrixHit {
    kind: QuestionnaireConditionKindCode;
    code: string;
    label: string;
}

/** Строка списка → карточка ячейки (без разметки «общая»). */
const toCard = (
    item: PortalQuestionnaireListItem,
    isSilenced = false,
): QuestionnaireMatrixCard => ({
    id: item.id,
    code: item.code,
    title: item.title,
    isActive: item.isActive,
    itemsCount: item.itemsCount,
    issuesCount: item.issuesCount,
    isShared: false,
    sharedWith: [],
    alsoRequires: [],
    isSilenced,
});

/** Есть ли у анкеты хоть одно условие по типу события. */
const hasEventTypeCondition = (
    conditions: PortalQuestionnaireCondition[],
): boolean =>
    conditions.some(condition =>
        QUESTIONNAIRE_EVENT_TYPE_KINDS.includes(condition.kind),
    );

/**
 * Все типы событий, на которых анкета сработает.
 *
 * Значение, которого нет в справочнике реестра, строкой не становится:
 * показать его не на чем — у такой строки нет ни подписи, ни места в
 * лестнице типов. Анкета с одними такими значениями уходит в отдельный
 * блок целиком, а не теряется.
 */
const findHits = (
    conditions: PortalQuestionnaireCondition[],
    kinds: QuestionnaireConditionKind[],
): QuestionnaireMatrixHit[] =>
    kinds.flatMap(kind => {
        const condition = conditions.find(entry => entry.kind === kind.kind);
        if (!condition) return [];

        const picked = condition.values ?? [];
        return kind.values
            .filter(value => picked.includes(value.code))
            .map(value => ({
                kind: kind.kind,
                code: value.code,
                label: value.name,
            }));
    });

/** Почему анкета осталась вне разреза по типам событий. */
const looseReason = (
    hasColumn: boolean,
    conditions: PortalQuestionnaireCondition[],
): QuestionnaireMatrixLooseReason => {
    if (!hasColumn) return 'unknownPurpose';
    if (hasEventTypeCondition(conditions)) return 'unknownValues';
    // «Презентация проведена» — не «условий по типу события нет»: анкета
    // сработает не на любом типе, а там, где презентация состоялась.
    if (
        conditions.some(
            condition =>
                condition.kind ===
                QUESTIONNAIRE_CODE.conditionKind.presentationDone,
        )
    ) {
        return 'presentationDone';
    }
    return 'noEventType';
};

/**
 * Каталог → матрица «тип события × назначение».
 *
 * Состав анкет (`details`) приходит отдельными запросами: условий в списке
 * бэка нет, а именно они решают, в какую строку попадёт анкета. Пока
 * состав едет, анкета лежит в `pending` — не в матрице и не в блоке
 * безусловных, потому что оба вывода были бы враньём.
 */
export const buildQuestionnaireMatrix = (
    list: PortalQuestionnaireListItem[] | undefined,
    details: Map<string, PortalQuestionnaire>,
    schema: PortalQuestionnaireSchema | undefined,
    /** Типы события, для которых анкеты выключены настройкой портала. */
    disabledEventTypes: readonly string[] = [],
): QuestionnaireMatrix => {
    const items = list ?? [];

    // Без реестра нет ни колонок, ни строк: подписи и списки значений
    // живут только в нём. Разложить каталог нечем — но и потерять нельзя.
    if (!schema) {
        return {
            columns: [],
            groups: [],
            loose: [],
            pending: items.map(item => toCard(item)),
        };
    }

    const columns: QuestionnaireMatrixColumn[] = questionnaireCodeOptions(
        QUESTIONNAIRE_CODE.purpose,
        schema.purposes,
    ).map(option => ({
        purpose: option.code,
        label: option.name,
        description: option.description,
    }));

    // Порядок групп — порядок реестра, а не наш: бэк ставит планирование
    // перед отчётом, и лестница типов внутри группы тоже его.
    const kinds = schema.conditions.filter(kind =>
        QUESTIONNAIRE_EVENT_TYPE_KINDS.includes(kind.kind),
    );

    const placed = new Map<string, QuestionnaireMatrixCard[]>();
    const loose: QuestionnaireMatrixLooseCard[] = [];
    const pending: QuestionnaireMatrixCard[] = [];

    for (const item of items) {
        const detail = details.get(item.id);
        if (!detail) {
            pending.push(toCard(item));
            continue;
        }

        const conditions = detail.conditions ?? [];
        const isSilenced = isQuestionnaireSilencedByEventTypes(
            conditions,
            disabledEventTypes,
        );
        const column = columns.find(entry => entry.purpose === item.purpose);
        const hits = column ? findHits(conditions, kinds) : [];

        if (!column || hits.length === 0) {
            loose.push({
                ...toCard(item, isSilenced),
                reason: looseReason(!!column, conditions),
                purposeLabel: optionName(schema.purposes, item.purpose),
                conditions: describeConditions(conditions, schema),
            });
            continue;
        }

        // Условия целиком: из них каждая клетка берёт свою оговорку — всё,
        // что к её виду условия отношения не имеет, но выполниться обязано.
        const chips = describeConditions(conditions, schema);
        const base = toCard(item, isSilenced);

        // Карточка кладётся в КАЖДУЮ свою клетку, но собирается для клетки
        // отдельно: «общая» и оговорка читаются от вида условия этой клетки.
        for (const hit of hits) {
            // Альтернативы — типы ТОГО ЖЕ вида: значения внутри условия
            // идут по ИЛИ, и правка из одной такой клетки меняет анкету в
            // остальных. Тип другого вида альтернативой не бывает — он
            // требуется одновременно с этим, и его место в оговорке.
            const sharedWith = hits
                .filter(entry => entry.kind === hit.kind)
                .map(entry => entry.label);

            const card: QuestionnaireMatrixCard = {
                ...base,
                isShared: sharedWith.length > 1,
                sharedWith,
                alsoRequires: chips.filter(chip => chip.kind !== hit.kind),
            };

            const key = cellKey(hit.kind, hit.code, column.purpose);
            const cards = placed.get(key);
            if (cards) cards.push(card);
            else placed.set(key, [card]);
        }
    }

    const groups: QuestionnaireMatrixGroup[] = kinds.map(kind => ({
        kind: kind.kind,
        title: kind.name,
        description: kind.description,
        rows: kind.values.map(value => ({
            kind: kind.kind,
            code: value.code,
            label: value.name,
            description: value.description,
            hasSmart: !!findSmartBindingByEventType(value.code),
            isDisabled: disabledEventTypes.includes(value.code),
            cells: columns.map(column => ({
                purpose: column.purpose,
                cards:
                    placed.get(
                        cellKey(kind.kind, value.code, column.purpose),
                    ) ?? [],
                preset: {
                    purpose: column.purpose,
                    conditionKind: kind.kind,
                    conditionValue: value.code,
                },
            })),
        })),
    }));

    return { columns, groups, loose, pending };
};
