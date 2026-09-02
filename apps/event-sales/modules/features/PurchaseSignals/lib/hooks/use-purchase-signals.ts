'use client';

import { useMemo } from 'react';
import { findUfKey } from '@workspace/pbx';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    saveConcurents,
    savePurchaseDate,
} from '../../model/PurchaseSignalsThunk';
import {
    PURCHASE_DATE_FIELDS,
    readConcurentCodes,
    readConcurentOptions,
    toInputDate,
    type ConcurentOption,
    type PurchaseDateCode,
} from '../purchase-signals';

export interface PurchaseDateView {
    code: PurchaseDateCode;
    label: string;
    value: string;
    setValue: (value: string) => void;
}

export interface ConcurentsView {
    /** Варианты справочника; пусто — поле не установлено ни у одного носителя. */
    options: ConcurentOption[];
    /** Коды выбранных вариантов. */
    selected: string[];
    toggle: (code: string) => void;
}

export interface PurchaseSignalsView {
    /** Хоть одно поле установлено на портале — иначе карточки нет вовсе. */
    isAvailable: boolean;
    dates: PurchaseDateView[];
    concurents: ConcurentsView;
    /** Локальный откат/ошибка записи. */
    error: string | null;
}

/**
 * Даты покупки и конкуренты текущего клиента.
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
 * Запись (savePurchaseDate / saveConcurents) — во всех носителей, у кого
 * поле есть.
 *
 * Конкуренты — ВЫБОР, а не только показ (02.09): справочник виден всегда,
 * когда поле установлено, даже пустой. До этого карточка рисовала лишь уже
 * выбранных бэйджами, и пустое поле было невидимо — владелец не находил в
 * UI «проинсталлированное поле конкурентов».
 */
export const usePurchaseSignals = (): PurchaseSignalsView => {
    const dispatch = useAppDispatch();
    const portal = useAppSelector(s => s.portal.portal);
    const bitrix = useAppSelector(s => s.app.bitrix);
    const error = useAppSelector(s => s.purchaseSignals.error);
    const overrides = useAppSelector(s => s.purchaseSignals.valueByCode);
    const concurentOverride = useAppSelector(
        s => s.purchaseSignals.concurentCodes,
    );

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

        const noConcurents: ConcurentsView = {
            options: [],
            selected: [],
            toggle: () => {},
        };

        if (!targets.length) {
            return {
                isAvailable: false,
                dates: [],
                concurents: noConcurents,
                error,
            };
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

        // Справочник — у первого носителя, где поле установлено; выбранные
        // — у первого, где они есть (сделка точнее компании).
        const options =
            targets
                .map(target => readConcurentOptions(target.fields))
                .find(items => items.length > 0) ?? [];
        const storedCodes =
            targets
                .map(target => readConcurentCodes(target.fields, target.row))
                .find(codes => codes.length > 0) ?? [];
        const selected = concurentOverride ?? storedCodes;

        const concurents: ConcurentsView = options.length
            ? {
                  options,
                  selected,
                  toggle: code =>
                      dispatch(
                          saveConcurents(
                              selected.includes(code)
                                  ? selected.filter(item => item !== code)
                                  : [...selected, code],
                          ),
                      ),
              }
            : noConcurents;

        return {
            isAvailable: dates.length > 0 || options.length > 0,
            dates,
            concurents,
            error,
        };
    }, [bitrix, portal, dispatch, error, overrides, concurentOverride]);
};
