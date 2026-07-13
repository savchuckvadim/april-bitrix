import { useReducer, useCallback } from 'react';
import { EV_CONTACT_PROP, EV_CONTACT_TYPE } from '../type/event-contact-type';
import { ContactEventType, SetCreatingContactProp, SetCreatingContact, SetCurrentEventContact, SetFetchedEventContact } from '../type/state-contact-type';
import { EV_BASE_CONTACT_ITEM_PROP, PBXContactStateItem } from '../type/pbx-contact-type';

// Types
type EventContactState = {
    contacts: PBXContactStateItem[];
    current: {
        contact: null | undefined | PBXContactStateItem;
        plan: null | undefined | PBXContactStateItem;
        report: null | undefined | PBXContactStateItem;
    };
    creating: {
        type: null | ContactEventType;
        contact: { [key in EV_CONTACT_PROP]: string };
        errors: string[];
        isFetched: boolean;
    };
    isFetched: boolean;
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
};

type EventContactAction =
    | { type: 'SET_FETCHED_CONTACTS'; payload: SetFetchedEventContact }
    | { type: 'SET_CURRENT_CONTACT'; payload: SetCurrentEventContact }
    | { type: 'SET_INIT_CURRENT_CONTACT'; payload: SetCurrentEventContact }
    | { type: 'SET_CREATING_CONTACT'; payload: SetCreatingContact }
    | { type: 'SET_CONTACT_PROP'; payload: SetCreatingContactProp }
    | { type: 'SET_CREATING_FETCHING'; payload: { status: boolean } }
    | { type: 'SET_CREATED_CONTACT'; payload: { type: EV_CONTACT_TYPE; contact: PBXContactStateItem } }
    | { type: 'SET_UPDATING_CONTACT_STATUS'; payload: { contactId: number; status: boolean } }
    | { type: 'SET_BASE_PROP'; payload: { value: string; propName: string } };

const initialState: EventContactState = {
    contacts: [],
    current: {
        contact: null,
        plan: null,
        report: null,
    },
    creating: {
        type: null,
        contact: {
            [EV_CONTACT_PROP.ID]: '',
            [EV_CONTACT_PROP.NAME]: '',
            [EV_CONTACT_PROP.PHONE]: '',
            [EV_CONTACT_PROP.EMAIL]: '',
            [EV_CONTACT_PROP.POST]: '',
        },
        errors: [''],
        isFetched: false,
    },
    isFetched: false,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
};

function eventContactReducer(state: EventContactState, action: EventContactAction): EventContactState {
    switch (action.type) {
        case 'SET_FETCHED_CONTACTS': {
            const { contacts } = action.payload;
            return {
                ...state,
                contacts,
                current: {
                    ...state.current,
                    contact: contacts.length ? null : null,
                },
                isFetched: true,
                isLoading: false,
            };
        }

        case 'SET_CURRENT_CONTACT': {
            const { contactId, type } = action.payload;
            const currentContact = state.contacts.find((contact) => contact.ID === contactId);

            return {
                ...state,
                current: {
                    ...state.current,
                    [type]: currentContact,
                },
            };
        }

        case 'SET_INIT_CURRENT_CONTACT': {
            const { contactId } = action.payload;
            const currentContact = contactId
                ? state.contacts.find((contact) => contact.ID === contactId)
                : null;

            return {
                ...state,
                current: {
                    ...state.current,
                    report: currentContact,
                    plan: currentContact,
                },
            };
        }

        case 'SET_CREATING_CONTACT': {
            const { isCreating, type } = action.payload;
            return {
                ...state,
                isCreating,
                creating: {
                    ...state.creating,
                    type: isCreating ? type : null,
                },
            };
        }

        case 'SET_CONTACT_PROP': {
            const { type, value } = action.payload;
            const prop = type as EV_CONTACT_PROP;

            if (prop && prop !== 'ID') {
                return {
                    ...state,
                    creating: {
                        ...state.creating,
                        contact: {
                            ...state.creating.contact,
                            [prop]: value,
                        },
                    },
                };
            }
            return state;
        }

        case 'SET_CREATING_FETCHING': {
            return {
                ...state,
                creating: {
                    ...state.creating,
                    isFetched: action.payload.status,
                },
            };
        }

        case 'SET_CREATED_CONTACT': {
            const { type, contact } = action.payload;
            const isHave = state.contacts.find(c => c.ID === contact.ID);
            const newContacts = isHave ? state.contacts : [...state.contacts, contact];

            return {
                ...state,
                contacts: newContacts,
                current: {
                    ...state.current,
                    [type]: contact,
                },
            };
        }

        case 'SET_UPDATING_CONTACT_STATUS': {
            const { contactId, status } = action.payload;
            const updatingContact = state.contacts.find(contact => contact.ID === contactId);

            return {
                ...state,
                isUpdating: status,
                current: {
                    ...state.current,
                    contact: status ? updatingContact : null,
                },
            };
        }

        case 'SET_BASE_PROP': {
            const { value, propName } = action.payload;
            if (!state.current.contact) return state;

            return {
                ...state,
                current: {
                    ...state.current,
                    contact: {
                        ...state.current.contact,
                        [propName]: value,
                    },
                },
            };
        }

        default:
            return state;
    }
}

export function useEventContact() {
    const [state, dispatch] = useReducer(eventContactReducer, initialState);

    const setFetchedContacts = useCallback((payload: SetFetchedEventContact) => {
        dispatch({ type: 'SET_FETCHED_CONTACTS', payload });
    }, []);

    const setCurrentContact = useCallback((payload: SetCurrentEventContact) => {
        dispatch({ type: 'SET_CURRENT_CONTACT', payload });
    }, []);

    const setInitCurrentContact = useCallback((payload: SetCurrentEventContact) => {
        dispatch({ type: 'SET_INIT_CURRENT_CONTACT', payload });
    }, []);

    const setCreatingContact = useCallback((payload: SetCreatingContact) => {
        dispatch({ type: 'SET_CREATING_CONTACT', payload });
    }, []);

    const setContactProp = useCallback((payload: SetCreatingContactProp) => {
        dispatch({ type: 'SET_CONTACT_PROP', payload });
    }, []);

    const setCreatingFetching = useCallback((status: boolean) => {
        dispatch({ type: 'SET_CREATING_FETCHING', payload: { status } });
    }, []);

    const setCreatedContact = useCallback((type: EV_CONTACT_TYPE, contact: PBXContactStateItem) => {
        dispatch({ type: 'SET_CREATED_CONTACT', payload: { type, contact } });
    }, []);

    const setUpdatingContactStatus = useCallback((contactId: number, status: boolean) => {
        dispatch({ type: 'SET_UPDATING_CONTACT_STATUS', payload: { contactId, status } });
    }, []);

    const setBaseProp = useCallback((value: string, propName: string) => {
        dispatch({ type: 'SET_BASE_PROP', payload: { value, propName } });
    }, []);

    return {
        state,
        actions: {
            setFetchedContacts,
            setCurrentContact,
            setInitCurrentContact,
            setCreatingContact,
            setContactProp,
            setCreatingFetching,
            setCreatedContact,
            setUpdatingContactStatus,
            setBaseProp,
        },
    };
} 