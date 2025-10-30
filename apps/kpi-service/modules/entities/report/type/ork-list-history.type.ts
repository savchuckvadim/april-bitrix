
import { EnumOrkEventAction, EnumOrkEventCommunication, EnumOrkEventInitiative, EnumOrkEventType, EnumOrkFailReason, EnumOrkFieldCode, EnumOrkForecast, EnumOrkResultStatus, EnumOrkWorkStatus } from "./ork-list-history.enum";


export const OrkFields = {
    ork_event_type: {
        name: 'Тип События',
        code: EnumOrkFieldCode.ork_event_type,
        items: {
            et_ork_signal: {
                name: 'Сервисный сигнал',
                code: EnumOrkEventType.et_ork_signal,
            },
            et_ork_info: {
                name: 'Информация',
                code: EnumOrkEventType.et_ork_info,
            },
            et_ork_call_doc: {
                name: 'Звонок по документам',
                code: EnumOrkEventType.et_ork_call_doc,
            },
            et_ork_call_money: {
                name: 'Звонок по оплате',
                code: EnumOrkEventType.et_ork_call_money,
            },
            et_ork_call_collect: {
                name: 'Звонок по задолженности',
                code: EnumOrkEventType.et_ork_call_collect,
            },
            et_ork_info_garant: {
                name: 'Инфоповод Гарант',
                code: EnumOrkEventType.et_ork_info_garant,
            },
            et_ork_presentation: {
                name: 'Презентация',
                code: EnumOrkEventType.et_ork_presentation,
            },
            et_ork_presentation_uniq: {
                name: 'Презентация(уникальная)',
                code: EnumOrkEventType.et_ork_presentation_uniq,
            },
            et_ork_edu_first: {
                name: 'Обучение первичное',
                code: EnumOrkEventType.et_ork_edu_first,
            },
            et_ork_edu: {
                name: 'Обучение',
                code: EnumOrkEventType.et_ork_edu,
            },
            et_ork_edu_uniq: {
                name: 'Обучение(уникальное)',
                code: EnumOrkEventType.et_ork_edu_uniq,
            },
            et_ork_seminar: {
                name: 'Семинар',
                code: EnumOrkEventType.et_ork_seminar,
            },
            et_ork_complect_up_work: {
                name: 'Работа по перезаключению',
                code: EnumOrkEventType.et_ork_complect_up_work,
            },
            et_ork_pere_contract: {
                name: 'Перезаключение',
                code: EnumOrkEventType.et_ork_pere_contract,
            },
            et_ork_complect_up: {
                name: 'Увеличение комплекта',
                code: EnumOrkEventType.et_ork_complect_up,
            },
            et_ork_complect_down: {
                name: 'Уменьшение комплекта / понижение ОД',
                code: EnumOrkEventType.et_ork_complect_down,
            },
            et_ork_fail_prevention: {
                name: 'Профилактика отказа',
                code: EnumOrkEventType.et_ork_fail_prevention,
            },
            et_ork_fail_work: {
                name: 'Работа по устранению угрозы отказа',
                code: EnumOrkEventType.et_ork_fail_work,
            },
            et_ork_threat: {
                name: 'Возникновение угрозы отказа',
                code: EnumOrkEventType.et_ork_threat,
            },
            et_ork_fail_work_success: {
                name: 'Устранение угрозы отказа',
                code: EnumOrkEventType.et_ork_fail_work_success,
            },
            et_ork_site: {
                name: 'Заявка с сайта',
                code: EnumOrkEventType.et_ork_site,
            },
            et_ork_offer: {
                name: 'Коммерческое Предложение',
                code: EnumOrkEventType.et_ork_offer,
            },
            et_ork_invoice: {
                name: 'Счет',
                code: EnumOrkEventType.et_ork_invoice,
            },
            et_ork_contract: {
                name: 'Договор',
                code: EnumOrkEventType.et_ork_contract,
            },
            et_ork_supply: {
                name: 'Поставка',
                code: EnumOrkEventType.et_ork_supply,
            },
            et_ork_halfsale: {
                name: 'Допродажа',
                code: EnumOrkEventType.et_ork_halfsale,
            },
            ev_success: {
                name: 'Продажа',
                code: EnumOrkEventType.ev_success,
            },
            et_ork_doc_akt: {
                name: 'Акт',
                code: EnumOrkEventType.et_ork_doc_akt,
            },
            et_ork_fail: {
                name: 'Отказ',
                code: EnumOrkEventType.et_ork_fail,
            },
            et_ork_return: {
                name: 'Возврат',
                code: EnumOrkEventType.et_ork_return,
            },
        },
    },
    ork_event_action: {
        name: 'Событие',
        code: EnumOrkFieldCode.ork_event_action,
        items: {
            ea_ork_act_create: {
                name: 'Создан',
                code: EnumOrkEventAction.ea_ork_act_create,
            },
            ea_ork_plan: {
                name: 'Запланирован',
                code: EnumOrkEventAction.ea_ork_plan,
            },
            ea_ork_expired: {
                name: 'Просрочен',
                code: EnumOrkEventAction.ea_ork_expired,
            },
            ea_ork_done: {
                name: 'Состоялся',
                code: EnumOrkEventAction.ea_ork_done,
            },
            ea_ork_pound: {
                name: 'Перенос',
                code: EnumOrkEventAction.ea_ork_pound,
            },
            ea_ork_act_noresult_fail: {
                name: 'Не состоялся',
                code: EnumOrkEventAction.ea_ork_act_noresult_fail,
            },
            ea_ork_act_init_send: {
                name: 'Заявка отправлена',
                code: EnumOrkEventAction.ea_ork_act_init_send,
            },
            ea_ork_act_init_done: {
                name: 'Заявка принята',
                code: EnumOrkEventAction.ea_ork_act_init_done,
            },
            ea_ork_act_send: {
                name: 'Отправлен',
                code: EnumOrkEventAction.ea_ork_act_send,
            },
            ea_ork_act_sign: {
                name: 'Подписан',
                code: EnumOrkEventAction.ea_ork_act_sign,
            },
            ea_ork_act_in_office: {
                name: 'Сдан',
                code: EnumOrkEventAction.ea_ork_act_in_office,
            },
            ea_ork_act_pay: {
                name: 'Оплачен',
                code: EnumOrkEventAction.ea_ork_act_pay,
            },
        },
    },
    event_communication: {
        name: 'Тип коммуникации',
        code: EnumOrkFieldCode.event_communication,
        items: {
            ec_ork_call: {
                name: 'Звонок',
                code: EnumOrkEventCommunication.ec_ork_call,
            },
            ec_ork_face: {
                name: 'Выезд',
                code: EnumOrkEventCommunication.ec_ork_face,
            },
            ec_ork_mail: {
                name: 'Письмо',
                code: EnumOrkEventCommunication.ec_ork_mail,
            },
            ec_ork_edo: {
                name: 'ЭДО',
                code: EnumOrkEventCommunication.ec_ork_edo,
            },
            ec_ork_signal: {
                name: 'СС',
                code: EnumOrkEventCommunication.ec_ork_signal,
            },
        },
    },
    ork_event_initiative: {
        name: 'Инициатива',
        code: EnumOrkFieldCode.ork_event_initiative,
        items: {
            ei_ork_incoming: {
                name: 'Входящий',
                code: EnumOrkEventInitiative.ei_ork_incoming,
            },
            ei_ork_outgoing: {
                name: 'Исходящий',
                code: EnumOrkEventInitiative.ei_ork_outgoing,
            },
        },
    },
    ork_work_status: {
        name: 'ОРК Статус работы в компании',
        code: EnumOrkFieldCode.ork_work_status,
        items: {
            ork_work_status_new: {
                name: 'Новый',
                code: EnumOrkWorkStatus.ork_work_status_new,
            },
            ork_work_status_supply: {
                name: 'Поставка',
                code: EnumOrkWorkStatus.ork_work_status_supply,
            },
            ork_work_status_first_edu: {
                name: 'Первичное обучение',
                code: EnumOrkWorkStatus.ork_work_status_first_edu,
            },
            ork_work_status_edu: {
                name: 'Обучение',
                code: EnumOrkWorkStatus.ork_work_status_edu,
            },
            ork_work_status_in_work: {
                name: 'В работе',
                code: EnumOrkWorkStatus.ork_work_status_in_work,
            },
            ork_work_status_signal: {
                name: 'Отработка сигнала',
                code: EnumOrkWorkStatus.ork_work_status_signal,
            },
            ork_work_status_pere_soon: {
                name: 'Скоро перезаключение',
                code: EnumOrkWorkStatus.ork_work_status_pere_soon,
            },
            ork_work_status_pere: {
                name: 'Перезаключение',
                code: EnumOrkWorkStatus.ork_work_status_pere,
            },
            ork_work_status_complect_up: {
                name: 'Увеличение комплекта',
                code: EnumOrkWorkStatus.ork_work_status_complect_up,
            },
            ork_work_status_complect_down: {
                name: 'Уменьшение комплекта',
                code: EnumOrkWorkStatus.ork_work_status_complect_down,
            },
            ork_work_status_threat: {
                name: 'Угроза отказа',
                code: EnumOrkWorkStatus.ork_work_status_threat,
            },
            ork_work_status_fail_in_process: {
                name: 'В процессе отказа',
                code: EnumOrkWorkStatus.ork_work_status_fail_in_process,
            },
            ork_work_status_fail: {
                name: 'Отказ',
                code: EnumOrkWorkStatus.ork_work_status_fail,
            },
        },
    },
    ork_forecast: {
        name: 'ОРК Прогноз',
        code: EnumOrkFieldCode.ork_forecast,
        items: {
            ork_forecast_client: {
                name: 'Продолжение сотрудничества',
                code: EnumOrkForecast.ork_forecast_client,
            },
            ork_forecast_complect_up: {
                name: 'Увеличение комплекта',
                code: EnumOrkForecast.ork_forecast_complect_up,
            },
            ork_forecast_complect_down: {
                name: 'Уменьшение комплекта',
                code: EnumOrkForecast.ork_forecast_complect_down,
            },
            ork_forecast_maybefail: {
                name: 'Угроза отказа',
                code: EnumOrkForecast.ork_forecast_maybefail,
            },
            ork_forecast_fail: {
                name: 'Отказ',
                code: EnumOrkForecast.ork_forecast_fail,
            },
        },
    },
    ork_fail_reason: {
        name: 'ОРК Причина Отказа',
        code: EnumOrkFieldCode.ork_fail_reason,
        items: {
            ork_fr_lpr_changed: {
                name: 'Смена ЛПР',
                code: EnumOrkFailReason.ork_fr_lpr_changed,
            },
            ork_fr_nomoney_plan: {
                name: 'Изменение бюджета',
                code: EnumOrkFailReason.ork_fr_nomoney_plan,
            },
            ork_fr_concurent_money: {
                name: 'Конкуренты - оплачено',
                code: EnumOrkFailReason.ork_fr_concurent_money,
            },
            ork_fr_lpr_concurent_money: {
                name: 'Конкуренты - цена',
                code: EnumOrkFailReason.ork_fr_lpr_concurent_money,
            },
            ork_fr_nomoney: {
                name: 'Нет денег',
                code: EnumOrkFailReason.ork_fr_nomoney,
            },
            ork_fr_lpr_noneeds: {
                name: 'Не видят надобности',
                code: EnumOrkFailReason.ork_fr_lpr_noneeds,
            },
            ork_fr_lpr: {
                name: 'ЛПР против',
                code: EnumOrkFailReason.ork_fr_lpr,
            },
            ork_fr_emploee_noneed: {
                name: 'Ключевой сотрудник против',
                code: EnumOrkFailReason.ork_fr_emploee_noneed,
            },
            ork_fr_nocommunication: {
                name: 'Не хотят общаться',
                code: EnumOrkFailReason.ork_fr_nocommunication,
            },
            ork_fr_company_changed: {
                name: 'Реорганизация',
                code: EnumOrkFailReason.ork_fr_company_changed,
            },
            ork_fr_company_bankrot: {
                name: 'Компания не существует',
                code: EnumOrkFailReason.ork_fr_company_bankrot,
            },
        },
    },
    ork_result_status: {
        name: 'Результативность',
        code: EnumOrkFieldCode.ork_result_status,
        items: {
            ork_call_result_yes: {
                name: 'Да',
                code: EnumOrkResultStatus.ork_call_result_yes,
            },
            ork_call_result_no: {
                name: 'Нет',
                code: EnumOrkResultStatus.ork_call_result_no,
            },
        },
    },
    ork_event_goal: {
        name: 'Цель коммуникации',
        code: EnumOrkFieldCode.ork_event_goal,
        items: {
            eg_ork_signal: {
                name: 'Отработка сигнала',
                code: 'eg_ork_signal',
            },
            eg_ork_edu: {
                name: 'Обучение',
                code: 'eg_ork_edu',
            },
            eg_ork_pres: {
                name: 'Презентация',
                code: 'eg_ork_pres',
            },
            eg_ork_soon: {
                name: 'Перезаключение',
                code: 'eg_ork_soon',
            },
            eg_ork_save: {
                name: 'Сохранение',
                code: 'eg_ork_save',
            },
            eg_ork_claim: {
                name: 'Отработка рекламации',
                code: 'eg_ork_claim',
            },
        },
    },
    ork_event_is_goal: {
        name: 'Цель достигнута',
        code: EnumOrkFieldCode.ork_event_is_goal,
        items: {
            ork_event_is_goal_yes: {
                name: 'Да',
                code: 'ork_event_is_goal_yes',
            },
            ork_event_is_goal_no: {
                name: 'Нет',
                code: 'ork_event_is_goal_no',
            },
        },
    },
    ork_noresult_reason: {
        name: 'Тип Нерезультативности',
        code: EnumOrkFieldCode.ork_noresult_reason,
        items: {
            secretar: {
                name: 'Секретарь',
                code: 'secretar',
            },
            nopickup: {
                name: 'Недозвон - трубку не берут',
                code: 'nopickup',
            },
            nonumber: {
                name: 'Недозвон - номер не существует',
                code: 'nonumber',
            },
            busy: {
                name: 'Занято',
                code: 'busy',
            },
            noresult_notime: {
                name: 'Перенос - не было времени',
                code: 'noresult_notime',
            },
            nocontact: {
                name: 'Контактера нет на месте',
                code: 'nocontact',
            },
            giveup: {
                name: 'Просят оставить свой номер',
                code: 'giveup',
            },
            bay: {
                name: 'Не интересует, до свидания',
                code: 'bay',
            },
            wrong: {
                name: 'По телефону отвечает не та организация',
                code: 'wrong',
            },
            auto: {
                name: 'Автоответчик',
                code: 'auto',
            },
        },
    },
    // Поля типа string
    event_title: {
        name: 'Название',
        code: EnumOrkFieldCode.event_title,
    },
    manager_comment: {
        name: 'Комментарий',
        code: EnumOrkFieldCode.manager_comment,
    },
    ork_evemt_tag: {
        name: 'Тэг',
        code: EnumOrkFieldCode.ork_evemt_tag,
    },
    // Поля типа datetime
    ork_event_date: {
        name: 'Дата',
        code: EnumOrkFieldCode.ork_event_date,
    },
    ork_plan_date: {
        name: 'Дата следующей коммуникации',
        code: EnumOrkFieldCode.ork_plan_date,
    },
    // Поля типа employee
    responsible: {
        name: 'Ответственный',
        code: EnumOrkFieldCode.responsible,
    },
    author: {
        name: 'Автор',
        code: EnumOrkFieldCode.author,
    },
    su: {
        name: 'Соисполнитель',
        code: EnumOrkFieldCode.su,
    },
    // Поля типа crm
    ork_crm_company: {
        name: 'Компания',
        code: EnumOrkFieldCode.ork_crm_company,
    },
    crm: {
        name: 'CRM',
        code: EnumOrkFieldCode.crm,
    },
    ork_crm_contact: {
        name: 'Контакт',
        code: EnumOrkFieldCode.ork_crm_contact,
    },
} as const;
export type OrkFieldsType = typeof OrkFields;
export type OrkFieldsCode = keyof OrkFieldsType;
export type OrkFieldValue<K extends keyof OrkFieldsType> =
    OrkFieldsType[K] extends { items: Record<string, { code: infer C }> }
    ? C
    : string;
