'use client';

import { useEffect, useState } from 'react';
import {
    parseCommercialInput,
    type CommercialEdit,
    type CommercialField,
    type RowPrice,
} from '@/modules/entities/row-set';

interface UseCommercialInputArgs {
    field: CommercialField;
    price: RowPrice;
    displayValue: number;
    onCommit: (edit: CommercialEdit) => void;
}

/**
 * Строковый буфер числового поля: правка локально, коммит по blur/Enter
 * через parseCommercialInput (невалидный ввод откатывается без диспатча),
 * Escape — откат. Вне фокуса значение форматируется ru-RU.
 */
export const useCommercialInput = ({
    field,
    price,
    displayValue,
    onCommit,
}: UseCommercialInputArgs) => {
    const [focused, setFocused] = useState(false);
    const [buffer, setBuffer] = useState('');

    useEffect(() => {
        if (!focused) setBuffer(String(displayValue));
    }, [displayValue, focused]);

    const commit = () => {
        setFocused(false);
        const edit = parseCommercialInput(field, buffer, price);
        if (edit) onCommit(edit);
        else setBuffer(String(displayValue));
    };

    const revert = () => {
        setBuffer(String(displayValue));
        setFocused(false);
    };

    return {
        value: focused
            ? buffer
            : displayValue.toLocaleString('ru-RU', {
                  maximumFractionDigits: 2,
              }),
        onFocus: () => {
            setFocused(true);
            setBuffer(String(displayValue));
        },
        onChange: (raw: string) => setBuffer(raw),
        onBlur: commit,
        onKeyDown: (key: string) => {
            if (key === 'Enter') commit();
            if (key === 'Escape') revert();
        },
    };
};
