'use client';

import { useCallback, useState } from 'react';
import type { PbxFieldCode, PbxFieldItem } from '../model';
import { usePbxField, UsePbxFieldResult } from './use-pbx-field';

export interface UsePbxSelectResult extends UsePbxFieldResult {
    /** Открыт ли диалог подтверждения (confirm-поля; включая «очистить»). */
    isConfirmOpen: boolean;
    /** Выбор элемента: confirm-поле → диалог, иначе сохранить сразу. */
    pick: (code: string | null) => void;
    confirmPending: () => void;
    cancelPending: () => void;
    /** Человекочитаемые подписи для диалога подтверждения. */
    pendingFromLabel: string;
    pendingToLabel: string;
}

/** Подпись элемента по коду (для диалога подтверждения). */
const labelOf = (items: PbxFieldItem[], code: string | null): string => {
    if (code === null) return 'пусто';
    return items.find(item => item.code === code)?.name ?? code;
};

/**
 * Логика select-бэйджа pbx-поля: выбор элемента + confirm-flow для полей
 * с подтверждением (contract_type и т.п.). Компонент только рендерит.
 */
export const usePbxSelect = (
    fieldCode: PbxFieldCode,
    entityId: number,
    serverValue: string | null,
): UsePbxSelectResult => {
    const field = usePbxField(fieldCode, entityId, serverValue);
    const [pendingCode, setPendingCode] = useState<string | null>(null);
    const [isPendingOpen, setPendingOpen] = useState(false);

    const pick = useCallback(
        (code: string | null) => {
            if (code === field.value) return;
            if (field.meta?.confirm) {
                setPendingCode(code);
                setPendingOpen(true);
                return;
            }
            field.save(code);
        },
        [field],
    );

    const confirmPending = useCallback(() => {
        if (isPendingOpen) field.save(pendingCode);
        setPendingOpen(false);
        setPendingCode(null);
    }, [field, isPendingOpen, pendingCode]);

    const cancelPending = useCallback(() => {
        setPendingOpen(false);
        setPendingCode(null);
    }, []);

    const items = field.meta?.items ?? [];
    return {
        ...field,
        isConfirmOpen: isPendingOpen,
        pick,
        confirmPending,
        cancelPending,
        pendingFromLabel: labelOf(items, field.value),
        pendingToLabel: labelOf(items, pendingCode),
    };
};
