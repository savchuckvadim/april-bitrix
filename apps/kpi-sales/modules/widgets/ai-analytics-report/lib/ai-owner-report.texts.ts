import {
    AI_OWNER_REPORT_DELIVERY_STATUSES,
    type AiOwnerReportDelivery,
    type AiOwnerReportDeliveryReason,
    type AiOwnerReportKind,
} from '@/modules/entities/ai-analytics';

/*
 * Тексты подвкладки «Отчёт за период» (отчёт собственнику). Сам текст
 * отчёта приходит с сервера готовыми фразами; здесь — только обвязка:
 * выбор периода, состояния, подписи колонок и кнопок.
 */

export const AI_OWNER_REPORT_TEXT = {
    title: 'Отчёт собственнику за период',
    description:
        'Управленческий отчёт по отделу продаж за закрытый период: где теряем продажи, как управляется отдел, что делать с каждым сотрудником. Собирается из разборов звонков; резюме и выводы пишет модель по фактам.',
    kindLabel: 'Период',
    periodLabel: 'Какой',
    latestOption: 'последний закрытый',
    rebuild: {
        label: 'Собрать заново',
        title: 'Пересобрать отчёт',
        lines: [
            'Факты и текст считаются заново по всем разговорам периода.',
            'Пригодится после появления новых разборов или смены настроек.',
        ],
    },
    pdf: {
        label: 'Скачать PDF',
        title: 'Скачать отчёт файлом',
        error: 'Не удалось скачать PDF',
    },
    send: {
        label: 'Отправить себе',
        title: 'Отправить отчёт себе в Битрикс24',
        lines: [
            'Личное сообщение с кратким содержанием и PDF придёт вам — так же, как собственнику при рассылке.',
            'Удобно проверить доставку до того, как включать рассылку.',
        ],
        sent: 'Отправлено: проверьте личные сообщения в Битрикс24.',
        dryRun: 'Режим «только считать»: отчёт собран, сообщение не отправлено.',
        skipped: {
            'ai-analytics-disabled':
                'AI-аналитика на портале выключена — отправлять нечего.',
            disabled: 'Выпуск отчёта выключен в настройках портала.',
            'no-recipients': 'Получатель не определён.',
            'not-delivered': 'Сообщение не доставлено — попробуйте позже.',
        } satisfies Record<AiOwnerReportDeliveryReason, string>,
        skippedDefault: 'Отправка пропущена.',
        failed: 'Сообщение не доставлено — попробуйте позже.',
        error: 'Не удалось отправить отчёт',
        openPdf: 'Открыть PDF',
    },
    loading: {
        queued: 'Отчёт поставлен в очередь: собираем разговоры периода…',
        processing: 'Считаем факты и пишем текст — обычно одна-две минуты.',
        default: 'Загружаем отчёт…',
    },
    generatedAt: (date: string) => `Собран ${date}`,
    source: {
        model: 'резюме, утечки и выводы по сотрудникам написала модель',
        template: 'текст собран шаблоном',
    },
    noScope: 'Отчёт доступен руководителям отдела продаж.',
    sections: {
        attention: 'На что обратить внимание',
        glossary: 'Как читать отчёт',
        summary: 'Коротко для собственника',
        overview: 'Общая картина',
        outcomes: 'Чем заканчиваются разговоры',
        typeGroups: 'По видам разговоров',
        weeks: 'По неделям',
        funnel: 'Воронка и конверсии',
        crmFunnel: 'Воронка по CRM',
        presentations: 'Презентации',
        presentationRows: 'Что видно в показах',
        presentationSections: 'Оценки разделов показа',
        leaks: 'Где теряем продажи',
        management: 'Как управляется отдел',
        objections: 'Возражения и где клиенты остывают',
        issues: 'Сбои не по вине разговора',
        metrics: 'Что держать под контролем',
        managers: 'Сотрудники',
        methodology: 'Как считали и что не учтено',
    },
    columns: {
        outcome: 'Исход',
        calls: 'Разговоров',
        share: 'Доля',
        typeGroup: 'Вид разговора',
        advanced: 'Шаг вперёд',
        callbackDated: 'Перезвон с датой',
        postponed: 'Отложено без даты',
        refused: 'Отказ',
        noContact: 'Без контакта',
        unmarked: 'Не размечено',
        stage: 'Этап',
        undecided: 'Без решения',
        invoiceAgreed: 'Согласие на счёт',
        indicator: 'Показатель',
        previous: 'Прошлый период',
        week: 'Неделя',
        cold: 'Холодных',
        coldAdvanced: 'Холодные → шаг вперёд',
        contacted: 'С ЛПР',
        contactedAdvanced: 'С ЛПР → шаг вперёд',
        note: 'Пометка',
        sign: 'Признак',
        verdict: 'Вердикт',
        detail: 'Что видно в разговорах',
        topic: 'Возражение',
        handled: 'Отработано',
        advancedAfter: 'Продвинуты после',
        issue: 'Сбой',
        examples: 'Примеры',
        metric: 'Показатель',
        value: 'За период',
        lastWeek: 'Последняя полная неделя',
        why: 'Почему важно',
        ifIgnored: 'Если не заниматься',
        employee: 'Сотрудник',
    },
    leak: {
        scale: 'Масштаб',
        money: 'Деньги',
        nature: 'Природа',
        action: 'Что сделать',
        example: (index: number) => `Разбор ${index}`,
        linkTitle: 'Открыть карточку разбора в Битрикс24',
    },
    manager: {
        strengths: 'Сильные стороны',
        risks: 'Риски',
        conclusion: 'Вывод для собственника',
        table: 'Показатели по сотрудникам',
        cards: 'Карточки',
    },
    writtenBy: {
        model: 'написано моделью',
        template: 'шаблон',
    },
    funnel: {
        afterOfferTitle: 'Где застревают деньги',
    },
    presentations: {
        comparisonTitle: 'Что работает',
    },
} as const;

