'use client';

import React from 'react';
import {
    DEFAULT_RENEWAL_LINK_PERIOD,
    RENEWAL_PRICE_DEFAULTS,
} from '../../../consts/renewal-link.consts';
import { periodToDays } from '../../../lib/renewal-link-view';
import type {
    RenewalExtraLine,
    RenewalExtraPeriod,
    RenewalLinkCreate,
    RenewalOfferInput,
} from '../../../model';

/**
 * Поля формы держим строками, а не числами: пока менеджер стирает цену,
 * поле на мгновение пустое, и число здесь означало бы «ноль» вместо
 * «ещё не ввели» — клиент получил бы услугу за 0 ₽.
 */
export interface RenewalOfferFormFields {
    clientName: string;
    title: string;
    period: string;

    salesIncluded: boolean;
    salesPrice: string;

    aiIncluded: boolean;
    aiEmployees: string;
    aiBasePrice: string;
    aiBaseEmployees: string;
    aiExtraPrice: string;
    aiFreeDelta: string;

    managerIncluded: boolean;
    managerPrice: string;

    devIncluded: boolean;
    devHours: string;
    devHourPrice: string;

    adjustment: string;
    adjustmentLabel: string;

    extras: RenewalExtraLine[];
}

const d = RENEWAL_PRICE_DEFAULTS;

const initialFields = (): RenewalOfferFormFields => ({
    clientName: '',
    title: '',
    period: DEFAULT_RENEWAL_LINK_PERIOD,

    salesIncluded: true,
    salesPrice: String(d.sales),

    aiIncluded: true,
    aiEmployees: String(d.aiBaseEmployees),
    aiBasePrice: String(d.aiBase),
    aiBaseEmployees: String(d.aiBaseEmployees),
    aiExtraPrice: String(d.aiExtra),
    aiFreeDelta: String(d.aiFreeDelta),

    managerIncluded: false,
    managerPrice: String(d.manager),

    devIncluded: true,
    devHours: String(d.devHours),
    devHourPrice: String(d.devHour),

    adjustment: '0',
    adjustmentLabel: 'Скидка',

    extras: [],
});

/**
 * Число из поля. Пустая строка и один минус — это «не ввели», а не ноль:
 * иначе стёртое поле уехало бы на бэк нулевой ценой.
 */
export function num(value: string, fallback: number): number {
    const normalized = value.replace(/[\s\u00a0]/g, '').replace(',', '.');
    if (normalized === '' || normalized === '-') return fallback;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

/** Цена AI-сервиса по числу сотрудников — как считает бэкенд и страница. */
export function calcAiPrice(fields: RenewalOfferFormFields): number {
    const employees = num(fields.aiEmployees, d.aiBaseEmployees);
    const base = num(fields.aiBaseEmployees, d.aiBaseEmployees);
    const extra = Math.max(0, employees - base);
    return num(fields.aiBasePrice, d.aiBase) + extra * num(fields.aiExtraPrice, d.aiExtra);
}

/** Месячный платёж по форме — для предпросмотра суммы до создания ссылки. */
export function calcMonthlyTotal(fields: RenewalOfferFormFields): number {
    let total = 0;
    if (fields.salesIncluded) total += num(fields.salesPrice, d.sales);
    if (fields.aiIncluded) total += calcAiPrice(fields);
    if (fields.managerIncluded) total += num(fields.managerPrice, d.manager);
    for (const line of fields.extras) {
        if (line.period === 'month' && line.title.trim()) total += line.price;
    }
    total += num(fields.adjustment, 0);
    return Math.max(0, total);
}

/** Сумма разовых услуг — в месячный платёж не входит. */
export function calcOnceTotal(fields: RenewalOfferFormFields): number {
    return fields.extras
        .filter(line => line.period === 'once' && line.title.trim())
        .reduce((sum, line) => sum + line.price, 0);
}

/** Поля формы → запрос на создание ссылки. */
export function fieldsToCreateDto(
    fields: RenewalOfferFormFields,
): RenewalLinkCreate {
    const offer: RenewalOfferInput = {
        clientName: fields.clientName.trim(),

        salesIncluded: fields.salesIncluded,
        salesPrice: num(fields.salesPrice, d.sales),

        aiIncluded: fields.aiIncluded,
        aiEmployees: num(fields.aiEmployees, d.aiBaseEmployees),
        aiBasePrice: num(fields.aiBasePrice, d.aiBase),
        aiBaseEmployees: num(fields.aiBaseEmployees, d.aiBaseEmployees),
        aiExtraPrice: num(fields.aiExtraPrice, d.aiExtra),
        aiFreeDelta: num(fields.aiFreeDelta, d.aiFreeDelta),

        managerIncluded: fields.managerIncluded,
        managerPrice: num(fields.managerPrice, d.manager),

        devIncluded: fields.devIncluded,
        devHours: num(fields.devHours, d.devHours),
        devHourPrice: num(fields.devHourPrice, d.devHour),

        adjustment: num(fields.adjustment, 0),
        adjustmentLabel: fields.adjustmentLabel.trim() || 'Скидка',

        // Строки без названия на бэк не отправляем: там они всё равно
        // отбрасываются, но валидация ругнётся на пустое название.
        extras: fields.extras
            .filter(line => line.title.trim())
            .map(line => ({ ...line, title: line.title.trim() })),
    };

    const title = fields.title.trim();
    const expiresInDays = periodToDays(fields.period);

    return {
        offer,
        ...(title ? { title } : {}),
        ...(expiresInDays === undefined ? {} : { expiresInDays }),
    };
}

/** Состояние формы выдачи ссылки. */
export const useRenewalOfferForm = () => {
    const [fields, setFields] = React.useState<RenewalOfferFormFields>(
        initialFields,
    );

    const set = React.useCallback(
        <K extends keyof RenewalOfferFormFields>(
            key: K,
            value: RenewalOfferFormFields[K],
        ) => setFields(prev => ({ ...prev, [key]: value })),
        [],
    );

    const addExtra = React.useCallback(
        () =>
            setFields(prev => ({
                ...prev,
                extras: [
                    ...prev.extras,
                    { title: '', price: 0, period: 'month' as RenewalExtraPeriod },
                ],
            })),
        [],
    );

    const updateExtra = React.useCallback(
        (index: number, patch: Partial<RenewalExtraLine>) =>
            setFields(prev => ({
                ...prev,
                extras: prev.extras.map((line, i) =>
                    i === index ? { ...line, ...patch } : line,
                ),
            })),
        [],
    );

    const removeExtra = React.useCallback(
        (index: number) =>
            setFields(prev => ({
                ...prev,
                extras: prev.extras.filter((_, i) => i !== index),
            })),
        [],
    );

    const reset = React.useCallback(() => setFields(initialFields()), []);

    return {
        fields,
        set,
        addExtra,
        updateExtra,
        removeExtra,
        reset,
        monthlyTotal: calcMonthlyTotal(fields),
        onceTotal: calcOnceTotal(fields),
        canSubmit: fields.clientName.trim().length > 0,
    };
};
