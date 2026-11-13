'use client';

import { useRef, type ChangeEvent } from 'react';

/** Выбор файла скрытым input: открыть диалог, отдать файл, сбросить значение. */
export const useFilePick = (onPick: (file: File) => void) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    return {
        inputRef,
        open: () => inputRef.current?.click(),
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            // тот же файл ещё раз — снова событие change
            event.target.value = '';
            if (file) onPick(file);
        },
    };
};
