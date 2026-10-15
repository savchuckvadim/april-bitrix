import {
    BITRIX_ID_PLACEHOLDER,
    HOOK_ID_LIKE_PARAMS,
} from '../consts/hooks.const';
import type { HookParam } from '../model';

const OPTION = /^[A-Za-z0-9_]+$/;
/** `{{ID}}`, `{{ASSIGNED_BY_ID}}` — подстановки Битрикса внутри значения. */
const PLACEHOLDER = /(\{\{[^{}]*\}\})/;

/**
 * Допустимые значения параметра → варианты селекта. Бэк описывает их
 * текстом вида `Y / N`, `from_lead / cold / new`; если хоть одна часть —
 * не простой код (`user_123 (робот) или число`, `DD.MM.YYYY HH:mm:ss`),
 * вариантов нет и нужен свободный ввод.
 */
export const parseParamOptions = (values: string | null): string[] | null => {
    if (!values) return null;
    const parts = values.split('/').map(part => part.trim());
    return parts.length > 0 && parts.every(part => OPTION.test(part))
        ? parts
        : null;
};

/** Параметры, которые робот передаёт в query (без /run-only). */
export const isRobotQueryParam = (param: HookParam): boolean =>
    param.where === 'query' && !param.runOnly;

/** Значение в адресе: подстановки `{{…}}` остаются как есть, остальное кодируется. */
const encodeQueryValue = (value: string): string =>
    value
        .split(PLACEHOLDER)
        .map(part => (PLACEHOLDER.test(part) ? part : encodeURIComponent(part)))
        .join('');

/**
 * Адрес вебхука для робота: хост + путь ручки (без её собственного query)
 * + непустые значения в порядке `values`. Подстановки Битрикса `{{ID}}`
 * не кодируются — их заменяет сам Битрикс.
 */
export const buildWebhookUrl = (
    baseUrl: string,
    path: string,
    values: Record<string, string>,
): string => {
    const base = baseUrl.replace(/\/+$/, '');
    const cleanPath = path.split('?')[0] ?? '';
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    const query = Object.entries(values)
        .filter(([, value]) => value.trim() !== '')
        .map(
            ([name, value]) =>
                `${encodeURIComponent(name)}=${encodeQueryValue(value.trim())}`,
        )
        .join('&');
    return query ? `${base}${normalizedPath}?${query}` : `${base}${normalizedPath}`;
};

/**
 * Стартовые значения конструктора: обязательные параметры-идентификаторы
 * (`leadId`, `dealId`, …) робот подставляет сам — `{{ID}}`; остальное пусто.
 */
export const initialWebhookValues = (
    params: readonly HookParam[],
): Record<string, string> =>
    Object.fromEntries(
        params
            .filter(isRobotQueryParam)
            .map(param => [
                param.name,
                param.required && HOOK_ID_LIKE_PARAMS.includes(param.name)
                    ? BITRIX_ID_PLACEHOLDER
                    : '',
            ]),
    );
