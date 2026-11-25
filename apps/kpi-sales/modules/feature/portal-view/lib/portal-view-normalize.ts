import { defaultPortalViewSettings } from '../consts/portal-view.consts';
import type {
    PortalViewBadgeOption,
    PortalViewMethodology,
    PortalViewOptions,
    PortalViewResponse,
    PortalViewSettings,
    PortalViewTabOption,
} from '../model/types';

/**
 * Ответ бэка → безопасный `PortalViewResponse`. Ручки новые и могут отвечать
 * не всеми полями (или вовсе не быть выложены) — отсутствующее и неверного
 * типа заменяется значением по умолчанию: ничего не скрыто, графики есть,
 * набор бейджей по умолчанию, права на правку нет.
 */

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const nonEmptyString = (value: unknown): string | null =>
    typeof value === 'string' && value.trim() ? value : null;

const stringList = (value: unknown): string[] =>
    Array.isArray(value)
        ? value.filter(
              (item): item is string => typeof item === 'string' && item !== '',
          )
        : [];

const recordList = (value: unknown): UnknownRecord[] =>
    Array.isArray(value) ? value.filter(isRecord) : [];

/** Ссылка поддержки уходит в href: пропускаем только http(s), иначе — «не настроена». */
export const safeSupportUrl = (value: unknown): string | null => {
    const raw = nonEmptyString(value);
    if (!raw) return null;
    try {
        const { protocol } = new URL(raw);
        return protocol === 'https:' || protocol === 'http:' ? raw : null;
    } catch {
        return null;
    }
};

const normalizeView = (raw: unknown): PortalViewSettings => {
    const defaults = defaultPortalViewSettings();
    if (!isRecord(raw)) return defaults;
    return {
        tabsHidden: stringList(raw.tabsHidden),
        chartsEnabled:
            typeof raw.chartsEnabled === 'boolean'
                ? raw.chartsEnabled
                : defaults.chartsEnabled,
        badgesMain: stringList(raw.badgesMain),
        updatedBy: nonEmptyString(raw.updatedBy),
        updatedAt: nonEmptyString(raw.updatedAt),
    };
};

const normalizeTab = (raw: UnknownRecord): PortalViewTabOption | null => {
    const code = nonEmptyString(raw.code);
    const name = nonEmptyString(raw.name);
    return code && name ? { code, name } : null;
};

const normalizeBadge = (raw: UnknownRecord): PortalViewBadgeOption | null => {
    const id = nonEmptyString(raw.id);
    const title = nonEmptyString(raw.title);
    if (!id || !title) return null;
    return {
        id,
        title,
        hint: nonEmptyString(raw.hint),
        group: raw.group === 'methodology' ? 'methodology' : 'general',
        callTypes: stringList(raw.callTypes),
        mainByDefault: raw.mainByDefault === true,
    };
};

const normalizeMethodology = (raw: unknown): PortalViewMethodology | null => {
    if (!isRecord(raw)) return null;
    const code = nonEmptyString(raw.code);
    const title = nonEmptyString(raw.title);
    return code && title ? { code, title } : null;
};

const normalizeOptions = (raw: unknown): PortalViewOptions => {
    if (!isRecord(raw)) return { tabs: [], badges: [], methodology: null };
    return {
        tabs: recordList(raw.tabs)
            .map(normalizeTab)
            .filter((tab): tab is PortalViewTabOption => tab !== null),
        badges: recordList(raw.badges)
            .map(normalizeBadge)
            .filter((badge): badge is PortalViewBadgeOption => badge !== null),
        methodology: normalizeMethodology(raw.methodology),
    };
};

export const normalizePortalViewResponse = (raw: unknown): PortalViewResponse => {
    const body = isRecord(raw) ? raw : {};
    return {
        view: normalizeView(body.view),
        canEdit: body.canEdit === true,
        supportUrl: safeSupportUrl(body.supportUrl),
        options: normalizeOptions(body.options),
    };
};
