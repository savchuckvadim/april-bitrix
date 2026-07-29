'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { selectAppDealId } from '@/modules/app/model/selectors';
import {
    saveSnapshot,
    selectSnapshotSaveError,
    selectSnapshotSaveStatus,
    snapshotActions,
} from '@/modules/entities/snapshot';
import { selectGeneralSet } from '@/modules/entities/row-set';

const SAVED_BADGE_MS = 2500;

/**
 * Сохранение предложения (слепок v2): «Сохранено» показывается по факту
 * ответа бэка, бейдж сбрасывается таймером (cleanup через ref).
 */
export const useSaveSnapshot = () => {
    const dispatch = useAppDispatch();
    const dealId = useAppSelector(selectAppDealId);
    const general = useAppSelector(selectGeneralSet);
    const status = useAppSelector(selectSnapshotSaveStatus);
    const error = useAppSelector(selectSnapshotSaveError);
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (status !== 'saved') return;
        resetTimer.current = setTimeout(
            () => dispatch(snapshotActions.saveReset()),
            SAVED_BADGE_MS,
        );
        return () => {
            if (resetTimer.current) clearTimeout(resetTimer.current);
        };
    }, [status, dispatch]);

    return {
        canSave: Boolean(dealId) && general.rows.length > 0,
        isSaving: status === 'saving',
        isSaved: status === 'saved',
        error: status === 'error' ? error : null,
        save: () => dispatch(saveSnapshot()),
    };
};
