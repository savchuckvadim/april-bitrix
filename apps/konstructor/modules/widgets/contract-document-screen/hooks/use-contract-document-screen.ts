'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectVariantStagesLoading } from '@/modules/entities/complect-variant';
import { initContractDocument, selectContractUnits } from '@/modules/entities/contract-document';
import { selectMainRow } from '@/modules/entities/row-set';
import { ROUTE_KONSTRUCTOR, useKonstructorNavigation } from '@/modules/shared/lib/routing';

/**
 * Экран договора: на входе — поля сделки из Bitrix и форма с бэка по текущей
 * сборке (и формы договорных единиц, когда варианты продаются вместе); без
 * главной строки экран не имеет смысла. Единицы зависят от настроек сборки и
 * стадий вариантов, поэтому вход ждёт, пока они загрузятся, и повторяется,
 * когда состав единиц меняется.
 */
export const useContractDocumentScreen = () => {
    const dispatch = useAppDispatch();
    const nav = useKonstructorNavigation();
    const hasMainRow = Boolean(useAppSelector(selectMainRow));
    const catalogReady = useAppSelector(state => state.catalog.loading === 'succeeded');
    const variantsSettled = useAppSelector(
        state => state.complectVariant.status !== 'loading' && !selectVariantStagesLoading(state),
    );
    const unitKeys = useAppSelector(state =>
        selectContractUnits(state)
            .units.map(unit => unit.key)
            .join('|'),
    );
    const unitsCount = useAppSelector(state => selectContractUnits(state).units.length);

    useEffect(() => {
        if (hasMainRow && catalogReady && variantsSettled) void dispatch(initContractDocument());
    }, [hasMainRow, catalogReady, variantsSettled, unitKeys, dispatch]);

    return {
        hasMainRow,
        hasUnits: unitsCount > 0,
        unitsCount,
        toHub: () => nav.to(ROUTE_KONSTRUCTOR.DOCUMENT),
        toCreate: () => nav.to(ROUTE_KONSTRUCTOR.START),
    };
};
