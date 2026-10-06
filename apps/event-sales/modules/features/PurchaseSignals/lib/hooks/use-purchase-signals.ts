'use client';

import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    saveConcurents,
    savePurchaseDate,
} from '../../model/PurchaseSignalsThunk';
import {
    CONCURENT_DATE_FIELDS,
    CONTRACT_DATE_FIELDS,
    readConcurentCodes,
    readConcurentOptions,
    resolveDates,
    type ConcurentOption,
    type ResolvedDate,
    type SignalCarrier,
} from '../purchase-signals';

export interface PurchaseDateView extends ResolvedDate {
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
    /** Есть что показать в карточке «Конкуренты» — иначе её нет вовсе. */
    hasConcurents: boolean;
    /** Есть что показать в карточке «Покупка и договор». */
    hasContract: boolean;
    /** Сроки конкурента: оплачено до, договор до. */
    concurentDates: PurchaseDateView[];
    /** Свои сроки клиента: плановая покупка, договор, подарочный период. */
    contractDates: PurchaseDateView[];
    concurents: ConcurentsView;
    /** Локальный откат/ошибка записи. */
    error: string | null;
}

const NO_CONCURENTS: ConcurentsView = {
    options: [],
    selected: [],
    toggle: () => {},
};

/**
 * Даты покупки, договора и конкуренты текущего клиента.
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
        const carriers: SignalCarrier[] = [];
        if (bitrix.deal) {
            carriers.push({
                row: bitrix.deal as unknown as Record<string, unknown>,
                fields: portal?.bitrixDeal?.bitrixfields ?? null,
            });
        }
        if (bitrix.company) {
            carriers.push({
                row: bitrix.company as unknown as Record<string, unknown>,
                fields: portal?.company?.bitrixfields ?? null,
            });
        }
        if (!bitrix.company && bitrix.lead) {
            carriers.push({
                row: bitrix.lead as unknown as Record<string, unknown>,
                fields: portal?.lead?.bitrixfields ?? null,
            });
        }

        if (!carriers.length) {
            return {
                hasConcurents: false,
                hasContract: false,
                concurentDates: [],
                contractDates: [],
                concurents: NO_CONCURENTS,
                error,
            };
        }

        const toView = (date: ResolvedDate): PurchaseDateView => ({
            ...date,
            setValue: next => dispatch(savePurchaseDate(date.code, next)),
        });
        const concurentDates = resolveDates(
            carriers,
            CONCURENT_DATE_FIELDS,
            overrides,
        ).map(toView);
        const contractDates = resolveDates(
            carriers,
            CONTRACT_DATE_FIELDS,
            overrides,
        ).map(toView);

        // Справочник — у первого носителя, где поле установлено; выбранные
        // — у первого, где они есть (сделка точнее компании).
        const options =
            carriers
                .map(carrier => readConcurentOptions(carrier.fields))
                .find(items => items.length > 0) ?? [];
        const storedCodes =
            carriers
                .map(carrier => readConcurentCodes(carrier.fields, carrier.row))
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
            : NO_CONCURENTS;

        return {
            hasConcurents: concurentDates.length > 0 || options.length > 0,
            hasContract: contractDates.length > 0,
            concurentDates,
            contractDates,
            concurents,
            error,
        };
    }, [bitrix, portal, dispatch, error, overrides, concurentOverride]);
};
