import type { AdminPortalResponseDto } from '@/modules/entities/portal';
import {
    HOOK_ENABLED_BADGE,
    HOOK_FAMILY_ORDER,
    HOOK_FAMILY_TITLE,
    HOOK_MISSING_PREVIEW_MAX,
    HOOK_READINESS_BADGE,
    HOOKS_PORTAL_QUERY_PARAM,
    HOOKS_TEXT,
    type HookBadgeView,
} from '../consts/hooks.const';
import type {
    HookCatalogEntry,
    HookCatalogItem,
    HookFamily,
    HookFieldCheck,
    HookPbxFieldRef,
    HookReadinessStatus,
    HookSettingCheck,
    HookSettingRef,
    HookSettingValue,
    HookStageCheck,
    HookStageRef,
    PortalHookReadiness,
    PortalHooksReadinessResponse,
} from '../model';

/** Семейство каталога с его хуками (в порядке показа). */
export interface HookFamilyGroup<T extends { family: HookFamily }> {
    family: HookFamily;
    title: string;
    items: T[];
}

/**
 * Хуки по семействам в порядке `HOOK_FAMILY_ORDER`; порядок внутри
 * семейства — как пришёл с бэка. Пустые семейства не показываются,
 * неизвестное семейство (бэк новее фронта) уходит в конец со своим
 * названием из ответа.
 */
export const groupHooksByFamily = <
    T extends { family: HookFamily; familyTitle?: string },
>(
    items: readonly T[],
): HookFamilyGroup<T>[] => {
    const groups = new Map<HookFamily, HookFamilyGroup<T>>();
    for (const family of HOOK_FAMILY_ORDER) {
        groups.set(family, {
            family,
            title: HOOK_FAMILY_TITLE[family],
            items: [],
        });
    }
    for (const item of items) {
        const known = groups.get(item.family);
        if (known) {
            known.items.push(item);
            continue;
        }
        groups.set(item.family, {
            family: item.family,
            title:
                HOOK_FAMILY_TITLE[item.family] ??
                item.familyTitle ??
                item.family,
            items: [item],
        });
    }
    return [...groups.values()].filter(group => group.items.length > 0);
};

export const normalizeHookQuery = (query: string): string =>
    query.trim().toLowerCase();

/** Совпадение по названию, описанию или коду хука. */
export const matchesHook = (
    item: Pick<HookCatalogItem, 'title' | 'summary' | 'code'>,
    normalizedQuery: string,
): boolean =>
    !normalizedQuery ||
    [item.title, item.summary, item.code].some(text =>
        text.toLowerCase().includes(normalizedQuery),
    );

export const filterHookItems = <
    T extends Pick<HookCatalogItem, 'title' | 'summary' | 'code'>,
>(
    items: readonly T[],
    query: string,
): T[] => {
    const normalized = normalizeHookQuery(query);
    return items.filter(item => matchesHook(item, normalized));
};

/** Бэйдж статуса установки; неизвестный статус — «Без требований» серым. */
export const resolveReadinessBadge = (
    status: HookReadinessStatus | string | undefined,
): HookBadgeView =>
    (status && HOOK_READINESS_BADGE[status as HookReadinessStatus]) ||
    HOOK_READINESS_BADGE.none;

/**
 * Бэйдж рубильника: `undefined` — готовность ещё не известна (бэйджа нет),
 * `null` — у хука нет рубильника (вебхук работает всегда).
 */
export const resolveEnabledBadge = (
    enabled: boolean | null | undefined,
): HookBadgeView | null =>
    enabled === undefined
        ? null
        : enabled === null
          ? HOOK_ENABLED_BADGE.none
          : enabled
            ? HOOK_ENABLED_BADGE.on
            : HOOK_ENABLED_BADGE.off;

/** Ссылка бэка с `{portalId}` → путь для конкретного портала. */
export const resolveHookLink = (href: string, portalId: number): string =>
    href.replace(/\{portalId\}/g, String(portalId));

