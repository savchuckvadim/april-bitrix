// import { AppFrame, AuthManager, MessageManager, PlacementManager } from "@bitrix24/b24jssdk"
// import { type TypeB24 } from '@bitrix24/b24jssdk'

import {

    // LoggerBrowser,

    Result,
    EnumCrmEntityTypeId,

} from '@bitrix24/b24jssdk'
import { initializeB24Frame, B24Frame } from '@bitrix24/b24jssdk'
import { getLayout } from "./bx-helper/activity-helper"


export const bxAPI = {
 
    install: async () => {
        const b24 = await initializeB24Frame();
        await b24.installFinish();
    },
    method: () => {

        //    const manager = new PlacementManager()
        // const bx = B24Frame
        // const result = await callMethod()
    },
    saleInit: async (dealId: null | number, companyId: null | number,) => {
        const b24 = await initializeB24Frame() as B24Frame

        const placement = b24.placement
        console.log('b24test plcmnt')
        console.log(placement)
        const authData = b24.auth.getAuthData()


        debugger
        try {
            const result = await b24.callBatch({
                CompanyList: {
                    method: 'crm.item.list',
                    params: {
                        entityTypeId: EnumCrmEntityTypeId.company,
                        order: { id: 'desc' },
                        select: [
                            'id',
                            'title',
                            'createdTime'
                        ]
                    }
                },
                DealList: {
                    method: 'crm.deal.list',
                    params: {
                        order: { created: 'desc' },
                        select: [
                            'id',
                            'title',
                            'createdTime',
                            'UF_CRM_1586947711880' // UF_CRM_1586947711880 - field with date
                        ],

                    }
                },
                UserList: {
                    method: 'user.current.get',
                    params: {},
                },
            }) as Result
            console.log('b24test result')
            console.log(result)

            console.log('b24test result')
            // console.log(result.getData())
            // logger.info('result >> ', result)

            return result

        } catch (error) {
            console.log('b24test error')
            console.log(error)
        }

    },

    setActivity: async (
        companyId: number,
        report: any,
        description: string,
        responsibilityId: number,
        planEvent: { code: string, name: string, description: string },
        deadline: string,
        color: string,

    ) => {
        const b24 = await initializeB24Frame() as B24Frame
        // const authData = b24.auth.getAuthData()
        // console.log(authData)

        let result = null
        let dealResponse = null
        const fields = {
            // "RESPOSIBLE_ID": responsibilityId || 1,
            // "DEADLINE": deadline
            "responsibleId": responsibilityId || 1,
            "deadline": deadline,
            "completed": "N",
            "pingOffset": [0, 5, 15, 30, 60],
            // "badgeCode": "myCustomBadge"  // сначала зарегистрировать на портал е badge

        }
        let eventType = planEvent.code || 'Звонок'


        let title = planEvent.name

        // if (!isPlanned && currentTask) {
        //     title = currentTask.title
        // }
        const layout = getLayout(
            companyId,
            '',
            title,
            description,
            eventType,
            deadline,
            color
        )

        // https://dev.1c-bitrix.ru/rest_help/crm/rest_activity/configurable/structure/actiondto.php

        const data = {
            ownerTypeId: 4,
            ownerId: companyId,
            fields,
            layout,


        }

        try {
            dealResponse = await b24.callMethod(
                'crm.activity.configurable.add',
                data
            );
            // console.log('setActivity')
            // console.log('dealResponse')

            if (dealResponse) {
                result = dealResponse.getData()
                console.info(result)

                const selectedUser = await b24.dialog.selectUser()
                console.info(selectedUser)

            }
            return result
        } catch (error) {
            console.log('error')
            console.log(dealResponse)
            console.log(error)
            return result
        }

    },

       // auth: () => {
    //     AuthManager.getAuth()
    // },

}