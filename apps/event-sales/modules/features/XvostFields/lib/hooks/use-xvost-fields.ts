'use client';

import { useMemo } from 'react';
import { findUfKey } from '@workspace/pbx';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { saveXvostField } from '../../model/XvostFieldsThunk';
import { xvostOverrideKey } from '../../model/XvostFieldsSlice';
import {
    XVOST_DATE_FIELDS,
    XVOST_FLAG_FIELDS,
    flagToPortalValue,
    toFlag,
    toInputDate,
    type XvostDateCode,
    type XvostFlagCode,
} from '../xvost-fields';

export interface XvostDateView {
    code: XvostDateCode;
    label: string;
    value: string;
    setValue: (value: string) => void;
}

export interface XvostFlagView {
    code: XvostFlagCode;
    label: string;
    value: boolean;
    setValue: (value: boolean) => void;
}

export interface XvostFieldsView {
    /** Есть сделка и хоть одно хвост-поле установлено — иначе карточки нет. */
    isAvailable: boolean;
    dates: XvostDateView[];
    flags: XvostFlagView[];
    /** Локальный откат/ошибка записи. */
    error: string | null;
}

/**
 * Хвост-поля СДЕЛКИ контекста для ручной правки.
 *
 * Носитель ровно один — сделка (блок op_xvost_* установлен только на ней),
 * без фолбэков на компанию/лид. Поля читаются по слепку и показываются
 * только установленные: карточка самогейтится и не требует релиза под
 * установку поля (§5 доктрины pbx-fields-system).
 */
export const useXvostFields = (): XvostFieldsView => {
    const dispatch = useAppDispatch();
    const deal = useAppSelector(s => s.app.bitrix.deal);
    const fields = useAppSelector(
        s => s.portal.portal?.bitrixDeal?.bitrixfields ?? null,
    );
    const error = useAppSelector(s => s.xvostFields.error);
    const overrides = useAppSelector(s => s.xvostFields.valueByKey);

    return useMemo(() => {
        if (!deal) {
            return { isAvailable: false, dates: [], flags: [], error };
        }
        const row = deal as unknown as Record<string, unknown>;
        const dealId = Number(deal.ID);
        const stored = (code: string, key: string): unknown =>
            overrides[xvostOverrideKey(dealId, code)] ?? row[key];

        const dates: XvostDateView[] = [];
        for (const field of XVOST_DATE_FIELDS) {
            const key = findUfKey(fields, field.code);
            if (!key) continue;
            dates.push({
                code: field.code,
                label: field.label,
                value: toInputDate(stored(field.code, key)),
                setValue: value => dispatch(saveXvostField(field.code, value)),
            });
        }

        const flags: XvostFlagView[] = [];
        for (const field of XVOST_FLAG_FIELDS) {
            const key = findUfKey(fields, field.code);
            if (!key) continue;
            flags.push({
                code: field.code,
                label: field.label,
                value: toFlag(stored(field.code, key)),
                setValue: value =>
                    dispatch(
                        saveXvostField(field.code, flagToPortalValue(value)),
                    ),
            });
        }

        return {
            isAvailable: dates.length > 0 || flags.length > 0,
            dates,
            flags,
            error,
        };
    }, [deal, fields, dispatch, error, overrides]);
};
