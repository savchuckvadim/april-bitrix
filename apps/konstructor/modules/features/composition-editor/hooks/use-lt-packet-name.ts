'use client';

import { useState } from 'react';

/** Своё название доп. пакета: правка на месте, null — просмотр. */
export const useLtPacketName = (name: string | null, onCommit: (name: string) => void) => {
    const [draft, setDraft] = useState<string | null>(null);

    const commit = () => {
        if (draft === null) return;
        onCommit(draft);
        setDraft(null);
    };

    return {
        draft,
        setDraft,
        commit,
        startEditing: () => setDraft(name ?? ''),
        cancel: () => setDraft(null),
    };
};
