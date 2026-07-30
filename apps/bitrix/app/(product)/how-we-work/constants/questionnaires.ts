import { HowQuestionnaire, HowQuestionnaireId } from './types';

/** Анкета 1: процесс и отчётность. */
const PROCESS_QUESTIONNAIRE: HowQuestionnaire = {
    id: 'process',
    title: 'Анкета 1 · Процесс и отчётность',
    description:
        'Определяет режим работы отдела. Рекомендуемые варианты отмечены галочкой — их можно менять, но осознанно.',
    protocolTitle: 'ПРОТОКОЛ — процесс и отчётность (внедрение April)',
    questions: [
        {
            id: 'kpi-mode',
            title: 'Как менеджеры отчитываются о звонках?',
            hint: 'Определяет режим KPI-отчёта. «События» — максимально детальный KPI; «Звонки» — факт берётся из АТС, через форму отмечаются только ключевые события.',
            options: [
                {
                    value: 'каждый звонок через форму (режим «События»)',
                    recommended: true,
                },
                { value: 'только презентации и ключевые события (режим «Звонки»)' },
                { value: 'оба ряда рядом (режим «Объединённый»)' },
            ],
        },
        {
            id: 'capacity',
            title: 'Лимит клиентов в работе на менеджера (правило ёмкости)',
            hint: 'Типично 30–80 в зависимости от цикла сделки. Лимит мотивирует менеджера самому освобождать место от бесперспективных клиентов.',
            options: [{ value: '50', recommended: true }, { value: '30' }, { value: '80' }],
            allowCustom: true,
            commentPlaceholder: 'Почему такое значение (необязательно)',
        },
        {
            id: 'set-aside',
            title: 'Порог статуса «Отложено»',
            hint: 'Клиенты со следующим контактом дальше порога отделяются от живой работы.',
            options: [
                { value: '5 месяцев', recommended: true },
                { value: '3 месяца' },
                { value: '6 месяцев' },
            ],
            allowCustom: true,
        },
        {
            id: 'widgets',
            title: 'Где включаем вкладку «Звонки»?',
            options: [
                {
                    value: 'компания + сделка + задача + окно звонка',
                    recommended: true,
                },
                { value: 'везде, включая карточку лида' },
                { value: 'только компания и сделка' },
            ],
            allowCustom: true,
        },
        {
            id: 'telephony',
            title: 'Какая телефония используется?',
            hint: 'Нужно для детализации звонков и ИИ-анализа: важно, пишутся ли записи разговоров.',
            options: [
                { value: 'телефония Битрикс24, записи включены' },
                { value: 'сторонняя АТС с интеграцией в Битрикс24' },
            ],
            allowCustom: true,
            commentPlaceholder: 'Название АТС, пишутся ли записи',
        },
        {
            id: 'finance',
            title: 'Финансовый блок KPI-отчёта',
            options: [
                { value: 'включить', recommended: true },
                { value: 'не включать' },
            ],
        },
    ],
};

