'use client';

import { useState } from 'react';

export interface DateDraftView {
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
}

/**
 * Черновик одного `<input type=date>` с записью по уходу с поля.
 *
 * Клавиатурный ввод даёт промежуточные значения («0002-…», пустую строку
 * при стирании), и писать их в CRM на каждый символ значило затирать дату
 * мусором. Коммитим по blur, и только если значение реально изменилось и
 * непустое (стирание — не способ очистить поле в CRM).
 */
export const useDateDraft = (
    committed: string,
    commit: (value: string) => void,
): DateDraftView => {
    const [draft, setDraft] = useState<string | null>(null);

    return {
        value: draft ?? committed,
        onChange: setDraft,
        onBlur: () => {
            if (draft !== null && draft !== committed && draft !== '') {
                commit(draft);
            }
        },
    };
};
