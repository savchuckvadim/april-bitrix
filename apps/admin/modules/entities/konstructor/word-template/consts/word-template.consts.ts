export const WORD_TEMPLATE_PATH = '/konstructor/word-template';
export const WORD_TEMPLATE_LIST_CASH_KEY = 'word-templates';
export const WORD_TEMPLATE_ITEM_CASH_KEY = 'word-template';
/** Привязки шаблона к порталам (offer_template_portal). */
export const WORD_TEMPLATE_PORTALS_CASH_KEY = 'word-template-portals';
/** Пользователи отдела продаж портала — для режима «от лица пользователя». */
export const DEPARTMENT_USERS_CASH_KEY = 'department-users';

/**
 * Подписи видимости шаблона КП. Словарь бэкенда — public | private | user;
 * «private» и есть портальная область (привязка через offer_template_portal).
 */
export const WORD_TEMPLATE_VISIBILITY_LABELS: Record<string, string> = {
    public: 'Публичный',
    private: 'Портальный',
    user: 'Пользовательский',
};

export const getWordTemplateVisibilityLabel = (code: string | null | undefined): string =>
    code ? (WORD_TEMPLATE_VISIBILITY_LABELS[code] ?? code) : '—';
