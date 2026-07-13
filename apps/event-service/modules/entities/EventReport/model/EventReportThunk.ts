import { AppDispatch, AppGetState } from "@/modules/app/model/store"

import { EV_REPORT_PROP } from "../type/event-report-type"
import { eventReportActions } from "./EventReportSlice"

import { clearFromLocalStorage, getFromLocalStorage, saveToLocalStorage } from "@workspace/api"


export const saveComment = () => async (
    dispatch: AppDispatch, getState: AppGetState
) => {
    const state = getState()
    const app = state.app
    const currentCompany = app.bitrix.company
    const companyId = currentCompany.ID
    const domain = app.domain
    const userId = app.bitrix.user.ID
    const comment = state.eventReport.report[EV_REPORT_PROP.COMMENT]
    const data = {
        companyId,
        domain,
        userId,
        comment

    }
    const key = domain + '_' + companyId + '_' + userId + '_comment'


    const result = saveToLocalStorage(key, comment, domain)

    // await hookAPI.service('full/comment/save', API_METHOD.POST, 'result', data,)







}

export const getSavedComment = () => async (
    dispatch: AppDispatch, getState: AppGetState
) => {
    const state = getState()
    const app = state.app
    const currentCompany = app.bitrix.company
    const companyId = currentCompany.ID
    const domain = app.domain

    const userId = app.bitrix.user.ID
    let comment = state.eventReport.report[EV_REPORT_PROP.COMMENT]
    const data = {
        companyId,
        domain,
        userId,


    }

    const key = domain + '_' + companyId + '_' + userId + '_comment'
    const result = await getFromLocalStorage(key, domain)
    // await hookAPI.service('full/comment/get', API_METHOD.POST, 'comment', data,)
    if (result) {
        // if (result[key]) {
        comment = result
        dispatch(
            eventReportActions
                .setReportProp({
                    propName: EV_REPORT_PROP.COMMENT,
                    value: comment
                })
        )
        // }
    }

    comment







}


export const clearComment = () => async (
    dispatch: AppDispatch, getState: AppGetState
) => {

    const state = getState()
    const app = state.app
    const currentCompany = app.bitrix.company
    const companyId = currentCompany.ID
    const domain = app.domain

    const userId = app.bitrix.user.ID


    const key = domain + '_' + companyId + '_' + userId + '_comment'


    clearFromLocalStorage(key)

    // await hookAPI.service('full/comment/save', API_METHOD.POST, 'result', data,)







}
