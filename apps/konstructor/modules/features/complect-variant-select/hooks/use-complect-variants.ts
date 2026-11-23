'use client';

import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import type { RootState } from '@/modules/app/model/store';
import { getComplectVariantPbxSmartEntityId } from '@/modules/entities/portal';
import {
    canMakeVariantCurrent,
    closeComplectVariant,
    createComplectVariant,
    deleteComplectVariant,
    getVariantContractCode,
    isSingleContractAllowed,
    isVariantDeletable,
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
 * Данные и действия вариантов комплекта. Список грузит слушатель на входе
 * (start-store-listeners); смарт на портале не установлен — `hasSmart: false`,
 * варианты не показываются, конструктор работает как раньше.
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

    const editingRecord =
        variantState.records.find(
            record =>
                record.variantSmartId !== null &&
                record.variantSmartId === variantState.openVariantSmartId,
        ) ?? null;

    return {
        hasSmart,
        records: variantState.records,
        /** Активный указатель: живое состояние точно этот вариант */
        openVariantSmartId: variantState.openVariantSmartId,
        /** Подсказка из настроек сделки: какой вариант открывали в прошлый раз */
        lastOpenVariantSmartId: variantState.lastOpenVariantSmartId,
        composition,
        // пока стадии из Битрикса в пути, править варианты рано: стадия на экране ещё не настоящая
        isBusy:
            variantState.isBusy ||
            variantState.status === 'loading' ||
            variantState.itemsStatus === 'loading',
        /** Названия и стадии из Битрикса ещё грузятся — карточки показывают загрузку */
        areDetailsLoading: variantState.itemsStatus === 'loading',
        error: variantState.error,
        /** Строка для шапки свёрнутой панели: какой вариант сейчас открыт в редакторе */
        editingSummary: editingRecord
            ? `Сейчас редактируется: ${titleOf(editingRecord)}`
            : null,
        stageOf,
        titleOf,
        /** «Сделать текущим» меняет состав участников; иначе кнопка не нужна */
        canMakeCurrent: (variantSmartId: number | null) =>
            canMakeVariantCurrent(variantState.records, stageOf, variantSmartId),
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
        /** Открытый в редакторе вариант удалять нельзя: сначала его закрывают */
        canDelete: (variantSmartId: number | null) =>
            isVariantDeletable(variantSmartId, variantState.openVariantSmartId),
        /** Удаление насовсем: база конструктора, затем элемент в Битриксе */
        remove: (variantSmartId: number) =>
            dispatch(deleteComplectVariant(variantSmartId)),
        saveComposition: (patch: Partial<ComplectComposition>) =>
            dispatch(saveComplectComposition(patch)),
    };
};

/** Данные и действия вариантов: то, что хук отдаёт строкам и панели. */
export type ComplectVariantsState = ReturnType<typeof useComplectVariants>;
