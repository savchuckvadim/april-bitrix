'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import { selectCatalog } from '@/modules/entities/catalog';
import {
    applyAction,
    checkComplectWeight,
    type CompositionAction,
    type RuleResult,
} from '@/modules/entities/composition';
import { rowSetActions, type KRow } from '@/modules/entities/row-set';
import { useCompositionSections } from './use-composition-sections';

/**
 * Редактор наполнения ПЕРЕДАННОЙ строки — любой garant-строки любого сета
 * (снятие легаси-ограничения «наполнение только у главного товара»): на шаге
 * «Комплект» — главная строка, на «Ценах» — строка из своей карточки.
 * Чекбоксы гоняются через rules-engine (applyAction); в free-режиме правила
 * не принуждают, только подсвечивают.
 */
export const useCompositionEditor = (row: KRow | null) => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    // текущий регион сборки — тумблер «Региональное законодательство» тянет его в состав
    const regionCode = useAppSelector(state => state.rowSet.context.regionCode);
    // сервисному отделу открыт средний пакет LT-other (вес 4)
    const serviceDepartment = useAppSelector(
        state => state.app.department === APP_DEP.SERVICE,
    );
    const [lastResult, setLastResult] = useState<RuleResult | null>(null);
    const sections = useCompositionSections(catalog, row?.composition ?? null);

    const composition = row?.composition ?? null;
    const complect = composition
        ? (catalog.complects.byCode[composition.complectCode] ?? null)
        : null;

    const writeComposition = (next: NonNullable<KRow['composition']>) => {
        if (!row) return;
        dispatch(
            rowSetActions.setRowComposition({
                setId: row.setId,
                key: row.key,
                composition: next,
            }),
        );
    };

    const applyComposition = (action: CompositionAction) => {
        if (!composition || !complect) return;
        const result = applyAction(composition, action, {
            complect,
            catalog,
            regionCode,
            serviceDepartment,
        });
        setLastResult(result);
        writeComposition(result.composition);
    };

    const toggleMode = () => {
        if (!composition) return;
        writeComposition({
            ...composition,
            mode: composition.mode === 'rules' ? 'free' : 'rules',
        });
    };

    const weightCheck =
        composition && complect
            ? checkComplectWeight(composition, { complect, catalog })
            : null;

    return {
        row,
        composition,
        catalog,
        sections,
        serviceDepartment,
        applyComposition,
        toggleMode,
        lastResult,
        weightCheck,
    };
};

export type CompositionEditorState = ReturnType<typeof useCompositionEditor>;