export const AI_OWNER_REPORT_KIND_LABELS: Readonly<Record<AiOwnerReportKind, string>> = {
    month: 'Месяц',
    quarter: 'Квартал',
    half_year: 'Полугодие',
    year: 'Год',
};

/** Колонки таблицы сотрудников — коды ячеек сервера и подписи. */
export const AI_OWNER_REPORT_MANAGER_COLUMNS = [
    ['calls', 'Разговоров (доля)'],
    ['coldAdvanced', 'Холодные → шаг вперёд'],
    ['contactedAdvanced', 'С ЛПР → шаг вперёд'],
    ['reactivationAdvanced', 'Возврат → шаг вперёд'],
    ['needsFound', 'Выяснил задачи'],
    ['presentationByNeeds', 'Показ под задачи'],
    ['closingAttempted', 'Попытка закрытия'],
    ['nextStepDated', 'Шаг с датой'],
    ['objectionsHandled', 'Отработал возражения'],
    ['postponedWithDate', 'Отложено с датой'],
    ['conflict', 'Конфликтный тон'],
    ['evasive', 'Ушёл от ответа'],
    ['advancedShareOfTeam', 'Доля в продвижениях команды'],
    ['upsellShareOfTeam', 'Доля в допродажах'],
    ['crm', 'Сделки / счета / показы'],
] as const;

const MONTHS_NOMINATIVE = [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
] as const;

/** Ключ периода словами: «октябрь 2026», «4 квартал 2026», «2 полугодие 2026», «2026 год». */
export const aiOwnerReportPeriodLabel = (
    kind: AiOwnerReportKind,
    periodKey: string,
): string => {
    const year = periodKey.slice(0, 4);
    switch (kind) {
        case 'month': {
            const month = Number(periodKey.slice(5, 7));
            const name = MONTHS_NOMINATIVE[month - 1];
            return name ? `${name} ${year}` : periodKey;
        }
        case 'quarter':
            return `${periodKey.slice(6, 7)} квартал ${year}`;
        case 'half_year':
            return `${periodKey.slice(6, 7)} полугодие ${year}`;
        default:
            return `${year} год`;
    }
};

/** Дата сборки словами: «2 ноября 2026, 09:05». */
export const aiOwnerReportGeneratedAt = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/** Итог «Отправить себе» словами: статус доставки и причина пропуска. */
export const aiOwnerReportSendMessage = (result: AiOwnerReportDelivery): string => {
    const S = AI_OWNER_REPORT_TEXT.send;
    switch (result.status) {
        case AI_OWNER_REPORT_DELIVERY_STATUSES.sent:
            return S.sent;
        case AI_OWNER_REPORT_DELIVERY_STATUSES.dry_run:
            return S.dryRun;
        case AI_OWNER_REPORT_DELIVERY_STATUSES.skipped:
            return (result.reason && S.skipped[result.reason]) || S.skippedDefault;
        default:
            return S.failed;
    }
};
