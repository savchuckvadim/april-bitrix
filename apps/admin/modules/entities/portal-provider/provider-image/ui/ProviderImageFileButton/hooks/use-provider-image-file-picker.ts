'use client';

import { useRef } from 'react';
import type { ChangeEvent } from 'react';

/**
 * Скрытое поле выбора файла и его открытие по кнопке. После выбора поле
 * очищается: тот же файл ещё раз (например, после ошибки) тоже вызовет выбор.
 */
export function useProviderImageFilePicker(onPick: (file: File) => void) {
    const input = useRef<HTMLInputElement>(null);

    const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (file) onPick(file);
    };

    return { input, open: () => input.current?.click(), onChange };
}
