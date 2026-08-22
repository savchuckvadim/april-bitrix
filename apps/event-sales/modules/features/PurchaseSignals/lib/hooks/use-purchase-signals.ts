'use client';

import { useMemo } from 'react';
import { findUfKey } from '@workspace/pbx';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { savePurchaseDate } from '../../model/PurchaseSignalsThunk';
import {
    PURCHASE_DATE_FIELDS,
    readConcurents,
    toInputDate,
    type PurchaseDateCode,
} from '../purchase-signals';

export interface PurchaseDateView {
    code: PurchaseDateCode;
    label: string;
    value: string;
    setValue: (value: string) => void;
}

export interface PurchaseSignalsView {
    /** Хоть одно поле установлено на портале — иначе карточки нет вовсе. */
    isAvailable: boolean;
    dates: PurchaseDateView[];
    concurents: string[];
    /** Локальный откат/ошибка записи. */
    error: string | null;
}

/**
 * Даты покупки и конкурентов текущего клиента.
 *
 * Носитель — по приоритету ИНН: компания, без неё сделка, в лиде — лид.
 * Поля читаются по слепку, показываются только установленные: карточка
 * самогейтится и не требует релиза под установку поля.
 */
export const usePurchaseSignals = (): PurchaseSignalsView => {
    const dispatch = useAppDispatch();
    const portal = useAppSelector(s => s.portal.portal);
    const bitrix = useAppSelector(s => s.app.bitrix);
    const error = useAppSelector(s => s.purchaseSignals.error);
    const overrides = useAppSelector(s => s.purchaseSignals.valueByCode);

    return useMemo(() => {
        const target = bitrix.company
            ? {
                  row: bitrix.company as unknown as Record<string, unknown>,
                  fields: portal?.company?.bitrixfields ?? null,
              }
            : bitrix.deal
              ? {
                    row: bitrix.deal as unknown as Record<string, unknown>,
                    fields: portal?.bitrixDeal?.bitrixfields ?? null,
                }
              : bitrix.lead
                ? {
                      row: bitrix.lead as unknown as Record<string, unknown>,
                      fields: portal?.lead?.bitrixfields ?? null,
                  }
                : null;

        if (!target) {
            return { isAvailable: false, dates: [], concurents: [], error };
        }

        const dates: PurchaseDateView[] = [];
        for (const field of PURCHASE_DATE_FIELDS) {
            const key = findUfKey(target.fields, field.code);
            if (!key) continue;
            dates.push({
                code: field.code,
                label: field.label,
                value: overrides[field.code] ?? toInputDate(target.row[key]),
                setValue: value =>
                    dispatch(savePurchaseDate(field.code, value)),
            });
        }

        return {
            isAvailable: dates.length > 0,
            dates,
            concurents: readConcurents(target.fields, target.row),
            error,
        };
    }, [bitrix, portal, dispatch, error, overrides]);
};
