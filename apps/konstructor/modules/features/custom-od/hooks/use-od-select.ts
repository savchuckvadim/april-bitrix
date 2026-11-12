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
    type SupplyKind,
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
 * числовой ввод и выбор вида — интернет или Проксима (из тех, что есть у
 * комплекта; по умолчанию — вид текущей поставки); коммит собирает
 * синтетический код x_<type>_<n>.
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
    const [customType, setCustomType] = useState<SupplyKind>('internet');

    const current = resolveSupply(catalog, value);
    // виды поставки, доступные комплекту: X-ОД бывает только из них
    const availableTypes = [...new Set(supplies.map(supply => supply.type))];
    const options: KSupply[] =
        current && isCustomSupplyCode(current.code)
            ? [...supplies, current]
            : supplies;

    const handleSelect = (selected: string) => {
        if (selected === CUSTOM_OPTION) {
            setCustomValue(String(current?.usersQuantity || ''));
            setCustomType(current?.type ?? availableTypes[0] ?? 'internet');
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
        setCustomMode(false);
        onChange(makeCustomSupplyCode(customType, quantity));
    };

    return {
        options,
        customOption: CUSTOM_OPTION,
        customMode,
        customValue,
        setCustomValue,
        customType,
        setCustomType,
        availableTypes,
        handleSelect,
        commitCustom,
        cancelCustom: () => setCustomMode(false),
    };
};
