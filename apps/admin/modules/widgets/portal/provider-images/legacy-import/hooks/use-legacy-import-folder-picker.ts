'use client';

import { useRef } from 'react';
import type { ChangeEvent } from 'react';

/**
 * Скрытое поле выбора папки и его открытие по кнопке. Файлы забираются в
 * массив до очистки поля: после выбора поле очищается, и та же папка при
 * повторном выборе (например, после правок файлов) снова вызовет `onPick`.
 */
export function useLegacyImportFolderPicker(onPick: (files: File[]) => void) {
    const input = useRef<HTMLInputElement>(null);

    const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = '';
        if (files.length > 0) onPick(files);
    };

    return { input, open: () => input.current?.click(), onChange };
}
