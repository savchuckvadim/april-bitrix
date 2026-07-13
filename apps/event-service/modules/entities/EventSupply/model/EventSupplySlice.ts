import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { EV_REPORT_PROP, EventReportStateReport } from "../type/event-report-type";
import { getreportState } from "../utils/event-report-util";

//TYPES
export type EventReportState = typeof initialState


export interface SetReportPropProps {
    propName: EV_REPORT_PROP,
    value: string
}

const initialState = {


    isNewEvent: false,
    report: {
        [EV_REPORT_PROP.WORK_STATUS]: {
            items: [
                {
                    id: 0,
                    code: 'inJob',
                    name: 'В работе',
                    isActive: true,

                },
                {
                    id: 1,
                    code: 'setAside',
                    name: 'Отложено',
                    isActive: true,

                },
                {
                    id: 2,
                    code: 'success',
                    name: 'Продажа',
                    isActive: true,

                },
                {
                    id: 3,
                    code: 'fail',
                    name: 'Отказ',
                    isActive: true,

                },

            ],
            current: {
                id: 0,
                code: 'inJob',
                name: 'В работе',
                isActive: true

            },
            default: {
                id: 0,
                code: 'inJob',
                name: 'В работе',
                isActive: true

            },
            isActive: true,
            isChanged: false
        },
        [EV_REPORT_PROP.NORESULT_REASON]: {
            items: [
                {
                    id: 0,
                    code: 'secretar',
                    name: 'Секретарь',
                    isActive: true

                },
                {
                    id: 1,
                    code: 'nopickup',
                    name: 'Недозвон - трубку не берут',
                    isActive: true

                },
                {
                    id: 2,
                    code: 'nonumber',
                    name: 'Недозвон - номер не существует',
                    isActive: true

                },
                {
                    id: 3,
                    code: 'busy',
                    name: 'Занято',
                    isActive: true

                },
                {
                    id: 4,
                    code: 'noresult_notime',
                    name: 'Перенос - не было времени',
                    isActive: true

                },
                {
                    id: 5,
                    code: 'nocontact',
                    name: 'Контактера нет на месте',
                    isActive: true

                },
                {
                    id: 6,
                    code: 'giveup',
                    name: 'Просят оставить свой номер',
                    isActive: true

                },
                {
                    id: 7,
                    code: 'bay',
                    name: 'Не интересует, до свидания',
                    isActive: true

                },
                {
                    id: 8,
                    code: 'wrong',
                    name: 'По телефону отвечает не та организация',
                    isActive: true

                },
                {
                    id: 9,
                    code: 'auto',
                    name: 'Автоответчик',
                    isActive: true

                },
            ],
            current: {
                id: 1,
                code: 'nopickup',
                name: 'Недозвон - трубку не берут',
                isActive: true

            },
            default: {
                id: 1,
                code: 'nopickup',
                name: 'Недозвон - трубку не берут',
                isActive: true

            },
            isActive: false,
            isChanged: false
        },
        [EV_REPORT_PROP.FAIL_TYPE]: {
            items: [
                // {
                //     id: 0,
                //     code: 'op_prospects_good',
                //     name: 'Перспективная',
                //      isActive: false

                // },
                // {
                //     id: 1,
                //     code: 'op_prospects_good',
                //     name: 'Нет перспектив',
                //      isActive: false

                // },
                {
                    id: 2,
                    code: 'garant',
                    name: 'Гарант/Запрет',
                    isActive: true

                },
                {
                    id: 3,
                    code: 'go',
                    name: 'Покупает ГО',
                    isActive: true

                },
                {
                    id: 4,
                    code: 'territory',
                    name: 'Чужая территория',
                    isActive: true

                },
                {
                    id: 5,
                    code: 'accountant',
                    name: 'Бухприх',
                    isActive: true

                },
                {
                    id: 6,
                    code: 'autsorc',
                    name: 'Аутсорсинг',
                    isActive: true

                },
                {
                    id: 7,
                    code: 'depend',
                    name: 'Несамостоятельная организация',
                    isActive: true

                },
                {
                    id: 8,
                    code: 'op_prospects_nophone',
                    name: 'Недозвон',
                    isActive: true

                },
                {
                    id: 9,
                    code: 'op_prospects_company',
                    name: 'Компания не существует',
                    isActive: true

                },

                {
                    id: 10,
                    code: 'failure',
                    name: 'Отказ',
                    isActive: true

                },
            ],
            current: {
                id: 2,
                code: 'garant',
                name: 'Гарант/Запрет',
                isActive: true

            },
            default: {
                id: 2,
                code: 'garant',
                name: 'Гарант/Запрет',
                isActive: true

            },
            isActive: false,
            isChanged: false
        },
        [EV_REPORT_PROP.FAIL_REASON]: {
            items: [
                {
                    id: 0,
                    code: 'fail_notime',
                    name: 'Не было времени',
                    isActive: true

                },
                {
                    id: 1,
                    code: 'c_habit',
                    name: 'Конкуренты - привыкли',
                    isActive: true

                },
                {
                    id: 2,
                    code: 'c_prepay',
                    name: 'Конкуренты - оплачено',
                    isActive: true

                },
                {
                    id: 3,
                    code: 'c_price',
                    name: 'Конкуренты - цена',
                    isActive: true

                },

                {
                    id: 4,
                    code: 'money',
                    name: 'Дорого/нет Денег',
                    isActive: true

                },



                {
                    id: 5,
                    code: 'to_cheap',
                    name: 'Слишком дешево',
                    isActive: true

                },
                {
                    id: 6,
                    code: 'nomoney',
                    name: 'Нет денег',
                    isActive: true

                },
                {
                    id: 7,
                    code: 'noneed',
                    name: 'Не видят надобности',
                    isActive: true

                },
                {
                    id: 8,
                    code: 'lpr',
                    name: 'ЛПР против',
                    isActive: true

                },
                {
                    id: 9,
                    code: 'employee',
                    name: 'Ключевой сотрудник против',
                    isActive: true

                },
                {
                    id: 10,
                    code: 'fail_off',
                    name: 'Не хотят общаться',
                    isActive: true

                },

            ],
            current: {
                id: 0,
                code: 'fail_notime',
                name: 'Не было времени',
                isActive: true

            },
            default: {
                id: 0,
                code: 'fail_notime',
                name: 'Не было времени',
                isActive: true

            },
            isActive: false,
            isChanged: false
        },
        [EV_REPORT_PROP.COMMENT]: '' as string
    } as EventReportStateReport,

}


const eventSupplySlice = createSlice({
    name: 'eventSupply',
    initialState,
    reducers: {
        setReportProp: (
            state: EventReportState,
            action: PayloadAction<SetReportPropProps>

        ) => {
            const payload = action.payload;
            state.report = getreportState(
                state,
                payload.propName,
                payload.value
            );
        },

    },

});


//utils


export const eventSupplyReducer = eventSupplySlice.reducer;

// Экспорт actions
export const eventSupplyActions = eventSupplySlice.actions;