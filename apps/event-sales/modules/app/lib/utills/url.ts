import { BASE_PATH } from './base-path';

/**
 * ЕДИНСТВЕННОЕ место сборки ссылок приложения. Строк вида
 * `https://${domain}/crm/...` больше нигде быть не должно.
 *
 * Почему так строго: приложение живёт во фрейме ЧУЖОГО портала и под общим
 * доменом next.april-app.ru, где в корне стоит другое приложение (kpi-sales).
 * Ссылка, собранная мимо этих правил, уводит менеджера не туда — в лучшем
 * случае в соседний отчёт, в худшем в чужой портал. Оба случая уже ловились
 * живьём:
 *  - пустой `domain` давал `https:///crm/lead/...`, и браузер понимал это
 *    как путь на ТЕКУЩЕМ хосте → открывался kpi-sales;
 *  - внутренний путь без basePath уходил в корень домена, туда же.
 */

/** Сущности CRM, на карточки которых мы ссылаемся. */
export type CrmEntityKind = 'lead' | 'deal' | 'company' | 'contact';

const CRM_PATH: Record<CrmEntityKind, string> = {
    lead: 'lead',
    deal: 'deal',
    company: 'company',
    contact: 'contact',
};

/** Домен портала пригоден для ссылки: непустой, без схемы и слэшей. */
const normalizeDomain = (domain: string | null | undefined): string | null => {
    const value = String(domain ?? '')
        .trim()
        .replace(/^https?:\/\//i, '')
        .replace(/\/+$/, '');
    // Домен портала всегда содержит точку (portal.bitrix24.ru). Без этой
    // проверки мусорное значение превратилось бы в путь текущего хоста.
    return value && value.includes('.') ? value : null;
};

/**
 * Карточка CRM-сущности в портале. Домена нет — возвращаем null, и вызывающий
 * НЕ рисует ссылку: лучше не дать ссылку, чем увести не туда.
 */
export const getCrmUrl = (
    domain: string | null | undefined,
    kind: CrmEntityKind,
    id: number | string | null | undefined,
): string | null => {
    const host = normalizeDomain(domain);
    const entityId = Number(id);
    if (!host || !Number.isFinite(entityId) || entityId <= 0) return null;
    return `https://${host}/crm/${CRM_PATH[kind]}/details/${entityId}/`;
};

/**
 * ПУТЬ карточки CRM-сущности внутри портала (без домена) — для слайдера
 * Битрикса: он открывается поверх текущей страницы и требует именно путь.
 */
export const getCrmPath = (
    kind: CrmEntityKind,
    id: number | string | null | undefined,
): string | null => {
    const entityId = Number(id);
    if (!Number.isFinite(entityId) || entityId <= 0) return null;
    return `/crm/${CRM_PATH[kind]}/details/${entityId}/`;
};

/**
 * Карточка задачи в портале. Группа известна — ссылка в группе (там задача
 * открывается в своём контексте), иначе универсальный путь через
 * ответственного: портал сам разрулит доступ.
 */
export const getTaskUrl = (
    domain: string | null | undefined,
    taskId: number | string | null | undefined,
    options: { groupId?: number | null; userId?: number | null } = {},
): string | null => {
    const host = normalizeDomain(domain);
    const id = Number(taskId);
    if (!host || !Number.isFinite(id) || id <= 0) return null;

    const groupId = Number(options.groupId);
    if (Number.isFinite(groupId) && groupId > 0) {
        return `https://${host}/workgroups/group/${groupId}/tasks/task/view/${id}/`;
    }
    const userId = Number(options.userId);
    const owner = Number.isFinite(userId) && userId > 0 ? userId : 0;
    return `https://${host}/company/personal/user/${owner}/tasks/task/view/${id}/`;
};

/**
 * Внутренний путь приложения (страницы, статика) с учётом basePath.
 * Для `next/link` и `router.push` НЕ нужен — они префиксуют сами.
 */
export const getAppUrl = (path: string): string => {
    if (!path.startsWith('/')) return path;
    if (BASE_PATH && path.startsWith(`${BASE_PATH}/`)) return path;
    return `${BASE_PATH}${path}`;
};
