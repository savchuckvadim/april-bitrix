import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { Bitrix } from '@workspace/bitrix';
import { BXContact, BXTask } from '@workspace/bx';
import { Portal } from '@/modules/app/types/portal/portal-type';
import { eventContactActions } from './EventContactSlice';
import {
    addSource,
    dealContactIds,
    leadContactId,
    relatedLeadIds,
    uniqueIds,
    type ContactSourceMap,
} from '../lib/contact-sources';
import { EV_CONTACT_PROP, EV_CONTACT_TYPE } from '../type/event-contact-type';
import { PBXContactStateItem } from '../type/pbx-contact-type';
import {
    chunkArray,
    normalizePhone,
    validateInput,
} from '../util/contact-util';
import {
    getContactsRequestSelect,
    getPbxContactByContact,
} from '../util/pbx-contact-util';
import { getCrmLinksFromRaw } from '@/modules/entities/EventTask/lib/task-links';
import { reportFrontError } from '@/modules/shared/front-error';
import {
    emptyErrors,
    eventActions,
} from '@/modules/processes/event/model/EventSlice';
import {
    EV_ERROR_CODE,
    SetErrorsPayload,
} from '@/modules/processes/event/types/event-types';

/**
 * Контакты клиента ИЗ ВСЕХ СВЯЗЕЙ: компании, сделки, лида, лида сделки и
 * привязок задачи.
 *
 * Раньше источник был один — контакты компании, и в сделке без компании (а
 * равно в лиде) список молча оставался пустым: «Контактов пока нет» при
 * заполненном контакте в самой сделке. Теперь собираем отовсюду, помним
 * источник каждого и дописываем в общий список — вызов идемпотентен, повторный
 * запрос спрашивает портал только про новые id.
 *
 * Зовётся listener'ами: портал загружен, компания появилась позже, задачи
 * приехали (у задачи свои CRM-привязки).
 */
export const collectRelatedContacts =
    (portal: Portal) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { company, deal, lead } = state.app.bitrix;
        const bitrix = Bitrix.getService();
        const sources: ContactSourceMap = {};

        if (company) {
            const items = await bitrix.company.contactItemsGet(company.ID);
            addSource(
                sources,
                'company',
                uniqueIds((items ?? []).map(item => Number(item.CONTACT_ID))),
            );
        }

        if (deal) {
            const items = await bitrix.deal.contactItemsGet(deal.ID);
            addSource(sources, 'deal', [
                ...uniqueIds(
                    (items ?? []).map(item => Number(item.CONTACT_ID)),
                ),
                ...dealContactIds(deal as unknown as Record<string, unknown>),
            ]);
        }

        const ownLeadContact = leadContactId(
            lead as unknown as Record<string, unknown> | null,
        );
        if (ownLeadContact) addSource(sources, 'lead', [ownLeadContact]);

        // Лид, из которого выросла сделка, и лиды из привязок задачи: контакт
        // мог остаться только там — в сделку его никто не переносил.
        const taskLinks = getCrmLinksFromRaw(
            state.eventTask.current?.ufCrmTask,
        );
        const leadIds = relatedLeadIds({
            deal: deal as unknown as Record<string, unknown> | null,
            lead: lead as unknown as Record<string, unknown> | null,
            taskLeadIds: taskLinks.leadIds,
        });
        if (leadIds.length) {
            const response = await bitrix.lead.getList(
                { ID: leadIds } as never,
                ['ID', 'CONTACT_ID'],
            );
            addSource(
                sources,
                'relatedLead',
                uniqueIds(
                    (response?.result ?? []).map(item =>
                        Number(item.CONTACT_ID),
                    ),
                ),
            );
        }

        addSource(sources, 'task', uniqueIds(taskLinks.contactIds));

        await dispatch(loadContactsByIds(portal, sources));
    };

/**
 * Догрузить контакты по id и записать их источники.
 *
 * Уже известные повторно не спрашиваем — источник им дописываем всё равно:
 * один и тот же человек нередко висит и в компании, и в лиде.
 */