type OrkFieldItem = {
    name: string;
    code: string;
};

type OrkField = {
    name: string;
    code: string;
    items?: Record<string, OrkFieldItem>;
};

export type OrkFieldCode = keyof typeof OrkFields;
export type OrkItemCode<T extends OrkFieldCode> =
    T extends keyof typeof OrkFields
    ? (typeof OrkFields)[T] extends { items: Record<string, OrkFieldItem> }
    ? keyof (typeof OrkFields)[T]['items']
    : never
    : never;

// Helper types for field metadata
export type OrkFieldType =
    | 'string'
    | 'datetime'
    | 'enumeration'
    | 'employee'
    | 'crm';

export interface OrkFieldMetadata {
    name: string;
    appType: string;
    type: OrkFieldType;
    field_code: string;
}

export const OrkFieldsMetadata: Record<string, OrkFieldMetadata> = {
    event_title: {
        name: 'Название',
        appType: 'calling',
        type: 'string',
        field_code: 'event_title',
    },
    ork_crm_company: {
        name: 'Компания',
        appType: 'calling',
        type: 'crm',
        field_code: 'ork_crm_company',
    },
    ork_event_date: {
        name: 'Дата',
        appType: 'calling',
        type: 'datetime',
        field_code: 'ork_event_date',
    },
    ork_event_type: {
        name: 'Тип События',
        appType: 'calling',
        type: 'enumeration',
        field_code: 'ork_event_type',
    },
    ork_event_action: {
        name: 'Событие',
        appType: 'calling',
        type: 'enumeration',
        field_code: 'ork_event_action',
    },
    event_communication: {
        name: 'Тип коммуникации',
        appType: 'calling',
        type: 'enumeration',
        field_code: 'event_communication',
    },
    ork_event_initiative: {
        name: 'Инициатива',
        appType: 'calling',
        type: 'enumeration',
        field_code: 'ork_event_initiative',
    },
    responsible: {
        name: 'Ответственный',
        appType: 'calling',
        type: 'employee',
        field_code: 'responsible',
    },
    ork_event_goal: {
        name: 'Цель коммуникации',
        appType: 'calling',
        type: 'enumeration',
        field_code: 'ork_event_goal',
    },
    ork_event_is_goal: {
        name: 'Цель достигнута',
        appType: 'calling',
        type: 'enumeration',
        field_code: 'ork_event_is_goal',
    },
    ork_plan_date: {
        name: 'Дата следующей коммуникации',
        appType: 'calling',
        type: 'datetime',
        field_code: 'ork_plan_date',
    },
    manager_comment: {
        name: 'Комментарий',
        appType: 'calling',
        type: 'string',
        field_code: 'manager_comment',
    },
    ork_result_status: {
        name: 'Результативность',
        appType: 'calling',
        type: 'enumeration',
        field_code: 'ork_result_status',
    },
    ork_noresult_reason: {
        name: 'Тип Нерезультативности',
        appType: 'calling',
        type: 'enumeration',
        field_code: 'ork_noresult_reason',
    },
    ork_work_status: {
        name: 'ОРК Статус работы в компании',
        appType: 'calling',
        type: 'enumeration',
        field_code: 'ork_work_status',
    },
    ork_forecast: {
        name: 'ОРК Прогноз',
        appType: 'calling',
        type: 'enumeration',
        field_code: 'ork_forecast',
    },
    ork_fail_reason: {
        name: 'ОРК Причина Отказа',
        appType: 'calling',
        type: 'enumeration',
        field_code: 'ork_fail_reason',
    },
    author: {
        name: 'Автор',
        appType: 'calling',
        type: 'employee',
        field_code: 'author',
    },
    su: {
        name: 'Соисполнитель',
        appType: 'calling',
        type: 'employee',
        field_code: 'su',
    },
    crm: {
        name: 'CRM',
        appType: 'calling',
        type: 'crm',
        field_code: 'crm',
    },
    ork_crm_contact: {
        name: 'Контакт',
        appType: 'calling',
        type: 'crm',
        field_code: 'ork_crm_contact',
    },
    ork_evemt_tag: {
        name: 'Тэг',
        appType: 'calling',
        type: 'string',
        field_code: 'ork_evemt_tag',
    },
} as const;


