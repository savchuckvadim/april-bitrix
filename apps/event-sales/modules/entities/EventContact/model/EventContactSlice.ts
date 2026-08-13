import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { ContactSourceMap } from '../lib/contact-sources';
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
    /** Откуда пришёл каждый контакт: компания, сделка, лид, привязка задачи. */
    sourceById: {} as ContactSourceMap,
    /** `<contactId>:<fieldCode>` → почему характеристика не сохранилась. */
    fieldErrors: {} as Record<string, string>,
    /**
     * Развёрнутая карточка контакта: режим и сторона.
     *
     * Состояние общее, а не локальное в компоненте, потому что открывают её
     * из двух мест — карточки отчёта и колонки плана, — а окно должно быть
     * одно: два экземпляра рисовали бы два стекла друг на друге.
     */
    dialog: null as null | {
        mode: 'view' | 'edit';
        side: EV_CONTACT_TYPE;
    },
    /**
     * Контакт задачи, который ещё не нашёлся в списке.
     *
     * Привязка задачи приходит раньше самих контактов, а раньше её просто
     * теряли: `find` по пустому списку давал undefined, и поле «с кем
     * говорили» оставалось пустым при заполненной привязке.
     */
    pendingCurrentId: null as number | null,
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

/**
 * Пересобрать ссылки на текущие контакты после пополнения списка.
 *
 * `current.report` обязан быть ТЕМ ЖЕ объектом, что лежит в `contacts`:
 * правка характеристики меняет элемент списка, и по разным объектам карточка
 * показывала бы старое значение. Заодно подхватывается отложенный контакт
 * задачи, который до этого было негде взять.
 */
const relinkCurrent = (state: EventContactState) => {
    const byId = (id: number | string | null | undefined) =>
        state.contacts.find(contact => Number(contact.ID) === Number(id));

    const reportId = state.current.report?.ID ?? state.pendingCurrentId;
    const planId = state.current.plan?.ID ?? state.pendingCurrentId;

    state.current.report = byId(reportId) ?? state.current.report;
    state.current.plan = byId(planId) ?? state.current.plan;
};

const eventContactSlice = createSlice({
    name: 'eventContactSlice',
    initialState,
    reducers: {
        /**
         * Пополнение списка контактов из очередного источника.
         *
         * Именно пополнение, а не замена: источников несколько (компания,
         * сделка, лид, привязки задачи) и приходят они вразнобой. Замена
         * стирала бы контакты предыдущего источника и рвала ссылку на уже
         * выбранного человека.
         */
        setFetchedContacts: (
            state: EventContactState,
            action: PayloadAction<SetFetchedEventContact>,
        ) => {
            for (const contact of action.payload.contacts) {
                const isKnown = state.contacts.some(
                    item => Number(item.ID) === Number(contact.ID),
                );
                // Уже известный не перезаписываем: в нём могли быть правки
                // характеристик, сделанные до прихода второго источника.
                if (!isKnown) state.contacts.push(contact);
            }

            for (const [id, sources] of Object.entries(
                action.payload.sources ?? {},
            )) {
                const known = state.sourceById[Number(id)] ?? [];
                state.sourceById[Number(id)] = [
                    ...new Set([...known, ...sources]),
                ];
            }

            relinkCurrent(state);
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
                // Список может ещё не приехать — id запоминаем, ссылку
                // проставит relinkCurrent, когда контакт появится.
                state.pendingCurrentId = Number(pay.contactId);
                const currentContact = state.contacts.find(
                    contact => contact.ID == pay.contactId,
                );
                state.current.report = currentContact ?? null;
                state.current.plan = currentContact ?? null;
            } else {
                state.pendingCurrentId = null;
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
            const isHave = state.contacts.find(
                contact => contact.ID == created.ID,
            );
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
                state.current.contact[action.payload.propName] =
                    action.payload.value;
            }
        },
        /**
         * Снять контакт с отчёта или плана.
         *
         * Это отвязка от формы, а не удаление человека из CRM: карточка в
         * Битриксе остаётся — менеджер лишь говорит «не с ним».
         */
        clearCurrentContact: (
            state: EventContactState,
            action: PayloadAction<{ type: EV_CONTACT_TYPE }>,
        ) => {
            state.current[action.payload.type] = null;
            if (action.payload.type === EV_CONTACT_TYPE.REPORT) {
                state.pendingCurrentId = null;
            }
        },
        /** Открыть развёрнутую карточку: просмотр или правка, отчёт или план. */
        openContactDialog: (
            state: EventContactState,
            action: PayloadAction<{
                mode: 'view' | 'edit';
                side?: EV_CONTACT_TYPE;
            }>,
        ) => {
            state.dialog = {
                mode: action.payload.mode,
                side: action.payload.side ?? EV_CONTACT_TYPE.REPORT,
            };
        },
        closeContactDialog: (state: EventContactState) => {
            state.dialog = null;
        },
        /**
         * Характеристика не сохранилась в портале.
         *
         * Молчать тут нельзя: значение на экране откатывается, и без подписи
         * это выглядит как «приложение само передумало».
         */
        setContactFieldError: (
            state: EventContactState,
            action: PayloadAction<{
                contactId: number;
                fieldCode: string;
                message: string | null;
            }>,
        ) => {
            const key = `${action.payload.contactId}:${action.payload.fieldCode}`;
            if (action.payload.message) {
                state.fieldErrors[key] = action.payload.message;
            } else {
                delete state.fieldErrors[key];
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
