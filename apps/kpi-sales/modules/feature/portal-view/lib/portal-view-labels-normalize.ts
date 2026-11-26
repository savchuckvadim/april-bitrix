import { PORTAL_VIEW_INDICATOR_GROUPS } from '../consts/portal-view.consts';
import type {
    PortalViewIndicator,
    PortalViewIndicatorGroup,
} from '../model/types';
import { isRecord, nonEmptyString, recordList } from './portal-view-guards';

/**
 * Свои названия и каталог показателей из ответа бэка (portal-view и
 * публичная ссылка). Поля новые: старый бэк их не присылает — тогда своих
 * названий нет и каталог пуст.
 */

const INDICATOR_GROUPS: ReadonlySet<string> = new Set(PORTAL_VIEW_INDICATOR_GROUPS);

const isIndicatorGroup = (value: unknown): value is PortalViewIndicatorGroup =>
    typeof value === 'string' && INDICATOR_GROUPS.has(value);

/** Свои названия: только «ключ → непустая строка»; остальное отбрасывается. */
export const normalizeIndicatorLabels = (raw: unknown): Record<string, string> =>
    isRecord(raw)
        ? Object.fromEntries(
              Object.entries(raw).filter(
                  (entry): entry is [string, string] =>
                      entry[0] !== '' && nonEmptyString(entry[1]) !== null,
              ),
          )
        : {};

/**
 * Показатель каталога: ключ, известная группа и название обязательны; у
 * колонки плана обязателен и ключ факта (без него колонку не поставить).
 */
const normalizeIndicator = (raw: Record<string, unknown>): PortalViewIndicator | null => {
    const key = nonEmptyString(raw.key);
    const name = nonEmptyString(raw.name);
    const factKey = nonEmptyString(raw.factKey);
    if (!key || !name || !isIndicatorGroup(raw.group)) return null;
    if (raw.group === 'plans' && !factKey) return null;
    return { key, group: raw.group, name, factKey };
};

/** Каталог показателей: только валидные элементы, порядок бэка. */
export const normalizeIndicators = (raw: unknown): PortalViewIndicator[] =>
    recordList(raw)
        .map(normalizeIndicator)
        .filter((item): item is PortalViewIndicator => item !== null);

/**
 * Свои названия из ответа публичной ссылки (`view.labels`). Поля нет в
 * сгенерированном типе ответа — читаем из unknown; нет или мусор — пусто.
 */
export const publicViewLabels = (payload: unknown): Record<string, string> =>
    isRecord(payload) && isRecord(payload.view)
        ? normalizeIndicatorLabels(payload.view.labels)
        : {};
