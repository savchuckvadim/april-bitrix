import { useCallback, useEffect, useState } from 'react';
import { nanoid } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import oldInit from '../../../../docs/oldinit.json';
import {
    catalogActions,
    catalogFromOldInit,
    filterContractsForSupply,
    filterSuppliesForComplect,
    selectCatalog,
    selectCatalogReady,
} from '@/modules/entities/catalog';
import {
    applyAction,
    checkComplectWeight,
    defaultComposition,
    type CompositionAction,
    type RuleResult,
} from '@/modules/entities/composition';
import {
    buildGarantRow,
    findMainRow,
    rowSetActions,
    selectAlternativeSets,
    selectGeneralSet,
    selectGeneralTotal,
    selectRowSetContext,
    selectSelectedRow,
} from '@/modules/entities/row-set';
import { mapV1, parseV1, type V1Record } from '@/modules/entities/snapshot';
import legacyRecord from '@/modules/entities/snapshot/lib/__fixtures__/legacy-deal.v1.json';

/**
 * Вся логика dev-витрины ядра: фикстурный каталог, сборка строк,
 * редактор наполнения (rules/free), сравнение, восстановление v1-слепка.
 * Компоненты — только вёрстка поверх этого хука.
 */
export const useDevCore = () => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const catalogReady = useAppSelector(selectCatalogReady);
    const context = useAppSelector(selectRowSetContext);
    const general = useAppSelector(selectGeneralSet);
    const alternative = useAppSelector(selectAlternativeSets);
    const total = useAppSelector(selectGeneralTotal);
    const selectedRow = useAppSelector(selectSelectedRow);

    const [complectCode, setComplectCode] = useState('buh');
    const [supplyCode, setSupplyCode] = useState('internet_1');
    const [contractCode, setContractCode] = useState('internet');
    const [lastResult, setLastResult] = useState<RuleResult | null>(null);
    const [snapshotWarnings, setSnapshotWarnings] = useState<string[]>([]);

    const loadFixture = useCallback(() => {
        dispatch(catalogActions.setCatalog(catalogFromOldInit(oldInit)));
        dispatch(
            rowSetActions.setContext({ regionCode: 'stv', withTax: false }),
        );
    }, [dispatch]);

    // Пока init v2 недоступен/пуст — работаем на фикстуре oldinit
    useEffect(() => {
        if (!catalogReady) loadFixture();
    }, [catalogReady, loadFixture]);

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

    const buildRowInto = (
        setId: string,
        role: 'main' | 'comparison' | 'additional',
        key: string,
    ) => {
        if (!selectedComplect || !context.regionCode) return;
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
        if (!row) return;
        dispatch(rowSetActions.upsertRow(row));
        dispatch(rowSetActions.selectRow(row.key));
    };

    const buildMain = () => buildRowInto('general', 'main', 'general_main');

    /** Дополнительный Гарант в general — теперь со СВОИМИ поставкой/договором/наполнением */
    const addAdditional = () =>
        buildRowInto('general', 'additional', `general_add_${nanoid(6)}`);

    const addComparison = () => {
        const setId = nanoid(8);
        dispatch(rowSetActions.addComparisonSet(setId));
        buildRowInto(setId, 'comparison', `${setId}_garant`);
    };

    const applyComposition = (action: CompositionAction) => {
        if (!selectedRow?.composition) return;
        const complect =
            catalog.complects.byCode[selectedRow.composition.complectCode];
        if (!complect) return;
        const result = applyAction(selectedRow.composition, action, {
            complect,
            catalog,
        });
        setLastResult(result);
        dispatch(
            rowSetActions.setRowComposition({
                setId: selectedRow.setId,
                key: selectedRow.key,
                composition: result.composition,
            }),
        );
    };

    const toggleMode = () => {
        if (!selectedRow?.composition) return;
        dispatch(
            rowSetActions.setRowComposition({
                setId: selectedRow.setId,
                key: selectedRow.key,
                composition: {
                    ...selectedRow.composition,
                    mode:
                        selectedRow.composition.mode === 'rules'
                            ? 'free'
                            : 'rules',
                },
            }),
        );
    };

    const setRegion = (regionCode: string) =>
        dispatch(rowSetActions.setContext({ regionCode }));
    const setWithTax = (withTax: boolean) =>
        dispatch(rowSetActions.setContext({ withTax }));
    const selectRowKey = (key: string | null) =>
        dispatch(rowSetActions.selectRow(key));
    const resetAll = () => {
        dispatch(rowSetActions.reset());
        dispatch(
            rowSetActions.setContext({ regionCode: 'stv', withTax: false }),
        );
        setLastResult(null);
        setSnapshotWarnings([]);
    };

    /** Восстановление реального легаси-слепка (фикстура из прод-данных) */
    const loadSnapshot = () => {
        const restored = mapV1(
            parseV1(legacyRecord as unknown as V1Record),
            catalog,
        );
        // ВАЖНО: контекст ДО restore — иначе listener пересчитает
        // сохранённые цены, а BC требует показывать их как есть
        if (restored.regionCode) {
            dispatch(
                rowSetActions.setContext({ regionCode: restored.regionCode }),
            );
        }
        dispatch(
            rowSetActions.restore({
                general: restored.general,
                alternative: restored.alternative,
            }),
        );
        const main = findMainRow(restored.general);
        dispatch(rowSetActions.selectRow(main?.key ?? null));
        setSnapshotWarnings(restored.warnings);
    };

    const composedComplect = selectedRow?.composition
        ? (catalog.complects.byCode[selectedRow.composition.complectCode] ??
          null)
        : null;
    const weightCheck =
        selectedRow?.composition && composedComplect
            ? checkComplectWeight(selectedRow.composition, {
                  complect: composedComplect,
                  catalog,
              })
            : null;

    return {
        catalog,
        context,
        general,
        alternative,
        total,
        selectedRow,
        builder: {
            complectCode,
            supplyCode,
            contractCode,
            setComplectCode,
            setSupplyCode,
            setContractCode,
            availableSupplies,
            availableContracts,
            buildMain,
            addAdditional,
            addComparison,
        },
        composition: {
            applyComposition,
            toggleMode,
            lastResult,
            weightCheck,
        },
        controls: { setRegion, setWithTax, loadFixture, resetAll },
        snapshot: { loadSnapshot, snapshotWarnings },
        selectRowKey,
    };
};
