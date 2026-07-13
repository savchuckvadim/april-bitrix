import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { eventContactActions, } from "./EventContactSlice";
import { EV_CONTACT_PROP, EV_CONTACT_TYPE } from "../type/event-contact-type";
import { errors, ErrorsCode, eventActions, SetErrorsPayload } from "@/modules/processes/event/model/EventSlice";
import { chunkArray, validateInput } from "../util/contact-util";
import { DEPARTAMENT_STATE_PROP, DUSER_ROLE } from "@/modules/features/Departament/type/department-type";
import { Bitrix } from '@workspace/bitrix';
import { BXContact, BXTask } from "@workspace/bx";
import { Portal } from "@workspace/pbx";

import { getContactsRequestSelect, getPbxContactByContact, getPBXContactsSetupData } from "../util/pbx-contact-util";
import { PBXContactFieldData, PBXContactStateItem } from "../type/pbx-contact-type";
// BXEntityContact (legacy bx type) -> use `any` for the raw crm.company.contact.items.get row.

export const getCompanyContacts = (
    portal: Portal,
    // companyId: number
) => async (
    dispatch: AppDispatch, getState: AppGetState
) => {
        const state = getState()
        const company = state.app.bitrix.company
        const companyId = company.ID
        const domain = state.app.domain

        const contactsFrom = await Bitrix.getService().api.call(
            'crm.company.contact.items.get',
            {
                id: companyId
            },
        );

        const contactIds = contactsFrom && contactsFrom?.map((contact: any) => contact.CONTACT_ID) || []
        let contacts = [] as BXContact[]

        const select = getContactsRequestSelect()
        if (contactIds && contactIds.length) {
            const chunks = chunkArray<number>(contactIds, 50);
            const allContacts = [];
            for (const chunk of chunks) {
                const result = await Bitrix.getService().api.call(
                    'crm.contact.list',
                    {
                        filter: {
                            'ID': chunk
                        },
                        select
                    },
                ) as BXContact[];
                
                result &&  allContacts.push(...result);
            }
            contacts = allContacts;
        }

        
        if (contacts && contacts.length) {
            dispatch(
                setInitPBXContact(portal, contacts)
            )
        }

        // if (contacts && contacts.length) {

        //     const contactId = contacts[0]['CONTACT_ID']
        //     const contact = await bitrixAPI.getMethod(
        //         'crm.company.contact.items.get',
        //         { id: contactId, },
        //         'april-dev.bitrix24.ru'
        //     );
        // }

    }

export const setCurrentReportContact = (
    currentTask: BXTask | null
) => async (
    dispatch: AppDispatch, getState: AppGetState
) => {
        if (currentTask) {


            if (currentTask.ufCrmTask) {
                const taskContactcrmString = currentTask.ufCrmTask.find(crm => crm.startsWith('C') && !crm.startsWith('CO'));

                if (taskContactcrmString) {
                    const idString = taskContactcrmString.split('_')[1]; // '678'
                    const contactId = Number(idString)
                    if (contactId) {
                        dispatch(
                            eventContactActions
                                .setInitCurrentContact(
                                    {
                                        type: 'init',
                                        contactId
                                    }
                                )
                        )
                    }
                }
            }

        } else {
            dispatch(
                eventContactActions
                    .setInitCurrentContact(
                        {
                            type: 'init',
                            contactId: null
                        }
                    )
            )
        }
    }






