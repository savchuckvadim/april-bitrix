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
 * Носители — СДЕЛКА + сущность-владелец (компания, а без неё лид), а не
 * один по приоритету (требование владельца 31.08, todo3108: «не вижу
 * конкурентов и плановую дату покупки, хотя установлены»). Раньше из
 * встройки сделки с компанией поля резолвились ТОЛЬКО по компании — всё,
 * чего в её слепке не было (плановая дата на сделке, справочник
 * конкурентов), молча пряталось.
 *
 * Чтение: значение — первое непустое по носителям (сделка точнее, она
 * первая); показ поля — если оно установлено ХОТЬ у одного носителя.
 * Запись (savePurchaseDate) — во всех носителей, у кого поле есть.
 */
export const usePurchaseSignals = (): PurchaseSignalsView => {
    const dispatch = useAppDispatch();
    const portal = useAppSelector(s => s.portal.portal);
    const bitrix = useAppSelector(s => s.app.bitrix);
    const error = useAppSelector(s => s.purchaseSignals.error);
    const overrides = useAppSelector(s => s.purchaseSignals.valueByCode);

    return useMemo(() => {
        const targets = [
            bitrix.deal
                ? {
                      row: bitrix.deal as unknown as Record<string, unknown>,
                      fields: portal?.bitrixDeal?.bitrixfields ?? null,
                  }
                : null,
            bitrix.company
                ? {
                      row: bitrix.company as unknown as Record<
                          string,
                          unknown
                      >,
                      fields: portal?.company?.bitrixfields ?? null,
                  }
                : null,
            !bitrix.company && bitrix.lead
                ? {
                      row: bitrix.lead as unknown as Record<string, unknown>,
                      fields: portal?.lead?.bitrixfields ?? null,
                  }
                : null,
        ].filter((target): target is NonNullable<typeof target> =>
            Boolean(target),
        );

        if (!targets.length) {
            return { isAvailable: false, dates: [], concurents: [], error };
        }

        const dates: PurchaseDateView[] = [];
        for (const field of PURCHASE_DATE_FIELDS) {
            let installed = false;
            let value = '';
            for (const target of targets) {
                const key = findUfKey(target.fields, field.code);
                if (!key) continue;
                installed = true;
                if (!value) value = toInputDate(target.row[key]);
            }
            if (!installed) continue;
            dates.push({
                code: field.code,
                label: field.label,
                value: overrides[field.code] ?? value,
                setValue: next => dispatch(savePurchaseDate(field.code, next)),
            });
        }

        // Справочник конкурентов — тоже первый носитель, у которого он есть.
        const concurents = targets
            .map(target => readConcurents(target.fields, target.row))
            .find(names => names.length > 0);

        return {
            isAvailable: dates.length > 0,
            dates,
            concurents: concurents ?? [],
            error,
        };
    }, [bitrix, portal, dispatch, error, overrides]);
};
