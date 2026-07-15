import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { Bitrix } from '@workspace/bitrix';
import { BXContact, BXTask } from '@workspace/bx';
import { Portal } from '@/modules/app/types/portal/portal-type';
import { eventContactActions } from './EventContactSlice';
import { EV_CONTACT_PROP, EV_CONTACT_TYPE } from '../type/event-contact-type';
import { PBXContactStateItem } from '../type/pbx-contact-type';
import { chunkArray, validateInput } from '../util/contact-util';
import {
    getContactsRequestSelect,
    getPbxContactByContact,
} from '../util/pbx-contact-util';
import { emptyErrors, eventActions } from '@/modules/processes/event/model/EventSlice';
import {
    EV_ERROR_CODE,
    SetErrorsPayload,
} from '@/modules/processes/event/types/event-types';

/**
 * Контакты компании: crm.company.contact.items.get → crm.contact.list чанками
 * по 50. Вызывается listener'ом на portalActions.setPortal (store-listeners).
 */
export const getCompanyContacts =
    (portal: Portal) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const company = getState().app.bitrix.company;
        if (!company) return;

        const contactsFrom = (await Bitrix.getService().api.call(
            'crm.company.contact.items.get',
            { id: company.ID },
        )) as Array<{ CONTACT_ID: number }> | null;

        const contactIds = contactsFrom?.map(contact => contact.CONTACT_ID) ?? [];
        let contacts: BXContact[] = [];

        if (contactIds.length) {
            const select = getContactsRequestSelect();
            const allContacts: BXContact[] = [];
            for (const chunk of chunkArray<number>(contactIds, 50)) {
                const result = (await Bitrix.getService().api.call('crm.contact.list', {
                    filter: { ID: chunk },
                    select,
                })) as BXContact[] | null;
                if (result) allContacts.push(...result);
            }
            contacts = allContacts;
        }

        if (contacts.length) {
            dispatch(setInitPBXContact(portal, contacts));
        }
    };

/** Контакт отчёта/плана из crm-привязок текущей задачи (C_xxx, но не CO_xxx). */
export const setCurrentReportContact =
    (currentTask: BXTask | null) => async (dispatch: AppDispatch) => {
        if (currentTask?.ufCrmTask) {
            const taskContactCrm = currentTask.ufCrmTask.find(
                crm => crm.startsWith('C') && !crm.startsWith('CO'),
            );
            const contactId = taskContactCrm
                ? Number(taskContactCrm.split('_')[1])
                : null;
            if (contactId) {
                dispatch(
                    eventContactActions.setInitCurrentContact({
                        type: 'init',
                        contactId,
                    }),
                );
                return;
            }
        }

        if (!currentTask) {
            dispatch(
                eventContactActions.setInitCurrentContact({
                    type: 'init',
                    contactId: null,
                }),
            );
        }
    };

export const setInitPBXContact =
    (portal: Portal, contacts: BXContact[]) => async (dispatch: AppDispatch) => {
        const allContacts: PBXContactStateItem[] = contacts.map(contact =>
            getPbxContactByContact(portal, contact),
        );
        dispatch(eventContactActions.setFetchedContacts({ contacts: allContacts }));
    };

/** Создание нового контакта в Bitrix и подстановка его в план/отчёт. */
export const saveCreatedContact =
    (type: EV_CONTACT_TYPE) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        dispatch(eventContactActions.setCreatingFetching({ status: true }));

        const state = getState();
        const portal = state.portal.portal as Portal;
        const creatingContact = state.contact.creating.contact;

        const resultErrors: SetErrorsPayload = {
            isError: false,
            errors: { ...emptyErrors },
        };

        if (!creatingContact.NAME) {
            resultErrors.errors[EV_ERROR_CODE.CONTACT_NAME] = 'Напишите имя контакта';
        }
        if (!creatingContact.EMAIL) {
            resultErrors.errors[EV_ERROR_CODE.CONTACT_EMAIL] = 'Напишите email контакта';
        } else {
            resultErrors.errors[EV_ERROR_CODE.CONTACT_EMAIL] = validateInput(
                creatingContact.EMAIL,
                EV_CONTACT_PROP.EMAIL,
            );
        }
        if (!creatingContact.PHONE) {
            resultErrors.errors[EV_ERROR_CODE.CONTACT_PHONE] = 'Напишите телефон контакта';
        } else {
            resultErrors.errors[EV_ERROR_CODE.CONTACT_PHONE] = validateInput(
                creatingContact.PHONE,
                EV_CONTACT_PROP.PHONE,
            );
        }

        resultErrors.isError = Object.values(resultErrors.errors).some(Boolean);

        if (resultErrors.isError) {
            dispatch(eventActions.setErrors(resultErrors));
        } else {
            const currentCompanyId = state.app.bitrix.company?.ID;
            // TODO(Фаза 5): ответственный — из department PLAN responsible
            const currentUserId = state.app.bitrix.user?.ID;

            const fields = {
                ...creatingContact,
                PHONE: [{ VALUE: creatingContact.PHONE }],
                EMAIL: [{ VALUE: creatingContact.EMAIL }],
                ASSIGNED_BY_ID: currentUserId,
                COMPANY_ID: currentCompanyId,
            };

            const contactId = await Bitrix.getService().api.call('crm.contact.add', {
                fields,
            });
            const contact = (await Bitrix.getService().api.call('crm.contact.get', {
                ID: contactId,
            })) as BXContact;

            const pbxContact = getPbxContactByContact(portal, contact);
            if (contactId && pbxContact) {
                dispatch(
                    eventContactActions.setCreatedContact({
                        contact: pbxContact,
                        type,
                    }),
                );
            }

            dispatch(
                eventContactActions.setCreatingContact({
                    isCreating: false,
                    type: null,
                }),
            );
        }

        dispatch(eventContactActions.setCreatingFetching({ status: false }));
    };

export const setUpdatingContactStatus =
    (type: EV_CONTACT_TYPE, status: boolean) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const contactId = getState().contact.current[type]?.ID;
        if (contactId) {
            dispatch(
                eventContactActions.setUpdatingContactStatus({ contactId, status }),
            );
        }
    };
