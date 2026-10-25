'use client';

import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    resolveRefsForBuildParams,
    resolveSupply,
    selectCatalog,
    type ComplectType,
    type SupplyKind,
} from '@/modules/entities/catalog';
import {
    buildMainRowWithRefs,
    rowSetActions,
    selectMainRow,
    selectRowSetContext,
} from '@/modules/entities/row-set';
import type { SummaryFact } from '@/modules/features/build-summary';
import {
    COMPLECT_TYPE_OPTIONS,
    SUPPLY_KIND_OPTIONS,
} from '../lib/build-params-options';

interface ParamsDraft {
    regionCode: string | null;
    complectType: ComplectType;
    supplyKind: SupplyKind;
}

/**
 * Шаг «Параметры»: регион, линейка, вид доступа. Черновик стартует с текущей
 * сборки (открыли существующую сделку — видно, что выбрано). «Далее»
 * применяет его к главной строке: совместимое сохраняется, остальное — по
 * матрице совместимости (resolveRefsForBuildParams).
 */
export const useBuildParams = () => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    const context = useAppSelector(selectRowSetContext);
    const mainRow = useAppSelector(selectMainRow);

    const [draft, setDraft] = useState<ParamsDraft>(() => ({
        regionCode: context.regionCode,
        complectType:
            catalog.complects.byCode[mainRow?.refs.complectCode ?? '']?.type ??
            'prof',
        supplyKind:
            resolveSupply(catalog, mainRow?.refs.supplyCode ?? '')?.type ??
            'internet',
    }));

    const refs = useMemo(
        () => resolveRefsForBuildParams(catalog, draft, mainRow?.refs ?? null),
        [catalog, draft, mainRow],
    );

    const facts: SummaryFact[] = [
        {
            label: 'Регион',
            value:
                catalog.regions.byCode[draft.regionCode ?? '']?.title ??
                'не выбран',
        },
        {
            label: 'Линейка',
            value:
                COMPLECT_TYPE_OPTIONS.find(
                    option => option.value === draft.complectType,
                )?.title ?? '—',
        },
        {
            label: 'Доступ',
            value:
                SUPPLY_KIND_OPTIONS.find(
                    option => option.value === draft.supplyKind,
                )?.title ?? '—',
        },
    ];

    const apply = (): boolean => {
        if (!draft.regionCode || !refs) return false;
        const nextContext = { ...context, regionCode: draft.regionCode };
        const row = buildMainRowWithRefs(catalog, nextContext, mainRow, refs);
        if (!row) return false;
        dispatch(rowSetActions.setContext({ regionCode: draft.regionCode }));
        dispatch(rowSetActions.upsertRow(row));
        dispatch(rowSetActions.selectRow(row.key));
        return true;
    };

    return {
        regions: catalog.regions.items,
        draft,
        facts,
        setRegion: (regionCode: string) =>
            setDraft(prev => ({ ...prev, regionCode })),
        setComplectType: (complectType: ComplectType) =>
            setDraft(prev => ({ ...prev, complectType })),
        setSupplyKind: (supplyKind: SupplyKind) =>
            setDraft(prev => ({ ...prev, supplyKind })),
        canApply: Boolean(draft.regionCode && refs),
        isUnavailable: !refs,
        apply,
    };
};
