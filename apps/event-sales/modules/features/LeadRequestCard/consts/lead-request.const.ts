/** Тексты и подписи фичи «Карточка заявки» — единая точка правок. */
export const LEAD_REQUEST_TEXT = {
    titleRequest: 'Заявка',
    titleLead: 'Лид',
    questLink: 'Оценка',
    partnerCode: 'Код партнёра',
    emptyText: 'Лид не найден.',
    selectPlaceholder: '— не отмечено —',
    historyShow: 'История обработки',
    historyHide: 'Скрыть историю',
    readinessMissingPrefix: 'Осталось отметить',
    notAcceptedTitle: 'Заявка не принята в работу',
    notAcceptedHint:
        'Подтвердите принятие или передайте заявку другому сотруднику ' +
        'вашего отдела — до этого отправка отчёта заблокирована.',
    gateHint:
        'Заявка назначена вам и ждёт решения. Не подтвердите в течение часа — ' +
        'она уйдёт другому сотруднику.',
    gateSkip: 'Пропустить и посмотреть карточку',
    acceptButton: 'Взять в работу',
    transferButton: 'Передать другому',
    sendBlockedByAccept: 'Сначала примите заявку в работу',
    foreignTitle: 'Заявка назначена другому сотруднику',
    foreignHint:
        'После передачи заявку принимает новый ответственный. ' +
        'Работа по ней вам недоступна.',
    sendBlockedByForeign: 'Заявка назначена другому сотруднику',
    openWorkButton: 'Открыть текущую работу',
    openWorkHereHint: 'Работа по этой заявке — сделка, в которой вы сейчас.',
    convertButton: 'Преобразовать в работу',
    convertHint:
        'Создаст сделку в вашей воронке по стадии лида и перенесёт задачи.',
    convertQueued: 'Преобразование запущено — сделка появится через минуту.',
    deepCheckButton: 'Проверить на дубли',
    deepCheckQueued:
        'Глубокая проверка запущена — итог появится в timeline лида.',
} as const;

/** Подписи enum-полей карточки. */
export const LEAD_REQUEST_ENUM_LABEL = {
    siteStatusCode: 'Статус заявки',
    siteStageCode: 'Стадия заявки',
    leadStatusCode: 'Статус лида',
    notCaTypeCode: 'Тип «не ЦА»',
} as const;

/** Подписи булевых маркеров карточки. */
export const LEAD_REQUEST_BOOL_LABEL = {
    boostSale: 'Повлиял на продажу',
    nppReported: 'Отчёт в НПП',
    blackShort: 'Не звонить никогда',
} as const;
