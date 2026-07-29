'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { selectCatalog } from '@/modules/entities/catalog';
import {
    applyAction,
    checkComplectWeight,
    type CompositionAction,
    type RuleResult,
} from '@/modules/entities/composition';
import {
    rowSetActions,
    selectSelectedRow,
} from '@/modules/entities/row-set';

/**
 * Редактор наполнения ВЫБРАННОЙ строки (любой garant-строки любого сета —
 * снятие легаси-ограничения «наполнение только у главного товара»).
 * Чекбоксы гоняются через rules-engine (applyAction); в free-режиме правила
 * не принуждают, только подсвечивают.
 */
export const useCompositionEditor = () => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const row = useAppSelector(selectSelectedRow);
    const [lastResult, setLastResult] = useState<RuleResult | null>(null);

    const composition = row?.composition ?? null;
    const complect = composition
        ? (catalog.complects.byCode[composition.complectCode] ?? null)
        : null;

    const applyComposition = (action: CompositionAction) => {
        if (!row || !composition || !complect) return;
        const result = applyAction(composition, action, { complect, catalog });
        setLastResult(result);
        dispatch(
            rowSetActions.setRowComposition({
                setId: row.setId,
                key: row.key,
                composition: result.composition,
            }),
        );
    };

    const toggleMode = () => {
        if (!row || !composition) return;
        dispatch(
            rowSetActions.setRowComposition({
                setId: row.setId,
                key: row.key,
                composition: {
                    ...composition,
                    mode: composition.mode === 'rules' ? 'free' : 'rules',
                },
            }),
        );
    };

    const close = () => {
        dispatch(rowSetActions.selectRow(null));
        setLastResult(null);
    };

    const weightCheck =
        composition && complect
            ? checkComplectWeight(composition, { complect, catalog })
            : null;

    const infoblocks = Object.values(catalog.infoblocks).filter(
        block => block.groupType === 'infoblocks',
    );
    const ers = Object.values(catalog.infoblocks).filter(
        block => block.groupType === 'er' && block.groupCode !== 'per',
    );
    const erPackets = Object.values(catalog.infoblocks).filter(
        block => block.groupCode === 'per',
    );

    return {
        row,
        composition,
        catalog,
        groups: { infoblocks, ers, erPackets },
        applyComposition,
        toggleMode,
        close,
        lastResult,
        weightCheck,
    };
};
