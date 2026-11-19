import {
    OFFER_LETTER_IMPORT_STATUS,
    OFFER_LETTER_SCOPE,
    type OfferLetterImportStatus,
    type OfferLetterScopeFilter,
} from '../model';

/** Временная ручка переноса писем: после переноса удаляется вместе с кнопкой */
export const OFFER_LETTERS_IMPORT_URL =
    '/api/admin/maintenance/offer-letters/import-legacy';

export const OFFER_LETTER_IMPORT_STATUS_LABEL: Record<OfferLetterImportStatus, string> = {
    [OFFER_LETTER_IMPORT_STATUS.WOULD_CREATE]: 'Будет перенесено',
    [OFFER_LETTER_IMPORT_STATUS.CREATED]: 'Перенесено',
    [OFFER_LETTER_IMPORT_STATUS.EXISTS]: 'Уже перенесено',
    [OFFER_LETTER_IMPORT_STATUS.EMPTY]: 'Пустое, пропущено',
};

/** Ручки CRUD писем КП (`apps/admin`, `OfferLettersController`) */
export const OFFER_LETTERS_API_BASE = '/api/admin/konstructor/offer-letters';
export const OFFER_LETTERS_CACHE_KEY = 'konstructor-offer-letters';

/** Пределы совпадают с проверкой бэка (`OfferLetterService`) */
export const OFFER_LETTER_NAME_MAX_LENGTH = 255;
export const OFFER_LETTER_TEXT_MAX_LENGTH = 5000;
export const OFFER_LETTER_SORT_MAX = 100000;

export const OFFER_LETTER_SCOPE_OPTIONS: ReadonlyArray<{
    value: OfferLetterScopeFilter;
    label: string;
}> = [
    { value: OFFER_LETTER_SCOPE.ALL, label: 'Все письма' },
    { value: OFFER_LETTER_SCOPE.PORTAL, label: 'Письма портала' },
    { value: OFFER_LETTER_SCOPE.PERSONAL, label: 'Личные письма менеджеров' },
];

export const OFFER_LETTER_PAGE_TEXT = {
    title: 'Письма КП',
    tabLetters: 'Письма',
    tabImport: 'Перенос из старого шаблона',
} as const;

export const OFFER_LETTER_TEXT = {
    description:
        'Сопроводительные письма коммерческих предложений. У портала и у каждого менеджера ' +
        'может быть несколько писем, одно из них подставляется по умолчанию. ' +
        'Выключенное письмо в КП не попадает.',
    portal: 'Портал',
    portalPlaceholder: 'Выберите портал',
    portalSearch: 'Домен портала',
    portalEmpty: 'Портал не найден',
    portalPrompt: 'Выберите портал, чтобы увидеть его письма.',
    scopeFilter: 'Чьи письма',
    create: 'Создать письмо',
    loadError: 'Не удалось загрузить письма.',
    empty: 'У портала пока нет писем.',
    emptyFilter: 'В этой выборке писем нет.',
    portalScope: 'Портал',
    defaultBadge: 'По умолчанию',
    defaultHint: 'Письмо по умолчанию меняется назначением другого письма области.',
    inactiveHint: 'Выключенное письмо нельзя назначить письмом по умолчанию.',
    edit: 'Изменить',
    remove: 'Удалить',
} as const;

export const OFFER_LETTER_COLUMN = {
    name: 'Название',
    scope: 'Чьё письмо',
    isActive: 'Активно',
    isDefault: 'По умолчанию',
    sort: 'Порядок',
    updatedAt: 'Изменено',
    actions: 'Действия',
} as const;

export const OFFER_LETTER_DIALOG_TEXT = {
    createTitle: 'Новое письмо КП',
    createDescription: 'Письмо портала или личное письмо менеджера.',
    editTitle: 'Письмо КП',
    name: 'Название',
    namePlaceholder: 'Например, письмо для новых клиентов',
    scope: 'Чьё письмо',
    scopePortal: 'Письмо портала',
    scopePersonal: 'Личное письмо менеджера',
    manager: 'Менеджер',
    managerPrompt: 'Выберите менеджера',
    isActive: 'Активно',
    isDefault: 'Письмо по умолчанию',
    isDefaultHint:
        'Первое активное письмо области становится письмом по умолчанию само.',
    sort: 'Порядок в списке',
    sortHint: 'Меньше — выше.',
    deactivateDefaultHint:
        'Это письмо стоит по умолчанию. Если его выключить, место займёт следующее активное письмо.',
    cancel: 'Отмена',
    create: 'Создать',
    creating: 'Создаю…',
    save: 'Сохранить',
    saving: 'Сохраняю…',
    createdToast: 'Письмо создано',
    savedToast: 'Письмо сохранено',
    saveError: 'Не удалось сохранить письмо',
} as const;

/** Чьё письмо создаётся: письмо портала или личное письмо менеджера */
export const OFFER_LETTER_FORM_SCOPE_OPTIONS: ReadonlyArray<{
    value: OfferLetterScopeFilter;
    label: string;
}> = [
    { value: OFFER_LETTER_SCOPE.PORTAL, label: OFFER_LETTER_DIALOG_TEXT.scopePortal },
    { value: OFFER_LETTER_SCOPE.PERSONAL, label: OFFER_LETTER_DIALOG_TEXT.scopePersonal },
];

/** Действия над письмами в таблице: подписи и сообщения о результате */
export const OFFER_LETTER_ACTION_TEXT = {
    activatedToast: 'Письмо включено',
    deactivatedToast: 'Письмо выключено',
    toggleError: 'Не удалось изменить письмо',
    defaultToast: 'Письмо назначено письмом по умолчанию',
    defaultError: 'Не удалось назначить письмо по умолчанию',
    deletedToast: 'Письмо удалено',
    deleteError: 'Не удалось удалить письмо',
} as const;

export const OFFER_LETTER_DELETE_TEXT = {
    title: 'Удалить письмо?',
    confirm: 'Удалить',
    descriptionDefault:
        'Это письмо стоит по умолчанию. После удаления его место займёт следующее активное письмо области.',
    description: 'Письмо будет удалено без возможности восстановления.',
} as const;