export const saveCreatedContact = (
    // contact: EVContact,
    type: EV_CONTACT_TYPE
) => async (
    dispatch: AppDispatch, getState: AppGetState
) => {
        dispatch(
            eventContactActions
                .setCreatingFetching({ status: true })
        )

        const state = getState()
        const portal = state.portal.portal
        const contactState = state.contact.creating
        const creatingContact = contactState.contact
        const name = creatingContact.NAME
        const email = creatingContact.EMAIL
        const phone = creatingContact.PHONE
        const post = creatingContact.POST


        const resultErrors = {
            isError: false as boolean,
            errors: { ...errors }
        } as SetErrorsPayload


        if (!name) {
            resultErrors.errors.NAME = 'Напишите имя контакта'
        } else {
            resultErrors.errors.NAME = ''
        }
        // if (!post) {
        //     resultErrors.errors.POST = 'Напишите должность контакта'
        // } else {
        //     resultErrors.errors.POST = ''
        // }
        if (!email) {
            resultErrors.errors.EMAIL = 'Напишите email контакта'
        } else {
            resultErrors.errors.EMAIL = validateInput(email, EV_CONTACT_PROP.EMAIL)

        }

        if (!phone) {
            resultErrors.errors.PHONE = 'Напишите телефон контакта'
        } else {
            resultErrors.errors.PHONE = validateInput(phone, EV_CONTACT_PROP.PHONE)

        }
        for (const key in resultErrors.errors) {
            const errorKey = key as ErrorsCode

            //@ts-ignore
            if (resultErrors.errors[errorKey]) {
                resultErrors.isError = true
            }
        }

        if (resultErrors.isError) {
            dispatch(
                eventActions.setErrors(
                    resultErrors
                )
            )
        }

        if (!resultErrors.isError) {
            const domain = state.app.domain

            const currentCompanyId = state.app.bitrix.company.ID

            const currentUserId = state.department[DEPARTAMENT_STATE_PROP.PLAN][DUSER_ROLE.RESPONSIBLE].current.ID || state.department[DEPARTAMENT_STATE_PROP.REPORT][DUSER_ROLE.RESPONSIBLE].current.ID

            const fields = {
                ...creatingContact,
                "PHONE": [{ "VALUE": creatingContact.PHONE }],
                "EMAIL": [{ "VALUE": creatingContact.EMAIL }],
                "ASSIGNED_BY_ID": currentUserId,
                'COMPANY_ID': currentCompanyId

            }
            const data = { fields }

            const contactId = await Bitrix.getService().api.call(
                'crm.contact.add',
                data,
            )
            const contact = await Bitrix.getService().api.call(
                'crm.contact.get',
                { ID: contactId },
            )
            const pbxContact = getPbxContactByContact(portal, contact)
            if (contactId && pbxContact) {


                dispatch(eventContactActions
                    .setCreatedContact(
                        {
                            contact: pbxContact,
                            type
                        }
                    ))
            }

            dispatch(
                eventContactActions
                    .setCreatingContact({
                        isCreating: false, type: null
                    })
            )

        }


        dispatch(
            eventContactActions
                .setCreatingFetching({ status: false })
        )
    }




export const setInitPBXContact =
    (portal: Portal, contacts: BXContact[]) =>
        async (dispatch: AppDispatch, getState: AppGetState) => {

            const allContacts = [] as PBXContactStateItem[];

            contacts.forEach((contact: BXContact) => {

                const resultContact = getPbxContactByContact(portal, contact)
                allContacts.push(resultContact);
            });

            dispatch(
                eventContactActions
                    .setFetchedContacts({
                        contacts: allContacts
                    })
            )

        };

export const setUpdatingContactStatus = (type: EV_CONTACT_TYPE, status: boolean) => async (dispatch: AppDispatch, getState: AppGetState) => {

    const contactId = getState().contact.current[type]?.ID
    dispatch(
        eventContactActions.setUpdatingContactStatus({
            contactId,
            status
        })

    )



}
// export const updateContact =
//     (contactId: number, code: string | PBXFieldItem, fieldCode: EV_CONTACT_PROP) =>
//         async (dispatch: AppDispatchType, getState: AppGetState) => {
//             const state = getState();
//             const app = state.app;
//             const domain = app.domain || "april-dev.bitrix24.ru";
//             const company = app.bitrix.deal;
//             const contactState = state.pbxContact;


//             dispatch(
//                 pbxContactAC.setCurrentProp(
//                     contactId,

//                     //@ts-ignore
//                     code,
//                     fieldCode
//                 )
//             );

