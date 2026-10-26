/** Тексты раздела «Поддержка клиентов». */
export const SUPPORT_TEXT = {
    title: 'Поддержка клиентов',
    lineLabel: 'Портал линии:',
    loading: 'Загружаем путеводитель…',
    loadError: 'Не удалось загрузить путеводитель поддержки',
    checklistTitle: 'Что осталось, чтобы заработало',
    checklistDescription:
        'Пункты по настройкам портала линии проверяются сами. «Проверить вручную» — то, что живёт в env приложения bot или на порталах.',
    checklistSummary: (done: number, total: number) => `готово ${done} из ${total}`,
    previewTitle: 'Проверить линию сейчас',
    previewDescription:
        'Открытые диалоги и оповещения, которые бот отправил бы прямо сейчас. Ничего не отправляется и не запоминается.',
    previewButton: 'Проверить линию',
    previewRunning: 'Смотрим линию…',
    previewError: 'Линию прочитать не удалось',
    previewDryRun: 'Монитор в режиме «только считать»: сверка с памятью пробного прогона.',
    previewNoDialogs: 'Открытых диалогов нет.',
    previewNoSignals: 'Сейчас бот ничего бы не отправил.',
    previewDialogsTitle: 'Открытые диалоги',
    previewSignalsTitle: 'Ушло бы сейчас',
    dialogOpen: 'Открыть диалог',
    dialogCrm: 'Карточка CRM',
    dialogNoOperator: 'никто не взял',
    linksTitle: 'Смежные разделы',
} as const;
