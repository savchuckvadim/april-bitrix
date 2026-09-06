'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AUDIT_TEXT } from '../../../consts/ai-analytics-audit.const';

/** Сколько держать отметку «Скопировано» на кнопке. */
const COPIED_RESET_MS = 2000;

/**
 * Копирование markdown в буфер: отметка «Скопировано» на пару секунд,
 * при недоступном буфере — тост (текст и так виден на экране).
 */
export const useCopyMarkdown = (markdown: string) => {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        },
        [],
    );

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(markdown);
            setCopied(true);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
        } catch {
            setCopied(false);
            toast.error(AUDIT_TEXT.copyFailed);
        }
    };

    return { copied, copy };
};