//             // const bxCompanyFieldState = state.pbxContact[fieldCode] as DealItem;
//             let bitrixId = null;
//             let bitrixValue = code as string | number;
//             let currentContact = contactState.contacts.find(
//                 (item: PBXContactStateItem) => item.contact.ID === contactId
//             ) as PBXContactStateItem;

//             if (currentContact) {
//                 currentContact = { ...currentContact };
//                 let currentField: PBXContactField | undefined;

//                 (currentContact as PBXContactStateItem).fields;

//                 const resultFields = currentContact.fields.map((field: PBXContactFieldData) => {
//                     if (field.field.code === fieldCode) {
//                         bitrixId = `UF_CRM_${field.field.bitrixId}`;
//                         currentField = { ...field.field } as PBXContactField;

//                         if (
//                             field.field.type === PBX_FIELD_TYPE.ENUM ||
//                             field.field.type === PBX_FIELD_TYPE.SELECT
//                         ) {
//                             const currentIndex = field.items.findIndex((item) => item.code === field.current?.code);
//                             const nextItem: PBXFieldItem<EV_CONTACT_PROP> =
//                                 code === null
//                                     ? field.items[0] // Если current = null, берем первый
//                                     : field.items[(currentIndex + 1) % field.items.length]; // Следующий элемент, если есть текущий

//                             bitrixValue = nextItem.bitrixId;
//                             return field.field.code === fieldCode ? { ...field, current: nextItem } : field;
//                         } else {
//                             return field.field.code === fieldCode ? { ...field, current: code } : field;
//                         }
//                     }
//                     return field;
//                 }) as PBXContactFieldData[];


//                 if (currentField) {
//                     if (bitrixId) {
//                         await bitrixAPI.getMethod(
//                             "crm.contact.update",
//                             {
//                                 ID: contactId,
//                                 fields: {
//                                     [bitrixId]: bitrixValue,
//                                 },

//                                 // SELECT: ['NAME', 'PHONE', 'ID']
//                             },
//                             domain
//                         );
//                     }
//                 }
//             }
//         };

// export const updateBaseContact =
//     (contactId: number) => async (dispatch: AppDispatchType, getState: AppGetState) => {
//         const state = getState();
//         const app = state.app;
//         const domain = app.domain || "april-dev.bitrix24.ru";
//         const contactState = state.pbxContact;

//         // const bxCompanyFieldState = state.pbxContact[fieldCode] as DealItem;

//         let currentContact = contactState.contacts.find(
//             (item: PBXContactStateItem) => item.contact.ID === contactId
//         ) as PBXContactStateItem;

//         if (currentContact) {
//             let currentField: PBXContactField | undefined;

//             const contact = (currentContact as PBXContactStateItem).contact as BXContact;
//             const updtData = {} as { [key: string]: string | [{ VALUE: string }] };

//             updtData[EV_BASE_CONTACT_ITEM_PROP.NAME] = contact[EV_BASE_CONTACT_ITEM_PROP.NAME];
//             updtData[EV_BASE_CONTACT_ITEM_PROP.LAST_NAME] = contact[EV_BASE_CONTACT_ITEM_PROP.LAST_NAME];
//             updtData[EV_BASE_CONTACT_ITEM_PROP.POST] = contact[EV_BASE_CONTACT_ITEM_PROP.POST];
//             updtData[EV_BASE_CONTACT_ITEM_PROP.PHONE] = contact[EV_BASE_CONTACT_ITEM_PROP.PHONE];
//             updtData[EV_BASE_CONTACT_ITEM_PROP.EMAIL] = contact[EV_BASE_CONTACT_ITEM_PROP.EMAIL];
//             updtData[EV_BASE_CONTACT_ITEM_PROP.COMMENTS] = contact[EV_BASE_CONTACT_ITEM_PROP.COMMENTS];


//             await bitrixAPI.getMethod(
//                 "crm.contact.update",
//                 {
//                     ID: contactId,
//                     fields: updtData,

//                     // SELECT: ['NAME', 'PHONE', 'ID']
//                 },
//                 domain
//             );
//         }
//     };

