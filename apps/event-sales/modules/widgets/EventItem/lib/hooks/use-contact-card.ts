'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getCrmUrl } from '@/modules/app/lib/utills/url';
import {
    contactEmail,
    contactName,
    contactPhone,
    contactSourceLabel,
} from '@/modules/entities/EventContact/lib/contact-view';
import type {
    PBXContactFieldData,
    PBXContactStateItem,
} from '@/modules/entities/EventContact/type/pbx-contact-type';
import {
    editableTraits,
    traitsProgress,
} from '@/modules/features/PbxContact/lib/contact-field-view';

/** Всё, что показывают о человеке: и в карточке, и в развёрнутом окне. */
export interface ContactDetailsView {
    name: string;
    post: string | null;
    /** «из лида сделки» и т.п.; контакт компании — null, это норма. */
    source: string | null;
    phone: string | null;
    email: string | null;
    /** Карточка в портале; чужой/пустой домен — null, ссылку не рисуем. */
    crmUrl: string | null;
}

export interface ContactCardView extends ContactDetailsView {
    /** Есть ли что показывать: хоть один контакт в любой из связей клиента. */
    isAvailable: boolean;
    report: PBXContactStateItem | null;
    plan: PBXContactStateItem | null;
    /** План и отчёт — один и тот же человек (обычный случай). */
    isSame: boolean;
    /** Имя контакта плана, когда он ОТЛИЧАЕТСЯ; иначе null. */
    planName: string | null;
    traits: PBXContactFieldData[];
    filled: number;
    total: number;
}

/** Характеристики контакта, которые можно выставить шкалой/селектом. */
export const useContactTraits = (
    contact: PBXContactStateItem | null | undefined,
): PBXContactFieldData[] =>
    useMemo(() => editableTraits(contact?.fields), [contact?.fields]);

/** Данные одного контакта для показа: имя, связь, телефон, почта, ссылка. */
export const useContactDetails = (
    contact: PBXContactStateItem | null | undefined,
): ContactDetailsView => {
    const domain = useAppSelector(s => s.app.domain);
    const sourceById = useAppSelector(s => s.contact.sourceById);

    return {
        name: contactName(contact),
        post: contact?.POST || null,
        source: contactSourceLabel(sourceById[Number(contact?.ID)]),
        phone: contactPhone(contact),
        email: contactEmail(contact),
        crmUrl: getCrmUrl(domain, 'contact', contact?.ID),
    };
};

/**
 * Состояние карточки контакта: кто в отчёте, кто в плане и насколько заполнен
 * профиль.
 *
 * Контакт в форме ДВА — с кем говорили и кому планируем следующий шаг, — но
 * человек чаще всего один. Карточка показывает отчётного, а расхождение
 * называет отдельной пометкой: молча показывать одного из двух нельзя.
 */
export const useContactCard = (): ContactCardView => {
    const report = useAppSelector(s => s.contact.current.report) ?? null;
    const plan = useAppSelector(s => s.contact.current.plan) ?? null;
    const hasContacts = useAppSelector(s => s.contact.contacts.length > 0);

    const details = useContactDetails(report);
    const traits = useContactTraits(report);
    const { filled, total } = traitsProgress(traits);
    const isSame = Boolean(report && plan && report.ID === plan.ID);

    return {
        ...details,
        // Компания больше не условие: контакт бывает и в сделке, и в лиде.
        isAvailable: hasContacts || Boolean(report),
        report,
        plan,
        isSame,
        planName: plan && !isSame ? contactName(plan) : null,
        traits,
        filled,
        total,
    };
};
