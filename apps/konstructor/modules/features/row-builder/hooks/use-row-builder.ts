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
    rowSetActions,
    selectAlternativeSets,
    selectGeneralSet,
    selectRowSetContext,
} from '@/modules/entities/row-set';

/**
 * Мастер добавления строки: главный Гарант, дополнительный Гарант в general
 * (теперь со СВОИМИ поставкой/договором/наполнением — снятие легаси-
 * ограничения) и альтернативный сет «Для сравнения» (лимит 7).
 */
export const useRowBuilder = () => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const context = useAppSelector(selectRowSetContext);
    const general = useAppSelector(selectGeneralSet);
    const alternative = useAppSelector(selectAlternativeSets);

    const [complectCode, setComplect] = useState('buh');
    const [supplyCode, setSupply] = useState('internet_1');
    const [contractCode, setContract] = useState('internet');

    const selectedComplect = catalog.complects.byCode[complectCode] ?? null;
    const availableSupplies = selectedComplect
        ? filterSuppliesForComplect(
              catalog.supplies.items,
              selectedComplect.type,
          )
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

    const buildMain = () => buildRowInto('general', 'main', 'general_main');

    const addAdditional = () =>
        buildRowInto('general', 'additional', `general_add_${nanoid(6)}`);

    const addComparison = () => {
        if (!canAddComparisonSet(alternative)) return;
        const setId = nanoid(8);
        dispatch(rowSetActions.addComparisonSet(setId));
        buildRowInto(setId, 'comparison', `${setId}_garant`);
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
        hasMain,
        canAddComparison: canAddComparisonSet(alternative),
        buildMain,
        addAdditional,
        addComparison,
    };
};
