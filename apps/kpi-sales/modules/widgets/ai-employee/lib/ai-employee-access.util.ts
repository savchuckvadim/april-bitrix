/*
 * Доступ к AI-разделу страницы сотрудника: вкладка AI открыта (флаги и
 * права), и либо смотрящий — руководитель (видит весь периметр; чужих
 * сервер отсекает сам ответом 403), либо это его собственная страница
 * (режим «вижу себя» при включённой настройке портала — он уже учтён
 * в праве на вкладку).
 */
export interface AiEmployeeAccessInput {
    /** Право на вкладку AI (EAccessFeature.AI_TAB). */
    canTab: boolean;
    /** Право видеть всех (EAccessFeature.AI_VIEW_ALL). */
    canViewAll: boolean;
    /** Bitrix-id эффективного пользователя; null — приложение не инициализировано. */
    requesterId: string | null;
    managerId: string;
}

export interface AiEmployeeAccess {
    allowed: boolean;
    isSelf: boolean;
}

export const resolveAiEmployeeAccess = (
    input: AiEmployeeAccessInput,
): AiEmployeeAccess => {
    const isSelf = input.requesterId !== null && input.requesterId === input.managerId;
    return {
        isSelf,
        allowed: input.canTab && (input.canViewAll || isSelf),
    };
};
