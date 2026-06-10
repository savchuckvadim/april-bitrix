import { useState, useRef } from 'react';
import { useColorScheme } from './useColorScheme';
import { useOutsideClick } from './useOutsideClick';
import type { ColorScheme } from '../lib/types/theme';

/**
 * Хук для работы с выбором цветовой схемы
 * Инкапсулирует логику открытия/закрытия и выбора схемы
 */
export function useColorSchemePicker() {
    const { scheme, setScheme } = useColorScheme();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useOutsideClick(ref, () => setOpen(false));

    const toggle = () => {
        setOpen(prev => !prev);
    };

    const selectScheme = (newScheme: ColorScheme) => {
        setScheme(newScheme);
        setOpen(false);
    };

    return {
        scheme,
        open,
        ref,
        toggle,
        selectScheme,
    };
}
