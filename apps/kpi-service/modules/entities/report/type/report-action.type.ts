import { OrkKpiFilterCode, OrkKpiFilterInnerCode } from "@workspace/nest-api";
import { EnumOrkEventAction, EnumOrkEventType } from "./ork-list-history.enum";
import { OrkFields } from "./ork-list-history.type";

export const OrkReportEventActionItems = {
    [OrkFields.ork_event_action.items.ea_ork_plan.code as EnumOrkEventAction]: {
        [OrkFields.ork_event_type.items.et_ork_signal.code as EnumOrkEventType]: {
            name: 'Сервисный сигнал запланирован',
            code: OrkKpiFilterCode.et_ork_signal_ea_ork_plan,
            type: 'signal',
            order: 1,
            color: 'rgba(160, 200, 220, 0.81)'
        },
        [OrkFields.ork_event_type.items.et_ork_info.code]: {
            name: 'Информация запланирован',
            code: OrkKpiFilterCode.et_ork_info_ea_ork_plan,
            type: 'info',
            order: 3,
            color: 'rgba(255, 215, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_call_doc.code]: {
            name: 'Звонок по документам запланирован',
            code: OrkKpiFilterCode.et_ork_call_doc_ea_ork_plan,
            type: 'call_doc',
            order: 5,
            color: 'rgba(120, 180, 220, 0.76)'
        },
        [OrkFields.ork_event_type.items.et_ork_call_money.code]: {
            name: 'Звонок по оплате запланирован',
            code: OrkKpiFilterCode.et_ork_call_money_ea_ork_plan,
            type: 'call_money',
            order: 7,
            color: 'rgba(120, 180, 220, 0.76)'
        },
        [OrkFields.ork_event_type.items.et_ork_call_collect.code]: {
            name: 'Звонок по задолженности запланирован',
            code: OrkKpiFilterCode.et_ork_call_collect_ea_ork_plan,
            type: 'call_collect',
            order: 9,
            color: 'rgba(120, 180, 220, 0.76)'
        },
        [OrkFields.ork_event_type.items.et_ork_info_garant.code]: {
            name: 'Инфоповод Гарант запланирован',
            code: OrkKpiFilterCode.et_ork_info_garant_ea_ork_plan,
            type: 'info_garant',
            order: 11,
            color: 'rgba(202, 176, 255, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_presentation.code]: {
            name: 'Презентация запланирован',
            code: OrkKpiFilterCode.et_ork_presentation_ea_ork_plan,
            type: 'presentation',
            order: 13,
            color: 'rgba(255, 215, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_presentation_uniq.code]: {
            name: 'Презентация(уникальная) запланирован',
            code: OrkKpiFilterCode.et_ork_presentation_uniq_ea_ork_plan,
            type: 'presentation_uniq',
            order: 15,
            color: 'rgba(255, 215, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_edu_first.code]: {
            name: 'Обучение первичное запланировано',
            code: OrkKpiFilterCode.et_ork_edu_first_ea_ork_plan,
            type: 'edu_first',
            order: 17,
            color: 'rgba(255, 215, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_edu.code]: {
            name: 'Обучение запланировано',
            code: OrkKpiFilterCode.et_ork_edu_ea_ork_plan,
            type: 'edu',
            order: 19,
            color: 'rgba(255, 215, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_edu_uniq.code]: {
            name: 'Обучение(уникальное) запланировано',
            code: OrkKpiFilterCode.et_ork_edu_uniq_ea_ork_plan,
            type: 'edu_uniq',
            order: 21,
            color: 'rgba(255, 215, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_threat.code]: {
            name: 'Обработка угрозы отказа запланировано',
            code: OrkKpiFilterCode.et_ork_threat_ea_ork_plan,
            type: 'edu_uniq',
            order: 22,
            color: 'rgba(255, 215, 0, 1)'
        },
    },
    [OrkFields.ork_event_action.items.ea_ork_done.code as EnumOrkEventAction]: {
        [OrkFields.ork_event_type.items.et_ork_signal.code]: {
            name: 'Сервисный сигнал обработан',
            code: OrkKpiFilterCode.et_ork_signal_ea_ork_done,
            type: 'signal',
            order: 2,
            color: 'rgba(120, 180, 220, 0.76)'
        },
        [OrkFields.ork_event_type.items.et_ork_info.code]: {
            name: 'Информационный звонок совершен',
            code: OrkKpiFilterCode.et_ork_info_ea_ork_done,
            type: 'info',
            order: 4,
            color: 'rgba(255, 140, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_call_doc.code]: {
            name: 'Звонок по документам совершен',
            code: OrkKpiFilterCode.et_ork_call_doc_ea_ork_done,
            type: 'call_doc',
            order: 6,
            color: 'rgba(120, 180, 220, 0.76)'
        },
        [OrkFields.ork_event_type.items.et_ork_call_money.code]: {
            name: 'Звонок по оплате совершен',
            code: OrkKpiFilterCode.et_ork_call_money_ea_ork_done,
            type: 'call_money',
            order: 8,
            color: 'rgba(120, 180, 220, 0.76)'
        },
        [OrkFields.ork_event_type.items.et_ork_call_collect.code]: {
            name: 'Звонок по задолженности совершен',
            code: OrkKpiFilterCode.et_ork_call_collect_ea_ork_done,
            type: 'call_collect',
            order: 10,
            color: 'rgba(120, 180, 220, 0.76)'
        },
        [OrkFields.ork_event_type.items.et_ork_info_garant.code]: {
            name: 'Инфоповод Гарант совершен',
            code: OrkKpiFilterCode.et_ork_info_garant_ea_ork_done,
            type: 'info_garant',
            order: 12,
            color: 'rgb(255, 66, 163)'
        },
        [OrkFields.ork_event_type.items.et_ork_presentation.code]: {
            name: 'Презентация проведена',
            code: OrkKpiFilterCode.et_ork_presentation_ea_ork_done,
            type: 'presentation',
            order: 14,
            color: 'rgba(255, 140, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_presentation_uniq.code]: {
            name: 'Презентация(уникальная) проведена',
            code: OrkKpiFilterCode.et_ork_presentation_uniq_ea_ork_done,
            type: 'presentation_uniq',
            order: 16,
            color: 'rgba(255, 215, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_edu_first.code]: {
            name: 'Обучение первичное проведено',
            code: OrkKpiFilterCode.et_ork_edu_first_ea_ork_done,
            type: 'edu_first',
            order: 18,
            color: 'rgba(255, 215, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_edu.code]: {
            name: 'Обучение проведено',
            code: OrkKpiFilterCode.et_ork_edu_ea_ork_done,
            type: 'edu',
            order: 20,
            color: 'rgba(255, 215, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_edu_uniq.code]: {
            name: 'Обучение(уникальное) проведено',
            code: OrkKpiFilterCode.et_ork_edu_uniq_ea_ork_done,
            type: 'edu_uniq',
            order: 21,
            color: 'rgba(255, 215, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_threat.code]: {
            name: 'Обработка угрозы отказа проведено',
            code: OrkKpiFilterCode.et_ork_threat_ea_ork_done,
            type: 'edu_uniq',
            order: 22,
            color: 'rgba(255, 215, 0, 1)'
        },
        [OrkFields.ork_event_type.items.et_ork_supply.code]: {
            name: 'Перезаключение договора совершено',
            code: OrkKpiFilterCode.et_ork_supply_ea_ork_done,
            type: 'supply',
            order: 23,
            color: 'rgba(47, 235, 0, 0.76)'
        },
        [OrkFields.ork_event_type.items.et_ork_fail.code]: {
            name: 'Отказ',
            code: OrkKpiFilterCode.et_ork_fail_ea_ork_done,
            type: 'fail',
            order: 24,
            color: 'rgb(255, 66, 52)'
        },
    },
    [OrkFields.ork_event_action.items.ea_ork_act_create.code as EnumOrkEventAction]: {
        [OrkFields.ork_event_type.items.et_ork_signal.code as EnumOrkEventType]: {
            name: 'Сервисный сигнал создан',
            code: OrkKpiFilterCode.et_ork_signal_ea_ork_act_create,
            type: 'signal',
            order: 1,
            color: 'rgba(120, 180, 220, 0.76)'
        },
    }
}


export const getColorByCode = (code: OrkKpiFilterCode): string => {

    let result = 'rgba(160, 200, 220, 0.81)';
    for (const item of Object.values(OrkReportEventActionItems)) {

        for (const item2 of Object.values(item)) {
            if (item2.code === code) {
                result = item2.color;

            }
        }
    }
    return result;
}
