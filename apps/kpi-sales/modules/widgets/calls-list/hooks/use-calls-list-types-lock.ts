'use client';

import { useEffect, useRef } from 'react';
import { callsListTypesToNarrow, type CallsListPatch } from '@/modules/entities/calls-list';

/**
 * Типы звонка следуют за бейджами методики: ответ сообщил ограничение
 * (`lock`), а в фильтре «Тип звонка» есть типы вне него — выбор сужается до
 * разрешённых одной правкой. Работает только на ответе под текущие фильтры
 * (`settled`): пока идёт пауза или запрос, ограничение может быть прошлым.
 * От повторов защищает запомненный вход: для одной и той же пары «выбор —
 * ограничение» правка уходит один раз, после неё выбор уже внутри ограничения.
 */
export const useCallsListTypesLock = (
    callTypes: readonly string[],
    lock: readonly string[] | null,
    settled: boolean,
    update: (patch: CallsListPatch) => void,
): void => {
    const applied = useRef<string | null>(null);

    useEffect(() => {
        if (!settled) return;
        const narrowed = callsListTypesToNarrow(callTypes, lock);
        if (narrowed === null) {
            applied.current = null;
            return;
        }
        const input = `${callTypes.join(',')}|${(lock ?? []).join(',')}`;
        if (applied.current === input) return;
        applied.current = input;
        update({ callTypes: narrowed });
    }, [callTypes, lock, settled, update]);
};