export const OrkReport = {
    [OrkFields.ork_event_action.items.ea_ork_plan.code]: {
        types: [
            OrkFields.ork_event_type.items.et_ork_signal.code,
            OrkFields.ork_event_type.items.et_ork_info.code,
            OrkFields.ork_event_type.items.et_ork_call_doc.code,
            OrkFields.ork_event_type.items.et_ork_call_money.code,
            OrkFields.ork_event_type.items.et_ork_call_collect.code,
            OrkFields.ork_event_type.items.et_ork_info_garant.code,
            OrkFields.ork_event_type.items.et_ork_presentation.code,
        ]
    },
    [OrkFields.ork_event_action.items.ea_ork_done.code]: {
        types: [
            OrkFields.ork_event_type.items.et_ork_signal.code,
            OrkFields.ork_event_type.items.et_ork_info.code,
            OrkFields.ork_event_type.items.et_ork_call_doc.code,
            OrkFields.ork_event_type.items.et_ork_call_money.code,
            OrkFields.ork_event_type.items.et_ork_call_collect.code,
            OrkFields.ork_event_type.items.et_ork_info_garant.code,
            OrkFields.ork_event_type.items.et_ork_presentation.code,
        ]
    }
} as const;


export const OrkCallingTypes = [
    OrkFields.ork_event_type.items.et_ork_signal.code,
    OrkFields.ork_event_type.items.et_ork_info.code,
    OrkFields.ork_event_type.items.et_ork_call_doc.code,
    OrkFields.ork_event_type.items.et_ork_call_money.code,
    OrkFields.ork_event_type.items.et_ork_call_collect.code,
    OrkFields.ork_event_type.items.et_ork_info_garant.code,
    OrkFields.ork_event_type.items.et_ork_presentation.code,
    OrkFields.ork_event_type.items.et_ork_presentation_uniq.code,
    OrkFields.ork_event_type.items.et_ork_edu_first.code,
    OrkFields.ork_event_type.items.et_ork_edu.code,
    OrkFields.ork_event_type.items.et_ork_edu_uniq.code,
    OrkFields.ork_event_type.items.et_ork_seminar.code,
    OrkFields.ork_event_type.items.et_ork_complect_up_work.code,
    OrkFields.ork_event_type.items.et_ork_pere_contract.code,
]