export const loadContactsByIds =
    (portal: Portal, sources: ContactSourceMap) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const ids = Object.keys(sources).map(Number);
        if (!ids.length) return;

        const known = new Set(
            getState().contact.contacts.map(contact => Number(contact.ID)),
        );
        const missing = ids.filter(id => !known.has(id));

        const contacts: BXContact[] = [];
        if (missing.length) {
            const bitrix = Bitrix.getService();
            const select = getContactsRequestSelect(portal);
            for (const chunk of chunkArray<number>(missing, 50)) {
                const response = await bitrix.contact.getList(
                    { ID: chunk } as never,
                    select,
                );
                if (Array.isArray(response?.result)) {
                    contacts.push(
                        ...(response.result as unknown as BXContact[]),
                    );
                }
            }
        }

        dispatch(setInitPBXContact(portal, contacts, sources));
    };

/** Контакт отчёта/плана из crm-привязок текущей задачи (C_xxx, но не CO_xxx). */
export const setCurrentReportContact =
    (currentTask: BXTask | null) => async (dispatch: AppDispatch) => {
        if (currentTask?.ufCrmTask) {
            const contactId =
                getCrmLinksFromRaw(currentTask.ufCrmTask).contactIds[0] ?? null;
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
    (portal: Portal, contacts: BXContact[], sources?: ContactSourceMap) =>
    async (dispatch: AppDispatch) => {
        const allContacts: PBXContactStateItem[] = contacts.map(contact =>
            getPbxContactByContact(portal, contact),
        );
        dispatch(
            eventContactActions.setFetchedContacts({
                contacts: allContacts,
                sources,
            }),
        );
    };

/**
 * Привязать контакт к сущности, в которой мы сейчас работаем.
 *
 * Контакт, заведённый «в компанию», в сделке без компании повисал ничей: в
 * следующий раз его было негде взять. Компания задаётся при создании
 * (COMPANY_ID), а сделке и лиду связь проставляется отдельно — здесь.
 *
 * Сделке связи ЗАМЕНЯЮТСЯ целиком (`crm.deal.contact.items.set`), поэтому
 * дописываем к уже существующим. Лиду контакт один — чужой не перетираем.
 */
export const bindContactToCurrentEntity =
    (contactId: number) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const { deal, lead } = getState().app.bitrix;
        const id = Number(contactId);
        if (!Number.isFinite(id) || id <= 0) return;

        const bitrix = Bitrix.getService();

        try {
            if (deal) {
                const items = await bitrix.deal.contactItemsGet(deal.ID);
                const existing = uniqueIds(
                    (items ?? []).map(item => Number(item.CONTACT_ID)),
                );
                if (!existing.includes(id)) {
                    await bitrix.deal.contactItemsSet(deal.ID, [
                        ...existing,
                        id,
                    ]);
                }
            } else if (lead && !leadContactId(lead as never)) {
                await bitrix.lead.update(lead.ID, { CONTACT_ID: String(id) });
            }
        } catch (error) {
            console.error('bindContactToCurrentEntity error', id, error);
        }

        // Источники пересобираем: контакт только что стал «из сделки».
        const portal = getState().portal.portal;
        if (portal) await dispatch(collectRelatedContacts(portal as Portal));
    };

/** Создание нового контакта в Bitrix и подстановка его в план/отчёт. */
export const saveCreatedContact =
    (type: EV_CONTACT_TYPE) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        dispatch(eventContactActions.setCreatingFetching({ status: true }));

        const state = getState();
        const portal = state.portal.portal as Portal;
        // Края обрезаем ПЕРЕД сохранением, а не на вводе: скопированные из
        // письма имя и почта приходят с пробелами, но обрезать на каждом
        // нажатии значит не давать поставить пробел между именем и фамилией.
        const raw = state.contact.creating.contact;
        const creatingContact = Object.fromEntries(
            Object.entries(raw).map(([key, value]) => [key, value.trim()]),
        ) as typeof raw;

        const resultErrors: SetErrorsPayload = {
            isError: false,
            errors: { ...emptyErrors },
        };

        // Обязательны только имя и телефон: контакт заводят посреди разговора,
        // и требовать почту с должностью значит останавливать этот разговор.
        // Заполненную почту всё равно проверяем — кривая хуже отсутствующей.
        if (!creatingContact.NAME) {
            resultErrors.errors[EV_ERROR_CODE.CONTACT_NAME] =
                'Напишите имя контакта';
        }
        if (creatingContact.EMAIL) {
            resultErrors.errors[EV_ERROR_CODE.CONTACT_EMAIL] = validateInput(
                creatingContact.EMAIL,
                EV_CONTACT_PROP.EMAIL,
            );
        }
        if (!creatingContact.PHONE) {
            resultErrors.errors[EV_ERROR_CODE.CONTACT_PHONE] =
                'Напишите телефон контакта';
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
            dispatch(eventContactActions.setCreatingStage({ stage: 'saving' }));
            try {
                const currentCompanyId = state.app.bitrix.company?.ID;
                // TODO(Фаза 5): ответственный — из department PLAN responsible
                const currentUserId = state.app.bitrix.user?.ID;

                const fields = {
                    ...creatingContact,
                    // В портал уходит нормализованный номер: набранный «как в
                    // плейсхолдере» он не совпал бы с номером того же человека
                    // из другого источника, и дубли не нашлись бы.
                    PHONE: [{ VALUE: normalizePhone(creatingContact.PHONE) }],
                    // Пустую почту не отправляем вовсе: Битрикс запишет пустое
                    // мультиполе, и потом непонятно, есть она или нет.
                    ...(creatingContact.EMAIL
                        ? { EMAIL: [{ VALUE: creatingContact.EMAIL }] }
                        : { EMAIL: undefined }),
                    ASSIGNED_BY_ID: currentUserId,
                    COMPANY_ID: currentCompanyId,
                };

                const bitrix = Bitrix.getService();
                const contactId = (await bitrix.contact.set(fields as never))
                    ?.result;
                const contact = (await bitrix.contact.get(Number(contactId)))
                    ?.result as unknown as BXContact;

                if (!contactId || !contact) {
                    throw new Error('Портал не вернул созданный контакт');
                }

                const pbxContact = getPbxContactByContact(portal, contact);
                dispatch(
                    eventContactActions.setCreatedContact({
                        contact: pbxContact,
                        type,
                    }),
                );
                // Компания проставилась при создании; сделке и лиду связь
                // нужно завести отдельно — иначе контакт повиснет ничей.
                await dispatch(bindContactToCurrentEntity(Number(contactId)));

                // Окно НЕ закрываем: оно превращается в правку созданного —
                // характеристики и детали дозаполняются тут же.
                dispatch(
                    eventContactActions.setCreatingStage({
                        stage: 'created',
                        createdContactId: Number(contactId),
                    }),
                );
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : String(error);
                dispatch(
                    eventContactActions.setCreatingStage({
                        stage: 'form',
                        error: 'Не удалось создать контакт — попробуйте ещё раз',
                    }),
                );
                // Тревога: упавшее создание контакта — потерянная работа
                // менеджера, о ней должен узнать человек, а не только лог.
                reportFrontError({
                    place: 'contact.create',
                    message,
                    domain: state.app.domain,
                    userId: state.app.bitrix.user?.ID,
                    withTg: true,
                });
            }
        }

        dispatch(eventContactActions.setCreatingFetching({ status: false }));
    };

