import type {
    AiByType,
    AiByTypeCallType,
    AiByTypeLongRow,
    AiByTypeWideRow,
    AiTypeTotals,
} from '../model';
import { isAiByTypeAll } from './ai-call-types.data';

/** Строки одного менеджера подряд (порядок первого появления сохранён). */
export interface AiManagerRowsGroup<T> {
    managerId: string;
    rows: T[];
}

/**
 * Группировка строк среза по менеджеру: в режиме «все типы» бэк отдаёт
 * строку на пару менеджер × тип (в длинной раскладке — × показатель), а
 * таблица показывает имя один раз и дальше строки типов. Порядок
 * менеджеров и строк внутри — как пришёл; строки одного менеджера,
 * разнесённые по списку, всё равно попадают в одну группу.
 */
export const groupAiRowsByManager = <T extends { managerId: string }>(
    rows: T[],
): AiManagerRowsGroup<T>[] => {
    const groups = new Map<string, AiManagerRowsGroup<T>>();
    for (const row of rows) {
        const group = groups.get(row.managerId);
        if (group) group.rows.push(row);
        else
            groups.set(row.managerId, {
                managerId: row.managerId,
                rows: [row],
            });
    }
    return [...groups.values()];
};

const BY_TYPE_IDLE_DESCRIPTION =
    'Оценки, разделы и KPI по выбранному типу звонка или по всем типам сразу; возражения — сквозной срез';

/** Подзаголовок drawer «Разбор по типам»: до данных — что это, с данными — что показано. */
export const aiByTypeDescription = (data: AiByType | null): string => {
    if (!data) return BY_TYPE_IDLE_DESCRIPTION;
    const period = `срез обзора за ${data.period.from} – ${data.period.to}`;
    return isAiByTypeAll(data.callType)
        ? `${data.title}: строка на каждую пару менеджер × тип, ${period}`
        : `${data.title}: ${period}`;
};

/* ---------- Отсев пустых типов в режиме «все типы» ---------- */

/**
 * Что показать после отсева и сколько скрыто. `hidden` считается в единицах
 * списка: пары менеджер × тип у строк таблиц, типы у чипов «Итоги по типам».
 */
export interface AiByTypeVisibility<T> {
    visible: T[];
    hidden: number;
}

/** Подпись под таблицей «все типы», когда пустые типы отсеяны. */
export const AI_BY_TYPE_HIDDEN_NOTE = 'Типы без звонков за период скрыты';

const hasCalls = (n: number): boolean => n > 0;

const splitVisible = <T>(
    items: T[],
    isVisible: (item: T) => boolean,
): AiByTypeVisibility<T> => {
    const visible = items.filter(isVisible);
    return { visible, hidden: items.length - visible.length };
};

/**
 * Широкая раскладка, режим «все типы»: бэк отдаёт строку на каждую пару
 * менеджер × тип справочника, включая other / irrelevant и типы без
 * звонков — остаются только строки с разобранными звонками (cell.n > 0).
 */
export const pickAiByTypeVisibleRows = (
    rows: AiByTypeWideRow[],
): AiByTypeVisibility<AiByTypeWideRow> =>
    splitVisible(rows, row => hasCalls(row.cell.n));

/** Чипы «Итоги по типам»: только типы со звонками за период (n > 0). */
export const pickAiVisibleTypeTotals = (
    totals: AiTypeTotals[],
): AiByTypeVisibility<AiTypeTotals> =>
    splitVisible(totals, total => hasCalls(total.n));

const longPairKey = (row: AiByTypeLongRow): string =>
    `${row.managerId}|${row.callType}`;

/**
 * Длинная раскладка, режим «все типы»: строки пары менеджер × тип идут
 * вместе (оценка типа, разделы, чек-листы, KPI). Пара скрывается целиком,
 * если её строка «оценка типа» (kind = score) без звонков (metric.n = 0);
 * пара без строки score остаётся — судить не по чему. `hidden` — число пар.
 */
export const pickAiByTypeVisibleLongRows = (
    rows: AiByTypeLongRow[],
): AiByTypeVisibility<AiByTypeLongRow> => {
    const emptyPairs = new Set<string>();
    for (const row of rows) {
        if (row.kind === 'score' && !hasCalls(row.metric.n))
            emptyPairs.add(longPairKey(row));
    }
    return {
        visible: rows.filter(row => !emptyPairs.has(longPairKey(row))),
        hidden: emptyPairs.size,
    };
};

/** Вход гарда отсева: выбранный тип среза, список и отсев для режима «все типы». */
export interface AiByTypeVisibilityInput<T> {
    callType: AiByTypeCallType;
    rows: T[];
    pick: (rows: T[]) => AiByTypeVisibility<T>;
}

/**
 * Отсев пустых типов применяется только в режиме «все типы». При обычном
 * типе список возвращается как есть и скрытых нет: там строки с n = 0
 * нужны — видно, у кого «мало данных».
 */
export const applyAiByTypeVisibility = <T>({
    callType,
    rows,
    pick,
}: AiByTypeVisibilityInput<T>): AiByTypeVisibility<T> =>
    isAiByTypeAll(callType) ? pick(rows) : { visible: rows, hidden: 0 };

/** Подпись под таблицей / чипами: есть скрытые — текст, нет — null (не показывать). */
export const aiByTypeHiddenNote = (hidden: number): string | null =>
    hidden > 0 ? AI_BY_TYPE_HIDDEN_NOTE : null;