/** «не хватает: a, b, c и ещё 2» — коротко для строки каталога. */
export const formatMissingRequired = (
    missing: readonly string[],
    max = HOOK_MISSING_PREVIEW_MAX,
): string => {
    if (missing.length === 0) return '';
    const shown = missing.slice(0, max).join(', ');
    const rest = missing.length - max;
    return rest > 0 ? `${shown} ${HOOKS_TEXT.andMore} ${rest}` : shown;
};

/** `?portalId=` → число или ничего: только положительное целое. */
export const parsePortalIdParam = (
    raw: string | null | undefined,
): number | undefined => {
    if (!raw || !/^\d+$/.test(raw)) return undefined;
    const id = Number(raw);
    return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

/**
 * Адрес карточки хука: в карточке портала — `/portal/:id/hooks/:code`,
 * в глобальном разделе — `/hooks/:code` с выбранным порталом в query.
 */
export const buildHookHref = (
    code: string,
    portalId: number | undefined,
    fixed: boolean,
): string => {
    const encoded = encodeURIComponent(code);
    if (fixed && portalId) return `/portal/${portalId}/hooks/${encoded}`;
    return portalId
        ? `/hooks/${encoded}?${HOOKS_PORTAL_QUERY_PARAM}=${portalId}`
        : `/hooks/${encoded}`;
};

/** Адрес каталога хуков для тех же двух режимов. */
export const buildHooksCatalogHref = (
    portalId: number | undefined,
    fixed: boolean,
): string => {
    if (fixed && portalId) return `/portal/${portalId}/hooks`;
    return portalId ? `/hooks?${HOOKS_PORTAL_QUERY_PARAM}=${portalId}` : '/hooks';
};

export interface HookPortalOption {
    /** Id портала строкой — Radix Select работает со строками. */
    value: string;
    label: string;
}

/** Порталы админки → варианты селекта, по домену. */
export const toPortalSelectOptions = (
    portals: readonly AdminPortalResponseDto[] | undefined,
): HookPortalOption[] =>
    (portals ?? [])
        .map(portal => ({
            value: String(portal.id),
            label: portal.domain
                ? `${portal.domain} (#${portal.id})`
                : `Портал #${portal.id}`,
        }))
        .sort((left, right) => left.label.localeCompare(right.label, 'ru'));

/** Готовность портала по кодам хуков — для строк каталога. */
export const indexReadinessByCode = (
    readiness: PortalHooksReadinessResponse | undefined,
): ReadonlyMap<string, PortalHookReadiness> =>
    new Map((readiness?.hooks ?? []).map(hook => [hook.code, hook]));

/** Строка таблицы настроек: описание из каталога + состояние на портале. */
export type HookSettingRow = HookSettingRef & {
    /** Действующее значение; null — не задано или портал не выбран. */
    value: HookSettingValue | null;
    /** null — портал не выбран (состояние неизвестно). */
    stored: boolean | null;
    href: string | null;
};

const settingKey = (ref: Pick<HookSettingRef, 'app' | 'key'>): string =>
    `${ref.app}:${ref.key}`;

export const mergeHookSettings = (
    refs: readonly HookSettingRef[],
    checks: readonly HookSettingCheck[] | undefined,
): HookSettingRow[] => {
    const byKey = new Map(
        (checks ?? []).map(check => [settingKey(check), check]),
    );
    return refs.map(ref => {
        const check = byKey.get(settingKey(ref));
        return {
            ...ref,
            value: check ? check.value : null,
            stored: check ? check.stored : null,
            href: check?.href ?? null,
        };
    });
};

export type HookFieldRow = HookPbxFieldRef & {
    /** null — портал не выбран. */
    installed: boolean | null;
    href: string | null;
};

const fieldKey = (ref: { entity: string; code: string }): string =>
    `${ref.entity}:${ref.code}`;

export const mergeHookFields = (
    refs: readonly HookPbxFieldRef[],
    checks: readonly HookFieldCheck[] | undefined,
): HookFieldRow[] => {
    const byKey = new Map((checks ?? []).map(check => [fieldKey(check), check]));
    return refs.map(ref => {
        const check = byKey.get(fieldKey(ref));
        return {
            ...ref,
            installed: check ? check.installed : null,
            href: check?.href ?? null,
        };
    });
};

/** Порядок сущностей в таблице полей: от лида к задаче. */
const ENTITY_ORDER: Record<HookPbxFieldRef['entity'], number> = {
    lead: 0,
    deal: 1,
    company: 2,
    contact: 3,
    task: 4,
};

/**
 * Поля по сущностям (лид → сделка → компания → контакт → задача); внутри
 * сущности — порядок карточки хука (он осмысленный: связи, маркеры, …).
 */
export const sortHookFieldRows = <T extends Pick<HookPbxFieldRef, 'entity'>>(
    rows: readonly T[],
): T[] =>
    rows
        .map((row, index) => ({ row, index }))
        .sort(
            (left, right) =>
                (ENTITY_ORDER[left.row.entity] ?? 99) -
                    (ENTITY_ORDER[right.row.entity] ?? 99) ||
                left.index - right.index,
        )
        .map(item => item.row);

export type HookStageRow = HookStageRef & {
    /** null — портал не выбран. */
    mapped: boolean | null;
    href: string | null;
};

export const mergeHookStages = (
    refs: readonly HookStageRef[],
    checks: readonly HookStageCheck[] | undefined,
): HookStageRow[] => {
    const byKey = new Map((checks ?? []).map(check => [fieldKey(check), check]));
    return refs.map(ref => {
        const check = byKey.get(fieldKey(ref));
        return {
            ...ref,
            mapped: check ? check.mapped : null,
            href: check?.href ?? null,
        };
    });
};

/** Значение настройки для таблицы: булево словами, пустое — тире. */
export const formatSettingValue = (
    value: HookSettingValue | null | undefined,
): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'вкл' : 'выкл';
    return String(value);
};

