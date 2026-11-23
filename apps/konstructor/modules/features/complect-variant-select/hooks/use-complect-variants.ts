'use client';

import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import type { RootState } from '@/modules/app/model/store';
import { getComplectVariantPbxSmartEntityId } from '@/modules/entities/portal';
import {
    canRejectVariant,
    canRestoreVariant,
    closeComplectVariant,
    createComplectVariant,
    deleteComplectVariant,
    getVariantContractCode,
    isSingleContractAllowed,
    isTogetherMode,
    isVariantDeletable,
    openComplectVariant,
    saveComplectComposition,
    selectComplectVariantState,
    selectComposition,
    selectUnclosedVariants,
    selectVariantParticipants,
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
    const participants = useAppSelector(selectVariantParticipants);
    const [newTitle, setNewTitle] = useState('');

    const isTogether = isTogetherMode(composition.mode);
    // «Одним договором» оценивается по всем незакрытым вариантам: именно они
    // пойдут в документы, как только выбран режим «вместе»
    const singleContractAllowed = useMemo(
        () =>
            isSingleContractAllowed(
                selectUnclosedVariants(variantState.records, stageOf).map(
                    getVariantContractCode,
                ),
            ),
        [variantState.records, stageOf],
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
        /** Режим «вместе»: документы собираются по всем участникам сразу */
        isTogether,
        /**
         * Бейдж «В документах»: вариант участвует в документах вместе с
         * другими. В режиме «по одному» участник один, открытый вариант, и он
         * уже помечен «Сейчас редактируется».
         */
        isInDocuments: (variantSmartId: number | null) =>
            isTogether &&
            variantSmartId !== null &&
            participants.some(record => record.variantSmartId === variantSmartId),
        /** «Отклонить» нужно, пока итог по варианту не подведён (финальной стадии нет) */
        canReject: (variantSmartId: number | null) =>
            variantSmartId !== null && canRejectVariant(stageOf(variantSmartId)),
        /** «Вернуть» есть только у отклонённого варианта */
        canRestore: (variantSmartId: number | null) =>
            variantSmartId !== null && canRestoreVariant(stageOf(variantSmartId)),
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