/** Анкета 2: входящий поток (лиды). */
const INBOUND_QUESTIONNAIRE: HowQuestionnaire = {
    id: 'inbound',
    title: 'Анкета 2 · Входящий поток',
    description:
        'Семь решений проектного стандарта по работе с заявками, звонками и импортами.',
    protocolTitle: 'ПРОТОКОЛ — входящий поток (внедрение April)',
    questions: [
        {
            id: 'profile',
            title: 'Профиль работы с лидами',
            hint: 'A — короткий карантин до опознания, вся продажа в сделках (одна воронка правды). B — только при малом чистом потоке с диспетчером. C — если действующий лидовый процесс дороже ломать.',
            options: [
                { value: 'A · «Лид-минимум»', recommended: true },
                { value: 'B · «Без лидов»' },
                { value: 'C · «Лид-центричный»' },
            ],
        },
        {
            id: 'workplace',
            title: 'Откуда работают менеджеры?',
            hint: 'Фиксируется единым решением руководителя для всего отдела. Форма и KPI одинаковы в любом варианте.',
            options: [
                {
                    value: 'из сделок и из лидов — одна форма',
                    recommended: true,
                },
                { value: 'только из сделок' },
                { value: 'только из лидов (профиль C)' },
            ],
        },
        {
            id: 'pres-before-id',
            title: 'Презентация из лида до опознания компании',
            hint: 'Строгий вариант защищает от презентаций «неизвестно кому», которые не к чему привязать.',
            options: [
                {
                    value: 'запрещена — «сначала узнай компанию»',
                    recommended: true,
                },
                { value: 'разрешена' },
            ],
        },
        {
            id: 'live-deal',
            title: 'Порог «живой сделки» (клиент уже в работе)',
            hint: 'Определяет, когда заявка уходит действующему менеджеру, а когда открывается новая работа.',
            options: [
                { value: 'любая незакрытая сделка', recommended: true },
                { value: 'незакрытая с активностью за N месяцев' },
            ],
            allowCustom: true,
            commentPlaceholder: 'Если N — укажите значение',
        },
        {
            id: 'site-smart',
            title: 'Отдельная воронка заявок с сайта + SLA',
            hint: 'Даёт SLA обработки, конверсию заявок независимо от судьбы сделки, группировку заявок одной компании.',
            options: [
                { value: 'включить', recommended: true },
                { value: 'не включать' },
            ],
            commentPlaceholder: 'SLA (например, 2 часа) и кому эскалируется',
        },
        {
            id: 'imports',
            title: 'Импортированные базы',
            hint: 'Карантин — стандартная защита KPI и воронки от случайного мусора.',
            options: [
                {
                    value: 'карантин + выпуск порциями по решению руководителя',
                    recommended: true,
                },
                { value: 'сразу в работу (не рекомендуем)' },
            ],
        },
        {
            id: 'territory',
            title: 'Пересечения с партнёрской сетью («чужая территория»)',
            options: [
                {
                    value: 'справочник территорий + регламент передачи',
                    recommended: true,
                },
                { value: 'решаем вручную по факту' },
            ],
            commentPlaceholder: 'Источник справочника, регламент',
        },
    ],
};

/** Анкета 3: справочники и роли. */
const CATALOGS_QUESTIONNAIRE: HowQuestionnaire = {
    id: 'catalogs',
    title: 'Анкета 3 · Справочники и роли',
    description:
        'Адаптация формулировок и распределение ролей процесса в вашей команде.',
    protocolTitle: 'ПРОТОКОЛ — справочники и роли (внедрение April)',
    questions: [
        {
            id: 'fail-reasons',
            title: 'Формулировки причин отказов и недозвонов',
            options: [
                { value: 'используем стандартные', recommended: true },
                { value: 'адаптируем под нас' },
            ],
            commentPlaceholder: 'Что изменить в формулировках',
        },
        {
            id: 'categories',
            title: 'Категории клиентов (размер/значимость)',
            options: [
                { value: 'стандартные', recommended: true },
                { value: 'свои' },
            ],
            commentPlaceholder: 'Ваши категории',
        },
        {
            id: 'rop-role',
            title: 'Кто выполняет роль руководителя в процессе?',
            hint: 'Эскалации по дублям, выпуск импорта, слияния, передачи клиентов.',
            options: [
                { value: 'руководитель отдела продаж', recommended: true },
                { value: 'коммерческий директор' },
                { value: 'выделенный администратор CRM' },
            ],
            allowCustom: true,
        },
        {
            id: 'transfer-role',
            title: 'Кто отвечает за передачу клиентов между менеджерами?',
            options: [
                { value: 'тот же руководитель', recommended: true },
                { value: 'отдельный сотрудник' },
            ],
            allowCustom: true,
        },
    ],
};

export const HOW_QUESTIONNAIRES: Record<HowQuestionnaireId, HowQuestionnaire> =
    {
        process: PROCESS_QUESTIONNAIRE,
        inbound: INBOUND_QUESTIONNAIRE,
        catalogs: CATALOGS_QUESTIONNAIRE,
    };