export const setUpdatingContactStatus =
    (type: EV_CONTACT_TYPE, status: boolean) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const contactId = getState().contact.current[type]?.ID;
        if (contactId) {
            dispatch(
                eventContactActions.setUpdatingContactStatus({
                    contactId,
                    status,
                }),
            );
        }
    };

/**
 * Правка базовых полей созданного контакта (ФИО, телефон, почта, должность).
 *
 * Пессимистично: сначала портал, потом стейт — здесь правят данные человека,
 * и показать «сохранено» раньше ответа значило бы врать. Ошибка возвращается
 * текстом в окно и уходит тревогой: правка контакта — работа менеджера,
 * терять её молча нельзя.
 */
export const updateContactBaseFields =
    (contactId: number, fields: Partial<Record<EV_CONTACT_PROP, string>>) =>
    async (
        dispatch: AppDispatch,
        getState: AppGetState,
    ): Promise<string | null> => {
        const state = getState();
        const payload: Record<string, unknown> = {};
        /** Что реально ушло на портал — только это меняем и в сторе. */
        const sentProps = new Set<EV_CONTACT_PROP>();

        const contact = state.contact.contacts.find(
            item => Number(item.ID) === contactId,
        );

        // Мультиполя Битрикса (PHONE/EMAIL): значение БЕЗ ID существующей
        // записи не заменяет её, а ДОБАВЛЯЕТ ещё одну — в CRM копились
        // дубли телефонов, пока стор показывал «заменили». Замена/очистка
        // требует ID записи (VALUE: '' с ID — удаление).
        const multiFieldUpdate = (
            raw: unknown,
            value: string,
        ): Array<Record<string, string>> | null => {
            const existing = Array.isArray(raw)
                ? (raw[0] as { ID?: string; VALUE?: string } | undefined)
                : undefined;
            if (existing?.ID) {
                if ((existing.VALUE ?? '') === value) return null; // не изменилось
                return [{ ID: String(existing.ID), VALUE: value }];
            }
            return value ? [{ VALUE: value }] : null;
        };

        const name = fields[EV_CONTACT_PROP.NAME]?.trim();
        if (name !== undefined) {
            payload.NAME = name;
            sentProps.add(EV_CONTACT_PROP.NAME);
        }
        const post = fields[EV_CONTACT_PROP.POST]?.trim();
        if (post !== undefined) {
            payload.POST = post;
            sentProps.add(EV_CONTACT_PROP.POST);
        }
        const phone = fields[EV_CONTACT_PROP.PHONE]?.trim();
        if (phone !== undefined) {
            const rows = multiFieldUpdate(contact?.PHONE, phone);
            if (rows) {
                payload.PHONE = rows;
                sentProps.add(EV_CONTACT_PROP.PHONE);
            }
        }
        const email = fields[EV_CONTACT_PROP.EMAIL]?.trim();
        if (email !== undefined) {
            const rows = multiFieldUpdate(contact?.EMAIL, email);
            if (rows) {
                payload.EMAIL = rows;
                sentProps.add(EV_CONTACT_PROP.EMAIL);
            }
        }

        if (!Object.keys(payload).length) return null;

        try {
            const response = await Bitrix.getService().contact.update(
                contactId,
                payload as never,
            );
            if (!response?.result) {
                throw new Error('crm.contact.update вернул отказ');
            }

            // Стейт меняем ТОЛЬКО для того, что реально записалось: иначе
            // стор расходился с CRM (стёртая почта пропадала на экране,
            // но оставалась на портале).
            for (const [prop, value] of Object.entries(fields)) {
                if (value === undefined) continue;
                if (!sentProps.has(prop as EV_CONTACT_PROP)) continue;
                dispatch(
                    eventContactActions.setContactBaseField({
                        contactId,
                        prop: prop as EV_CONTACT_PROP,
                        value: value.trim(),
                    }),
                );
            }
            return null;
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            reportFrontError({
                place: 'contact.update',
                message,
                domain: state.app.domain,
                userId: state.app.bitrix.user?.ID,
                withTg: true,
                context: { contactId, fields: Object.keys(fields) },
            });
            return 'Не сохранилось — проверьте данные и попробуйте ещё раз';
        }
    };
