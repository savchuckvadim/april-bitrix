/*
 * Подсказки к ошибкам секций вкладки. В `section.error` лежит текст
 * сервера из тела 403/400 (`lib/ai-error.util.ts` сущности) либо
 * сообщение axios «Request failed with status code 403». По тексту
 * узнаём типовые случаи и добавляем строку «что это значит».
 */

export const AI_SECTION_ERROR_HINTS = {
    /** Менеджер без роли руководителя при выключенной self_view. */
    selfView:
        'Витрина AI-аналитики открыта руководителям. Чтобы менеджеры видели свои данные, включите ai_analytics_self_view_enabled в настройках приложения на портале.',
    /** Раздел выключен признаком портала (план дня и т. п.). */
    disabled:
        'Раздел выключен настройкой портала: включите его в настройках приложения kpi-sales — данные появятся без пересчёта.',
    /** Менеджер вне периметра видимости по структуре. */
    scope: 'Менеджер не входит в ваш периметр видимости по структуре компании.',
    /** Действие только руководителям cup/op/group. */
    leaderOnly: 'Действие доступно только руководителю отдела продаж.',
    /** 403 без распознанного текста. */
    forbidden:
        'Доступ запрещён (403): проверьте роль в структуре компании и настройки AI-аналитики на портале.',
} as const;

export type AiSectionErrorKind = keyof typeof AI_SECTION_ERROR_HINTS;

const FORBIDDEN_CODE = /\b403\b/;

/** Типовой случай ошибки по тексту сервера или коду axios; null — не типовой. */
export const detectAiSectionErrorKind = (
    error: string | null | undefined,
): AiSectionErrorKind | null => {
    if (!error) return null;
    const text = error.toLowerCase();
    if (text.includes('self_view') || text.includes('доступна руководителям')) {
        return 'selfView';
    }
    if (text.includes('выключен') || text.includes('_enabled')) {
        return 'disabled';
    }
    if (text.includes('вне периметра')) return 'scope';
    if (text.includes('только руководител')) return 'leaderOnly';
    if (FORBIDDEN_CODE.test(text) || text.includes('forbidden')) {
        return 'forbidden';
    }
    return null;
};

/** Подсказка «что это значит» к ошибке секции; null — подсказки нет. */
export const aiSectionErrorHint = (
    error: string | null | undefined,
): string | null => {
    const kind = detectAiSectionErrorKind(error);
    return kind ? AI_SECTION_ERROR_HINTS[kind] : null;
};

/** Ошибка доступа/настройки: повтор без изменений на портале не поможет. */
export const isAiSectionAccessError = (
    error: string | null | undefined,
): boolean => detectAiSectionErrorKind(error) !== null;
