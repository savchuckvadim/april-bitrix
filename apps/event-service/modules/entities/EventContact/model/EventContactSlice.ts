import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { EV_CONTACT_PROP, EV_CONTACT_TYPE } from "../type/event-contact-type";
import { ContactEventType, SetCreatingContactProp, SetCreatingContact, SetCurrentEventContact, SetFetchedEventContact } from "../type/state-contact-type";
import { EV_BASE_CONTACT_ITEM_PROP, PBXContactStateItem } from "../type/pbx-contact-type";
import { BXContact } from "@workspace/bx";

//TYPES
export type EventContactState = typeof initialState



const initialState = {

    contacts: [] as PBXContactStateItem[],
    current: {
        contact: null as null | undefined | PBXContactStateItem,
        plan: null as null | undefined | PBXContactStateItem,
        report: null as null | undefined | PBXContactStateItem,
        // default: null as null | EVContact,
        // type: null as 'new' | 'updating' | 'existing' | null
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
    // errors: {
    //     fetching: [] as string[],
    // }
}


const eventContactSlice = createSlice({
    name: 'eventContactSlice',
    initialState,
    reducers: {

        setFetchedContacts: (
            state: EventContactState,
            action: PayloadAction<SetFetchedEventContact>

        ) => {

            const pay = action.payload
            state.contacts = pay.contacts
            if (pay.contacts.length) {
                state.current.contact = null
            } else {
                state.current.contact = null
            }
            state.isFetched = true
            state.isLoading = false

        },
        setCurrentContact: (
            state: EventContactState,
            action: PayloadAction<SetCurrentEventContact>

        ) => {

            const pay = action.payload
            // if (pay.contactId) {
            const currentContact = state.contacts.find((contact) => contact.ID == pay.contactId)
            // state.current.contact = currentContact

            if (pay.type == 'plan') {
                state.current.plan = currentContact

            } else if (pay.type == 'report') {
                state.current.report = currentContact

            }
            // } else {
            //     state.current.contact = null
            // }


        },

        setInitCurrentContact: (
            state: EventContactState,
            action: PayloadAction<SetCurrentEventContact>

        ) => {

            const pay = action.payload
            if (pay.contactId) {
                const currentContact = state.contacts.find((contact) => contact.ID == pay.contactId)
                state.current.report = currentContact
                state.current.plan = currentContact

            } else {
                state.current.report = null
                state.current.plan = null

            }


        },


        setCreatingContact: (
            state: EventContactState,
            action: PayloadAction<SetCreatingContact>

        ) => {
            const isCreating = action.payload.isCreating
            state.isCreating = isCreating
            state.creating.type = isCreating ? action.payload.type : null
        },
        setContactProp: (
            state: EventContactState,
            action: PayloadAction<SetCreatingContactProp>

        ) => {
            const prop = action.payload.type as EV_CONTACT_PROP
            if (prop) {
                if (prop != 'ID') {
                    state.creating.contact[prop] = action.payload.value

                }
            }
        },
        setCreatingFetching: (
            state: EventContactState,
            action: PayloadAction<{ status: boolean }>
        ) => {
            state.creating.isFetched = action.payload.status
        },
        setCreatedContact: (
            state: EventContactState,
            action: PayloadAction<{ type: EV_CONTACT_TYPE, contact: PBXContactStateItem }>
        ) => {
            const crtdContact = action.payload.contact
            const crtdContactType = action.payload.type

            const isHave = state.contacts.find(contact => contact.ID == crtdContact.ID)
            !isHave && state.contacts.push(crtdContact)

            state.current[crtdContactType] = crtdContact
        },

        setUpdatingContactStatus: (
            state: EventContactState,
            action: PayloadAction<{ contactId: number, status: boolean }>
        ) => {
            const pay = action.payload
            const contactId = pay.contactId
            const updatingContact = state.contacts.find(contact => contact.ID === contactId)
            if (updatingContact && pay.status) {
                state.isUpdating = true
                state.current.contact = updatingContact
            } else {
                state.isUpdating = false
                state.current.contact = null
            }
        },
        setBaseProp: (state: EventContactState,
            action: PayloadAction<{ value: string, propName: string }>) => {
            const pay = action.payload
            const propName = pay.propName
            const value = pay.value
            
            if (state.current.contact) {
                state.current.contact[propName] = value
            }
        }


    },

});


//utils


export const eventContactReducer = eventContactSlice.reducer;

// Экспорт actions
export const eventContactActions = eventContactSlice.actions;