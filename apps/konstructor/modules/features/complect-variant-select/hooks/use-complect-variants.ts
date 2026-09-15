'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import type { RootState } from '@/modules/app/model/store';
import { getComplectVariantPbxSmartEntityId } from '@/modules/entities/portal';
import {
    closeComplectVariant,
    createComplectVariant,
    fetchComplectVariants,
    getVariantContractCode,
    isSingleContractAllowed,
    openComplectVariant,
    saveComplectComposition,
    selectComplectVariantState,
    selectComposition,
    selectParticipants,
    selectVariantStageOf,
    setComplectVariantStage,
    type ComplectComposition,
    type ComplectVariantRecordDto,
    type ComplectVariantStage,
} from '@/modules/entities/complect-variant';

/**
 * Данные и действия панели вариантов комплекта. Смарт на портале не
 * установлен — `hasSmart: false`, панель не рисуется, конструктор работает
 * как раньше.
 */
export const useComplectVariants = () => {
    const dispatch = useAppDispatch();
    const hasSmart = useAppSelector((state: RootState) =>
        Boolean(getComplectVariantPbxSmartEntityId(state.portal.current)),
    );
    const variantState = useAppSelector(selectComplectVariantState);
    const composition = useAppSelector(selectComposition);
    const stageOf = useAppSelector(selectVariantStageOf);
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        if (hasSmart && variantState.status === 'idle') {
            void dispatch(fetchComplectVariants());
        }
    }, [hasSmart, variantState.status, dispatch]);

    const participants = useMemo(
        () => selectParticipants(variantState.records, stageOf),
        [variantState.records, stageOf],
    );
    const singleContractAllowed = useMemo(
        () => isSingleContractAllowed(participants.map(getVariantContractCode)),
        [participants],
    );

    const titleOf = (record: ComplectVariantRecordDto): string => {
        const item = variantState.items.find(
            candidate => candidate.id === Number(record.variantSmartId),
        );
        return item?.title || `Вариант ${record.variantSmartId ?? record.id}`;
    };

    return {
        hasSmart,
        records: variantState.records,
        openVariantSmartId: variantState.openVariantSmartId,
        composition,
        isBusy: variantState.isBusy || variantState.status === 'loading',
        error: variantState.error,
        stageOf,
        titleOf,
        singleContractAllowed,
        newTitle,
        setNewTitle,
        create: () => {
            const title =
                newTitle.trim() || `Вариант ${variantState.records.length + 1}`;
            setNewTitle('');
            return dispatch(createComplectVariant(title));
        },
        open: (record: ComplectVariantRecordDto) =>
            dispatch(openComplectVariant(record)),
        close: () => dispatch(closeComplectVariant()),
        setStage: (variantSmartId: number, stage: ComplectVariantStage) =>
            dispatch(setComplectVariantStage(variantSmartId, stage)),
        saveComposition: (patch: Partial<ComplectComposition>) =>
            dispatch(saveComplectComposition(patch)),
    };
};
