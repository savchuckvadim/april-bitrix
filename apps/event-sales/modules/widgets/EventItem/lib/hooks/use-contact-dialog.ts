'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    bindContactToCurrentEntity,
    EV_CONTACT_TYPE,
    eventContactActions,
} from '@/modules/entities/EventContact';
import type { PBXContactFieldData } from '@/modules/entities/EventContact/type/pbx-contact-type';
import {
    useContactCard,
    useContactDetails,
    useContactTraits,
    type ContactDetailsView,
} from './use-contact-card';

export interface ContactDialogView {
    isOpen: boolean;
    /** Просмотр: ни одного поля ввода — листать характеристики безопасно. */
    isView: boolean;
    /** Какой из двух контактов сейчас показан. */
    side: EV_CONTACT_TYPE;
    setSide: (side: EV_CONTACT_TYPE) => void;
    close: () => void;
    hasContact: boolean;
    contactId: number | null;
    details: ContactDetailsView;
    traits: PBXContactFieldData[];
    /** Имя контакта отчёта — для кнопки «тот же, что в отчёте». */
    reportName: string;
    /** План и отчёт разошлись: предлагаем скопировать отчётный. */
    canCopyFromReport: boolean;
    copyFromReport: () => void;
    /** Контакт есть только в лиде, а работаем в сделке. */
    canAttachToDeal: boolean;
    attachToDeal: () => void;
}

/**
 * Состояние развёрнутой карточки контакта.
 *
 * Открывают её из двух мест (карточка отчёта и колонка плана), поэтому режим и
 * стартовая сторона живут в сторе, а переключение внутри окна — локально:
 * следующее открытие должно снова начинаться с той стороны, откуда позвали.
 */
export const useContactDialog = (): ContactDialogView => {
    const dispatch = useAppDispatch();
    const dialog = useAppSelector(s => s.contact.dialog);
    const sourceById = useAppSelector(s => s.contact.sourceById);
    const hasDeal = useAppSelector(s => Boolean(s.app.bitrix.deal));
    const card = useContactCard();

    const [override, setOverride] = useState<EV_CONTACT_TYPE | null>(null);
    const side = override ?? dialog?.side ?? EV_CONTACT_TYPE.REPORT;

    const contact = side === EV_CONTACT_TYPE.REPORT ? card.report : card.plan;
    const details = useContactDetails(contact);
    const traits = useContactTraits(contact);

    const contactId = contact ? Number(contact.ID) : null;
    const sources = contactId ? (sourceById[contactId] ?? []) : [];

    return {
        isOpen: Boolean(dialog),
        isView: dialog?.mode === 'view',
        side,
        setSide: setOverride,
        close: () => {
            dispatch(eventContactActions.closeContactDialog());
            setOverride(null);
        },
        hasContact: Boolean(contact),
        contactId,
        details,
        traits,
        reportName: card.name,
        canCopyFromReport:
            side === EV_CONTACT_TYPE.PLAN &&
            Boolean(card.report) &&
            Boolean(card.planName),
        copyFromReport: () => {
            if (!card.report) return;
            dispatch(
                eventContactActions.setCurrentContact({
                    type: EV_CONTACT_TYPE.PLAN,
                    contactId: Number(card.report.ID),
                }),
            );
        },
        // Связь у контакта только лидовая: в сделке его в следующий раз
        // просто не найдут.
        canAttachToDeal:
            hasDeal &&
            !sources.includes('deal') &&
            (sources.includes('lead') || sources.includes('relatedLead')),
        attachToDeal: () => {
            if (contactId) dispatch(bindContactToCurrentEntity(contactId));
        },
    };
};
