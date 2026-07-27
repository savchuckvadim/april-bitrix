'use client';

import { useCallback, useState } from 'react';
import { format } from 'date-fns';
import type { PbxFieldCode } from '../model';
import { usePbxField, UsePbxFieldResult } from './use-pbx-field';

/** ISO-дата запроса записи (контракт бэка pbx-fields). */
const ISO_DATE_FORMAT = 'yyyy-MM-dd';
/** Человекочитаемый формат отображения даты. */
const HUMAN_DATE_FORMAT = 'dd.MM.yyyy';

export interface UsePbxDateResult extends UsePbxFieldResult {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    /** Черновик в календаре (до явного «Сохранить»). */
    draft: Date | undefined;
    setDraft: (date: Date | undefined) => void;
    /** Явный коммит черновика (кнопка «Сохранить» — и есть подтверждение). */
    commit: () => void;
    /** Очистить значение поля. */
    clear: () => void;
    /** Отображаемое значение dd.MM.yyyy или null. */
    displayValue: string | null;
}

/** Значение поля (ISO-строка/datetime) → Date; невалидное → undefined. */
const parseValue = (value: string | null): Date | undefined => {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
};

/**
 * Логика date-ячейки pbx-поля: попап с календарём, черновик и явный коммит
 * («Сохранить» в попапе = подтверждение — отдельный диалог не нужен).
 */
export const usePbxDate = (
    fieldCode: PbxFieldCode,
    entityId: number,
    serverValue: string | null,
): UsePbxDateResult => {
    const field = usePbxField(fieldCode, entityId, serverValue);
    const [isOpen, setOpen] = useState(false);
    const [draft, setDraft] = useState<Date | undefined>(undefined);

    const openChange = useCallback(
        (open: boolean) => {
            setOpen(open);
            // Черновик всегда стартует с текущего значения.
            if (open) setDraft(parseValue(field.value));
        },
        [field.value],
    );

    const commit = useCallback(() => {
        if (draft) field.save(format(draft, ISO_DATE_FORMAT));
        setOpen(false);
    }, [draft, field]);

    const clear = useCallback(() => {
        field.save(null);
        setOpen(false);
    }, [field]);

    const parsed = parseValue(field.value);
    return {
        ...field,
        isOpen,
        setOpen: openChange,
        draft,
        setDraft,
        commit,
        clear,
        displayValue: parsed ? format(parsed, HUMAN_DATE_FORMAT) : null,
    };
};
