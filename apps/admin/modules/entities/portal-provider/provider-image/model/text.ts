/** Тексты раздела «Печать, подписи, логотип и QR». */
export const PROVIDER_IMAGES_TEXT = {
    title: 'Печать, подписи, логотип и QR',
    description:
        'Картинки реквизитов поставщика. Загруженное попадает в документы, замена действует сразу.',
    notes: 'PNG или JPG, до 2 МБ. Печать и подписи лучше загружать в PNG с прозрачным фоном. QR для оплаты нужен чёткий, с белым полем вокруг кода.',
    loading: 'Загрузка…',
    unavailable: 'Раздел станет доступен после обновления базы',
    loadError: 'Не удалось загрузить картинки поставщика',
    retry: 'Повторить',
    allEmpty: 'Пока ни одной картинки не загружено.',
} as const;

/** Тексты одного слота. */
export const PROVIDER_IMAGE_SLOT_TEXT = {
    empty: 'Не загружено',
    previewLoading: 'Загрузка превью…',
    previewError: 'Не удалось загрузить превью',
    upload: 'Загрузить',
    replace: 'Заменить',
    remove: 'Удалить',
    uploading: 'Загрузка',
    uploadError: 'Не удалось сохранить картинку',
    removeError: 'Не удалось удалить картинку',
    unnamedFile: 'Файл без имени',
} as const;

/** Тексты подтверждения удаления. */
export const PROVIDER_IMAGE_REMOVE_TEXT = {
    title: (roleLabel: string) => `Удалить «${roleLabel}»?`,
    cancel: 'Отмена',
    confirm: 'Удалить',
    removing: 'Удаляю…',
    description:
        'Картинка исчезнет из документов поставщика. Вернуть можно только новой загрузкой.',
} as const;

/** Тексты проверки файла до отправки. */
export const PROVIDER_IMAGE_CHECK_TEXT = {
    wrongType: 'Подходят только файлы PNG и JPG. Остальные форматы пересохраните в PNG или JPG',
    empty: 'Файл пустой — выберите другой',
    tooLarge: (sizeLabel: string, limitLabel: string) =>
        `Файл весит ${sizeLabel}, предел — ${limitLabel}. Сожмите картинку или пересохраните в JPG`,
    serverTooLarge: (limitLabel: string) =>
        `Файл больше, чем принимает сервер: предел — ${limitLabel}`,
    timeout: 'Загрузка не уложилась по времени — проверьте связь или сожмите файл',
} as const;
