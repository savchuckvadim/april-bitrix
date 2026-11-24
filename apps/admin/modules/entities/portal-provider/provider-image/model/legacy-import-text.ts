/** Тексты переноса картинок из легаси. */
export const PROVIDER_IMAGE_LEGACY_TEXT = {
    open: 'Перенести из легаси',
    title: 'Перенос картинок из легаси',
    description:
        'Переносятся картинки всех порталов из выбранной папки. Сначала нажмите «Проверить»: проверка ничего не меняет и показывает, что будет сделано.',
    pickFolder: 'Выбрать папку',
    repickFolder: 'Выбрать другую папку',
    noFolder: 'Папка не выбрана',
    pickedFiles: (folder: string, count: number) =>
        `Папка «${folder}», картинок PNG и JPG: ${count}`,
    skippedFiles: (count: number) =>
        `Остальные файлы папки (${count}) пропущены: переносятся только PNG и JPG`,
    tooMany: (count: number, limit: number) =>
        `Картинок PNG и JPG в папке: ${count}. За один раз принимается до ${limit}: выберите вложенную папку с меньшим числом файлов`,
    emptySelection: 'В выбранной папке нет файлов PNG и JPG',
    check: 'Проверить',
    checking: 'Проверяю…',
    run: 'Перенести',
    running: 'Переношу…',
    runNeedsCheck: 'Кнопка «Перенести» включится после проверки, в которой есть что переносить',
    close: 'Закрыть',
    requestError: 'Не удалось выполнить запрос переноса',
    checkDone: 'Проверка выполнена. В базе ничего не менялось.',
    runDone: 'Перенос выполнен. Картинки на странице обновлены.',
    reportEmpty: 'Бэк не вернул ни одной строки: для выбранной папки нечего переносить',
    filterAll: 'Все',
    noRowsInFilter: 'В этом статусе строк нет',
    columns: {
        portal: 'Портал',
        rq: 'Реквизиты',
        role: 'Роль',
        file: 'Файл',
        status: 'Статус',
        message: 'Пояснение',
    },
    unknownPortal: '—',
    unknownRole: '—',
    unnamedRq: 'без названия',
} as const;
