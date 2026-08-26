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
     * Быстрый выбор/замена контакта: планировали на одного, дозвонились
     * другому — окно с поиском по существующим и «создать» внизу.
     * Состояние общее по той же причине, что и dialog: окно одно на экран.
     */
    quickPickSide: null as null | EV_CONTACT_TYPE,
    /**
     * Контакт задачи, который ещё не нашёлся в списке.
     *
     * Привязка задачи приходит раньше самих контактов, а раньше её просто
     * теряли: `find` по пустому списку давал undefined, и поле «с кем
     * говорили» оставалось пустым при заполненной привязке.
     */
    pendingCurrentId: null as number | null,
    /**
     * РУЧНОЙ выбор менеджера (быстрый выбор / создание контакта).
     *
     * Сильнее привязки задачи: авто-инициализация (в т.ч. перепривязка после
     * reload) его не затирает, а reset переносит его в pendingCurrentId —
     * иначе reload молча подменял выбранного человека контактом из привязки.
     * Гасится: явным снятием контакта, cleanEvent (contactId: null) и
     * открытием другой карточки (clearManualCurrent из меню-тонков).
     */
    manualCurrentId: null as number | null,
    current: {
        contact: null as null | undefined | PBXContactStateItem,
        plan: null as null | undefined | PBXContactStateItem,
        report: null as null | undefined | PBXContactStateItem,
    },
    creating: {
        /**
         * Этап окна создания: форма → сохранение → правка созданного.
         * Окно ОДНО и живёт через все три: после успеха оно не закрывается,
         * а превращается в редактируемую карточку нового человека.
         */
        stage: 'form' as 'form' | 'saving' | 'created',
        /** Ошибка сохранения — текстом в окне, значения полей не теряются. */
        error: null as string | null,
        /** Кто только что создан — его правит этап 'created'. */
        createdContactId: null as number | null,
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

/**
 * Перенавести `current.*` на свежий объект ПРАВЛЕНОГО контакта.
 *
 * Immer отдаёт свой draft на каждый путь доступа: правка через `contacts[i]`
 * не меняет объект, лежащий в `current.report`/`current.plan`, — карточка и
 * окно продолжали показывать старое значение и даже не перерисовывались
 * (ссылка та же). Хуже того, повторные клики уходили в портал, пока экран
 * стоял на прежнем.
 *
 * Строго по id и без `pendingCurrentId` — в отличие от relinkCurrent, который
 * заодно воскрешает отложенный контакт задачи: здесь это вернуло бы снятый
 * контакт плана обратно на экран.
 */
const relinkContactById = (
    state: EventContactState,
    contactId: number | string,
) => {
    const fresh = state.contacts.find(
        contact => Number(contact.ID) === Number(contactId),
    );
    if (!fresh) return;

    const isSame = (contact?: PBXContactStateItem | null) =>
        Number(contact?.ID) === Number(contactId);

    if (isSame(state.current.report)) state.current.report = fresh;
    if (isSame(state.current.plan)) state.current.plan = fresh;
    if (isSame(state.current.contact)) state.current.contact = fresh;
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
            // Явный клик менеджера — с этого момента авто-инициализация
            // из привязок задачи выбор не перезаписывает.
            state.manualCurrentId = Number(pay.contactId) || null;
        },
        setInitCurrentContact: (
            state: EventContactState,
            action: PayloadAction<SetCurrentEventContact>,
        ) => {
            const pay = action.payload;
            if (pay.contactId) {
                // Ручной выбор сильнее привязки задачи: перепривязка после
                // reload не подменяет выбранного человека — применяем его
                // как pending (список мог ещё не приехать).
                if (state.manualCurrentId) {
                    state.pendingCurrentId = state.manualCurrentId;
                    const manualContact = state.contacts.find(
                        contact =>
                            Number(contact.ID) === state.manualCurrentId,
                    );
                    if (manualContact) {
                        state.current.report = manualContact;
                        state.current.plan = manualContact;
                    }
                    return;
                }
                // Список может ещё не приехать — id запоминаем, ссылку
                // проставит relinkCurrent, когда контакт появится.
                state.pendingCurrentId = Number(pay.contactId);
                const currentContact = state.contacts.find(
                    contact => contact.ID == pay.contactId,
                );
                state.current.report = currentContact ?? null;
                state.current.plan = currentContact ?? null;
            } else {
                // Явный сброс (cleanEvent после отправки) снимает всё,
                // включая ручной выбор: следующий отчёт стартует с авто.
                state.pendingCurrentId = null;
                state.manualCurrentId = null;
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
            state.creating.stage = 'form';
            state.creating.error = null;
            state.creating.createdContactId = null;
            if (!isCreating) {
                // Закрыли окно — форма чистая к следующему открытию.
                state.creating.contact = {
                    [EV_CONTACT_PROP.NAME]: '',
                    [EV_CONTACT_PROP.PHONE]: '',
                    [EV_CONTACT_PROP.EMAIL]: '',
                    [EV_CONTACT_PROP.POST]: '',
                } as { [key in EV_CONTACT_PROP]: string };
            }
        },
        setCreatingStage: (
            state: EventContactState,
            action: PayloadAction<{
                stage: 'form' | 'saving' | 'created';
                error?: string | null;
                createdContactId?: number | null;
            }>,
        ) => {
            state.creating.stage = action.payload.stage;
            state.creating.error = action.payload.error ?? null;
            if (action.payload.createdContactId !== undefined) {
                state.creating.createdContactId =
                    action.payload.createdContactId;
            }
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
            // Созданный и подставленный контакт — тот же ручной выбор.
            state.manualCurrentId = Number(created.ID) || null;
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
            // Отложенный id гасим для ЛЮБОЙ стороны: иначе ближайшая
            // перелинковка вернёт снятый контакт обратно на экран.
            state.pendingCurrentId = null;
            // «Не с ним» отменяет и ручной выбор — дальше снова авто.
            state.manualCurrentId = null;
        },
        /**
         * Снять ручной выбор контакта (открытие ДРУГОЙ карточки из меню):
         * выбор менеджера привязан к делу, в новом деле контакт снова авто.
         */
        clearManualCurrent: (state: EventContactState) => {
            state.manualCurrentId = null;
        },
        /** Базовое поле контакта в общем списке (после удачного update). */
        setContactBaseField: (
            state: EventContactState,
            action: PayloadAction<{
                contactId: number;
                prop: EV_CONTACT_PROP;
                value: string;
            }>,
        ) => {
            const contact = state.contacts.find(
                item => Number(item.ID) === action.payload.contactId,
            );
            if (!contact) return;
            if (action.payload.prop === EV_CONTACT_PROP.PHONE) {
                contact.PHONE = [{ VALUE: action.payload.value }] as never;
            } else if (action.payload.prop === EV_CONTACT_PROP.EMAIL) {
                contact.EMAIL = [{ VALUE: action.payload.value }] as never;
            } else {
                contact[action.payload.prop] = action.payload.value as never;
            }
            relinkContactById(state, action.payload.contactId);
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
        /** Открыть быстрый выбор контакта для плана или отчёта. */
        openQuickPick: (
            state: EventContactState,
            action: PayloadAction<{ side: EV_CONTACT_TYPE }>,
        ) => {
            state.quickPickSide = action.payload.side;
        },
        closeQuickPick: (state: EventContactState) => {
            state.quickPickSide = null;
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
        /**
         * Полный сброс (reloadApp): список контактов копится идемпотентно
         * («уже известный не перезаписываем»), поэтому без сброса правки,
         * сделанные в CRM за пределами приложения, не доезжали бы никогда.
         * Пересбор — листенерами setPortal/setFetchedTasks на новом init.
         *
         * Ручной выбор менеджера при этом переживает reload: id переезжает
         * в pendingCurrentId, и relinkCurrent вернёт человека на карточку,
         * когда контакт снова приедет в список. Без этого «Обновить» (и
         * фоновый reload после отправки) молча подменял ручной выбор
         * контактом из привязки задачи.
         */
        reset: (state: EventContactState) => ({
            ...initialState,
            manualCurrentId: state.manualCurrentId,
            pendingCurrentId: state.manualCurrentId,
        }),
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
                relinkContactById(state, action.payload.contactId);
            }
        },
    },
});

export const eventContactReducer = eventContactSlice.reducer;
export const eventContactActions = eventContactSlice.actions;
