import { EV_CONTACT_PROP } from './event-contact-type';
import type { ContactSourceMap } from '../lib/contact-sources';
import { PBXContactStateItem } from './pbx-contact-type';

export interface SetFetchedEventContact {
    contacts: PBXContactStateItem[];
    /** id → откуда пришёл контакт (компания, сделка, лид, привязка задачи). */
    sources?: ContactSourceMap;
}

export interface SetCurrentEventContact {
    type: ContactEventType;
    contactId: number | '' | null;
}

export interface SetCreatingContact {
    type: ContactEventType | null;
    isCreating: boolean;
}

export interface SetCreatingContactProp {
    type: EV_CONTACT_PROP;
    value: string;
}

export type ContactEventType = 'plan' | 'report' | 'init';
