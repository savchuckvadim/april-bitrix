'use client';

import { useState } from 'react';
import { nanoid } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    filterContractsForSupply,
    filterSuppliesForComplect,
    resolveContractForSupplyChange,
    resolveRefsForComplectChange,
    selectCatalog,
} from '@/modules/entities/catalog';
import { defaultComposition } from '@/modules/entities/composition';
import {
    buildGarantRow,
    canAddComparisonSet,
    MAIN_ROW_KEY,
    rowSetActions,
    selectAlternativeSets,
    selectGeneralSet,
    selectMainRow,
    selectRowSetContext,
} from '@/modules/entities/row-set';
import type { RowBuilderTarget } from '../model/types';

/** Стартовый выбор, если главного товара ещё нет */
const FALLBACK_REFS = { complectCode: 'buh', supplyCode: 'internet_1', contractCode: 'internet' };

/**
 * Мастер добавления Гаранта в свой раздел шага цен: «Основные» — главный или
 * дополнительный Гарант (со своими поставкой/договором/наполнением), «Для
 * сравнения» — новый набор (лимит 7). Выбор стартует с главного товара:
 * набор для сравнения обычно собирают похожим на основной.
 */
export const useRowBuilder = (target: RowBuilderTarget, onDone: () => void) => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const context = useAppSelector(selectRowSetContext);
    const general = useAppSelector(selectGeneralSet);
    const alternative = useAppSelector(selectAlternativeSets);
    const mainRow = useAppSelector(selectMainRow);

    // мастер монтируется открытым — главный товар читаем один раз, на старте
    const [complectCode, setComplect] = useState(
        () => mainRow?.refs.complectCode ?? FALLBACK_REFS.complectCode,
    );
    const [supplyCode, setSupply] = useState(
        () => mainRow?.refs.supplyCode ?? FALLBACK_REFS.supplyCode,
    );
    const [contractCode, setContract] = useState(
        () => mainRow?.refs.contractCode ?? FALLBACK_REFS.contractCode,
    );

    const selectedComplect = catalog.complects.byCode[complectCode] ?? null;
    const availableSupplies = selectedComplect
        ? filterSuppliesForComplect(catalog.supplies.items, selectedComplect.type)
        : [];
    const availableContracts = selectedComplect
        ? filterContractsForSupply(catalog, selectedComplect.type, supplyCode)
        : [];

    /** Смена комплекта тянет цепочку сброса поставки → договора */
    const setComplectCode = (code: string) => {
        setComplect(code);
        const resolved = resolveRefsForComplectChange(catalog, code, {
            supplyCode,
            contractCode,
        });
        if (resolved) {
            setSupply(resolved.supplyCode);
            setContract(resolved.contractCode);
        }
    };

    const setSupplyCode = (code: string) => {
        setSupply(code);
        if (!selectedComplect) return;
        const resolved = resolveContractForSupplyChange(
            catalog,
            selectedComplect.type,
            code,
            contractCode,
        );
        if (resolved) setContract(resolved);
    };

    const buildRowInto = (
        setId: string,
        role: 'main' | 'comparison' | 'additional',
        key: string,
    ): boolean => {
        if (!selectedComplect || !context.regionCode) return false;
        const row = buildGarantRow({
            catalog,
            regionCode: context.regionCode,
            withTax: context.withTax,
            key,
            setId,
            role,
            complectCode,
            supplyCode,
            contractCode,
            composition: defaultComposition(selectedComplect),
        });
        if (!row) return false;
        dispatch(rowSetActions.upsertRow(row));
        dispatch(rowSetActions.selectRow(row.key));
        return true;
    };

    const hasMain = general.rows.some(row => row.role === 'main');
    const canAddComparison = canAddComparisonSet(alternative);

    const addToGeneral = () =>
        hasMain
            ? buildRowInto('general', 'additional', `general_add_${nanoid(6)}`)
            : buildRowInto('general', 'main', MAIN_ROW_KEY);

    const addComparison = () => {
        if (!canAddComparison) return false;
        const setId = nanoid(8);
        dispatch(rowSetActions.addComparisonSet(setId));
        return buildRowInto(setId, 'comparison', `${setId}_garant`);
    };

    return {
        catalog,
        catalogReady: catalog.complects.prof.length > 0,
        complects: [...catalog.complects.prof, ...catalog.complects.universal],
        complectCode,
        supplyCode,
        contractCode,
        setComplectCode,
        setSupplyCode,
        setContractCode: setContract,
        availableSupplies,
        availableContracts,
        /** Подпись кнопки добавления — по разделу, из которого открыт мастер */
        submitLabel:
            target === 'comparison'
                ? 'Добавить набор'
                : hasMain
                  ? 'Добавить к основным'
                  : 'Добавить главный товар',
        canSubmit: target === 'comparison' ? canAddComparison : true,
        /** Добавить в свой раздел; собралась строка — мастер закрывается */
        submit: () => {
            const added = target === 'comparison' ? addComparison() : addToGeneral();
            if (added) onDone();
        },
    };
};
