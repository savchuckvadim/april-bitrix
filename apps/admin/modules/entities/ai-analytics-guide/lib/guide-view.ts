import type { AdminPortalResponseDto } from '@/modules/entities/portal';
import { GUIDE_PATH, GUIDE_PORTAL_QUERY_PARAM } from '../consts/ai-analytics-guide.const';
import type { GuideEndpoint, GuideParam, GuideSectionItem } from '../model';

const PORTAL_PLACEHOLDER = '{portalId}';
const DOMAIN_PLACEHOLDER = '{domain}';

/**
 * Ссылка путеводителя для портала: `{portalId}` подставляется; без
 * портала ссылка в карточку недоступна (null), глобальные пути — как есть.
 */
export const resolveGuideHref = (
    href: string,
    portalId: number | undefined,
): string | null => {
    if (!href.includes(PORTAL_PLACEHOLDER)) return href;
    return portalId ? href.replace(PORTAL_PLACEHOLDER, String(portalId)) : null;
};

/** Адрес раздела путеводителя (с портал-параметром, если выбран). */
export const buildGuideSectionHref = (
    code: string,
    portalId?: number,
): string => {
    const query = portalId ? `?${GUIDE_PORTAL_QUERY_PARAM}=${portalId}` : '';
    return `${GUIDE_PATH}${query}#${code}`;
};

/** Код раздела из `location.hash`; неизвестный или пустой — первый раздел. */
export const resolveSectionCode = (
    hash: string,
    items: readonly GuideSectionItem[],
): string | undefined => {
    const code = hash.replace(/^#/, '').trim();
    if (code && items.some(item => item.code === code)) return code;
    return items[0]?.code;
};

/** `?portalId=` → число или undefined (мусор игнорируется). */
export const parseGuidePortalId = (raw: string | null): number | undefined => {
    if (!raw) return undefined;
    const value = Number(raw);
    return Number.isInteger(value) && value > 0 ? value : undefined;
};

/** Портал по id из списка порталов админки. */
export const findPortalById = (
    portals: readonly AdminPortalResponseDto[] | undefined,
    portalId: number | undefined,
): AdminPortalResponseDto | undefined =>
    portalId ? (portals ?? []).find(portal => portal.id === portalId) : undefined;

/** Портал по домену (значение комбобокса) из списка порталов админки. */
export const findPortalByDomain = (
    portals: readonly AdminPortalResponseDto[] | undefined,
    domain: string | undefined,
): AdminPortalResponseDto | undefined =>
    domain ? (portals ?? []).find(portal => portal.domain === domain) : undefined;

/** Подстановка домена в пример тела или query ручки. */
export const fillDomain = (template: string, domain: string | undefined): string =>
    template.split(DOMAIN_PLACEHOLDER).join(domain ?? DOMAIN_PLACEHOLDER);

/**
 * Значение дефолта реестра человеком: флаг — вкл/выкл, число как есть,
 * пустая строка — «пусто», объект (generated-тип шире рантайма) — JSON.
 */
export const formatParamDefault = (value: unknown): string => {
    if (typeof value === 'boolean') return value ? 'вкл' : 'выкл';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return value === '' ? '«пусто»' : value;
    if (value === null || value === undefined) return '—';
    return JSON.stringify(value);
};

/** Диапазон [min; max] или «—». */
export const formatParamRange = (
    range: readonly number[] | null | undefined,
): string =>
    range && range.length === 2 ? `[${range[0]}; ${range[1]}]` : '—';

export interface GuideParamGroupView {
    group: string;
    groupTitle: string;
    params: GuideParam[];
}

/** Параметры по тематическим группам в порядке первого появления. */
export const groupGuideParams = (
    params: readonly GuideParam[],
): GuideParamGroupView[] => {
    const groups = new Map<string, GuideParamGroupView>();
    for (const param of params) {
        const known = groups.get(param.group);
        if (known) {
            known.params.push(param);
            continue;
        }
        groups.set(param.group, {
            group: param.group,
            groupTitle: param.groupTitle,
            params: [param],
        });
    }
    return [...groups.values()];
};

/** Ручка выполняется из админки (есть клиент), а не через Swagger. */
export const isAdminEndpoint = (endpoint: Pick<GuideEndpoint, 'app'>): boolean =>
    endpoint.app === 'admin';

/** Подсказка, где искать ручку внешнего приложения. */
export const buildSwaggerHint = (
    endpoint: Pick<GuideEndpoint, 'app' | 'method' | 'path' | 'swaggerPath'>,
): string =>
    `Swagger ${endpoint.app}: ${endpoint.swaggerPath} → ${endpoint.method} /api/${endpoint.path}`;

/** JSON с отступами для карточки ответа. */
export const formatJson = (value: unknown): string =>
    value === undefined ? '' : JSON.stringify(value, null, 2);
