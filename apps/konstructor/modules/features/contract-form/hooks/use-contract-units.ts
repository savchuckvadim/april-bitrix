'use client';

import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { runDocumentToDeal } from '@/modules/app/model/document-run.thunk';
import { COMPLECT_MODE, selectComposition } from '@/modules/entities/complect-variant';
import {
    SINGLE_CONTRACT_NOTE,
    contractGenerateBlocker,
    generateContractUnits,
    selectContractUnits,
} from '@/modules/entities/contract-document';

/**
 * Список договорных единиц: по карточке на вариант комплекта, когда варианты
 * продаются вместе. «Сформировать все» ведёт себя как кнопка одиночного
 * договора: экран загрузки на всё время, во фрейме после успеха всех договоров
 * окно уходит в сделку (документы уже в таймлайне).
 */
export const useContractUnits = () => {
    const dispatch = useAppDispatch();
    const { units } = useAppSelector(selectContractUnits);
    const unitStates = useAppSelector(state => state.contractDocument.units);
    const isSingleContract = useAppSelector(state => selectComposition(state).mode === COMPLECT_MODE.single_contract);
    const blocker = useAppSelector(contractGenerateBlocker);

    const progress = useMemo(() => {
        const states = units.map(unit => unitStates[unit.key]);
        return {
            isGenerating: states.some(state => state?.generate.status === 'generating'),
            isFormLoading: states.some(state => state?.formStatus === 'loading'),
            doneCount: states.filter(state => state?.generate.status === 'done').length,
        };
    }, [units, unitStates]);

    return {
        units,
        hasUnits: units.length > 0,
        isSingleContract,
        singleContractNote: SINGLE_CONTRACT_NOTE,
        blocker,
        isGenerating: progress.isGenerating,
        isFormLoading: progress.isFormLoading,
        doneCount: progress.doneCount,
        generateAll: () =>
            void dispatch(runDocumentToDeal('Формирую договоры…', () => dispatch(generateContractUnits()))),
    };
};
