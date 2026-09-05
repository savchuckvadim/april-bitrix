import { findPortalField, findUfKey } from '@workspace/pbx';
import type { PBXField } from '@/modules/app/types/portal/portal-type';
import { parseCrmDate } from '@/modules/shared/lib/crm-date';

/**
 * Состояние «на доработке» основной сделки — чтение трёх deal-only полей
 * (`op_is_in_refine`, `op_refined_at`, `op_refined_reason`), без UI.
 *
 * Состояние живёт ПОЛЯМИ, а не стадией: у части порталов стадии «Доработка»
 * в воронке нет, а признак менеджеру нужен — по нему видно, что клиента
 * дорабатывают, с какого дня и почему. Пишет поля бэк (`applyRefineState`
 * в модели полей event-report), фронт только показывает.
 */

export const REFINE_STATE_CODES = {
    flag: 'op_is_in_refine',
    since: 'op_refined_at',
    reason: 'op_refined_reason',
} as const;

export interface RefineState {
    /** Флаг стоит. */
    isActive: boolean;
    /** «2 сентября 2026»; пусто — дата не записана. */
    sinceLabel: string;
    /** Причина как записана; пусто — не записана. */
    reason: string;
}

const MONTHS_GENITIVE = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
];

/** Истина булева UF во всех формах, в которых её отдаёт REST и SDK. */
const isTruthyFlag = (raw: unknown): boolean =>
    raw === true || raw === 1 || raw === '1' || raw === 'Y';

/** «2 сентября 2026» из любого диалекта даты портала; мусор — пусто. */
export const toRefineSinceLabel = (raw: unknown): string => {
    const parts = parseCrmDate(raw);
    if (!parts) return '';
    const month = MONTHS_GENITIVE[parts.month - 1];
    return month ? `${parts.day} ${month} ${parts.year}` : '';
};

/**
 * Состояние по строке сделки и слепку её полей. `null` — флаг на портале
 * не установлен: показывать нечего, даже если дата/причина заведены.
 */
export const readRefineState = (
    fields: PBXField[] | null | undefined,
    row: Record<string, unknown> | null | undefined,
): RefineState | null => {
    if (!findPortalField(fields, REFINE_STATE_CODES.flag)) return null;
    const read = (code: string): unknown => {
        const key = findUfKey(fields, code);
        return key && row ? row[key] : undefined;
    };
    const reason = read(REFINE_STATE_CODES.reason);
    return {
        isActive: isTruthyFlag(read(REFINE_STATE_CODES.flag)),
        sinceLabel: toRefineSinceLabel(read(REFINE_STATE_CODES.since)),
        reason: typeof reason === 'string' ? reason.trim() : '',
    };
};
