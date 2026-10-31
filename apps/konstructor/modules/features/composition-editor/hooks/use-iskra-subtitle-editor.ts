'use client';

import { useState } from 'react';

/** Правка подписи Искры: черновик живёт, пока открыто окошко. */
export const useIskraSubtitleEditor = (
    subtitle: string | null,
    onChange: (subtitle: string | null) => void,
) => {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(subtitle ?? '');

    return {
        open,
        draft,
        setDraft,
        setOpen: (next: boolean) => {
            if (next) setDraft(subtitle ?? '');
            setOpen(next);
        },
        save: () => {
            onChange(draft);
            setOpen(false);
        },
        reset: () => {
            onChange(null);
            setOpen(false);
        },
    };
};
