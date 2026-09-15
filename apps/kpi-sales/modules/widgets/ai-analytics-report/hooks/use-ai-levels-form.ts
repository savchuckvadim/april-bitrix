'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    buildAiLevelsForm,
    saveAiLevels,
    toAiLevelsPayload,
    validateAiLevelRow,
    type AiLevelFormRow,
    type AiManagerLevel,
} from '@/modules/entities/ai-analytics';

/**
 * Форма уровней менеджеров: строки из обзора (уровень, источник, стаж),
 * правка уровня и даты стажа, валидация, settings/save. После успеха
 * обзор перечитывает listener (levelsSaved), а окно закрывается через
 * onClose — по факту ответа бэка, не по клику.
 */
export const useAiLevelsForm = (open: boolean, onClose: () => void) => {
    const dispatch = useAppDispatch();
    const managers = useAppSelector(
        state => state.aiAnalytics.overview.data?.managers,
    );
    const saving = useAppSelector(state => state.aiAnalytics.levels.saving);
    const error = useAppSelector(state => state.aiAnalytics.levels.error);
    const [rows, setRows] = useState<AiLevelFormRow[]>([]);

    // Каждое открытие — свежая форма из текущего обзора.
    useEffect(() => {
        if (open) setRows(buildAiLevelsForm(managers ?? []));
    }, [open, managers]);

    const errors = useMemo(
        () =>
            new Map(rows.map(row => [row.managerId, validateAiLevelRow(row)])),
        [rows],
    );
    const hasErrors = [...errors.values()].some(Boolean);

    const patch = useCallback(
        (
            managerId: number,
            changes: Partial<Pick<AiLevelFormRow, 'level' | 'since'>>,
        ) =>
            setRows(prev =>
                prev.map(row =>
                    row.managerId === managerId
                        ? { ...row, ...changes, manual: true }
                        : row,
                ),
            ),
        [],
    );

    const setLevel = (managerId: number, level: AiManagerLevel) =>
        patch(managerId, { level });
    const setSince = (managerId: number, since: string) =>
        patch(managerId, { since });

    /** Сохранить; окно закрывается только после успешного ответа. */
    const submit = useCallback(async (): Promise<void> => {
        if (hasErrors) return;
        const saved = await dispatch(saveAiLevels(toAiLevelsPayload(rows)));
        if (saved) onClose();
    }, [dispatch, hasErrors, onClose, rows]);

    return {
        rows,
        errors,
        hasErrors,
        saving,
        error,
        isEmpty: rows.length === 0,
        setLevel,
        setSince,
        submit,
    };
};
