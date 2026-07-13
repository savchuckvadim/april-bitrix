import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { Portal } from "@/modules/app/types/portal/portal-type";
import { EV_COMPANY_PROP, eventCompanyActions } from "./EventCompanySlice";
import { CompanyColorType } from "../utils/event-company-util";
import { Bitrix } from '@workspace/bitrix';


export const setInitEventCompany = (portal: Portal) => async (
    dispatch: AppDispatch, getState: AppGetState
) => {
    const state = getState()
    const company = state.app.bitrix.company
    const pCompany = portal.company
    const pFields = pCompany.bitrixfields
    const colorPField = pFields.find(pf => pf.code == 'op_prospects')
    const concurentPField = pFields.find(pf => pf.code == 'op_concurents')
    const resultPField = pFields.find(pf => pf.code == 'op_work_result')
    const clientStatusPField = pFields.find(pf => pf.code == 'op_client_status')


    const colorBtrixId = `UF_CRM_${colorPField.bitrixId}`
    //@ts-ignore
    const colorCurrentId = company[colorBtrixId]

    const colorCurrent = colorPField.items.find(pfi => pfi.bitrixId == colorCurrentId)
    dispatch(
        eventCompanyActions
            .setInitCompanyColor({
                bitrixId: colorBtrixId,
                items: colorPField.items,
                current: colorCurrent,
                field: colorPField

            })
    )



    const clientStatusBtrixId = `UF_CRM_${clientStatusPField.bitrixId}`

    //@ts-ignore
    const clientStatusCurrentId = company[clientStatusBtrixId]
    const clientStatusCurrent = clientStatusPField.items.find(pfi => pfi.bitrixId == clientStatusCurrentId)

    dispatch(
        eventCompanyActions
            .setInitCompanyStatus({
                bitrixId: clientStatusBtrixId,
                items: clientStatusPField.items,
                current: clientStatusCurrent,
                field: clientStatusPField

            })
    )



}


export const setCurrentColor = (
    color: CompanyColorType
) => async (
    dispatch: AppDispatch, getState: AppGetState
) => {
        const state = getState()
        const company = state.app.bitrix.company

        const colorState = state.company.color
        const colors = colorState.items
        const isLoading = colorState.isLoading

        if (!isLoading) {
            dispatch(
                eventCompanyActions
                    .setIsLoading({ isLoading: true, type: EV_COMPANY_PROP.COLOR })
            )
            const current = colors
                .find(fi => fi.code == color)

            const fieldBxId = colorState.bitrixId as string

            if (current) {
                dispatch(
                    eventCompanyActions
                        .setCurrentColor({ color })
                )
                const result = await Bitrix.getService().company.update(
                    company.ID,
                    {
                        [fieldBxId]: current.bitrixId,
                    },
                );

                // if (result) {
                //     dispatch(
                //         eventCompanyActions
                //             .setCurrentColor({ color })
                //     )

                // }
            }

            dispatch(
                eventCompanyActions
                    .setIsLoading({ isLoading: false, type: EV_COMPANY_PROP.COLOR })
            )
        }



    }



export const updateCompany = (
    type: EV_COMPANY_PROP,
    code: CompanyColorType | string,
) => async (
    dispatch: AppDispatch, getState: AppGetState
) => {
        const state = getState()
        const company = state.app.bitrix.company

        const targetState = state.company[type]
        const items = targetState.items
        const isLoading = targetState.isLoading

        if (!isLoading) {
            dispatch(
                eventCompanyActions
                    .setIsLoading({ isLoading: true, type })
            )
            const current = items
                .find(fi => fi.code == code)

            const fieldBxId = targetState.bitrixId as string

            if (current) {
                const result = await Bitrix.getService().company.update(
                    company.ID,
                    {
                        [fieldBxId]: current.bitrixId,
                    },
                );

                if (result) {
                    dispatch(
                        eventCompanyActions
                            .setCurrentProp({ code, type })
                    )

                }
            }

            dispatch(
                eventCompanyActions
                    .setIsLoading({ isLoading: false, type })
            )
        }



    }