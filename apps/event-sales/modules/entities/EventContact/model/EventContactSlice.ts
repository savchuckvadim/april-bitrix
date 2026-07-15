import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { EV_CONTACT_PROP, EV_CONTACT_TYPE } from '../type/event-contact-type';
import {
    ContactEventType,
    SetCreatingContact,
    SetCreatingContactProp,
    SetCurrentEventContact,
    SetFetchedEventContact,
} from '../type/state-contact-type';
import { PBXContactStateItem } from '../type/pbx-contact-type';

export type EventContactState = typeof initialState;

const initialState = {
    contacts: [] as PBXContactStateItem[],
    current: {
        contact: null as null | undefined | PBXContactStateItem,
        plan: null as null | undefined | PBXContactStateItem,
        report: null as null | undefined | PBXContactStateItem,
    },
    creating: {
        type: null as null | ContactEventType,
        contact: {
            [EV_CONTACT_PROP.NAME]: '',
            [EV_CONTACT_PROP.PHONE]: '',
            [EV_CONTACT_PROP.EMAIL]: '',
            [EV_CONTACT_PROP.POST]: '',
        } as { [key in EV_CONTACT_PROP]: string },
        errors: [''],
        isFetched: false,
    },
    isFetched: false as boolean,
    isLoading: false as boolean,
    isCreating: false as boolean,
    isUpdating: false as boolean,
};

const eventContactSlice = createSlice({
    name: 'eventContactSlice',
    initialState,
    reducers: {
        setFetchedContacts: (
            state: EventContactState,
            action: PayloadAction<SetFetchedEventContact>,
        ) => {
            state.contacts = action.payload.contacts;
            state.current.contact = null;
            state.isFetched = true;
            state.isLoading = false;
        },
        setCurrentContact: (
            state: EventContactState,
            action: PayloadAction<SetCurrentEventContact>,
        ) => {
            const pay = action.payload;
            const currentContact = state.contacts.find(
                contact => contact.ID == pay.contactId,
            );
            if (pay.type == 'plan') {
                state.current.plan = currentContact;
            } else if (pay.type == 'report') {
                state.current.report = currentContact;
            }
        },
        setInitCurrentContact: (
            state: EventContactState,
            action: PayloadAction<SetCurrentEventContact>,
        ) => {
            const pay = action.payload;
            if (pay.contactId) {
                const currentContact = state.contacts.find(
                    contact => contact.ID == pay.contactId,
                );
                state.current.report = currentContact;
                state.current.plan = currentContact;
            } else {
                state.current.report = null;
                state.current.plan = null;
            }
        },
        setCreatingContact: (
            state: EventContactState,
            action: PayloadAction<SetCreatingContact>,
        ) => {
            const isCreating = action.payload.isCreating;
            state.isCreating = isCreating;
            state.creating.type = isCreating ? action.payload.type : null;
        },
        setContactProp: (
            state: EventContactState,
            action: PayloadAction<SetCreatingContactProp>,
        ) => {
            const prop = action.payload.type;
            if (prop && prop != EV_CONTACT_PROP.ID) {
                state.creating.contact[prop] = action.payload.value;
            }
        },
        setCreatingFetching: (
            state: EventContactState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.creating.isFetched = action.payload.status;
        },
        setCreatedContact: (
            state: EventContactState,
            action: PayloadAction<{
                type: EV_CONTACT_TYPE;
                contact: PBXContactStateItem;
            }>,
        ) => {
            const created = action.payload.contact;
            const isHave = state.contacts.find(contact => contact.ID == created.ID);
            if (!isHave) state.contacts.push(created);
            state.current[action.payload.type] = created;
        },
        setUpdatingContactStatus: (
            state: EventContactState,
            action: PayloadAction<{ contactId: number; status: boolean }>,
        ) => {
            const pay = action.payload;
            const updatingContact = state.contacts.find(
                contact => contact.ID === pay.contactId,
            );
            if (updatingContact && pay.status) {
                state.isUpdating = true;
                state.current.contact = updatingContact;
            } else {
                state.isUpdating = false;
                state.current.contact = null;
            }
        },
        setBaseProp: (
            state: EventContactState,
            action: PayloadAction<{ value: string; propName: string }>,
        ) => {
            if (state.current.contact) {
                state.current.contact[action.payload.propName] = action.payload.value;
            }
        },
        /** Текущее значение портального поля контакта (PbxContact feature). */
        setContactFieldCurrent: (
            state: EventContactState,
            action: PayloadAction<{
                contactId: number;
                fieldCode: string;
                current: PBXContactStateItem['fields'][number]['current'];
            }>,
        ) => {
            const contact = state.contacts.find(
                item => item.ID == action.payload.contactId,
            );
            const field = contact?.fields.find(
                f => f.field.code === action.payload.fieldCode,
            );
            if (field) {
                field.current = action.payload.current;
            }
        },
    },
});

export const eventContactReducer = eventContactSlice.reducer;
export const eventContactActions = eventContactSlice.actions;
