import { AccessContext, EAccessFeature } from './access.types';

/**
 * ЦЕНТРАЛЬНАЯ ТАБЛИЦА ПРАВ — единственное место, где настраивается
 * «кому что видно». Новое ограничение = ключ в EAccessFeature + правило
 * здесь; потребители ничего не знают о ролях, только useAccess(key).
 *
 * Текущие правила:
 * - FINANCE_TAB: флаг приложения включён И (суперюзер ИЛИ руководитель
 *   отдела 'op' ИЛИ вышестоящий 'cup'). Руководители групп и рядовые —
 *   не видят. Скоуп ДАННЫХ отдельно не ограничиваем: assignedIds всегда
 *   идут из периметра структуры (op видит свой отдел, cup — все отделы
 *   при isMulti) — это уже обеспечивает computeDepartmentScope.
 * - VIEW_AS: только реальный суперюзер (кнопка не исчезает в самом
 *   режиме viewAs — иначе из него не выйти).
 *
 * Задел: когда настройки прав станут пер-портальными (санка с бэка,
 * appActions.setFeatures), правила останутся прежними — поменяется
 * только источник ctx.features.
 */
export const ACCESS_RULES: Record<
    EAccessFeature,
    (ctx: AccessContext) => boolean
> = {
    [EAccessFeature.FINANCE_TAB]: ctx =>
        ctx.features.financeTab &&
        (ctx.isSuperUser || ctx.headOf === 'op' || ctx.headOf === 'cup'),

    [EAccessFeature.VIEW_AS]: ctx => ctx.isRealSuperUser,

    // Командное эфирное время — любой руководитель (group/op/cup) или
    // суперюзер; рядовой менеджер видит только собственную карточку
    // (данные и так порезаны периметром — правило страхует UI).
    [EAccessFeature.AIRTIME_TEAM]: ctx =>
        ctx.isSuperUser || ctx.headOf !== null,

    // Публичные ссылки на отчёт — ВРЕМЕННО только суперюзер (обкатка в
    // проде); после проверки вернуть руководителей:
    // ctx.isSuperUser || ctx.headOf !== null
    [EAccessFeature.SHARE_LINKS]: ctx => ctx.isSuperUser,

    // ПЛАНЫ РУКОВОДИТЕЛЯ (не путать с kpi-«планами» из CRM-задач):
    // видеть свои — любой сотрудник при включённой фиче; видеть всех —
    // любой руководитель; настраивать — op/cup и суперюзер.
    [EAccessFeature.PLANS_VIEW]: ctx => ctx.features.plans,

    [EAccessFeature.PLANS_VIEW_ALL]: ctx =>
        ctx.features.plans && (ctx.isSuperUser || ctx.headOf !== null),

    [EAccessFeature.PLANS_CONFIGURE]: ctx =>
        ctx.features.plans &&
        (ctx.isSuperUser || ctx.headOf === 'op' || ctx.headOf === 'cup'),
};

/** Проверка доступа — чистая функция, удобна и вне React (thunks/утилы). */
export const checkAccess = (
    feature: EAccessFeature,
    ctx: AccessContext,
): boolean => ACCESS_RULES[feature](ctx);
