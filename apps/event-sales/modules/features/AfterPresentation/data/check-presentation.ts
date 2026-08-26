import {
    CheckPresentationFieldType,
    CheckPresentationItem,
} from '../type/check-presentation-type';

/**
 * TODO(бэк): затычка — опросник должен приходить с бэка под конкретного
 * клиента (см. gap-док). id = code — стабильно между SSR/клиентом.
 */
export const checkPresentationData: CheckPresentationItem[] = [
    {
        id: 'xo_impression',
        type: CheckPresentationFieldType.STRING,
        code: 'xo_impression',
        title: 'Первое впечатление',
        placeholder: 'Опишите первое впечатление от встречи',
        required: true,
        order: 0,
    },
    {
        id: 'xo_remembered',
        type: CheckPresentationFieldType.STRING,
        code: 'xo_remembered',
        title: 'Что запомнили',
        placeholder: 'Что клиент запомнил из презентации',
        required: true,
        order: 1,
    },
    {
        id: 'xo_desire_to_work',
        type: CheckPresentationFieldType.STRING,
        code: 'xo_desire_to_work',
        title: 'Желание работать',
        placeholder: 'Опишите желание клиента работать с нами',
        required: true,
        order: 2,
    },
    {
        id: 'xo_decision_process',
        type: CheckPresentationFieldType.STRING,
        code: 'xo_decision_process',
        title: 'Как принимается решение',
        placeholder: 'Опишите, как клиент принимает решение',
        required: true,
        order: 3,
    },
    {
        id: 'xo_price_opinion',
        type: CheckPresentationFieldType.STRING,
        code: 'xo_price_opinion',
        title: 'Мнение о цене',
        placeholder: 'Опишите мнение клиента о цене',
        required: true,
        order: 4,
    },
    {
        id: 'xo_readiness_to_approach_manager',
        type: CheckPresentationFieldType.STRING,
        code: 'xo_readiness_to_approach_manager',
        title: 'Готовность подойти к руководителю',
        placeholder: 'Что клиент сказал насчёт обращения к руководителю',
        required: true,
        order: 5,
    },
    {
        // Булевы вопросы «Разговора» — настоящие pbx-поля сделки (коды по
        // владельческой таблице install todo2508): код вопроса = код поля,
        // персист резолвит их сам и пишет в сделку.
        id: 'op_xvost_is_offer',
        type: CheckPresentationFieldType.BOOLEAN,
        code: 'op_xvost_is_offer',
        title: 'Предложение КП',
        placeholder: 'Предложено ли коммерческое предложение',
        required: true,
        order: 6,
    },
    {
        id: 'op_xvost_is_complect',
        type: CheckPresentationFieldType.BOOLEAN,
        code: 'op_xvost_is_complect',
        title: 'Озвучить наполнение',
        placeholder: 'Озвучено ли наполнение',
        required: true,
        order: 7,
    },
    {
        id: 'op_xvost_is_price',
        type: CheckPresentationFieldType.BOOLEAN,
        code: 'op_xvost_is_price',
        title: 'Озвучить цену',
        placeholder: 'Озвучена ли цена',
        required: true,
        order: 8,
    },
    {
        // Код op_* (не исторический xo_ анкеты): вопрос «выдернут из
        // Хвоста» в фича-поле — код вопроса обязан совпадать с кодом
        // портального поля из реестра, тогда персист резолвит его сам.
        id: 'op_manager_approach_date',
        type: CheckPresentationFieldType.DATE,
        code: 'op_manager_approach_date',
        title: 'Дата подхода к руководителю',
        placeholder: 'Укажите дату обращения к руководителю',
        required: true,
        order: 9,
    },
    {
        // Пишутся в портальные поля op_presentation_xvost / op_presentation_5k
        // (реестр PBX_SALES_EVENT_FIELDS): это итог презентации, который потом
        // читают руководитель и следующий менеджер.
        id: 'op_presentation_xvost',
        type: CheckPresentationFieldType.STRING,
        code: 'op_presentation_xvost',
        title: 'Хвост',
        placeholder: 'Что осталось «хвостом» после презентации',
        required: false,
        order: 11,
    },
    /*
     * «Пять К»: Клиент, Компания, Коллеги, Конкурент, Критерий выбора.
     * Ответы пишутся в собственные поля лида (op_5k_*), а сводное
     * op_presentation_5k собирается из них автоматически при сохранении —
     * отдельно его никто не заполняет.
     */
    {
        id: 'op_5k_client_what',
        type: CheckPresentationFieldType.STRING,
        code: 'op_5k_client_what',
        title: 'КЛИЕНТ: Что хочет?',
        placeholder: 'Что клиенту нужно от системы',
        required: false,
        order: 12,
    },
    {
        id: 'op_5k_client_ready',
        type: CheckPresentationFieldType.STRING,
        code: 'op_5k_client_ready',
        title: 'КЛИЕНТ: Готов работать?',
        placeholder: 'Готов ли работать с нами',
        required: false,
        order: 13,
    },
    {
        id: 'op_5k_client_price',
        type: CheckPresentationFieldType.STRING,
        code: 'op_5k_client_price',
        title: 'КЛИЕНТ: Укладываемся в цену?',
        placeholder: 'Совпадает ли бюджет с нашей ценой',
        required: false,
        order: 14,
    },
    {
        id: 'op_5k_company_who',
        type: CheckPresentationFieldType.STRING,
        code: 'op_5k_company_who',
        title: 'КОМПАНИЯ: Кто принимает решение?',
        placeholder: 'Кто в компании решает',
        required: false,
        order: 15,
    },
    {
        id: 'op_5k_company_how',
        type: CheckPresentationFieldType.STRING,
        code: 'op_5k_company_how',
        title: 'КОМПАНИЯ: Как принимается решение?',
        placeholder: 'Как устроено согласование',
        required: false,
        order: 16,
    },
    {
        id: 'op_5k_company_right',
        type: CheckPresentationFieldType.STRING,
        code: 'op_5k_company_right',
        title: 'КОМПАНИЯ: Правильно ли подобрали цену и комплект?',
        placeholder: 'Подходит ли предложенный комплект',
        required: false,
        order: 17,
    },
    {
        id: 'op_5k_command',
        type: CheckPresentationFieldType.STRING,
        code: 'op_5k_command',
        title: 'КОЛЛЕГИ: Кто будет работать с системой?',
        placeholder: 'Кто будет пользоваться, будут ли обсуждать',
        required: false,
        order: 18,
    },
    {
        id: 'op_5k_concurent',
        type: CheckPresentationFieldType.STRING,
        code: 'op_5k_concurent',
        title: 'КОНКУРЕНТ: По каким критериям нас сравнивают?',
        placeholder: 'С кем и по каким критериям сравнивают',
        required: false,
        order: 19,
    },
    {
        id: 'op_5k_criteri',
        type: CheckPresentationFieldType.STRING,
        code: 'op_5k_criteri',
        title: 'КРИТЕРИЙ ВЫБОРА: Что важно при выборе СПС?',
        placeholder: 'Что решает при выборе системы',
        required: false,
        order: 20,
    },
    {
        // Код op_xvost_* — как поле установлено владельцем (todo2508).
        id: 'op_xvost_decision_date_agreement',
        type: CheckPresentationFieldType.DATE,
        code: 'op_xvost_decision_date_agreement',
        title: 'Согласование даты по решению',
        placeholder: 'Укажите согласованную дату принятия решения',
        required: true,
        order: 10,
    },
];
