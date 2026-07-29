'use client';

import { useState } from 'react';
import {
    CUSTOM_OD_MAX,
    CUSTOM_OD_MIN,
    isCustomSupplyCode,
    makeCustomSupplyCode,
    resolveSupply,
    type Catalog,
    type KSupply,
} from '@/modules/entities/catalog';

const CUSTOM_OPTION = '__custom__';

interface UseOdSelectArgs {
    catalog: Catalog;
    supplies: KSupply[];
    value: string;
    onChange: (supplyCode: string) => void;
}

/**
 * Селект вида поставки с X-ОД: пункт «X-ОД — своё количество…» открывает
 * числовой ввод; коммит собирает синтетический код x_<type>_<n>.
 * Текущий кастомный код добавляется в опции синтетической поставкой.
 */
export const useOdSelect = ({
    catalog,
    supplies,
    value,
    onChange,
}: UseOdSelectArgs) => {
    const [customMode, setCustomMode] = useState(false);
    const [customValue, setCustomValue] = useState('');

    const current = resolveSupply(catalog, value);
    const options: KSupply[] =
        current && isCustomSupplyCode(current.code)
            ? [...supplies, current]
            : supplies;

    const handleSelect = (selected: string) => {
        if (selected === CUSTOM_OPTION) {
            setCustomValue(String(current?.usersQuantity || ''));
            setCustomMode(true);
            return;
        }
        setCustomMode(false);
        onChange(selected);
    };

    const commitCustom = () => {
        const quantity = Math.round(Number(customValue));
        if (
            !Number.isFinite(quantity) ||
            quantity < CUSTOM_OD_MIN ||
            quantity > CUSTOM_OD_MAX
        ) {
            setCustomMode(false);
            return;
        }
        const type = current?.type ?? supplies[0]?.type ?? 'internet';
        setCustomMode(false);
        onChange(makeCustomSupplyCode(type, quantity));
    };

    return {
        options,
        customOption: CUSTOM_OPTION,
        customMode,
        customValue,
        setCustomValue,
        handleSelect,
        commitCustom,
        cancelCustom: () => setCustomMode(false),
    };
};
