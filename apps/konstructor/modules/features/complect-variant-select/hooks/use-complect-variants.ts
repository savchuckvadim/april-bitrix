'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import type { RootState } from '@/modules/app/model/store';
import { getComplectVariantPbxSmartEntityId } from '@/modules/entities/portal';
import {
    canRejectVariant,
    canRestoreVariant,
    closeComplectVariant,
    createComplectVariant,
    deleteComplectVariant,
    isVariantDeletable,
    openComplectVariant,
    selectComplectVariantState,
    selectVariantsBusy,
    selectVariantStageOf,
    setComplectVariantStage,
    type ComplectVariantRecordDto,
    type ComplectVariantStage,
} from '@/modules/entities/complect-variant';

/**
 * Данные и действия вариантов комплекта: открыть, создать, закрыть, удалить,
 * отклонить и вернуть. Список грузит слушатель на входе (start-store-listeners);
 * смарт на портале не установлен — `hasSmart: false`, варианты не показываются,
 * конструктор работает как раньше. Какие варианты идут в договор и отчёт, решает
 * режим сделки на этих экранах (feature complect-mode-select).
 */
export const useComplectVariants = () => {
    const dispatch = useAppDispatch();
    const hasSmart = useAppSelector((state: RootState) =>
        Boolean(getComplectVariantPbxSmartEntityId(state.portal.current)),
    );
    const variantState = useAppSelector(selectComplectVariantState);
    const isBusy = useAppSelector(selectVariantsBusy);
    const stageOf = useAppSelector(selectVariantStageOf);
    const [newTitle, setNewTitle] = useState('');

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
        isBusy,
        /** Названия и стадии из Битрикса ещё грузятся — карточки показывают загрузку */
        areDetailsLoading: variantState.itemsStatus === 'loading',
        error: variantState.error,
        /** Строка для шапки свёрнутой панели: какой вариант сейчас открыт в редакторе */
        editingSummary: editingRecord
            ? `Сейчас редактируется: ${titleOf(editingRecord)}`
            : null,
        stageOf,
        titleOf,
        /** «Отклонить» нужно, пока итог по варианту не подведён (финальной стадии нет) */
        canReject: (variantSmartId: number | null) =>
            variantSmartId !== null && canRejectVariant(stageOf(variantSmartId)),
        /** «Вернуть» есть только у отклонённого варианта */
        canRestore: (variantSmartId: number | null) =>
            variantSmartId !== null && canRestoreVariant(stageOf(variantSmartId)),
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
    };
};

/** Данные и действия вариантов: то, что хук отдаёт строкам и панели. */
export type ComplectVariantsState = ReturnType<typeof useComplectVariants>;
