'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Черновик текстового поля, который уходит наружу по blur (или явным
 * commit): набор не дёргает стор и всё, что от него зависит (например,
 * пересборку превью документа), на каждый символ. Внешнее значение
 * подхватывается, пока поле не в фокусе.
 */
export const useCommitOnBlur = (value: string, onCommit: (value: string) => void) => {
    const [draft, setDraft] = useState(value);
    const focusedRef = useRef(false);

    useEffect(() => {
        if (!focusedRef.current) setDraft(value);
    }, [value]);

    const commit = () => {
        if (draft !== value) onCommit(draft);
    };

    return {
        draft,
        setDraft,
        commit,
        onFocus: () => {
            focusedRef.current = true;
        },
        onBlur: () => {
            focusedRef.current = false;
            commit();
        },
    };
};