/** Поля одной сущности в сводке «что хук меняет». */
export interface HookEffectFields {
    entity: HookPbxFieldRef['entity'];
    fields: HookPbxFieldRef[];
}

/** «Что хук меняет в CRM»: выводится из описания хука, без новых данных. */
export interface HookEffects {
    /** Пишет: роли writes, link (связи графа) и marker (метки процесса). */
    writes: HookEffectFields[];
    /** Читает: роли reads и routing (маршрутизация). */
    reads: HookEffectFields[];
    stages: HookStageRef[];
    /** Рубильники хука; пусто — хук работает всегда, когда вызван. */
    gates: HookSettingRef[];
}

const WRITE_ROLES: ReadonlySet<HookPbxFieldRef['role']> = new Set([
    'writes',
    'link',
    'marker',
]);

const bucketByEntity = (fields: readonly HookPbxFieldRef[]): HookEffectFields[] => {
    const buckets = new Map<HookPbxFieldRef['entity'], HookPbxFieldRef[]>();
    for (const field of sortHookFieldRows(fields)) {
        const list = buckets.get(field.entity) ?? [];
        list.push(field);
        buckets.set(field.entity, list);
    }
    return [...buckets.entries()].map(([entity, list]) => ({
        entity,
        fields: list,
    }));
};

/**
 * Сводка последствий подключения хука для сотрудника: какие поля по
 * сущностям он пишет (включая связи и метки), какие читает, какие стадии
 * использует и какой настройкой включается.
 */
export const summarizeHookEffects = (
    entry: Pick<HookCatalogEntry, 'pbxFields' | 'stages' | 'settings'>,
): HookEffects => ({
    writes: bucketByEntity(
        entry.pbxFields.filter(field => WRITE_ROLES.has(field.role)),
    ),
    reads: bucketByEntity(
        entry.pbxFields.filter(field => !WRITE_ROLES.has(field.role)),
    ),
    stages: [...entry.stages],
    gates: entry.settings.filter(setting => setting.role === 'gate'),
});
