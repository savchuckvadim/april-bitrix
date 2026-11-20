'use client';

import { useCallback } from 'react';
import { aiDmManagerName } from '../lib/deal-movement/ai-deal-movement-format.util';
import { useAiManagerName } from './use-ai-manager-name';

/** Имя менеджера по id: имя из ответа сервера (known), иначе из структуры отдела. */
export type AiDmNameOf = (
    managerId: string | null,
    managerName?: string | null,
) => string;

export const useAiDmNameOf = (known: ReadonlyMap<string, string>): AiDmNameOf => {
    const structureName = useAiManagerName();
    return useCallback(
        (managerId, managerName = null) =>
            aiDmManagerName(
                managerId,
                managerName ?? (managerId ? (known.get(managerId) ?? null) : null),
                structureName,
            ),
        [known, structureName],
    );
};
