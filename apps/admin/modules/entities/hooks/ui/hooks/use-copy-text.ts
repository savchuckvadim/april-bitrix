'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { HOOKS_TEXT } from '../../consts/hooks.const';

/** Сколько держать отметку «Скопировано» на кнопке. */
const COPIED_RESET_MS = 2000;

/**
 * Копирование строки в буфер: отметка «Скопировано» на пару секунд, при
 * недоступном буфере (http, старый браузер) — тост; текст и так на экране.
 */
export const useCopyText = () => {
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        },
        [],
    );

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(
                () => setCopiedText(null),
                COPIED_RESET_MS,
            );
        } catch {
            setCopiedText(null);
            toast.error(HOOKS_TEXT.copyFailed);
        }
    };

    return { copiedText, copy };
};
